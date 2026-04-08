/**
 * processManager — spawns and manages agent CLI processes.
 *
 * Each agent is one child_process.spawn() instance keyed by agent ID.
 * stdout/stderr are streamed line-by-line to the renderer via agent:output IPC.
 */

import { spawn, execSync } from 'child_process'
import type { ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpawnConfig {
  id: string
  name: string
  model: string
  workingDirectory: string
  task: string
}

export interface SpawnResult {
  success: boolean
  pid?: number
  error?: string
}

// ─── Process registry ─────────────────────────────────────────────────────────

const processes = new Map<string, ChildProcess>()

/** Last-known config per agent — used to re-spawn with a new task. */
const agentConfigs = new Map<string, SpawnConfig>()

/** Session ID captured from Claude Code stdout — used for --resume on follow-ups. */
const agentSessionIds = new Map<string, string>()

// ─── PATH augmentation ────────────────────────────────────────────────────────

const LOCAL_BIN = '/Users/yuvanadarshjagannnathan/.local/bin'
const FALLBACK_CLAUDE = `${LOCAL_BIN}/claude`

/** PATH string with ~/.local/bin prepended so CLI tools are always found. */
const AUGMENTED_PATH = `${LOCAL_BIN}:${process.env.PATH ?? ''}`

/** Resolved absolute path to the claude binary (resolved once at startup). */
let resolvedClaudePath = FALLBACK_CLAUDE
try {
  resolvedClaudePath = execSync('which claude', {
    env: { ...process.env, PATH: AUGMENTED_PATH },
  })
    .toString()
    .trim()
  console.log(`[processManager] resolved claude path: ${resolvedClaudePath}`)
} catch {
  console.warn(`[processManager] 'which claude' failed — using fallback: ${FALLBACK_CLAUDE}`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get the first window's webContents so we can push IPC events to the renderer. */
function getWebContents(): Electron.WebContents | undefined {
  return BrowserWindow.getAllWindows()[0]?.webContents
}

/** Push a line of output to the renderer for a given agent. */
function pushOutput(agentId: string, line: string): void {
  const wc = getWebContents()
  if (!wc) {
    console.warn('[processManager] pushOutput: no webContents — window not ready')
    return
  }
  console.log('[IPC] sending agent:output', agentId, line.slice(0, 80))
  wc.send('agent:output', agentId, line)
}

/** Fire agent:permission to the renderer when a permission prompt is detected. */
function pushPermission(agentId: string, message: string): void {
  const wc = getWebContents()
  if (!wc) return
  console.log('[IPC] sending agent:permission', agentId, message.slice(0, 80))
  wc.send('agent:permission', agentId, message)
}

/** Fire agent:sessionId to the renderer so it can persist the session ID. */
function pushSessionId(agentId: string, sessionId: string): void {
  const wc = getWebContents()
  if (!wc) return
  console.log('[IPC] sending agent:sessionId', agentId, sessionId)
  wc.send('agent:sessionId', agentId, sessionId)
}

/**
 * Patterns that indicate an agent is pausing for user approval.
 * Only relevant for non-JSON-mode agents (Gemini, Codex).
 */
const PERMISSION_RE = /do you want to|allow this|shall i|\(y\/n\)|yes\/no/i

/**
 * Resolve the CLI binary and arguments for a given model name.
 * Claude uses the dynamically-resolved absolute path.
 */
function resolveCommand(
  model: string,
  task: string,
  sessionId?: string
): { cmd: string; args: string[]; stdinMode: 'pipe' | 'ignore'; jsonMode: boolean } {
  const m = model.toLowerCase()
  if (m.includes('claude')) {
    const args = ['-p', task, '--dangerously-skip-permissions', '--output-format', 'json']
    if (sessionId) args.push('--resume', sessionId)
    return { cmd: resolvedClaudePath, args, stdinMode: 'pipe', jsonMode: true }
  }
  if (m.includes('gemini')) {
    return {
      cmd: 'gemini',
      args: ['-m', model, '--prompt', task, '--yolo'],
      stdinMode: 'ignore',
      jsonMode: false,
    }
  }
  if (m.includes('codex') || m === 'o3' || m === 'o4-mini') {
    return { cmd: 'codex', args: [task], stdinMode: 'pipe', jsonMode: false }
  }
  // Fallback to claude
  return {
    cmd: resolvedClaudePath,
    args: ['-p', task, '--dangerously-skip-permissions', '--output-format', 'json'],
    stdinMode: 'pipe',
    jsonMode: true,
  }
}

/**
 * Relay buffered chunks as individual lines.
 * Returns any partial (unterminated) line remaining in the buffer.
 * onLine, if provided, is called for each complete line (before prefix is applied).
 */
function flushLines(
  agentId: string,
  buf: string,
  chunk: Buffer,
  prefix = '',
  onLine?: (line: string) => void
): string {
  const combined = buf + chunk.toString()
  const lines = combined.split('\n')
  const remaining = lines.pop() ?? '' // last element is unterminated partial line
  for (const line of lines) {
    if (line.length > 0) {
      pushOutput(agentId, prefix + line)
      onLine?.(line)
    }
  }
  return remaining
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Spawn a new agent process. Returns success + pid on success. */
export function spawnAgent(config: SpawnConfig, sessionId?: string): SpawnResult {
  const { id, model, workingDirectory, task } = config
  const { cmd, args, stdinMode, jsonMode } = resolveCommand(model, task, sessionId)

  const augmentedEnv = { ...process.env, PATH: AUGMENTED_PATH }

  console.log(`[DEBUG spawn] cmd: ${cmd}`)
  console.log(`[DEBUG spawn] args: ${JSON.stringify(args)}`)
  console.log(`[DEBUG spawn] sessionId passed in: ${sessionId ?? '(none)'}`)
  console.log(`[processManager] cwd: ${workingDirectory}`)

  let child: ChildProcess
  try {
    // shell: false — args are passed directly to execvp, no shell splitting.
    child = spawn(cmd, args, {
      cwd: workingDirectory,
      stdio: [stdinMode, 'pipe', 'pipe'],
      shell: false,
      env: augmentedEnv,
    })
  } catch (err) {
    const msg = `[ERR] Failed to start '${cmd}': ${String(err)}`
    console.error(msg)
    pushOutput(id, msg)
    return { success: false, error: String(err) }
  }

  console.log(`[processManager] spawned pid=${child.pid} for agent=${id}`)
  processes.set(id, child)
  agentConfigs.set(id, config)

  // ── stderr (both paths) ───────────────────────────────────────────────────
  let stderrBuf = ''
  child.stderr?.on('data', (chunk: Buffer) => {
    stderrBuf = flushLines(id, stderrBuf, chunk, '[ERR] ')
  })

  // ── spawn error ───────────────────────────────────────────────────────────
  child.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ENOENT') {
      pushOutput(id, `[ERR] '${cmd}' not found. Make sure it is installed and available in PATH.`)
    } else {
      pushOutput(id, `[ERR] Process error: ${err.message}`)
    }
    console.error(`[processManager] process error for agent=${id}:`, err)
    processes.delete(id)
    pushOutput(id, '[ORBITAL] Agent exited with error.')
  })

  if (jsonMode) {
    // ── JSON mode (Claude) ────────────────────────────────────────────────
    // Buffer all stdout, parse once on close to extract result text + session_id.
    let rawJson = ''
    child.stdout?.on('data', (chunk: Buffer) => {
      rawJson += chunk.toString()
    })

    child.on('close', (code: number | null) => {
      if (stderrBuf.length > 0) pushOutput(id, `[ERR] ${stderrBuf}`)

      if (rawJson.length > 0) {
        try {
          const parsed = JSON.parse(rawJson) as {
            result?: string
            session_id?: string
            is_error?: boolean
          }

          // Capture session ID for subsequent --resume invocations.
          if (parsed.session_id) {
            console.log('[SESSION CAPTURED]', parsed.session_id)
            agentSessionIds.set(id, parsed.session_id)
            pushSessionId(id, parsed.session_id)
          }

          // Push the response text line-by-line so the terminal renders it.
          const text = parsed.result ?? (parsed.is_error ? '[ERR] Claude reported an error.' : '')
          for (const line of text.split('\n')) {
            pushOutput(id, line)
          }
        } catch {
          // Malformed JSON — push raw so nothing is silently lost.
          pushOutput(id, rawJson)
        }
      }

      console.log(`[processManager] agent=${id} exited with code=${code}`)
      processes.delete(id)
      pushOutput(id, `[ORBITAL] Agent exited (code ${code ?? 'unknown'}).`)
    })
  } else {
    // ── Streaming mode (Gemini, Codex) ────────────────────────────────────
    let stdoutBuf = ''
    child.stdout?.on('data', (chunk: Buffer) => {
      stdoutBuf = flushLines(id, stdoutBuf, chunk, '', (line) => {
        if (PERMISSION_RE.test(line)) pushPermission(id, line)
      })
    })

    child.on('close', (code: number | null) => {
      if (stdoutBuf.length > 0) pushOutput(id, stdoutBuf)
      if (stderrBuf.length > 0) pushOutput(id, `[ERR] ${stderrBuf}`)

      console.log(`[processManager] agent=${id} exited with code=${code}`)
      processes.delete(id)
      pushOutput(id, `[ORBITAL] Agent exited (code ${code ?? 'unknown'}).`)
    })
  }

  return { success: true, pid: child.pid }
}

/** Kill an agent process by ID and remove it from the registry. */
export function killAgent(id: string): void {
  const child = processes.get(id)
  if (child) {
    child.kill('SIGTERM')
    processes.delete(id)
  }
  agentConfigs.delete(id)
  agentSessionIds.delete(id)
}

/** Write text to a running agent's stdin (e.g. permission response). */
export function sendInput(id: string, text: string): void {
  const child = processes.get(id)
  if (child?.stdin?.writable) {
    child.stdin.write(text + '\n')
  }
}

/**
 * Spawn a fresh -p invocation for a follow-up task message.
 * The previous process (if still running) is killed first.
 * If a session ID was captured from the previous run, --resume <sessionId> is
 * appended so Claude Code continues the same session context.
 * Output streams into the same agent terminal (cumulative).
 */
export function respawnWithTask(agentId: string, newTask: string): SpawnResult {
  const prev = processes.get(agentId)
  if (prev) {
    prev.kill('SIGTERM')
    processes.delete(agentId)
  }

  const prevConfig = agentConfigs.get(agentId)
  if (!prevConfig) {
    const msg = `[ERR] No config found for agent ${agentId} — cannot respawn.`
    pushOutput(agentId, msg)
    return { success: false, error: msg }
  }

  // Use the captured session ID for --resume, if available.
  const sessionId = agentSessionIds.get(agentId)
  // Reset so we capture the new session ID from this invocation's output.
  agentSessionIds.delete(agentId)

  pushOutput(agentId, `[ORBITAL] New task: ${newTask}`)
  return spawnAgent({ ...prevConfig, task: newTask }, sessionId)
}

/** Kill every running agent process. Called on app quit. */
export function killAllAgents(): void {
  for (const child of processes.values()) {
    child.kill('SIGTERM')
  }
  processes.clear()
  agentConfigs.clear()
  agentSessionIds.clear()
}
