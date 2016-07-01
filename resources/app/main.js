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

const {Tray, Menu} = require('electron');

let mainWindow;
let appIcon = null;

function createWindow () {

  mainWindow = new BrowserWindow({width: 800, height: 600, icon: 'app-icon.png'});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.webContents.openDevTools();
  mainWindow.on('close', function (e) {
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  appIcon = new Tray('app-icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show', type: 'normal', click: function () {
      mainWindow.show();
    }},
    {type: 'separator'},
    {label: 'Exit', type: 'normal', click: function () {
      app.exit(0);
    }}
  ]);
  appIcon.setToolTip('indachaos');
  appIcon.setContextMenu(contextMenu);
  appIcon.on('click', function () {
    mainWindow.show();
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

