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

"use strict";

var sqlite3 = require('sqlite3').verbose();

function SettingsManager() {

    var settingsPath = 'indachaos_settings.db';
    var settingsDb = '';

    this.setDB = function (settingsPath) {
        self.settingsPath = settingsPath;
    };

    function insertDefaults() {

        self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
            $key: 'path_to_db',
            $value: 'indachaos_notes.db'
        });
        self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
            $key: 'local_keymap',
            $value: 'ru'
        });
        self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
            $key: 'history',
            $value: '[]'
        });

    }

    this.createDB = function () {
        self.settingsDb = new sqlite3.Database(self.settingsPath);
        self.settingsDb.run("CREATE TABLE IF NOT EXISTS params (key TEXT, value TEXT, UNIQUE(key))", insertDefaults);
    };

    this.updateSettings = function (key, value) {
        self.settingsDb.run("UPDATE params SET value=$value WHERE key = $key", {
            $key: key,
            $value: value
        }, afterSettingsUpdate);
    };

    this.getParams = function (callback) {

        self.settingsDb = new sqlite3.Database(self.settingsPath);
        self.settingsDb.run("CREATE TABLE IF NOT EXISTS params (key TEXT, value TEXT, UNIQUE(key))", function () {
            self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
                $key: 'path_to_db',
                $value: 'indachaos_notes.db'
            }, function () {
                self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
                    $key: 'local_keymap',
                    $value: 'ru'
                },function () {
                    self.settingsDb.run("INSERT INTO params (key, value) VALUES ($key, $value)", {
                        $key: 'history',
                        $value: '[]'
                    }, function () {
                        self.settingsDb.all("SELECT * FROM params", function (err, rows) {
                            callback(err, rows)
                        });
                    });

                });
            });

        });


        


    };

    this.closeDB = function () {
        self.settingsDb.close();
    };
    
    function afterSettingsUpdate() {

    }

}



