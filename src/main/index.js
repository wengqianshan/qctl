import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as server from '../server'

// 启动web服务
async function startServer() {
  return new Promise((resolve) => {
    server.start((info) => {
      const { ip, port } = info
      resolve({ ip, port })
    })
  })
}

let serverInfo
ipcMain.handle('app.server', async () => {
  if (serverInfo) {
    return serverInfo
  }
  serverInfo = await startServer()
  return serverInfo
})
ipcMain.on('app.stop', () => {
  console.log('app.stop', '---------------')
  server.stop()
  serverInfo = null
})
ipcMain.on('app.exit', app.exit)

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 330,
    alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  // mainWindow.on('ready-to-show', () => {
  //   mainWindow.show()
  // })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let win = null
let tray = null
app.whenReady().then(() => {
  tray = new Tray(join(__dirname, '../../resources/tray.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示二维码',
      click: () => {
        if (win.isDestroyed()) {
          win = createWindow()
        }
        const { x, y, width, height } = tray.getBounds()
        const winBounds = win.getBounds()
        win.setPosition(x - (winBounds.width - width) / 2, y + height + 10, true)
        win.show()
      }
    },
    {
      label: '退出',
      click: () => {
        app.exit()
      }
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  win = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) win = createWindow()

    if (!BrowserWindow.getFocusedWindow()) {
      win.show()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
