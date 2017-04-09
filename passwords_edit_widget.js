Vue.component('passwords-edit-item', {
    template: '\
    <div class="password row">\
    <div class="col-sm-3">\
    <label>Name</label>\
    <input v-model="item.name" type="text" :class="{invalid: !item.name_valid}">\
    </div>\
    <div class="col-sm-4">\
    <label>Password</label>\
    <div v-if="item.visibility">\
    <input v-model="item.password" type="text" :class="{invalid: !item.password_valid}">\
    </div>\
    <div v-else>\
    <input v-model="item.password" type="password" :class="{invalid: !item.password_valid}">\
    </div>\
    <button @click="$emit(\'gen\')" type="button" class="btn btn-xs btn-default button-gen-password">\
    <span class="glyphicon glyphicon-flash" aria-hidden="true"></span>\
    </button>\
    <button @click="$emit(\'visibility\')" type="button" class="btn btn-xs btn-default button-show-password">\
    <div v-if="item.visibility">\
    <span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>\
    </div>\
    <div v-else>\
    <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>\
    </div>\
    </button>\
    </div>\
    <div class="col-sm-3">\
    <label>Confirm</label>\
    <div v-if="item.visibility">\
    <input v-model="item.confirm" type="text" :class="{invalid: !item.confirm_valid}">\
    </div>\
    <div v-else>\
    <input v-model="item.confirm" type="password" :class="{invalid: !item.confirm_valid}">\
    </div>\
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

    },
    watch: {
        'item.name': function (value) {
            if (!value) {
                this.item.name_valid = false;
            } else {
                this.item.name_valid = true;
            }
        },
        'item.password': function (value) {
            if (!value) {
                this.item.password_valid = false;
            } else {
                this.item.password_valid = true;
            }

            if (value != this.item.confirm) {
                this.item.confirm_valid = false;
            } else {
                this.item.confirm_valid = true;
            }
        },
        'item.confirm': function (value) {
            if (value != this.item.password) {
                this.item.confirm_valid = false;
            } else {
                this.item.confirm_valid = true;
            }
        }
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
                name: 'password',
                password: genPassword(),
                confirm: genPassword(),
                visibility: false,
                name_valid: true,
                password_valid: true,
                confirm_valid: true,
            });

            editorDataModified = true;
            displayEditorSaveButton();
        },
        deleteItem: function (index) {
            // if (confirm('Are you sure you want to delete this password?')) {
            //     this.todos.splice(index, 1);
            // }

            this.passwords.splice(index, 1);

            editorDataModified = true;
            displayEditorSaveButton();
        },
        genPassword: function (index) {
            this.passwords[index].confirm = this.passwords[index].password = genPassword();

        },
        changeVisibility: function (index) {
            this.passwords[index].visibility = !this.passwords[index].visibility;

        }
    }
});

function validatePasswordsEditWidget() {
    for (var i in vmPasswordsEditWidget.passwords) {
        if (
            !vmPasswordsEditWidget.passwords[i].name_valid ||
            !vmPasswordsEditWidget.passwords[i].password_valid ||
            !vmPasswordsEditWidget.passwords[i].confirm_valid
        ) {
            return false;
        }
    }
    return true;
}