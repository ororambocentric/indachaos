Vue.directive('focus', {
    inserted: function (el) {
        el.focus();
    }
});

Vue.component('todo-item', {
    props: ['item', 'index', 'editmode', 'show', 'filtertext', 'show_category'],
    template: '\
      <li v-show="editmode.enabled || ((show_category == \'0\' || show_category == item.category) && (item.text.toLowerCase().indexOf(this.filtertext.toLowerCase()) !== -1) && (show == \'all\' || (show == \'completed\' && item.strikeout) || (show == \'active\' && !item.strikeout)))" class="list-group-item">\
      <input type="checkbox" v-if="!(editmode.enabled && editmode.index == index)" @click="$emit(\'strike\')" :checked="item.strikeout">\
      <div class="input-group editor-group" :data-id="index" @keydown.ctrl.83="$emit(\'save\')" @keydown.stop.esc="$emit(\'cancel\')" v-if="editmode.enabled && editmode.index == index">\
         <div class="input-group edit-todo-title-group">\
             <select v-model="item.category" class="editor-category form-control">\
                <option value="10">Work</option>\
                <option value="20">Project</option>\
                <option value="30">Personal</option>\
                <option value="40">Family</option>\
             </select>\
            <input class="editor-text form-control" v-focus="true" v-model.trim="item.text" type="text" placeholder="Text...">\
        </div>\
      <textarea class="editor-details" v-model.trim="item.details" type="text" placeholder="Details..."></textarea>\
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
      <div class="item-text" :class="[{is_details: item.details}, {strikeout: item.strikeout}]" :title="item.details" v-if="!(editmode.enabled && editmode.index == index)">\
      <div class="label label-danger remind-label" v-if="item.remind_enabled">\
      <span class="glyphicon glyphicon-bell white" aria-hidden="true"></span>&nbsp;{{moment(item.remind_date + \' \' + item.remind_time).format(\'DD.MM.YYYY HH:mm\') + getRepeatStr(item.remind_repeat)}}\
      </div><br v-if="item.remind_enabled">\
      <div class="badge">\
      {{getCategoryByID(item.category)}}\
      </div>&nbsp;\
      {{item.text}}\
      </div>\
        <div class="btn-group">\
            <button type="button" :data-id="index" class="btn btn-default edit-todo-button" title="Edit item" @click="$emit(\'edit\');" v-if="!(editmode.enabled && editmode.index == index)">\
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
                default:
                    return ''
            }
        },
        getCategoryByID: function (id) {
            switch (id) {
                case '10':
                    return 'Work';
                case '20':
                    return 'Project';
                case '30':
                    return 'Personal';
                case '40':
                    return 'Family';
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
        },
        show: 'all',
        filterText: '',
        showCategory: '0',
        categoryForNew: '10',
    },
    methods: {
        addItem: function () {
            if (!this.newItemInput) return;
            this.todos.unshift({
                text: this.newItemInput,
                details: '',
                strikeout: false,
                remind_enabled: false,
                remind_date: moment().add(1, 'day').format('YYYY-MM-DD'),
                remind_time: '09:00',
                remind_repeat: '0',
                category: this.categoryForNew

            });
            this.newItemInput = '';
            loadTodosToSettings();
            updateAppSettings();
        },
        deleteItem: function (index) {
            if (confirm('Are you sure you want to delete this todo?')) {
                this.todos.splice(index, 1);
            }
            loadTodosToSettings();
            updateAppSettings();
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
                if (!this.todos[i].text) {
                    this.todos[i].text = 'Nothing';
                }
                if (!this.todos[i].category) {
                    this.todos[i].category = this.categoryForNew;
                }
                if (!this.todos[i].remind_date) {
                    this.todos[i].remind_date = convertDate(new Date());
                }
                if (!this.todos[i].remind_time) {
                    this.todos[i].remind_time = '00:00';
                }
            }
            loadTodosToSettings();
            updateAppSettings();
            $('body').animate({
                scrollTop: 0
            }, settings.animationSpeed);
        },
        cancelChanges: function (index) {
            this.editMode.enabled = false;
            loadTodosFromSettings(index);
            $('body').animate({
                scrollTop: 0
            }, settings.animationSpeed);
        },
        setFilterShow: function (type) {
            this.show = type;
        },
        cancelFilters: function () {
            this.show = 'all' ;
            this.filterText='';
            this.showCategory = '0';
            $("#todo-list .filters-wrap .category").val(0).change();
            $("#todo-list #todo-filter-text").val('');
        },
        selectCategory: function (e) {
            this.showCategory = e.target.value;
        },
        setFilterText : function (e) {
            this.filterText = e.target.value;
        }

    }


});


