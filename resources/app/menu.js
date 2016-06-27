const {remote} = require('electron');
const {Menu, MenuItem} = remote;

const template = [
    {
        label: 'Application',
        submenu: [
            {
                label: 'Add note',
                accelerator: 'CmdOrCtrl+N',
                click() { $("#button-add-note").trigger('click'); }
            },
            {
                label: 'Clips',
                accelerator: 'CmdOrCtrl+Y',
                click() { $("#button-clips").trigger('click'); }
            },
            {
                label: 'Go to search',
                accelerator: 'CmdOrCtrl+F',
                click() { 
                    if (activeScreen !== 'search') {
                        showScreenSearch();
                    } else {
                        $("#screen-search #input-search").focus();
                    }
                    
                }

            },
            {
                label: 'Go to previous occurrence',
                accelerator: 'Shift+F3',
                click() { $("#button-gotoresult-backward").trigger('click'); }
            },
            {
                label: 'Go to next occurrence',
                accelerator: 'CmdOrCtrl+L',
                click() { $("#button-sidebar-toggle").trigger('click'); }
            },
            {
                label: 'Show / hide sidebar',
                accelerator: 'F3',
                click() { $("#button-gotoresult-forward").trigger('click'); }
            },
            {
                label: 'Settings',
                accelerator: 'F6',
                click() { showScreenSettings(); }
            },
            {
                label: 'About',
                accelerator: 'F12',
                click() { showScreenAbout(); }
            },

        ]

    },
    {
        label: 'Edit text',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                //role: 'copy',
                click() { copyText(false); }
            },
            {
                label: 'Copy with saving to clips',
                accelerator: 'CmdOrCtrl+Shift+C',
                //role: 'copy'
                click() { copyText(); }
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Paste and Match Style',
                accelerator: 'Shift+Command+V',
                role: 'pasteandmatchstyle'
            },
            {
                label: 'Delete',
                role: 'delete'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
            {
                label: 'Paste line',
                accelerator: 'CmdOrCtrl+-',
                click() { pasteLine(); }
            },
            {
                label: 'Paste double line',
                accelerator: 'CmdOrCtrl+=',
                click() { pasteDoubleLine(); }
            },
            {
                label: 'Generate and paste password',
                accelerator: 'CmdOrCtrl+P',
                click() { pastePassword(); }
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Full Screen',
                accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
                click(item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.webContents.toggleDevTools();
                }
            },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            },
        ]
    },


];

if (process.platform === 'darwin') {
    const name = require('electron').remote.app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Alt+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() { app.quit(); }
            },
        ]
    });
    // Window menu.
    template[3].submenu = [
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ];
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
menu.popup(remote.getCurrentWindow());
}, false);