var animationSpeed = 0;
var clipTitle='', clipBody='';

const {clipboard} = require('electron');


function hideAllScreens() {
    $("[id^=screen]").hide(animationSpeed);
}

function showScreenSettings() {
    hideAllScreens();
    $("#screen-settings").show(animationSpeed);
}

function showScreenSearch() {
    hideAllScreens();
    $("#screen-search").show(animationSpeed);
    $("#screen-search #input-search").focus();
}

function showScreenEdit(id) {
    hideAllScreens();
    if (id === undefined) {
        $("#screen-edit").removeAttr('data-id');
        $("#edit-screen-title").text('Add note');
        $("#screen-edit #title").val('');
        $("#screen-edit #body").val('');
    } else {
        $("#edit-screen-title").text('Edit note');
        var nm = new DBManager();
        nm.setDB('db/pilepad.db');
        nm.createDB();
        nm.getNote(id, function (err, row) {
            $("#screen-edit").attr('data-id', row.id);
            $("#screen-edit #title").val(row.title);
            $("#screen-edit #body").val(row.body);
        });
        nm.closeDB();

    }
    $("#screen-edit").show(animationSpeed);
    $("#screen-edit #title").focus();
}

function showScreenClips() {
    searchClips();
    hideAllScreens();
    $("#screen-clips").show(animationSpeed);

}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderFoundNote(note, pattern) {
    pattern = pattern.trim();
    var render = '';
    var title = escapeHtml(note.title).replace(pattern, '<span class="hl">'+escapeHtml(pattern)+'</span>');
    var body = escapeHtml(note.body).replace(pattern, '<span class="hl">'+escapeHtml(pattern)+'</span>');
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
    render += '<h1 class="title">'+title+'</h1>';
    render += '<div class="body">';
    render += body;
    render += '</div>';
    render += '</div>';
    render += '</div>';
    return render;
}

function searchNotes(pattern) {
    var nm = new DBManager();
    nm.setDB('db/pilepad.db');
    nm.createDB();
    var extra = " WHERE title LIKE '%" + pattern + "%' OR body LIKE '%" + pattern + "%' ORDER BY id DESC";
    nm.getNotes(function (err, rows) {
        var html = '';
        var idList = [];
        rows.forEach(function (note) {
            idList.push(note.id);
            html += renderFoundNote(note, pattern);
        });
        $("#search-results-area").html(html);
        $("#search-results-area").attr('data-navigator-list', idList);
        $("#search-results-area").attr('data-navigator-pos', 0);
        $(".found-counter").text(idList.length);
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
    nm.setDB('db/pilepad.db');
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
    nm.setDB('db/pilepad.db');
    nm.createDB();
    nm.addNote(title, body);
    nm.closeDB();
}

function addClip(title, body) {
    var nm = new DBManager();
    nm.setDB('db/pilepad.db');
    nm.createDB();
    nm.addClip(title, body);
    nm.closeDB();
}

function updateNote(id, title, body) {
    var nm = new DBManager();
    nm.setDB('db/pilepad.db');
    nm.createDB();
    nm.updateNote(id, title, body);
    nm.closeDB();
}

function deleteNote(id) {
    var nm = new DBManager();
    nm.setDB('db/pilepad.db');
    nm.createDB();
    nm.deleteNote(id);
    nm.closeDB();
}

function deleteClip(id) {
    var nm = new DBManager();
    nm.setDB('db/pilepad.db');
    nm.createDB();
    nm.deleteClip(id);
    nm.closeDB();
}

function navigatorSaveCurrent(id) {
    var idList = $("#search-results-area").attr('data-navigator-list').split(',');
    idList = idList.map(function(value) {
        return parseInt(value);
    });

    var pos = idList.indexOf(parseInt(id));
    $("#search-results-area").attr('data-navigator-pos', pos);
}

function navigatorForward() {
    var idList = $("#search-results-area").attr('data-navigator-list').split(',');
    idList = idList.map(function(value) {
        return parseInt(value);
    });
    var pos = parseInt($("#search-results-area").attr('data-navigator-pos'));
    if (pos < idList.length - 1) {
        $('body').animate({ scrollTop: $('[name=note_'+idList[pos+1]+']').offset().top -100 }, 0, function () {
            $("#search-results-area").attr('data-navigator-pos', ++pos);
            $("#search-results-area [name=note_"+idList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        $("#search-results-area").attr('data-navigator-pos', 0);
    }


}

function navigatorBackward() {
    var idList = $("#search-results-area").attr('data-navigator-list').split(',');
    idList = idList.map(function(value) {
        return parseInt(value);
    });
    var pos = parseInt($("#search-results-area").attr('data-navigator-pos'));
    if (pos > 0) {
        $('body').animate({ scrollTop: $('[name=note_'+idList[pos-1]+']').offset().top -100 }, 0, function () {
            $("#search-results-area").attr('data-navigator-pos', --pos);
            $("#search-results-area [name=note_"+idList[pos]+"] + .note .button-edit-note").focus();
        });
    } else {
        $("#search-results-area").attr('data-navigator-pos', idList.length-1);
    }

}

function registerShortcuts() {
    var isCtrl = false;
    $(document).keyup(function (e) {
        if(e.which == 17) {
            isCtrl = false;
        }
    }).keydown(function (e) {
        if(e.which == 17) {
            isCtrl=true;
        }

        // ESC
        if(e.which == 27) {
            showScreenSearch();
        }

        //ctrl + N
        if(e.which == 78 && isCtrl == true) {
            $("#button-add-note").trigger('click');
            return false;
        }

        //ctrl + F
        if(e.which == 70 && isCtrl == true) {
            $("#screen-search #input-search").focus();
            return false;
        }

        //ctrl + Y
        if(e.which == 89 && isCtrl == true) {
            $("#button-clips").trigger('click');
            return false;
        }

        //ctrl + S
        if(e.which == 83 && isCtrl == true) {
            $("#screen-edit #button-ok").trigger('click');
            return false;
        }

        //ctrl + C
        if(e.which == 67 && isCtrl == true) {
            clipboard.writeText(window.getSelection().toString());
            clipboard.writeText(window.getSelection().toString(), 'selection');
            if (clipBody != '' && window.getSelection().toString() != '') {
                addClip(clipTitle, clipBody);
                clipTitle = clipBody = '';
            }
            return false;
        }

        //ctrl + Up
        if(e.which == 38 && isCtrl == true) {
            $("#button-navigator-backward").trigger('click');
            return false;
        }

        //ctrl + Down
        if(e.which == 40 && isCtrl == true) {
            $("#button-navigator-forward").trigger('click');
            return false;
        }
        
    });
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