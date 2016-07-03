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

    afterSettingsLoading(function () {
        $(".container").fadeIn(animationSpeed);
        registerShortcuts();
        showScreenSearch();
        toggleSidebar();
        renderNotesLinks();
    });



    $(document).on('click', "#button-settings-back", function () {
        activeScreen = 'search';
        showScreenSearch();


    });

    $(document).on('click', "#button-settings-save", function () {
        updateSettings();
        activeScreen = 'search';
        renderNotesLinks();
        showScreenSearch();
        searchNotes($("#screen-search #input-search").val());
    });

    $(document).on('click', "#button-clips-back", function () {
        showScreenSearch();
    });

    $(document).on('click', "#button-add-note", function () {
        showScreenEdit();
    });

    $(document).on('click', "#button-clips", function () {
        showScreenClips();
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

    $(document).on('click', '#notes-links-area .note-link', function (e) {
        triggerNoteLink(parseInt($(this).attr('data-id')));
        addToHistory($(this).attr('data-id'));
    });

    // $(document).on('selectionchange', '.note', function (e) {
    //     if (window.getSelection().toString() != '') {
    //         clipTitle = $(this).find(".title").text();
    //         clipBody = window.getSelection().toString();
    //         console.log(clipTitle, clipBody);
    //     } else {
    //         clipTitle = clipBody = '';
    //     }
    //     // clipboard.writeText(window.getSelection().toString());
    //     // clipboard.writeText(window.getSelection().toString(), 'selection');
    //     // console.log(clipboard.readText('selection'));
    //     // console.log(window.getSelection());
    // });

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

    $(document).on('mousedown', "#search-results-area .note", function (e) {
        if (e.which == 2) {
            e.preventDefault();
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

    $(document).on('click', "#screen-edit #button-ok", function () {
        var title = $("#screen-edit #title").val();
        var body = $("#screen-edit #body").val();
        if (body == '') {
            alert('Field Body is required.');
            return;
        }
        if (title == '') {
            title = body.substr(0, 30)+'...'.trim();
        }
        if ($("#screen-edit").attr('data-id') === undefined) {
            addNote(title, body);
        } else {
            updateNote($("#screen-edit").attr('data-id'), title, body);
        }
    });
    
    $(document).on('click', ".button-delete-note", function () {
        actionDeleteNote($(this).attr('data-id'));
    });



    $(document).on('click', "#clips-area .clip", function () {
        var clip = $(this).find(".clip-text").text();
        clipboard.writeText(clip);
        clipboard.writeText(clip, 'selection');
        $("#button-clips-back").trigger('click');
    });


    $(document).on('click', "#button-sidebar-toggle", function () {
        toggleSidebar();
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
        e.preventDefault();
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

