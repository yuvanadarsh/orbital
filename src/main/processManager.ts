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
  getWebContents()?.send('agent:output', agentId, line)
}

/**
 * Resolve the CLI binary and arguments for a given model name.
 * Claude uses the dynamically-resolved absolute path.
 */
function resolveCommand(model: string, task: string): { cmd: string; args: string[] } {
  const m = model.toLowerCase()
  if (m.includes('claude')) {
    return { cmd: resolvedClaudePath, args: ['-p', task] }
  }
  if (m.includes('gemini')) return { cmd: 'gemini', args: [task] }
  if (m.includes('codex') || m === 'o3' || m === 'o4-mini') return { cmd: 'codex', args: [task] }
  // Fallback to claude
  return { cmd: resolvedClaudePath, args: ['-p', task] }
}

/**
 * Relay buffered chunks as individual lines.
 * Returns any partial (unterminated) line remaining in the buffer.
 */
function flushLines(
  agentId: string,
  buf: string,
  chunk: Buffer,
  prefix = ''
): string {
  const combined = buf + chunk.toString()
  const lines = combined.split('\n')
  const remaining = lines.pop() ?? '' // last element is unterminated partial line
  for (const line of lines) {
    if (line.length > 0) pushOutput(agentId, prefix + line)
  }
  return remaining
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Spawn a new agent process. Returns success + pid on success. */
export function spawnAgent(config: SpawnConfig): SpawnResult {
  const { id, model, workingDirectory, task } = config
  const { cmd, args } = resolveCommand(model, task)

  const augmentedEnv = { ...process.env, PATH: AUGMENTED_PATH }

  console.log(`[processManager] spawning: ${cmd} ${args.join(' ')}`)
  console.log(`[processManager] cwd: ${workingDirectory}`)

  let child: ChildProcess
  try {
    child = spawn(cmd, args, {
      cwd: workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
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

  // ── stdout ───────────────────────────────────────────────────────────────
  let stdoutBuf = ''
  child.stdout?.on('data', (chunk: Buffer) => {
    stdoutBuf = flushLines(id, stdoutBuf, chunk)
  })

  // ── stderr ───────────────────────────────────────────────────────────────
  let stderrBuf = ''
  child.stderr?.on('data', (chunk: Buffer) => {
    stderrBuf = flushLines(id, stderrBuf, chunk, '[ERR] ')
  })

  // ── spawn error (e.g. ENOENT — binary not found) ─────────────────────────
  child.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ENOENT') {
      pushOutput(
        id,
        `[ERR] '${cmd}' not found. Make sure it is installed and available in PATH.`
      )
    } else {
      pushOutput(id, `[ERR] Process error: ${err.message}`)
    }
    console.error(`[processManager] process error for agent=${id}:`, err)
    processes.delete(id)
    pushOutput(id, '[ORBITAL] Agent exited with error.')
  })

  // ── process exit ──────────────────────────────────────────────────────────
  child.on('close', (code: number | null) => {
    if (stdoutBuf.length > 0) pushOutput(id, stdoutBuf)
    if (stderrBuf.length > 0) pushOutput(id, `[ERR] ${stderrBuf}`)

    console.log(`[processManager] agent=${id} exited with code=${code}`)
    processes.delete(id)
    pushOutput(id, `[ORBITAL] Agent exited (code ${code ?? 'unknown'}).`)
  })

  return { success: true, pid: child.pid }
}

/** Kill an agent process by ID and remove it from the registry. */
export function killAgent(id: string): void {
  const child = processes.get(id)
  if (child) {
    child.kill('SIGTERM')
    processes.delete(id)
  }
}

/** Write text to a running agent's stdin (e.g. task input or permission response). */
export function sendInput(id: string, text: string): void {
  const child = processes.get(id)
  if (child?.stdin?.writable) {
    child.stdin.write(text + '\n')
  }
}

/** Kill every running agent process. Called on app quit. */
export function killAllAgents(): void {
  for (const child of processes.values()) {
    child.kill('SIGTERM')
  }
  processes.clear()
}
