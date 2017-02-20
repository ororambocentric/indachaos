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
      <div class="input-group editor-group"><textarea class="editor" v-focus="true" @keydown.enter="$emit(\'save\')" @keydown.ctrl.83="$emit(\'save\')" @blur="editmode.enabled = false" @keydown.prevent.esc="editmode.enabled = false" v-model.trim="item.text" v-if="editmode.enabled && editmode.index == index" type="text"></textarea></div>\
      <div class="item-text" v-if="!(editmode.enabled && editmode.index == index)" :class="{strikeout: item.strikeout}"  @dblclick="$emit(\'edit\');">{{item.text}}</div>\
        <div class="btn-group">\
            <button type="button" class="btn btn-default" title="Delete item" @click="$emit(\'delete\')">\
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
        todos: settings.todos,
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
                strikeout: false
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
        editItem: function (index) {
            this.editMode.index = index;
            this.editMode.enabled = !this.editMode.enabled;
        },
        saveItem: function () {
            this.editMode.enabled = !this.editMode.enabled;
            this.save()
        },
        save: function () {
            settings.todos = vmTodoList.todos;
            updateAppSettings();
        }
    }


});


