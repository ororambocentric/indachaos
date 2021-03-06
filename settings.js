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

var settings = {
    path_to_db: 'default.indc',
    local_keymap: 'ru',
    history: [],
    last_editing_note_id: 0,
    history_length: 30,
    color_theme: 'default',
    todos: [],
    notifications: [],
    notifications_is_read: true,
    date_format: "DD.MM.YYYY",
    time_format: "HH:mm",
    animationSpeed: 250
};

function loadAppSettings(callback) {
    require('fs').readFile('./settings', function read(err, data) {
        if (data) {
            settings = JSON.parse(data);
        }
        callback();
    });
}

function updateAppSettings() {
    require('fs').writeFileSync('./settings', JSON.stringify(settings, null, 2));
}

function createSettingsFileIfNotExists() {
    if (!require('fs').existsSync('./settings')) {
        updateAppSettings();
    }
}

