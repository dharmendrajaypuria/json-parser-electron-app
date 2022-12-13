const path = require('path')
const {app, BrowserWindow} = require('electron')
const { ipcMain, dialog } = require("electron");

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'development'



const createWindow = () => {
    const mainWindow = new BrowserWindow({
        title: 'Json Parser',
        width: isDev ? 800 : 600,
        height: 400,
        autoHideMenuBar: true,
        resizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))

    ipcMain.handle("showSaveDialog", (e, options) => {
        return dialog.showSaveDialog(mainWindow, options)
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})