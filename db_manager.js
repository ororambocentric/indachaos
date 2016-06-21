"use strict";

var sqlite3 = require('sqlite3').verbose();

function DBManager() {

    var dbPath = 'db/default.db';

    var sqlite3 = require('sqlite3').verbose();
    var db = '';

    this.setDB = function (dbPath) {
        self.dbPath = dbPath;
    };

    this.getDB = function () {
        return self.dbPath;
    };

    this.createDB = function () {
        self.db = new sqlite3.Database(self.dbPath);
        self.db.run("CREATE TABLE IF NOT EXISTS note ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, ltitle TEXT, lbody TEXT, marker INTEGER DEFAULT (1))");
        self.db.run("CREATE TABLE IF NOT EXISTS clip ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT)");
    }

    this.addNote = function (title, body, marker='1') {
        self.db.run("INSERT INTO note (title, body, ltitle, lbody, marker) VALUES ($title, $body, $ltitle, $lbody, $marker)", {
            $title: title,
            $body: body,
            $ltitle: title.toLowerCase(),
            $lbody: body.toLowerCase(),
            $marker: marker
        }, afterAddNote);
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
        }, afterUpdateNote);
    };

    this.getNote = function (id, callback) {
        self.db.get("SELECT * FROM note WHERE id = "+id, function (err, row) {
            callback(err, row)
        });
        
    };
    
    this.getNotes = function (callback, extra='') {
        self.db.all("SELECT * FROM note " + extra, function (err, rows) {
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
        }, afterDeleteNote);
    };

    this.deleteClip = function (id) {
        self.db.run("DELETE FROM clip WHERE id = $id", {
            $id: id
        }, afterDeleteClip);
    };

    this.closeDB = function () {
        self.db.close();
    };


}

function afterAddNote() {
    searchNotes($("#screen-search #input-search").val());
    showScreenSearch();
}
function afterUpdateNote() {
    searchNotes($("#screen-search #input-search").val());
    showScreenSearch();
}
function afterDeleteNote() {
    searchNotes($("#screen-search #input-search").val());
}
function afterDeleteClip() {
    showScreenClips();
}
