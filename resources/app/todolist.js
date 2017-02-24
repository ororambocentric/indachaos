Vue.directive('focus', {
    inserted: function (el) {
        el.focus();
    }
});

Vue.component('todo-item', {
    props: ['item', 'index', 'editmode'],
    template: '\
      <li class="list-group-item">\
      <input type="checkbox" v-if="!(editmode.enabled && editmode.index == index)" @click="$emit(\'strike\')" :checked="item.strikeout">\
      <div class="input-group editor-group" @keydown.ctrl.83="$emit(\'save\')" @keydown.stop.esc="$emit(\'cancel\')" v-if="editmode.enabled && editmode.index == index">\
      <textarea class="editor" v-focus="true" v-model.trim="item.text" type="text"></textarea>\
      <div class="remind-wrap">\
      <div class="remind-toggle-area" @click="$emit(\'check_remind\')">\
        <input type="checkbox" :checked="item.remind_enabled">\
        Remind\
      </div>\
      <input type="date" v-model="item.remind_date">&nbsp;at&nbsp;\
      <input type="time" v-model="item.remind_time">&nbsp;repeat&nbsp;\
      <select v-model="item.remind_repeat">\
        <option value="0">no repeat</option>\
        <option value="1">every minute</option>\
        <option value="2">every hour</option>\
        <option value="3">every day</option>\
        <option value="4">every week</option>\
        <option value="5">every month</option>\
        <option value="6">every year</option>\
      </select>\
      </div>\
      <div class="editor-save-group">\
        <button type="button" class="btn btn-default" @click="$emit(\'save\')" title="Ctrl+S">Save</button>\
        <button type="button" class="btn btn-default" @click="$emit(\'cancel\')" title="ESC">Cancel</button>\
      </div>\
      </div>\
      <div class="item-text" v-if="!(editmode.enabled && editmode.index == index)" :class="{strikeout: item.strikeout}">\
      <div class="label label-primary remind-label" v-if="item.remind_enabled">\
      <span class="glyphicon glyphicon-bell white" aria-hidden="true"></span>&nbsp;{{moment(item.remind_date + \' \' + item.remind_time).format(\'DD.MM.YYYY HH:mm\') + getRepeatStr(item.remind_repeat)}}\
      </div><br v-if="item.remind_enabled">\
      {{item.text}}\
      </div>\
        <div class="btn-group">\
            <button type="button" class="btn btn-default" title="Edit item" @click="$emit(\'edit\');" v-if="!(editmode.enabled && editmode.index == index)">\
                <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>\
            </button>\
            <button type="button" class="btn btn-default" title="Delete item" @click="$emit(\'delete\')" v-if="!(editmode.enabled && editmode.index == index)">\
                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
            </button>\
        </div>\
      </li>\
      ',
    methods: {
        getRepeatStr: function (repeat) {
            switch (repeat) {
                case '0':
                    return '';
                    break;
                case '1':
                    return ' and every minute';
                    break;
                case '2':
                    return ' and every hour';
                    break;
                case '3':
                    return ' and every day';
                    break;
                case '4':
                    return ' and every week';
                    break;
                case '5':
                    return ' and every month';
                    break;
                case '6':
                    return ' and every year';
                    break;
            }
        },
        moment: function(something) {
            return moment(something)
        }
    },

    inserted: function (el) {
        // Focus the element
        el.focus()
    }
});

var vmTodoList = new Vue({
    el: '#todo-list',
    data: {
        newItemInput: '',
        todos: [],
        editMode: {
            enabled: false,
            index: 0
        }
    },
    methods: {
        addItem: function () {
            if (!this.newItemInput) return;
            this.todos.unshift({
                text: this.newItemInput,
                strikeout: false,
                remind_enabled: false,
                remind_date: convertDate(new Date()),
                remind_time: '23:00',
                remind_repeat: 0

            });
            this.newItemInput = '';
            loadTodosToSettings();
            updateAppSettings();
        },
        deleteItem: function (index) {
            if (confirm('Are you sure you want to delete this todo?')) {
                this.todos.splice(index, 1);
            }
        },
        strikeItem: function (index) {
            this.todos[index].strikeout = !this.todos[index].strikeout;
            loadTodosToSettings(index);
            updateAppSettings();
        },
        checkRemind: function (index) {
            this.todos[index].remind_enabled = !this.todos[index].remind_enabled;

        },
        editItem: function (index) {
            this.editMode.index = index;
            this.editMode.enabled = !this.editMode.enabled;
        },
        saveItem: function () {
            this.editMode.enabled = !this.editMode.enabled;
            for (var i in this.todos) {
                if (!this.todos[i].remind_date) {
                    this.todos[i].remind_date = convertDate(new Date());
                }
                if (!this.todos[i].remind_time) {
                    this.todos[i].remind_time = '00:00';
                }
            }
            loadTodosToSettings();
            updateAppSettings();
        },
        cancelChanges: function (index) {
            this.editMode.enabled = false;
            loadTodosFromSettings(index);
        }
    }


});


