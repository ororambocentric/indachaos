$(document).ready(function () {

    afterSettingsLoading(function () {
        $(".container").fadeIn(animationSpeed);
        registerShortcuts();
        showScreenSearch();
        renderNotesLinks();
        toggleSidebar();
        searchNotes($("#screen-search #input-search").val());
    });



    $(document).on('click', "#button-settings-back", function () {
        activeScreen = 'search';
        showScreenSearch();


    });

    $(document).on('click', "#button-settings-save", function () {
        updateSettings();
        activeScreen = 'search';
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

    $(document).on('click', '#notes-links-area .note-link', function (e) {
        $("#notes-links-area .note-link").removeClass('active');
        $(this).addClass('active');
        var noteId = $(this).attr('data-id');
        // $('body').animate({ scrollTop: $('a[name=note_'+noteId+']').offset().top -100 }, 0, function () {
        //
        // });
        searchNotes('', parseInt($(this).attr('data-id')));
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
        console.log(stripHtml(getHTMLOfSelection()));
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

    $(document).on('click', ".button-edit-note", function () {
        showScreenEdit($(this).attr('data-id'));
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
    //     //navigatorSaveCurrent($(this).attr('data-id'));
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
        if (title == '' || body == '') {
            alert('All fields in a form are required.');
            return;
        }
        if ($("#screen-edit").attr('data-id') === undefined) {
            addNote(title, body);
        } else {
            updateNote($("#screen-edit").attr('data-id'), title, body);
        }
    });

    $(document).on('click', ".button-delete-note", function () {
        if (confirm('Are you sure you want to delete this note?')) {
            var id = $(this).attr('data-id');
            deleteNote(id);
        }
    });

    // $(document).on('click', "#button-navigator-forward", function () {
    //     navigatorForward();
    // });
    //
    // $(document).on('click', "#button-navigator-backward", function () {
    //     navigatorBackward();
    // });

    $(document).on('click', "#clips-area .clip", function () {
        var clip = $(this).find(".clip-text").text();
        clipboard.writeText(clip);
        clipboard.writeText(clip, 'selection');
        $("#button-clips-back").trigger('click');
    });


    $(document).on('click', "#button-sidebar-toggle", function () {
        toggleSidebar();
    });


});