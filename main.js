/*
 The MIT License (MIT)

 Copyright (c) 2016 Sergei Tolokonnikov

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const {Tray, Menu, clipboard} = require('electron');

let mainWindow;
let appIcon = null;

function createWindow () {

    mainWindow = new BrowserWindow({width: 800, height: 600, icon: 'resources/app/images/app-icon.png'});
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    //mainWindow.webContents.openDevTools();
    mainWindow.on('close', function (e) {
        e.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    appIcon = new Tray(`resources/app/images/app-icon.png`);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Add', type: 'normal', click: function () {
            mainWindow.webContents.send('add');
            mainWindow.show();
        }},
        {label: 'Add from clipboard', type: 'normal', click: function () {

            if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
                mainWindow.webContents.send('window-must-be-hidden');
            }
            mainWindow.webContents.send('add-from-clipboard');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Open recent', type: 'normal', click: function () {
            if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
                mainWindow.webContents.send('window-must-be-hidden');
            }
            mainWindow.webContents.send('open-recent');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Clips', type: 'normal', click: function () {
            mainWindow.webContents.send('clips');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Todo from clipboard', type: 'normal', click: function () {
            if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
                mainWindow.webContents.send('window-must-be-hidden');
            }
            mainWindow.webContents.send('todo-from-clipboard');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Todo', type: 'normal', click: function () {
            mainWindow.webContents.send('todolist');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Notifications', type: 'normal', click: function () {
            mainWindow.webContents.send('notifications');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Settings', type: 'normal', click: function () {
            mainWindow.webContents.send('settings');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Change password', type: 'normal', click: function () {
            mainWindow.webContents.send('change-secret-key');
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Show', type: 'normal', click: function () {
            mainWindow.show();
        }},
        {type: 'separator'},
        {label: 'Exit', type: 'normal', click: function () {
            app.exit(0);
        }}
    ]);
    appIcon.setToolTip('Indachaos');
    appIcon.setContextMenu(contextMenu);
    appIcon.on('click', function () {
        if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
            mainWindow.show();
        } else {
            mainWindow.hide();
        }

    });
}

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });

if (shouldQuit) {
    app.exit(0);
    return;
}


app.on('ready', createWindow);

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

const {ipcMain} = require('electron')
ipcMain.on('set-tray-icon-notif', function (event, arg) {
    appIcon.setImage('resources/app/images/app-icon-notif.png');
});
ipcMain.on('set-tray-icon-normal', function (event, arg) {
    appIcon.setImage('resources/app/images/app-icon.png');
});
ipcMain.on('system-exit', function (event, arg) {
    app.exit(0);
});
