const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const {Tray, Menu} = require('electron');

let mainWindow;
let appIcon = null;

function createWindow () {

  mainWindow = new BrowserWindow({width: 800, height: 600, icon: 'images/app-icon.png'});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.webContents.openDevTools();
  mainWindow.on('close', function (e) {
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  appIcon = new Tray('images/app-icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show', type: 'normal', click: function () {
      mainWindow.show();
    }},
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

app.on('ready', createWindow);

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});

