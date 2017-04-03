Vue.component('passwords-edit-item', {
    template: '\
    <div class="password row">\
    <div class="col-sm-3">\
    <label>Name</label>\
    <input v-model="item.name" type="text">\
    </div>\
    <div class="col-sm-4">\
    <label>Password</label>\
    <input v-model="item.password" :type="item.visibility ? \'text\': \'password\'">\
    <button @click="$emit(\'gen\')" type="button" class="btn btn-xs btn-default button-gen-password">\
    <span class="glyphicon glyphicon-flash" aria-hidden="true"></span>\
    </button>\
    <button @click="$emit(\'visibility\')" type="button" class="btn btn-xs btn-default button-show-password">\
    <span :class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>\
    </button>\
    </div>\
    <div class="col-sm-3">\
    <label>Confirm</label>\
    <input v-model="item.confirm" :type="item.visibility ? \'text\': \'password\'">\
    </div>\
    <div class="pull-right">\
    <button @click="$emit(\'delete\')" type="button" class="btn btn-sm btn-default">\
    <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>\
    </button>\
    </div>\
    </div>\
    ',
    props: ['index', 'item'],
    methods: {

    }
});

var vmPasswordsEditWidget = new Vue({
    el: '.passwords-edit-area',
    data: {
        passwords: []
    },
    methods: {
        addPasswordEditWidget: function () {
            this.passwords.push({
                name: '',
                password: '',
                confirm: '',
                visibility: false
            });
        },
        deleteItem: function (index) {
            // if (confirm('Are you sure you want to delete this password?')) {
            //     this.todos.splice(index, 1);
            // }
            this.passwords.splice(index, 1);
        },
        genPassword: function (index) {
            this.passwords[index].confirm = this.passwords[index].password = genPassword();

        },
        changeVisibility: function (index) {
            this.passwords[index].visibility = !this.passwords[index].visibility;

        }
    }
});
