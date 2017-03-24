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

$(document).ready(function () {

    createSettingsFileIfNotExists();

    loadAppSettings(function () {
        setColorTheme(settings.color_theme);
        $(".container").fadeIn(settings.animationSpeed);
        registerShortcuts();
        showScreenSearch();
        toggleSidebar();
        loadTodosFromSettings();
        loadNotificationsFromSettings();
        checkNotifications();
        renderNotesLinks();
    });

    var appTimer = setInterval(function () {
        watchTodoRemainds();
    }, 1000);

    $(document).on('click', "#button-settings-back", function () {
        activeScreen = 'search';
        showScreenSearch();


    });

    $(document).on('click', "#button-settings-save", function () {
        if (settings.path_to_db != $("#screen-settings #path-to-db").val()) {
            dbSecretKey = null;
        }
        settings.path_to_db = $("#screen-settings #path-to-db").val();
        settings.local_keymap = $("#screen-settings #local-keymap").val();
        settings.history_length = $("#screen-settings #history-length").val();
        settings.color_theme = $("[name=color_theme]:checked").val();
        setColorTheme(settings.color_theme);
        updateAppSettings();
        activeScreen = 'search';
        renderNotesLinks();
        showScreenSearch();
        researchNotes();
    });

    $(document).on('click', "#button-add-note", function () {
        showScreenEdit();
    });

    $(document).on('click', "#button-todo", function () {
        showScreenTodo();
    });

    $(document).on('click', "#button-notifications", function () {
        showScreenNotifications();
    });

    $(document).on('click', "#button-todo-back", function () {
        vmTodoList.editMode.enabled = false;
        showScreenSearch();
    });

    $(document).on('click', "#button-notifications-back", function () {
        showScreenSearch();
    });

    $(document).on('click', "#button-clips", function () {
        showScreenClips();
    });

    $(document).on('click', "#button-clips-back", function () {
        showScreenSearch();
    });

    $(document).on('click', "#button-gotoresult-forward", function () {
        if (!searchMatchesCount) return;
        gotoNextResult();
    });

    $(document).on('click', "#button-gotoresult-backward", function () {
        if (!searchMatchesCount) return;
        gotoPrevResult();
    });

    $(document).on('click', "#button-navigator-forward", function () {
        navigatorForward();
    });

    $(document).on('click', "#button-navigator-backward", function () {
        navigatorBackward();
    });

    $(document).on('click', "#button-history-back", function () {
        $("#input-search").blur();
        historyBack();
    });

    $(document).on('click', "#button-history-forward", function () {
        $("#input-search").blur();
        historyForward();
    });

    $(document).on('click', "#screen-settings #button-clear-history", function () {
        actionClearHistory();
    });

    $(document).on('click', '#notes-links-area .note-link', function (e) {
        triggerNoteLink(parseInt($(this).attr('data-id')));
        addToHistory($(this).attr('data-id'));
    });

    $(document).on('selectionchange', function (e) {
        if (stripHtml(getHTMLOfSelection()) == '') {
            clipTitle = clipBody = '';
            return;
        } else {
            var noteID = window.getSelection().getRangeAt(0).commonAncestorContainer
                .parentNode.parentNode.getAttribute('data-id') ||
                window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.getAttribute('data-id') ||
                window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.parentNode.parentNode.getAttribute('data-id');
            if (noteID === null) {
                return;
            }
            clipTitle = $(".note[data-id="+noteID+"]").find(".title").text();
            clipBody = stripHtml(getHTMLOfSelection());

        }

    });

    $(document).on('click', "#search-results-area .note", function (e) {
        var noteID = parseInt($(this).attr('data-id'));
        addToHistory(noteID);
    });

    $(document).on('click', "#search-results-area .btn", function (e) {
        return false;
    });

    $(document).on('mousedown', "#search-results-area .note", function (e) {
        if (e.which == 2) {
            //e.preventDefault();
            contextCurrentNoteID = parseInt($(this).attr('data-id'));
            actionEditNote(contextCurrentNoteID);
        }
    });

    $(document).on('click', ".button-edit-note", function () {
        actionEditNote(parseInt($(this).attr('data-id')));
    });

    $(document).on('click', "#button-clear-clips", function () {
        if (confirm('Are you sure you want to delete all clips?')) {
            clearClips();
        }

    });

    $(document).on('click', "#button-edit-back", function () {
        showScreenSearch();
    });
    $(document).on('click', "#button-about-back", function () {
        showScreenSearch();
    });
    $(document).on('click', "#button-change-secret-key-back", function () {
        showScreenSearch();
    });

    // $(document).on('mouseenter', ".note", function () {
    //     markActiveNoteLink(parseInt($(this).attr('data-id')));
    // });

    $("#screen-search #input-search").keyup(function (e) {
        $("#notes-links-area .note-link").removeClass('active');
        searchNotes($(this).val());
    });

    // $(document).on('keyup', "#screen-search #input-search", function (e) {
    //
    //
    //
    //
    // });


    $(document).on('keydown', "#screen-edit #title, #screen-edit #body", function (e) {

        if (addingFromClipboard || $("#screen-edit").attr('data-id') === undefined) {
            return;
        }
        if (!e.ctrlKey) {
            editorDataModified = true;
        }
        displayEditorSaveButton();
    });


    $(document).on('click', "#screen-edit #button-save", function () {

        if (!editorDataModified) return;

        dontCloseScreen = true;
        windowMustBeHidden = false;
        $("#screen-edit #button-ok").trigger('click');
    });

    $(document).on('click', "#screen-edit #button-ok", function () {
        var title = $("#screen-edit #title").val().trim();
        var body = $("#screen-edit #body").val().trim();
        if (body == '') {
            alert('Field Body is required.');
            return;
        }
        if (title == '') {
            var prefix = '#untitled ';
            if (addingFromClipboard) {
                prefix = '#clipboard ';
                addingFromClipboard = false;
            }
            title = prefix + body.substr(0, 30)+'...'.trim();
        }
        if ($("#screen-edit").attr('data-id') === undefined) {
            addNote(title, body);
        } else {
            updateNote($("#screen-edit").attr('data-id'), title, body);
        }
        if (windowMustBeHidden) {
            windowMustBeHidden = false;
            const { remote } = require('electron');
            remote.BrowserWindow.getFocusedWindow().minimize();
        }
        editorDataModified = false;
        displayEditorSaveButton();
    });
    
    $(document).on('click', ".button-delete-note", function () {
        actionDeleteNote($(this).attr('data-id'));
    });

    $(document).on('click', "#clips-area .clip", function () {
        currentClipID = $(this).data('id');
        var clip = $(this).find(".clip-text").text();
        clipboard.writeText(clip);
        clipboard.writeText(clip, 'selection');
        $("#button-clips-back").trigger('click');
    });

    $(document).on('contextmenu', "#clips-area .clip", function (e) {
        e.preventDefault();
        currentClipID = $(this).data('id');
        clipsContextMenu.popup(remote.getCurrentWindow());
    });


    $(document).on('click', "#button-sidebar-toggle", function () {
        toggleSidebar();
    });


    $(document).on('click', ".edit-todo-button", function () {
        $('body').animate({
            scrollTop: $("#todo-list .editor-group[data-id="+$(this).data('id')+"]").offset().top - 93
        }, settings.settings.animationSpeed);
    });


    function setSidebarHeight() {
        var h = $(window).height();
        $('#sidebar').css('height', (h - 89 - 26)+'px');
    }
    function setEditorHeight() {
        var h = $(window).height();
        $('#screen-edit #body').css('height', (h - 175)+'px');
    }
    $(window).load(function (e) {
        setSidebarHeight();
        setEditorHeight();
    });
    $(window).resize(function (e) {
        setSidebarHeight();
        setEditorHeight();
    });

});

$(document).on('contextmenu', '#search-results-area .note', function (e) {
    e.preventDefault();
    contextCurrentNoteID = parseInt($(this).attr('data-id'));
    searchResultsContextMenu.popup(remote.getCurrentWindow());
});

$(document).on('contextmenu', '#notes-links-area .note-link', function (e) {
    e.preventDefault();
    contextCurrentNoteID = parseInt($(this).attr('data-id'));
    notesLinksContextMenu.popup(remote.getCurrentWindow());
});

$(document).on('mousedown', "#notes-links-area .note-link", function (e) {
    if (e.which == 2) {
        //e.preventDefault();
        contextCurrentNoteID = parseInt($(this).attr('data-id'));
        actionEditNote(contextCurrentNoteID);
    }
});

$(document).on('contextmenu', '#screen-edit #body', function (e) {
    e.preventDefault();
    editorBodyContextMenu.popup(remote.getCurrentWindow());
});

$(document).on('contextmenu', '#screen-edit #title', function (e) {
    e.preventDefault();
    editorTitleContextMenu.popup(remote.getCurrentWindow());
});

$(document).on('submit', '#screen-edit form', function (e) {
    e.preventDefault();
    $('#screen-edit #body').focus();
});

$(window).scroll(function (e) {
    if (activeScreen == 'search') {
        windowScrollTop = $(window).scrollTop();
    }
});

$(document).on('keyup', '#screen-set-secret-key #key-repeat, #screen-set-secret-key #key', function (e) {
    e.preventDefault();
    $('#screen-set-secret-key #key-repeat').removeClass('error').removeClass('equal');
    $('#screen-set-secret-key #key').removeClass('error').removeClass('equal');

    if ($('#screen-set-secret-key #key').val() == $('#screen-set-secret-key #key-repeat').val()) {
        $('#screen-set-secret-key #key-repeat').removeClass('error').addClass('equal');
    } else {
        $('#screen-set-secret-key #key-repeat').removeClass('equal').addClass('error');
    }
});

$(document).on('submit', '#screen-set-secret-key form', function (e) {
    e.preventDefault();

    if ($('#screen-set-secret-key #key').val() != $('#screen-set-secret-key #key-repeat').val()) {
        return;
    }

    dbSecretKey = $('#screen-set-secret-key #key').val();

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.pingKey(function () {
        renderNotesLinks();
        showScreenSearch();
        researchNotes();
    });

});

$(document).on('keyup', '#screen-enter-secret-key #key', function (e) {
    e.preventDefault();
    $('#screen-enter-secret-key #key').removeClass('error');
});

$(document).on('submit', '#screen-enter-secret-key form', function (e) {
    e.preventDefault();

    dbSecretKey = $('#screen-enter-secret-key #key').val();

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.pingKey(function () {
        renderNotesLinks();
        showScreenSearch();
        researchNotes();
    });

});

$(document).on('keyup', '#screen-change-secret-key #new-key-repeat, #screen-change-secret-key #new-key', function (e) {
    e.preventDefault();
    $('#screen-change-secret-key #new-key-repeat').removeClass('error').removeClass('equal');
    $('#screen-change-secret-key #new-key').removeClass('error').removeClass('equal');

    if ($('#screen-change-secret-key #new-key').val() == $('#screen-change-secret-key #new-key-repeat').val()) {
        $('#screen-change-secret-key #new-key-repeat').removeClass('error').addClass('equal');
    } else {
        $('#screen-change-secret-key #new-key-repeat').removeClass('equal').addClass('error');
    }
});

$(document).on('submit', '#screen-change-secret-key form', function (e) {
    e.preventDefault();

    if ($('#screen-change-secret-key #new-key').val() != $('#screen-change-secret-key #new-key-repeat').val()) {
        return;
    }
    
    dbChangedSecretKey = $('#screen-change-secret-key #new-key').val();

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.pingKey(function () {
        renderNotesLinks();
        showScreenSearch();
        researchNotes();
    });

});
