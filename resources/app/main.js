// Copyright 2016 Sergei Tolokonnikov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

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

