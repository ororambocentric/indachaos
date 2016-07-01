var animationSpeed = 250;
var clipTitle='', clipBody='';
var currentResultIndex = -1;
var searchMatchesCount = 0;
var activeScreen = 'search';
var navigatorList = [];
var navigatorPos = 0;
var historyPos = -1;


const {clipboard} = require('electron');


function hideAllScreens() {
    $("[id^=screen]").hide();
    if ($("#sidebar").css('display') != 'none') {
        $("#sidebar").hide();
        $(".container").removeClass('with-sidebar');
    }

}

function showScreenSettings() {
    activeScreen = 'settings';
    hideAllScreens();
    $("#screen-settings #path-to-db").val(settings.path_to_db);
    $("#screen-settings #local-keymap").val(settings.local_keymap);
    $("#screen-settings").fadeIn(animationSpeed);
}

function showScreenAbout() {
    activeScreen = 'about';
    hideAllScreens();
    $("#screen-about").fadeIn(animationSpeed);
}

function showScreenSearch() {
    activeScreen = 'search';
    hideAllScreens();
    $("#screen-search").fadeIn(animationSpeed);
    if ($("#button-sidebar-toggle").hasClass('active')) {
        $("#sidebar").fadeIn(animationSpeed);
        $(".container").addClass('with-sidebar');
    }
    $("#screen-search #input-search").focus();
    $("#screen-edit #title").val('');
    $("#screen-edit #body").val('');
}

function showScreenEdit(id) {
    activeScreen = 'edit';
    hideAllScreens();
    if (id === undefined) {
        $("#screen-edit").removeAttr('data-id');
        $("#edit-screen-title").text('Add note');
        $("#screen-edit #title").val('');
        $("#screen-edit #body").val('');
    } else {
        $("#edit-screen-title").text('Edit note');
        var nm = new DBManager();
        nm.setDB(settings.path_to_db);
        nm.createDB();
        nm.getNote(id, function (err, row) {
            $("#screen-edit").attr('data-id', row.id);
            $("#screen-edit #title").val(row.title);
            $("#screen-edit #body").val(row.body);
        });
        nm.closeDB();

    }
    $("#screen-edit").fadeIn(animationSpeed);
    $("#screen-edit #title").focus();
}

function showScreenClips() {
    activeScreen = 'clips';
    searchClips();
    hideAllScreens();
    $("#screen-clips").fadeIn(animationSpeed);

}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderFoundNote(note, patternArray) {

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
    render += '<div class="body">';
    render += body;
    render += '</div>';
    render += '</div>';
    render += '</div>';
    return render;
}

function searchNotes(pattern, id) {

    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();

    var patternArray = pattern.trim().split(' ');
    var extra = " WHERE ";

    if (id !== undefined) {
        extra += " id = '"+id+"'";
    } else {
        for (var i in patternArray) {
            var keymaped1 = alterKeymap(patternArray[i], 'en', settings.local_keymap);
            var keymaped2 = alterKeymap(patternArray[i], settings.local_keymap, 'en');
            extra += " (title LIKE '%"+patternArray[i]+"%' OR ltitle LIKE '%"+patternArray[i]+"%' OR body LIKE '%"+patternArray[i]+"%' or lbody LIKE '%"+patternArray[i]+"%'";
            extra += " OR title LIKE '%"+keymaped1+"%' OR ltitle LIKE '%"+keymaped1+"%' OR body LIKE '%"+keymaped1+"%' or lbody LIKE '%"+keymaped1+"%'";
            extra += " OR title LIKE '%"+keymaped2+"%' OR ltitle LIKE '%"+keymaped2+"%' OR body LIKE '%"+keymaped2+"%' or lbody LIKE '%"+keymaped2+"%')";

            if (i < patternArray.length-1) {
                extra += ' AND ';
            } else {
                extra += " ORDER BY id DESC";
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
        rows.forEach(function (note) {
            idList.push(note.id);
            html += renderFoundNote(note, patternArray);
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

    var extra = " ORDER BY id DESC";

    nm.getNotes(function (err, rows) {
        var html = '';
        rows.forEach(function (note) {
            html += renderNoteLink(note);
        });
        $("#notes-links-area").html(html);
    }, extra);
}

function renderFoundClip(clip) {
    var render = '';
    var title = escapeHtml(clip.title);
    var body = escapeHtml(clip.body);
    render += '<div class="row clip">';
    render += '<button class="btn btn-default btn-block" type="submit" title="Copy it">';
    render += '<p class="clip-title">From "'+title+'"</p>';
    render += '<p class="clip-text">'+body+'</p>';
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

function addClip(title, body) {
    var nm = new DBManager();
    nm.setDB(settings.path_to_db);
    nm.createDB();
    nm.addClip(title, body);
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
        $('body').animate({ scrollTop: $('[name=note_'+navigatorList[pos+1]+']').offset().top -100 }, 0, function () {
            navigatorPos = ++pos;
            $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        navigatorPos = 0;
    }

    $(".highlight").removeClass('highlight-current');
    $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").addClass('highlight-current');
    currentResultIndex = parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").find(".highlight:first").attr('data-index')) - 1;

    markActiveNoteLink(parseInt($("#search-results-area [name=note_"+navigatorList[pos]+"] + .note").attr('data-id')));

}

function navigatorBackward() {

    var pos = navigatorPos;
    if (pos > 0) {
        $('body').animate({ scrollTop: $('[name=note_'+navigatorList[pos-1]+']').offset().top -100 }, 0, function () {
            navigatorPos = --pos;
            $("#search-results-area [name=note_"+navigatorList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        navigatorPos = navigatorList.length-1;
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
    if (viaClips && clipBody != '' && selection != '') {
        addClip(clipTitle, clipBody);
        clipTitle = clipBody = '';
    }
}

function registerShortcuts() {

    $(document).keydown(function (e) {


        // ESC
        if(e.which == 27) {
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

        //ctrl + S
        if(e.which == 83 && e.ctrlKey) {
            if (activeScreen == 'settings') {
                $("#button-settings-save").trigger('click');
                return;
            }
            if (activeScreen == 'edit') {
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

function afterSettingsLoading(callback) {
    var sm = new SettingsManager();
    sm.setDB('indachaos_settings.db');
    sm.createDB();
    sm.getParams(function (err, rows) {
        rows.forEach(function (param) {

            if (param.key == 'history') {
                settings.history = JSON.parse(param.value);
            } else {
                settings[param.key] = param.value;
            }
        });
        callback();
    });
    sm.closeDB();
}

function updateSettings() {
    settings.path_to_db = $("#screen-settings #path-to-db").val();
    settings.local_keymap = $("#screen-settings #local-keymap").val();
    var sm = new SettingsManager();
    sm.setDB('indachaos_settings.db');
    sm.createDB();
    sm.updateSettings('path_to_db', settings.path_to_db);
    sm.updateSettings('local_keymap', settings.local_keymap);
    sm.closeDB();
}

function insertAtCaret(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);
    var back = (txtarea.value).substring(strPos,txtarea.value.length);
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
}

function pasteLine() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            insertAtCaret('body', '-------------------------------------------\n');
        }
    }
}

function pasteDoubleLine() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            insertAtCaret('body', '===========================================\n');
        }
    }
}

function genPassword(len=20) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789!@#$%=!@#$%=!@#$%=";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function pastePassword() {
    if (activeScreen == 'edit') {
        if ($('#body').is(':focus')) {
            insertAtCaret('body', genPassword(20));
        }
    }
}

function toggleSidebar() {
    if ($("#sidebar").css('display') == 'none') {
        $("#button-sidebar-toggle").addClass('active');
        $("#sidebar").fadeIn(animationSpeed);
        $(".container").addClass('with-sidebar');
    } else {
        $("#button-sidebar-toggle").removeClass('active');
        $("#sidebar").fadeOut(animationSpeed / 2, function () {
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

    if (historyPos == 0) {
        historyPos = settings.history.length -1;
    } else {
        historyPos --;
    }

    var historyRecord = settings.history[historyPos];
    historyRecord.n = parseInt(historyRecord.n);

    if (navigatorList.indexOf(historyRecord.n) < 0) {
        $("#input-search").val(historyRecord.s);
        searchNotes(historyRecord.s);
    }

    triggerNoteLink(historyRecord.n);

}

function historyForward() {

    if (historyPos == settings.history.length -1) {
        historyPos = 0;
    } else {
        historyPos ++;
    }

    var historyRecord = settings.history[historyPos];
    historyRecord.n = parseInt(historyRecord.n);

    if (navigatorList.indexOf(historyRecord.n) < 0) {
        $("#input-search").val(historyRecord.s);
        searchNotes(historyRecord.s);
    }
    triggerNoteLink(historyRecord.n);

}

function addToHistory(noteID) {
    if (settings.history[settings.history.length -1].n == noteID) {
        return;
    }
    if (settings.history.length == 100) {
        settings.history.shift();
    }
    var historyRecord = {
        's': $("#screen-search #input-search").val(),
        'n': noteID,
    };
    settings.history.push(historyRecord);
    var sm = new SettingsManager();
    sm.setDB('indachaos_settings.db');
    sm.createDB();
    sm.updateSettings('history', JSON.stringify(settings.history));
    sm.closeDB();
    historyPos = settings.history.length -1;
}

function triggerNoteLink(noteID) {

    var noteLinkElem = $("#notes-links-area .note-link[data-id="+noteID+"]");
    navigatorPos = navigatorList.indexOf(noteID);
    $("#notes-links-area .note-link").removeClass('active');
    noteLinkElem.addClass('active');
    $('body').animate({ scrollTop: $('a[name=note_'+noteID+']').offset().top -100 }, 0, function () {

    });
}