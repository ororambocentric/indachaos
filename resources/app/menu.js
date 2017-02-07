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

const {remote} = require('electron');
const {Menu, MenuItem} = remote;

const ipcRenderer = require('electron').ipcRenderer;

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
                accelerator: 'CmdOrCtrl+K',
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
                label: 'Go to last editing',
                accelerator: 'CmdOrCtrl+E',
                click() {
                    actionGoToLastEditing();
                }

            },
            {
                label: 'Go to next occurrence',
                accelerator: 'F3',
                click() { $("#button-gotoresult-forward").trigger('click'); }
            },
            {
                label: 'Go to previous occurrence',
                accelerator: 'Shift+F3',
                click() { $("#button-gotoresult-backward").trigger('click'); }
            },
            {
                label: 'Go to next note',
                accelerator: 'CmdOrCtrl+Down',
                click() { $("#button-navigator-forward").trigger('click'); }
            },
            {
                label: 'Go to previous note',
                accelerator: 'CmdOrCtrl+Up',
                click() { $("#button-navigator-backward").trigger('click'); }
            },
            {
                label: 'History back',
                accelerator: 'CmdOrCtrl+Left',
                click() { historyBack(); }
            },
            {
                label: 'History forward',
                accelerator: 'CmdOrCtrl+Right',
                click() { historyForward(); }
            },
            {
                label: 'Toggle sidebar',
                accelerator: 'CmdOrCtrl+L',
                click() { $("#button-sidebar-toggle").trigger('click'); }
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
    // {
    //     label: 'Edit text',
    //     submenu: [
    //         {
    //             label: 'Undo',
    //             accelerator: 'CmdOrCtrl+Z',
    //             role: 'undo'
    //         },
    //         {
    //             label: 'Redo',
    //             accelerator: 'Shift+CmdOrCtrl+Z',
    //             role: 'redo'
    //         },
    //         {
    //             type: 'separator'
    //         },
    //         {
    //             label: 'Cut',
    //             accelerator: 'CmdOrCtrl+X',
    //             role: 'cut'
    //         },
    //         {
    //             label: 'Copy',
    //             accelerator: 'CmdOrCtrl+C',
    //             //role: 'copy',
    //             click() { copyText(false); }
    //         },
    //         {
    //             label: "Copy'n'clip",
    //             accelerator: 'CmdOrCtrl+Shift+C',
    //             //role: 'copy'
    //             click() { copyText(); }
    //         },
    //         {
    //             label: 'Paste',
    //             accelerator: 'CmdOrCtrl+V',
    //             role: 'paste'
    //         },
    //         {
    //             label: 'Paste and Match Style',
    //             accelerator: 'Shift+Command+V',
    //             role: 'pasteandmatchstyle'
    //         },
    //         {
    //             label: 'Delete',
    //             role: 'delete'
    //         },
    //         {
    //             label: 'Select All',
    //             accelerator: 'CmdOrCtrl+A',
    //             role: 'selectall'
    //         },
    //         {
    //             label: 'Paste line',
    //             accelerator: 'CmdOrCtrl+-',
    //             click() { pasteLine(); }
    //         },
    //         {
    //             label: 'Paste double line',
    //             accelerator: 'CmdOrCtrl+=',
    //             click() { pasteDoubleLine(); }
    //         },
    //         {
    //             label: 'Generate and paste password',
    //             accelerator: 'CmdOrCtrl+P',
    //             click() { pastePassword(); }
    //         },
    //     ]
    // },
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

// window.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
// menu.popup(remote.getCurrentWindow());
// }, false);

const searchResultsContextMenuTemplate = [
    {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        //role: 'copy',
        click() { copyText(false); }
    },
    {
        label: "Copy'n'clip",
        accelerator: 'CmdOrCtrl+Shift+C',
        //role: 'copy'
        click() { copyText(); }
    },
    {
        type: 'separator'
    },
    {
        label: 'Edit note',
        click() { actionEditNote(contextCurrentNoteID); }
    },
    {
        type: 'separator'
    },
    {
        label: 'Delete note',
        click() { actionDeleteNote(contextCurrentNoteID); }
    },
];
const searchResultsContextMenu = Menu.buildFromTemplate(searchResultsContextMenuTemplate);


const notesLinksContextMenuTemplate = [
    {
        label: 'Edit note',
        click() { actionEditNote(contextCurrentNoteID); }
    },
    {
        type: 'separator'
    },
    {
        label: 'Delete note',
        click() { actionDeleteNote(contextCurrentNoteID); }
    },
];
const notesLinksContextMenu = Menu.buildFromTemplate(notesLinksContextMenuTemplate);



const editorBodyContextMenuTemplate = [
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
    // {
    //     label: "Copy'n'clip",
    //     accelerator: 'CmdOrCtrl+Shift+C',
    //     //role: 'copy'
    //     click() { copyText(); }
    // },
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
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    },
    {
        type: 'separator'
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
        label: 'Paste checkbox',
        accelerator: 'CmdOrCtrl+[',
        click() { pastePseudoCheckbox(); }
    },
    {
        label: 'Generate and paste password',
        accelerator: 'CmdOrCtrl+P',
        click() { pastePassword(); }
    },
    {
        label: 'Paste current date',
        accelerator: 'CmdOrCtrl+D',
        click() { pasteCurrentDate(); }
    },
];
const editorBodyContextMenu = Menu.buildFromTemplate(editorBodyContextMenuTemplate);



const editorTitleContextMenuTemplate = [
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
        role: 'copy',
    },
    // {
    //     label: "Copy'n'clip",
    //     accelerator: 'CmdOrCtrl+Shift+C',
    //     //role: 'copy'
    //     click() { copyText(); }
    // },
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
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    },

];

const clipsContextMenuTemplate = [
    {
        label: 'Delete clip',
        click() { actionDeleteClip(currentClipID); }
    },
];

const editorTitleContextMenu = Menu.buildFromTemplate(editorTitleContextMenuTemplate);
const clipsContextMenu = Menu.buildFromTemplate(clipsContextMenuTemplate);

ipcRenderer.on('add-from-clipboard', function() {
    addFromClipboard();
});