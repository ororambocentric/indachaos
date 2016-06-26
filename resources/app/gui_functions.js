var animationSpeed = 250;
var clipTitle='', clipBody='';
var currentResultIndex = -1;
var searchMatchesCount = 0;
var activeScreen = 'search';

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
            var keymaped = alterKeymap(patternArray[i], 'en', settings.local_keymap);
            extra += " (title LIKE '%"+patternArray[i]+"%' OR ltitle LIKE '%"+patternArray[i]+"%' OR body LIKE '%"+patternArray[i]+"%' or lbody LIKE '%"+patternArray[i]+"%'";
            extra += " OR title LIKE '%"+keymaped+"%' OR ltitle LIKE '%"+keymaped+"%' OR body LIKE '%"+keymaped+"%' or lbody LIKE '%"+keymaped+"%')";

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
        rows.forEach(function (note) {
            idList.push(note.id);
            html += renderFoundNote(note, patternArray);
        });
        $("#search-results-area").html(html);
        $("#search-results-area").attr('data-navigator-list', idList);
        $("#search-results-area").attr('data-navigator-pos', 0);

        $(".found-counter").text(idList.length);

        if (id === undefined) {

            currentResultIndex = -1;
            $('body').animate({ scrollTop: $('a[name^=note_]:first').offset().top -100 }, 0, function () {

            });

            for (var i in patternArray) {
                $("#search-results-area").highlight(patternArray[i]);
                $("#search-results-area").highlight(alterKeymap(patternArray[i], 'en', settings.local_keymap));
                $("#search-results-area").highlight(alterKeymap(patternArray[i], settings.local_keymap, 'en'));
                searchMatchesCount = $(".highlight").length;
            }
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

// function navigatorSaveCurrent(id) {
//     var idList = $("#search-results-area").attr('data-navigator-list').split(',');
//     idList = idList.map(function(value) {
//         return parseInt(value);
//     });
//
//     var pos = idList.indexOf(parseInt(id));
//     $("#search-results-area").attr('data-navigator-pos', pos);
// }

// function navigatorForward() {
//     var idList = $("#search-results-area").attr('data-navigator-list').split(',');
//     idList = idList.map(function(value) {
//         return parseInt(value);
//     });
//     var pos = parseInt($("#search-results-area").attr('data-navigator-pos'));
//     if (pos < idList.length - 1) {
//         $('body').animate({ scrollTop: $('[name=note_'+idList[pos+1]+']').offset().top -100 }, 0, function () {
//             $("#search-results-area").attr('data-navigator-pos', ++pos);
//             $("#search-results-area [name=note_"+idList[pos]+"] + .note .button-edit-note").focus();
//         });
//     } else {
//         $("#search-results-area").attr('data-navigator-pos', 0);
//     }
// }

// function navigatorBackward() {
//     var idList = $("#search-results-area").attr('data-navigator-list').split(',');
//     idList = idList.map(function(value) {
//         return parseInt(value);
//     });
//     var pos = parseInt($("#search-results-area").attr('data-navigator-pos'));
//     if (pos > 0) {
//         $('body').animate({ scrollTop: $('[name=note_'+idList[pos-1]+']').offset().top -100 }, 0, function () {
//             $("#search-results-area").attr('data-navigator-pos', --pos);
//             $("#search-results-area [name=note_"+idList[pos]+"] + .note .button-edit-note").focus();
//         });
//     } else {
//         $("#search-results-area").attr('data-navigator-pos', idList.length-1);
//     }
// }

function copyText() {
    clipboard.writeText(window.getSelection().toString());
    clipboard.writeText(window.getSelection().toString(), 'selection');
    if (clipBody != '' && window.getSelection().toString() != '') {
        addClip(clipTitle, clipBody);
        clipTitle = clipBody = '';
    }
}

function registerShortcuts() {
    var isCtrl = false;
    var isShift = false;
    $(document).keyup(function (e) {
        if(e.which == 17) {
            isCtrl = false;
        }
        if(e.shiftKey) {
            isShift = false;
        }
    }).keydown(function (e) {
        if(e.which == 17) {
            isCtrl=true;
        }
        if(e.shiftKey) {
            isShift=true;
        }

        // ESC
        if(e.which == 27) {
            showScreenSearch();
        }

        //ctrl + N
        // if(e.which == 78 && isCtrl == true) {
        //     $("#button-add-note").trigger('click');
        //     return false;
        // }

        //ctrl + F
        // if(e.which == 70 && isCtrl == true) {
        //     $("#screen-search #input-search").focus();
        //     return false;
        // }

        // //ctrl + Y
        // if(e.which == 89 && isCtrl == true) {
        //     $("#button-clips").trigger('click');
        //     return false;
        // }

        //ctrl + S
        if(e.which == 83 && isCtrl == true) {
            if (activeScreen == 'settings') {
                $("#button-settings-save").trigger('click');
            } else {
                $("#screen-edit #button-ok").trigger('click');
            }

            return false;
        }

        //ctrl + C
        if(e.which == 67 && isCtrl == true) {
            copyText();
            return false;
        }

        // //ctrl + Up
        // if(e.which == 38 && isCtrl == true) {
        //     $("#button-navigator-backward").trigger('click');
        //     return false;
        // }
        //
        // //ctrl + Down
        // if(e.which == 40 && isCtrl == true) {
        //     $("#button-navigator-forward").trigger('click');
        //     return false;
        // }

        //F3 and Shift+F3
        // if(e.which == 114) {
        //     if (e.shiftKey) {
        //         $("#button-gotoresult-backward").trigger('click');
        //     } else {
        //         $("#button-gotoresult-forward").trigger('click');
        //     }
        //
        //     return false;
        // }


        
    });
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

// QString Core::strLatToRus(QString str){
//
//     QString str_search = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./";
//     QString str_replace = "ё1234567890-=йцукенгшщзхъ\\фывапролджэячсмитьбю.";
//
//     str = str.toLower();
//
//     for(int i=0; i<str.length(); i++){
//         for(int j=0; j<str_search.length(); j++){
//             if(str.at(i)==str_search.at(j)){
//                 str[i]=str_replace.at(j);
//             }
//         }
//     }
//
//     return str;
//
// }
//
// QString Core::strRusToLat(QString str){
//
//     QString str_search = "ё1234567890-=йцукенгшщзхъ\\фывапролджэячсмитьбю.";
//     QString str_replace = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./";
//
//     str = str.toLower();
//
//     for(int i=0; i<str.length(); i++){
//         for(int j=0; j<str_search.length(); j++){
//             if(str.at(i)==str_search.at(j)){
//                 str[i]=str_replace.at(j);
//             }
//         }
//     }
//
//     return str;
//
// }

function afterSettingsLoading(callback) {
    var sm = new SettingsManager();
    sm.setDB('indachaos_settings.db');
    sm.createDB();
    sm.getParams(function (err, rows) {
        rows.forEach(function (param) {
            settings[param.key] = param.value;
            // if (param.key == 'path_to_db') {
            //     settings.path_to_db = param.value;
            // } else if (param.key == 'local_keymap') {
            //     settings.local_keymap = param.value;
            // }
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
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789!@#$%=!@#$%=!@#$%=!@#$%=";

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


