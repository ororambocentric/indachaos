$(document).ready(function () {

    $('[data-toggle="tooltip"]').tooltip();
    registerShortcuts();
    showScreenSearch();
    searchNotes($("#screen-search #input-search").val());

    $(document).on('click', "#button-settings", function () {
        showScreenSettings();
    });

    $(document).on('click', "#button-settings-back", function () {
        showScreenSearch();
    });

    $(document).on('click', "#button-add-note", function () {
        showScreenEdit();
    });

    $(document).on('click', ".button-edit-note", function () {
        showScreenEdit($(this).attr('data-id'));
    });

    $(document).on('click', "#button-edit-back", function () {
        showScreenSearch();
    });

    $(document).on('mouseenter', ".note", function () {
        navigatorSaveCurrent($(this).attr('data-id'));
    });

    $("#screen-search #input-search").keyup(function (e) {
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
            return;
        }
        if ($("#screen-edit").attr('data-id') === undefined) {
            addNote(title, body);
        } else {
            updateNote($("#screen-edit").attr('data-id'), title, body);
        }


    });

    $(document).on('click', ".button-delete-note", function () {
        var id = $(this).attr('data-id');
        deleteNote(id);
    });

    $(document).on('click', "#button-navigator-forward", function () {
        navigatorForward();
    });

    $(document).on('click', "#button-navigator-backward", function () {
        navigatorBackward();
    });



});