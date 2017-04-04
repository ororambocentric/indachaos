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

"use strict";

var sqlite3 = require('sqlite3').verbose();

function DBManager() {

    var dbPath = '';
    var db = '';
    this.setDB = function (dbPath) {
        self.dbPath = dbPath;
    };

    this.getDB = function () {
        return self.dbPath;
    };

    this.setSecretKey = function (key) {
        if (key == '') {
            return;
        }
        self.db.run("PRAGMA key = '"+ key +"'");
    };

    this.changeSecretKey = function (key) {
        if (key == null) {
            return;
        }
        self.db.run("PRAGMA rekey = '"+ key +"'");
    };

    this.checkSecretKey = function () {
        if (dbSecretKey === null) {
            if (!require('fs').existsSync(settings.path_to_db)) {
                showScreenSetSecretKey();
            } else {
                showScreenEnterSecretKey();
            }
            return false;
        }
        return true;
    };

    function errorSaysDatabaseEnripted (err) {
        var error = String(JSON.stringify(err));
        if (error == '{"errno":26,"code":"SQLITE_NOTADB"}') {
            return true;
        } else {
            return false;
        }
    }

    this.pingKey = function (callback) {
        self.db.run("select count(*) from note", function (err, rows) {
            if (errorSaysDatabaseEnripted(err)) {
                showScreenEnterSecretKey();
                return;
            }
            callback();
        });
    };

    this.createDB = function () {
        if (!this.checkSecretKey()) {
            return;
        }
        self.db = new sqlite3.Database(self.dbPath);
        this.setSecretKey(dbSecretKey);
        this.changeSecretKey(dbChangedSecretKey);
        dbChangedSecretKey = null;
        self.db.run("CREATE TABLE IF NOT EXISTS note ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, ltitle TEXT, lbody TEXT, marker INTEGER DEFAULT (1))");
        self.db.run("CREATE TABLE IF NOT EXISTS clip ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");
        self.db.run("CREATE TABLE IF NOT EXISTS password ( id INTEGER PRIMARY KEY AUTOINCREMENT, note_id INTEGER, name TEXT, lname TEXT, password TEXT)");
    };

    this.addNote = function (title, body, marker='1') {
        self.db.run("INSERT INTO note (title, body, ltitle, lbody, marker) VALUES ($title, $body, $ltitle, $lbody, $marker)", {
            $title: title,
            $body: body,
            $ltitle: title.toLowerCase(),
            $lbody: body.toLowerCase(),
            $marker: marker
        }, afterAddNote);
    };

    this.getClipsCount = function (callback) {
        self.db.get("SELECT count(*) as c, min(id) as m FROM clip", function (err, row) {
            callback(err, row)
        });
    };

    this.addClip = function (title, body) {
        self.db.run("INSERT INTO clip (title, body) VALUES ($title, $body)", {
            $title: title,
            $body: body
        });
    };

    this.updateNote = function (id, title, body, marker='1') {
        self.db.run("UPDATE note SET title=$title, body=$body, ltitle=$ltitle, lbody=$lbody, marker=$marker WHERE id = $id", {
            $id: id,
            $title: title,
            $body: body,
            $ltitle: title.toLowerCase(),
            $lbody: body.toLowerCase(),
            $marker: marker
        }, afterUpdateNote(id));
    };

    this.getNote = function (id, callback) {
        self.db.get("SELECT note.*, password.note_id, password.name, password.lname, password.password FROM note LEFT JOIN password ON note.id = password.note_id WHERE note.id = "+id, function (err, row) {
            callback(err, row)
        });

    };

    this.getNotes = function (callback, extra='') {
        self.db.all("SELECT note.*, password.note_id, password.name, password.lname, password.password FROM note LEFT JOIN password ON note.id = password.note_id " + extra, function (err, rows) {
            callback(err, rows)
        });
    };

    this.getClips = function (callback, extra='') {
        self.db.all("SELECT * FROM clip " + extra, function (err, rows) {
            callback(err, rows)
        });
    };

    this.deleteNote = function (id) {
        self.db.run("DELETE FROM note WHERE id = $id", {
            $id: id
        }, afterDeleteNote(id));
    };

    this.deleteClip = function (id) {
        self.db.run("DELETE FROM clip WHERE id = $id", {
            $id: id
        }, afterDeleteClip);
    };

    this.deleteClips = function () {
        self.db.run("DELETE FROM clip", afterDeleteClips);
    };

    this.closeDB = function () {
        self.db.close();
    };

    function afterAddNote() {
        self.db.get("SELECT id FROM note ORDER BY id DESC LIMIT 1", function (err, row) {
            addPasswordsToDB(row.id, function (noteID) {
                addToHistory(noteID);
                renderNotesLinks();
                //searchNotes($("#screen-search #input-search").val());
                showScreenSearch();
                researchNotes();
            });
        });
    }
    function afterUpdateNote(noteID) {
        deletePasswordsByNoteID(noteID, function (noteID) {
            addPasswordsToDB(noteID, function (noteID) {
                afterUpdatePassword();
            });
        });
    }
    function afterUpdatePassword() {
        renderNotesLinks();
        //searchNotes($("#screen-search #input-search").val());
        if (!dontCloseScreen) {
            showScreenSearch();
        }
        dontCloseScreen = false;
        researchNotes();
    }
    function afterDeleteNote(nodeID) {
        deletePasswordsByNoteID(nodeID, function (nodeID) {
            renderNotesLinks();
            //searchNotes($("#screen-search #input-search").val());
            researchNotes();
        });

    }
    function afterDeleteClip() {
        searchClips();
    }

    function afterDeleteClips() {
        searchClips();
    }

    function addPassword(note_id, name, password) {
        self.db.run("INSERT INTO password (note_id, name, lname, password) VALUES ($note_id, $name, $lname, $password)", {
            $note_id: note_id,
            $name: name,
            $lname: name.toLowerCase(),
            $password: password
        });
    };

    function addPasswordsToDB(noteID, callback) {
        if (vmPasswordsEditWidget.passwords.length) {
            for (var i in vmPasswordsEditWidget.passwords) {
                addPassword(
                    noteID,
                    vmPasswordsEditWidget.passwords[i].name,
                    vmPasswordsEditWidget.passwords[i].password);
            }
        }
        callback(noteID);
    }

    this.getPasswords = function (noteID, callback) {
        self.db.all("SELECT * FROM password WHERE note_id = "+noteID, function (err, rows) {
            callback(err, rows)
        });
    };

    function deletePasswordsByNoteID(noteID, callback) {
        self.db.run("DELETE FROM password WHERE note_id = "+noteID, callback(noteID));
    };

}


