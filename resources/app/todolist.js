Vue.directive('focus', {
    inserted: function (el) {
        el.focus();
    }
});



Vue.component('todo-item', {
    props: ['item', 'index', 'editmode'],
    template: '\
      <li class="list-group-item">\
      <input type="checkbox" @click="$emit(\'strike\')" :checked="item.strikeout">\
      <div class="input-group editor-group" v-if="editmode.enabled && editmode.index == index">\
      <textarea class="editor" v-focus="true" @keydown.ctrl.83="$emit(\'save\')" @keydown.prevent.esc="editmode.enabled = false" v-model.trim="item.text" type="text"></textarea>\
      <div class="remind-wrap">\
      <div class="remaind-toggle-area">\
        <input type="checkbox" @keydown.ctrl.83="$emit(\'save\')" @click="$emit(\'check_remind\')" :checked="item.remind_enabled">\
        \
      </div>\
      <input type="date" v-model="item.remind_date" @keydown.ctrl.83="$emit(\'save\')">\
      <input type="time" v-model="item.remind_time" @keydown.ctrl.83="$emit(\'save\')">\
      </div>\
      <div class="editor-save-group">\
        <button type="button" class="btn btn-default" @click="$emit(\'save\')">Save & Close</button>\
      </div>\
      </div>\
      <div class="item-text" v-if="!(editmode.enabled && editmode.index == index)" :class="{strikeout: item.strikeout}"  @dblclick="$emit(\'edit\');">\
      <span :title="item.remind_date + \' \' + item.remind_time" v-if="item.remind_enabled" class="glyphicon glyphicon-bell red" aria-hidden="true"></span>\
      {{item.text}}\
      </div>\
        <div class="btn-group">\
            <button type="button" class="btn btn-default" title="Delete item" @click="$emit(\'delete\')" v-if="!(editmode.enabled && editmode.index == index)">\
                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
            </button>\
        </div>\
      </li>\
      ',
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
                remind_date: '',
                remind_time: ''

            });
            this.newItemInput = '';
            this.save()
        },
        deleteItem: function (index) {
            if (confirm('Are you sure you want to delete this todo?')) {
                this.todos.splice(index, 1);
                this.save()
            }
        },
        strikeItem: function (index) {
            this.todos[index].strikeout = !this.todos[index].strikeout;
            this.save()
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
             this.save()
        },
        save: function () {
            settings.todos = vmTodoList.todos.slice(0);
            updateAppSettings();
        }
    }


});


