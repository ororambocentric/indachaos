Vue.component('todo-item', {
    props: ['item'],
    template: '\
      <li class="list-group-item">\
      <input type="checkbox" @click="$emit(\'strike\')" :checked="item.strikeout">\
      <div class="item-text" :class="{strikeout: item.strikeout}" @dblclick="$emit(\'edit\')">{{item.text}}</div>\
        <div class="btn-group">\
            <button type="button" class="btn btn-default" title="Delete item" @click="$emit(\'delete\')">\
                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
            </button>\
        </div>\
      </li>\
      '
});

var vmTodoList = new Vue({
    el: '#todo-list',
    data: {
        newItemInput: '',
        todos: settings.todos,
        editMode: false
    },
    methods: {
        addItem: function () {
            if (!this.newItemInput) return;
            this.todos.push({
                text: this.newItemInput,
                strikeout: false
            });
            this.newItemInput = '';
            this.save()
        },
        deleteItem: function (index) {
            this.todos.splice(index, 1);
            this.save()
        },
        strikeItem: function (index) {
            this.todos[index].strikeout = !this.todos[index].strikeout;
            this.save()
        },
        editItem: function (index) {
            console.log('111');
        },
        save: function () {
            settings.todos = vmTodoList.todos;
            updateAppSettings();
        }
    },

    // watch: {
    //     todos: function (newTodos) {
    //         settings.todos = newTodos;
    //         updateAppSettings();
    //     }
    // }
});

