import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  spawnAgent,
  killAgent,
  sendInput,
  killAllAgents,
} from './processManager'
import type { SpawnConfig } from './processManager'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ── Dev ping ─────────────────────────────────────────────────────────────
  ipcMain.on('ping', () => console.log('pong'))

  // ── Agent lifecycle ───────────────────────────────────────────────────────

  ipcMain.handle('agent:spawn', (_event, config: SpawnConfig) => {
    console.log('[IPC] agent:spawn received', config)
    const result = spawnAgent(config)
    console.log('[IPC] agent:spawn result', result)
    return result
  })

  ipcMain.handle('agent:kill', (_event, id: string) => {
    killAgent(id)
  })

  ipcMain.on('agent:input', (_event, agentId: string, text: string) => {
    sendInput(agentId, text)
  })

  // Claude Code reads 'allow' or 'deny' (+ newline) on stdin for permission prompts.
  ipcMain.on('agent:respond', (_event, agentId: string, allow: boolean) => {
    sendInput(agentId, allow ? 'allow' : 'deny')
  })

  // ── File watching ─────────────────────────────────────────────────────────
  // Stub — real chokidar watcher wired in Day 6.
  ipcMain.handle('files:watch', (_event, path: string) => {
    console.log('[IPC] files:watch requested', path)
  })

  // ── Native file dialog ────────────────────────────────────────────────────
  ipcMain.handle('dialog:browse', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win ?? BrowserWindow.getAllWindows()[0], {
      properties: ['openDirectory'],
      title: 'Select working directory',
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  // Used by NewAgentModal via window.electron.ipcRenderer.invoke
  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Kill all agent processes before the app quits so no orphans are left.
app.on('before-quit', () => {
  killAllAgents()
})

app.on('window-all-closed', () => {
  killAllAgents()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
