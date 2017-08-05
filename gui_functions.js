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

var dbSecretKey = null;
var dbChangedSecretKey = null;
var clipTitle='', clipBody='';
var currentResultIndex = -1;
var searchMatchesCount = 0;
var activeScreen = 'search';
var navigatorList = [];
var navigatorPos = 0;
var historyPos = -1;
var contextCurrentNoteID = 0;
var currentClipID = 0;
var windowScrollTop = 0;
var lastSearchPattern = '-';
var windowMustBeHidden = false;
var addingFromClipboard = false;
var editorDataModified = false;
var dontCloseScreen = false;

const {clipboard} = require('electron');
const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;

function hideAllScreens() {
    $("[id^=screen]").hide();
    if ($("#sidebar").css('display') != 'none') {
        $("#sidebar").hide();
        $(".container").removeClass('with-sidebar');
    }
    if (activeScreen != 'edit') {
        windowMustBeHidden = false;
        addingFromClipboard = false;
    }
    dontCloseScreen = false;
    editorDataModified = false;

}

function showScreenSettings() {
    if (activeScreen == 'settings') {
        //showScreenSearch();
        return;
    }
    activeScreen = 'settings';
    hideAllScreens();
    $("#screen-settings #path-to-db").val(settings.path_to_db);
    $("#screen-settings #local-keymap").val(settings.local_keymap);
    $("#screen-settings #history-length").val(settings.history_length);
    $("#screen-settings #theme-"+settings.color_theme+".color-theme").prop('checked', 'checked');
    $("#screen-settings").fadeIn(settings.animationSpeed);
    $('#screen-settings #path-to-db').focus();
}

function showScreenTodo() {

    if (activeScreen == 'todo') {
        //showScreenSearch();
        $("#screen-todo #input-todo").focus();
        return;
    }
    activeScreen = 'todo';
    hideAllScreens();
    $("#screen-todo").fadeIn(settings.animationSpeed);
    $("#screen-todo #input-todo").focus();
}

function showScreenNotifications() {

    if (activeScreen == 'notifications') {
        //showScreenSearch();
        return;
    }
    activeScreen = 'notifications';
    checkNotifications();
    hideAllScreens();
    $("#screen-notifications").fadeIn(settings.animationSpeed);
}

function showScreenAbout() {
    if (activeScreen == 'about') {
        //showScreenSearch();
        return;
    }
    activeScreen = 'about';
    hideAllScreens();
    $("#screen-about").fadeIn(settings.animationSpeed);
}


function showScreenSearch() {
    activeScreen = 'search';
    hideAllScreens();
    $("#screen-search").fadeIn(settings.animationSpeed);
    if ($("#button-sidebar-toggle").hasClass('active')) {
        $("#sidebar").fadeIn(settings.animationSpeed);
        $(".container").addClass('with-sidebar');
    }
    $("#screen-search #input-search").focus();
    $("#screen-edit #title").val('');
    $("#screen-edit #body").val('');
    $(window).scrollTop(windowScrollTop);
}

function showScreenEdit(id) {
    activeScreen = 'edit';
    hideAllScreens();
    if (id === undefined) {
        $("#screen-edit").removeAttr('data-id');
        $("#edit-screen-title").text('Add note');
        $("#screen-edit #title").val('');
        $("#screen-edit #body").addClass('compact').val('');
        vmPasswordsEditWidget.passwords = [];
    } else {
        $("#edit-screen-title").text('Edit note');
        var nm = new DBManager();
        nm.setDB(settings.path_to_db);
        nm.createDB();
        nm.getNote(id, function (err, row) {
            $("#screen-edit").attr('data-id', row.id);
            $("#screen-edit #title").val(row.title);
            $("#screen-edit #body").addClass('compact').val(row.body);
            vmPasswordsEditWidget.passwords = [];
            loadNotePasswordsData(row.id);
        });
        nm.closeDB();

    }
    displayEditorSaveButton();
    $("#screen-edit").fadeIn(settings.animationSpeed);
    if (id === undefined) {
        //$("#screen-edit #title").focus();
        $("#screen-edit #body").focus();
    } else {
        $("#screen-edit #body").focus();
    }
}

function showScreenClips() {
    if (activeScreen == 'clips') {
        //showScreenSearch();
        return;
    }
    activeScreen = 'clips';
    searchClips();
    hideAllScreens();
    $("#screen-clips").fadeIn(settings.animationSpeed);

}

function showScreenSetSecretKey() {
    if (activeScreen == 'set-secret-key') {
        return;
    }
    activeScreen = 'set-secret-key';
    hideAllScreens();
    $("#screen-set-secret-key").fadeIn(settings.animationSpeed);
    $("#screen-set-secret-key #key-repeat").val('');
    $("#screen-set-secret-key #key").val('').focus();

}

function showScreenChangeSecretKey() {
    if (activeScreen == 'change-secret-key') {
        return;
    }
    activeScreen = 'change-secret-key';
    hideAllScreens();
    $("#screen-change-secret-key").fadeIn(settings.animationSpeed);
    $("#screen-change-secret-key #new-key").val('').focus();
    $("#screen-change-secret-key #new-key-repeat").val('');

}

function showScreenEnterSecretKey() {
    if (activeScreen == 'enter-secret-key') {
        return;
    }
    activeScreen = 'enter-secret-key';
    dbSecretKey == null;
    hideAllScreens();
    $("#screen-enter-secret-key").fadeIn(settings.animationSpeed);
    $("#screen-enter-secret-key #key").val('').focus();

}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPassword(row) {
    var render = '';
    //render += '<div>';
    render += '<button class="btn btn-default copy-password-button" data-password="'+row.password+'" data-note-id="'+row.id+'" title="click to copy / click with \'ctrl\' for Copy\'n\'Clip">';
    render += '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span> '+row.name;
    render += '</button>';
    //render += '</div>';
    return render;
}

function renderFoundNote(note, patternArray, rows) {

    var render_passwords = '';
    rows.forEach(function (row) {
        if (row.note_id != note.id) {
            return;
        }
        render_passwords += renderPassword(row);
    });

    var render = '';
    var title = escapeHtml(note.title);
    var body = escapeHtml(note.body);
    render += '<a name="note_'+note.id+'"></a>';
    render += '<div data-id="'+note.id+'" class="note">';
    render += '<div class="btn-group pull-right" role="group">';
    render += '<button data-id="'+note.id+'" type="button" class="button-edit-note btn btn-default" title="Edit note">';
    render += '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>';
    render += '</button>';
    render += '<button data-id="'+note.id+'" type="button" class="button-delete-note btn btn-default" title="Delete note">';
    render += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>';
    render += '</button>';
    render += '</div>';
    render += '<h2 class="title">'+title+'</h2>';
    if (note.created_at == note.updated_at) {
        render += '<p class="date">'+note.created_at+'</p>';
    } else {
        render += '<p class="date">'+note.created_at+', <b>upd</b>: '+note.updated_at+'</p>';
    }
    render += render_passwords;
    render += '<div class="body">';
    render += body;
    render += '</div>';
    render += '</div>';
    render += '</div>';
    return render;
}

function searchNotes(pattern, id) {

    if (pattern == lastSearchPattern && id === undefined) {
        return;
    } else {
        lastSearchPattern = pattern;
    }

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();

    var patternArray = pattern.trim().split(' ');
    var extra = " WHERE ";

    if (id !== undefined) {
        extra += " note.id = '"+id+"'";
    } else {
        for (var i in patternArray) {
            var keymaped1 = alterKeymap(patternArray[i], 'en', settings.local_keymap);
            var keymaped2 = alterKeymap(patternArray[i], settings.local_keymap, 'en');
            extra += " (note.title LIKE '%"+patternArray[i]+"%' OR note.ltitle LIKE '%"+patternArray[i]+"%' OR note.body LIKE '%"+patternArray[i]+"%' or note.lbody LIKE '%"+patternArray[i]+"%' OR note.created_at LIKE '%"+patternArray[i]+"%' or note.updated_at LIKE '%"+patternArray[i]+"%' or password.name LIKE '%"+patternArray[i]+"%' or password.lname LIKE '%"+patternArray[i]+"%'";
            extra += " OR note.title LIKE '%"+keymaped1+"%' OR note.ltitle LIKE '%"+keymaped1+"%' OR note.body LIKE '%"+keymaped1+"%' or note.lbody LIKE '%"+keymaped1+"%' or password.name LIKE '%"+keymaped1+"%' or password.lname LIKE '%"+keymaped1+"%'";
            extra += " OR note.title LIKE '%"+keymaped2+"%' OR note.ltitle LIKE '%"+keymaped2+"%' OR note.body LIKE '%"+keymaped2+"%' or note.lbody LIKE '%"+keymaped2+"%' or password.name LIKE '%"+keymaped2+"%' or password.lname LIKE '%"+keymaped2+"%')";

            if (i < patternArray.length-1) {
                extra += ' AND ';
            } else {
                extra += " ORDER BY note.id DESC";
            }

        }
    }

    nm.getNotes(function (err, rows) {
        var html = '';
        var idList = [];
        $("#sidebar .note-link").hide();
        if (rows.length) {
            $("#sidebar").css('overflow-y', 'scroll');
        } else {
            $("#sidebar").css('overflow-y', 'hidden');
        }
        var last_note_id;
        rows.forEach(function (note) {
            if (last_note_id == note.id) {

                return;
            } else {
                last_note_id = note.id;
            }
            idList.push(note.id);
            html += renderFoundNote(note, patternArray, rows);
            $("#sidebar .note-link[data-id="+note.id+"]").show();
        });

        $("#search-results-area").html(html);
        navigatorList = idList;
        navigatorPos = 0;

        if (idList.length) {
            markActiveNoteLink(idList[0]);
        }

        $(".found-counter").text(idList.length);


        if (id === undefined) {

            if (rows.length) {
                currentResultIndex = -1;
                $('body').animate({ scrollTop: $('a[name^=note_]:first').offset().top -100 }, 0, function () {

                });
            }


            for (var i in patternArray) {
                $("#search-results-area").highlight(patternArray[i]);
                $("#search-results-area").highlight(alterKeymap(patternArray[i], 'en', settings.local_keymap));
                $("#search-results-area").highlight(alterKeymap(patternArray[i], settings.local_keymap, 'en'));
                searchMatchesCount = $(".highlight").length;
            }

            var i = 1;
            $(".highlight").each(function () {
                $(this).attr('data-index', i);
                i++;
            });

        }



    }, extra);
}

function renderNoteLink(note) {

    var render = '';
    var title = escapeHtml(note.title);
    render += '<button data-id="'+note.id+'" class="note-link btn btn-default btn-block" type="submit" title="Show">'+title+'</button>';
    return render;
}

function renderNotesLinks() {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();

    var extra = " ORDER BY note.id DESC";

    nm.getNotes(function (err, rows) {

        var html = '';
        var last_note_id;
        rows.forEach(function (note) {
            if (last_note_id == note.id) {
                return;
            } else {
                last_note_id = note.id;
            }
            html += renderNoteLink(note);
        });
        $("#notes-links-area").html(html);

        searchNotes($("#screen-search #input-search").val());
        historyPos = settings.history.length -1;

    }, extra);
    nm.closeDB();
}

function renderFoundClip(clip) {
    var render = '';
    var title = escapeHtml(clip.title);
    var body = escapeHtml(clip.body);
    render += '<div class="row clip" data-id="'+clip.id+'">';
    render += '<button class="btn btn-default btn-block" type="submit" title="Copy it">';
    render += '<p class="clip-title">... '+title+'</p>';
    render += '<p class="clip-text '+((clip.is_password) ? "is_password" : "")+'">';
    //render += '<span class="glyphicon glyphicon-copy" aria-hidden="true"></span>';
    render += body;
    render += '</p>';
    if (clip.is_password) {
        render += '<p class="clip-caption">';
        render += '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>';
        render += clip.caption;
        render += '</p>';
    }
    render += '</button>';
    render += '</div>';
    return render;
}

function searchClips() {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    var extra = " ORDER BY id DESC";
    nm.getClips(function (err, rows) {
        var html = '';
        rows.forEach(function (clip) {
            html += renderFoundClip(clip);
        });
        $("#clips-area").html(html);
    }, extra);
}

function addNote(title, body) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.addNote(title, body);
    nm.closeDB();
}

function addClip(title, body, is_password, caption) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.addClip(title, body, is_password, caption);
    nm.closeDB();
}

function updateNote(id, title, body) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.updateNote(id, title, body);
    nm.closeDB();
}

function deleteNote(id) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.deleteNote(id);
    nm.closeDB();

    if (settings.last_editing_note_id == id) {
        settings.last_editing_note_id = 0;
    }

    deleteNoteFromHistory(id);
    deleteDuplicatesFromHistory();
    updateAppSettings();
}

function deleteClip(id) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.deleteClip(id);
    nm.closeDB();
}

function navigatorSaveCurrent(id) {
    var pos = navigatorList.indexOf(parseInt(id));
    navigatorPos = pos;
}

function navigatorForward() {

    var pos = navigatorPos;
    if (pos < navigatorList.length - 1) {
        $('body').animate({ scrollTop: $('[name=note_'+navigatorList[pos+1]+']').offset().top -80 }, 0, function () {
            navigatorPos = ++pos;
            $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        navigatorPos = 0;
    }

    var noteID = navigatorList[pos];
    if (activeScreen == 'edit' && noteID !== undefined && !editorDataModified) {
        showScreenEdit(noteID);
        return;
    }

    $(".highlight").removeClass('highlight-current');
    $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").addClass('highlight-current');
    currentResultIndex = parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").attr('data-index')) - 1;

    markActiveNoteLink(parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").attr('data-id')));

}

function navigatorBackward() {

    var pos = navigatorPos;
    if (pos > 0) {
        $('body').animate({ scrollTop: $('[name=note_'+navigatorList[pos-1]+']').offset().top -80 }, 0, function () {
            navigatorPos = --pos;
            $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        navigatorPos = navigatorList.length-1;
    }

    var noteID = navigatorList[pos];
    if (activeScreen == 'edit' && noteID !== undefined && !editorDataModified) {
        showScreenEdit(noteID);
        return;
    }

    $(".highlight").removeClass('highlight-current');
    $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").addClass('highlight-current');
    currentResultIndex = parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").attr('data-index')) - 1;

    markActiveNoteLink(parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").attr('data-id')));

}

function gotoNextResult() {
    $("#button-gotoresult-forward").focus();

    // var noteId = parseInt($(".highlight-current").parent().parent().attr('data-id'));
    // var idList = $("#search-results-area").attr('data-navigator-list').split(',');
    // idList = idList.map(function(value) {
    //     return parseInt(value);
    // });
    // var pos = idList.indexOf(noteId);
    // if (pos < idList.length-1) {
    //     pos++;
    // } else {
    //     pos = 0;
    // }
    // $("#search-results-area").attr('data-navigator-pos', pos);

    if (searchMatchesCount === 0) return;
    if (currentResultIndex < searchMatchesCount-1) {
        currentResultIndex++;
    } else {
        currentResultIndex = 0;
    }
    $(".highlight").removeClass('highlight-current');
    $(".highlight:eq("+currentResultIndex+")").addClass('highlight-current');
    $(document).scrollTop($(".highlight:eq("+currentResultIndex+")").offset().top -300);

    var noteId = parseInt($(".highlight-current").parent().parent().attr('data-id'));
    var pos = navigatorList.indexOf(parseInt(noteId));
    navigatorPos = pos;

    markActiveNoteLink(parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").attr('data-id')));

}

function gotoPrevResult() {
    $("#button-gotoresult-backward").focus();

    // var noteId = parseInt($(".highlight-current").parent().parent().attr('data-id'));
    // var idList = $("#search-results-area").attr('data-navigator-list').split(',');
    // idList = idList.map(function(value) {
    //     return parseInt(value);
    // });
    // var pos = idList.indexOf(noteId);
    // if (pos > 0) {
    //     pos--;
    // } else {
    //     pos = idList.length-1;
    // }
    // $("#search-results-area").attr('data-navigator-pos', pos);

    if (searchMatchesCount === 0) return;
    if (currentResultIndex > 0) {
        currentResultIndex--;
    } else {
        currentResultIndex = searchMatchesCount - 1;
    }
    $(".highlight").removeClass('highlight-current');
    $(".highlight:eq("+currentResultIndex+")").addClass('highlight-current');
    $(document).scrollTop($(".highlight:eq("+currentResultIndex+")").offset().top -300);

    var noteId = parseInt($(".highlight-current").parent().parent().attr('data-id'));
    var pos = navigatorList.indexOf(parseInt(noteId));
    navigatorPos = pos;

    markActiveNoteLink(parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").attr('data-id')));

}


function copyText(viaClips = true) {
    var selection = window.getSelection().getRangeAt(0).toString();
    if (selection == '') selection = window.getSelection().toString();
    clipboard.writeText(selection);
    clipboard.writeText(selection, 'selection');
    if (viaClips) {
        $('#button-clips').addClass('active');
        setTimeout(function () {
            $('#button-clips').removeClass('active');
        }, 300);
    }
    if (viaClips && clipBody != '' && selection != '') {
        addClip(clipTitle, clipBody);
        clipTitle = clipBody = '';
    }
}

function registerShortcuts() {

    $(document).keydown(function (e) {


        // ESC
        if(e.which == 27) {

            if (activeScreen == 'todo') {
                vmTodoList.editMode.enabled = false;
            }

            if (activeScreen != 'search')
                showScreenSearch();
        }

        //ctrl + N
        // if(e.which == 78 && e.ctrlKey) {
        //     $("#button-add-note").trigger('click');
        //     return false;
        // }

        //ctrl + F
        // if(e.which == 70 && e.ctrlKey) {
        //     $("#screen-search #input-search").focus();
        //     return false;
        // }

        // //ctrl + Y
        // if(e.which == 89 && e.ctrlKey) {
        //     $("#button-clips").trigger('click');
        //     return false;
        // }

        //ctrl + S / ctrl + shift + S
        if(e.which == 83 && e.ctrlKey) {

            if (activeScreen == 'settings') {
                $("#screen-settings #button-settings-save").trigger('click');
                return;
            }

            if (activeScreen == 'edit') {

                if (e.shiftKey) {
                    $("#screen-edit #button-save").trigger('click');
                    return;
                }

                $("#screen-edit #button-ok").trigger('click');
                return;
            }
            return false;
        }

        //shift + ctrl + C / ctrl + C
        if(e.which == 67 && e.ctrlKey) {
            if (e.shiftKey) {
                copyText();
            } else {
                copyText(false);
            }

            return false;
        }

        //ctrl + Up
        if(e.which == 38 && e.ctrlKey) {
            $("#button-navigator-backward").trigger('click');
            return false;
        }

        //ctrl + Down
        if(e.which == 40 && e.ctrlKey) {
            $("#button-navigator-forward").trigger('click');
            return false;
        }

        //F3 / Shift+F3
        if(e.which == 114) {
            if (e.shiftKey){
                $("#button-gotoresult-backward").trigger('click');
            } else {
                $("#button-gotoresult-forward").trigger('click');
            }
            return false;
        }

        // Ctrl + Left
        if(e.which == 37 && e.ctrlKey) {
            $("#input-search").blur();
            historyBack();
            return false;
        }

        // Ctrl + Right
        if(e.which == 39 && e.ctrlKey) {
            $("#input-search").blur();
            historyForward();
            return false;
        }

        // Editor: Ctrl + -
        if(e.which == 109 && e.ctrlKey) {
            pasteLine();
            return false;
        }
        // Editor: Ctrl + -
        if(e.which == 189 && e.ctrlKey) {
            pasteLine();
            return false;
        }
        // Editor: Ctrl + =
        if(e.which == 187 && e.ctrlKey) {
            pasteDoubleLine();
            return false;
        }
        // Editor: Ctrl + [
        if(e.which == 219 && e.ctrlKey) {
            pastePseudoCheckbox();
            return false;
        }
        // Editor: Ctrl + P
        if(e.which == 80 && e.ctrlKey) {
            pastePassword();
            return false;
        }
        // Editor: Ctrl + D
        if(e.which == 68 && e.ctrlKey) {
            pasteCurrentDate();
            return false;
        }




    });
}

var KEYMAPS = {
    en: [
        "q","w","e","r","t","y","u","i","o","p","\\[","\\]",
        "a","s","d","f","g","h","j","k","l",";","'",
        "z","x","c","v","b","n","m",",","\\."
    ],
    ru: [
        "й","ц","у","к","е","н","г","ш","щ","з","х","ъ",
        "ф","ы","в","а","п","р","о","л","д","ж","э",
        "я","ч","с","м","и","т","ь","б","ю"
    ]
};

function alterKeymap(str, from, to) {

    for (var i = 0; i < KEYMAPS[from].length; i++)
    {
        var reg = new RegExp(KEYMAPS[from][i], 'mig');
        str = str.replace(reg, function (a) {
            return a == a.toLowerCase() ? KEYMAPS[to][i] : KEYMAPS[to][i].toUpperCase();
        });
    }

    return str;
}

function pasteLine() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            $('#body').insertAtCaret('-------------------------------------------\n');
        }
    }
}

function pasteDoubleLine() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            $('#body').insertAtCaret('===========================================\n');
        }
    }
}

function pastePseudoCheckbox() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            $('#body').insertAtCaret('[ ] ');
        }
    }
}

function pasteCurrentDate() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            $('#body').insertAtCaret(new Date()+"");
        }
    }
}

function genPassword(len=32) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789012345678901234567890123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function pastePassword() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            $('#body').insertAtCaret(genPassword(32));
        }
    }
}

function toggleSidebar() {
    if (activeScreen != 'search') return;
    if ($("#sidebar").css('display') == 'none') {
        $("#button-sidebar-toggle").addClass('active');
        $("#sidebar").fadeIn(settings.animationSpeed);
        $(".container").addClass('with-sidebar');
    } else {
        $("#button-sidebar-toggle").removeClass('active');
        $("#sidebar").fadeOut(settings.animationSpeed / 2, function () {
            $(".container").removeClass('with-sidebar');
        });

    }
}

function stripHtml(html){
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function getHTMLOfSelection () {
    var range;
    if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        return range.htmlText;
    }
    else if (window.getSelection) {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            var clonedSelection = range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(clonedSelection);
            return div.innerHTML;
        }
        else {
            return '';
        }
    }
    else {
        return '';
    }
}

function clearClips() {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.deleteClips();
    nm.closeDB();
}

function markActiveNoteLink(noteID) {
    $("#sidebar .note-link").removeClass('active');
    $("#sidebar .note-link[data-id="+noteID+"]").addClass('active');
    // $("#sidebar #notes-links-area").animate({ scrollTop: $("#sidebar .note-link[data-id="+noteID+"]").offset().top -100 }, 0, function () {
    //
    // });
}

function historyBack() {

    if (!settings.history.length) return;

    if (historyPos == 0) {
        historyPos = settings.history.length -1;
    } else {
        historyPos --;
    }

    var historyRecord = settings.history[historyPos];
    historyRecord.n = parseInt(historyRecord.n);

    var noteID = $("#screen-edit").attr('data-id');
    if (activeScreen == 'edit' && noteID !== undefined && !editorDataModified) {
        showScreenEdit(historyRecord.n);
        return;
    }

    if (navigatorList.indexOf(historyRecord.n) < 0) {
        $("#input-search").val(historyRecord.s);
        searchNotes(historyRecord.s);
    }

    triggerNoteLink(historyRecord.n);
    $("#search-results-area [name=note_"+historyRecord.n+"] + .note .button-edit-note").focus();

}

function historyForward() {

    if (!settings.history.length) return;

    if (historyPos == settings.history.length -1) {
        historyPos = 0;
    } else {
        historyPos ++;
    }

    var historyRecord = settings.history[historyPos];
    historyRecord.n = parseInt(historyRecord.n);

    var noteID = $("#screen-edit").attr('data-id');
    if (activeScreen == 'edit' && noteID !== undefined && !editorDataModified) {
        showScreenEdit(historyRecord.n);
        return;
    }

    if (navigatorList.indexOf(historyRecord.n) < 0) {
        $("#input-search").val(historyRecord.s);
        searchNotes(historyRecord.s);
    }
    triggerNoteLink(historyRecord.n);
    $("#search-results-area [name=note_"+historyRecord.n+"] + .note .button-edit-note").focus();

}

function addToHistory(noteID) {
    if (settings.history.length && settings.history[settings.history.length -1].n == noteID) {
        return;
    }
    if (settings.history.length == settings.history_length) {
        settings.history.shift();
    }
    var historyRecord = {
        's': $("#screen-search #input-search").val(),
        'n': noteID,
    };
    settings.history.push(historyRecord);
    updateAppSettings();
    historyPos = settings.history.length -1;
}

function triggerNoteLink(noteID) {

    var noteLinkElem = $("#notes-links-area .note-link[data-id="+noteID+"]");
    navigatorPos = navigatorList.indexOf(noteID);
    $("#notes-links-area .note-link").removeClass('active');
    noteLinkElem.addClass('active');
    $('body').animate({ scrollTop: $('a[name=note_'+noteID+']').offset().top -80 }, 0, function () {

    });
}

function researchNotes() {
    lastSearchPattern = '-';
    searchNotes($("#screen-search #input-search").val());
    $("#sidebar").scrollTop(0);
    $(window).scrollTop(0);
}

function actionDeleteNote(noteID) {
    if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(noteID);
        //$("#notes-links-area").scrollTop(0);
    }
}

function actionDeleteClip(clipID) {
    if (confirm('Are you sure you want to delete this clip?')) {
        deleteClip(clipID);
    }
}

function actionEditNote(noteID) {
    settings.last_editing_note_id = noteID;
    updateAppSettings();
    showScreenEdit(noteID);
    addToHistory(noteID);
}

function actionCloneNote(noteID) {

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.getNote(noteID, function (err, row) {
        vmPasswordsEditWidget.passwords = [];
        loadNotePasswordsData(noteID);
        addNote(row.title, row.body);
    });
    nm.closeDB();

}

function actionClearHistory() {
    if (confirm('Are you sure you want to clear history?')) {
        settings.history = [];
        settings.last_editing_note_id = 0;
        historyPos = -1;
        updateAppSettings();
        alert('History is successful cleared.');
    }
}

function actionGoToLastEditing() {
    if (!settings.last_editing_note_id) return;
    if (activeScreen == 'edit') return;
    actionEditNote(settings.last_editing_note_id);
}

function deleteNoteFromHistory(noteID) {

    for (var i = 0; i < settings.history.length; i++) {
        if (settings.history[i].n == noteID) {
            settings.history.splice(i, 1);
            i--;
        }
    }

}
function deleteDuplicatesFromHistory() {

    for (var i = 0; i < settings.history.length; i++) {
        if (i < settings.history.length -1) {
            if (settings.history[i].n == settings.history[i+1].n) {
                settings.history.splice(i, 1);
                i--;
            }
        }
    }

}

function setColorTheme(name) {
    if (name != 'default') {
        $('#add-color-theme').remove();
        $('head').append('<link id="add-color-theme" rel="stylesheet" href="theme-'+name+'.css">')
    } else {
        $('#add-color-theme').remove();
    }
}

function displayEditorSaveButton() {
    if (editorDataModified) {
        $("#screen-edit #button-save").show(settings.animationSpeed);
    } else {
        $("#screen-edit #button-save").hide(settings.animationSpeed);
    }

}

function trayAddFromClipboard() {
    var body = clipboard.readText().trim();
    if (body == '') {
        alert('Clipboard is empty.');
        if (windowMustBeHidden) {
            windowMustBeHidden = false;
            const { remote } = require('electron');
            remote.BrowserWindow.getAllWindows()[0].minimize();
        }
        windowMustBeHidden = false;
        addingFromClipboard = false;
        return;
    }
    showScreenEdit();
    $("#screen-edit #body").val(body);
    addingFromClipboard = true;
}

function trayTodoFromClipboard() {
    var body = clipboard.readText().trim();
    if (body == '') {
        alert('Clipboard is empty.');
        return;
    }
    vmTodoList.newItemInput = body;
    vmTodoList.addItem();
    showScreenTodo();
}

function trayAdd() {
    showScreenEdit();
}

function trayOpenRecent() {
    actionGoToLastEditing();
}

function trayClips() {
    showScreenClips();
}

function trayTodoList() {
    showScreenTodo();
}

function trayNotifications() {
    showScreenNotifications();
}

function traySettings() {
    showScreenSettings();
}

function trayChangeSecretKey() {
    showScreenChangeSecretKey();
}

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString();
    var dd  = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

function watchTodoRemainds() {

    var dateFormat = 'YYYY-MM-DD';
    var timeFormat = 'HH:mm';

    for (var i in settings.todos) {

        if (!settings.todos[i].remind_enabled) continue;

        var now_timestamp = moment().unix();
        var remind_date_object = moment(settings.todos[i].remind_date + ' ' + settings.todos[i].remind_time);
        var remind_timestamp = remind_date_object.unix();

        if (now_timestamp < remind_timestamp) continue;

        var notification = new Notification('Indachaos reminds', {
            body: escapeHtml(getTodoGategoryByID(settings.todos[i].category) + '\n\r' + settings.todos[i].remind_date + ' at '+ settings.todos[i].remind_time + '\n\r' +
                settings.todos[i].text + '\n\r\n\r' + ((settings.todos[i].details) ? settings.todos[i].details : '')),
            icon: 'images/app-icon.png'
        });

        const noise = new Audio('sound/notif_1.wav');
        noise.play();

        notification.onclick = function() {
            require('electron').remote.getCurrentWindow().webContents.send('notifications');
            require('electron').remote.getCurrentWindow().show();
        };

        settings.todos[i].remind_enabled = false;

        if (settings.todos[i].remind_repeat !== '0') {

            if (settings.todos[i].remind_repeat === '1') {
                var nextDate = remind_date_object.add(1, 'minute');
            } else if (settings.todos[i].remind_repeat === '2') {
                var nextDate = remind_date_object.add(1, 'hour');
            } else if (settings.todos[i].remind_repeat === '3') {
                var nextDate = remind_date_object.add(1, 'day');
            } else if (settings.todos[i].remind_repeat === '4') {
                var nextDate = remind_date_object.add(1, 'week');
            } else if (settings.todos[i].remind_repeat === '5') {
                var nextDate = remind_date_object.add(1, 'month');
            } else if (settings.todos[i].remind_repeat === '6') {
                var nextDate = remind_date_object.add(1, 'year');
            }

            settings.todos[i].remind_date = nextDate.format(dateFormat);
            settings.todos[i].remind_time = nextDate.format(timeFormat);
            settings.todos[i].remind_enabled = true;
            settings.todos[i].strikeout = false;

        }

        addNotification({
            category: getTodoGategoryByID(settings.todos[i].category),
            time: moment().format(settings.date_format + ' ' + settings.time_format),
            text: settings.todos[i].text,
            details: settings.todos[i].details
        });

        updateAppSettings();
        loadTodosFromSettings();
        loadNotificationsFromSettings();
    }
}

// todo if (index) {... !!!!
function loadTodosFromSettings(index) {
    if (index) {
        var todos = $.extend(true, [], settings.todos);
        vmTodoList.todos = todos;
    } else {
        var todos = $.extend(true, [], settings.todos);
        vmTodoList.todos = todos;
    }

}
// todo if (index) {... !!!!
function loadTodosToSettings(index) {
    if (index) {
        var todos = $.extend(true, [], vmTodoList.todos);
        settings.todos = todos;
    } else {
        var todos = $.extend(true, [], vmTodoList.todos);
        settings.todos = todos;
    }

}

function loadNotificationsFromSettings(index) {
    vmNotifications.notifications = settings.notifications.slice();
}

function loadNotificationsToSettings(index) {
    settings.notifications = vmNotifications.notifications.slice();
}

function addNotification(notification) {
    settings.notifications.unshift(notification);
    settings.notifications_is_read = false;
    checkNotifications();
}

function checkNotifications() {
    if (activeScreen == 'notifications') {
        settings.notifications_is_read = true;
        updateAppSettings();
    }
    if (settings.notifications_is_read) {
        ipcRenderer.send('set-tray-icon-normal');
        $("#button-notifications").removeClass('unread');
    } else {
        ipcRenderer.send('set-tray-icon-notif');
        $("#button-notifications").addClass('unread');
    }

}

function getTodoGategoryByID(id) {
    switch (id) {
        case '10':
            return 'Work';
        case '20':
            return 'Project';
        case '30':
            return 'Personal';
        case '40':
            return 'Family';
    }
}

function loadNotePasswordsData(noteID) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.getPasswords(noteID, function (err, rows) {
        rows.forEach(function (row) {
            vmPasswordsEditWidget.passwords.push({
                name: row.name,
                password: row.password,
                confirm: row.password,
                visibility: false
            });
        });
    });
    nm.closeDB();
}

function loadNotePasswordsData(noteID) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.getPasswords(noteID, function (err, rows) {
        rows.forEach(function (row) {
            vmPasswordsEditWidget.passwords.push({
                name: row.name,
                password: row.password,
                confirm: row.password,
                visibility: false,
                name_valid: true,
                password_valid: true,
                confirm_valid: true
            });
        });
    });
    nm.closeDB();
}

