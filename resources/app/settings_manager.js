
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



