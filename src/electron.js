'use strict'

const path = require('path');
//const { readFileSync, readdirSync } = require('fs');
const { app, BrowserWindow, Menu } = require('electron'); //ipcMain
const { autoUpdater } = require("electron-updater");

const isDev = process.env.NODE_ENV === "development"

if (isDev) try {
    require('electron-reloader')(module);
} catch (_) { }


let mainWindow;

//app.allowRendererProcessReuse = true;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        minWidth: 750,
        minHeight: 500,
        width: 1000,
        height: 1000,
        // frame: false,
        icon: path.join(__dirname, 'icon', 'icon.png'),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            // nodeIntegration: false,
            // worldSafeExecuteJavaScript: true,
            // enableRemoteModule: true,
            // preload: path.join(__dirname, 'preload.js'),
        },
    });

    // mainWindow.setMenu(null);

    const url = `file://${path.join(__dirname, '..', 'public', 'index.html')}`
        //isDev
        //    ?
        //    'http://localhost:5000'
        //    :
        //    `file://${path.join(__dirname, '..', 'public', 'index.html')}`

    mainWindow.loadURL(url);

    if (isDev) mainWindow.webContents.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};

app.on('ready', () => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        mainWindow = null;
        app.quit();
    }
});


//ipcMain.on('readDir', (event, dir) => {
//    const content = readdirSync(path.join(__dirname, dir));
//    event.returnValue = content;
//})
//
//ipcMain.on('readFile', (event, dir, file) => {
//    const location = path.join(__dirname, dir, file);
//    const content = readFileSync(location, 'utf8').split('\n');
//    event.returnValue = content;
//})

const isMac = process.platform === 'darwin'
const template = [
    {
    label: app.name,
    submenu: [
        { role: 'copy' },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
    ]
  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)