Vue.component('todo-item', {
    props: ['item'],
    template: '\
      <li><span :class="{strikeout: item.strikeout}" @click="$emit(\'strike\')">{{item.text}}</span>\
        <button type="button" class="btn btn-default" title="Delete item" @click="$emit(\'delete\')">\
          <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
        </button>\
      </li>\
      '
});

var vmTodoList = new Vue({
    el: '#todo-list',
    data: {
        newItemInput: '',
        todos: settings.todos
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

