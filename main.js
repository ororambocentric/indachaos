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

var template = [{
  label: "Application",
  submenu: [
    { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
    { type: "separator" },
    { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]}, {
  label: "Edit",
  submenu: [
    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
    { type: "separator" },
    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));


