Vue.component('notification-item', {
    template: '\
    <li class="notification list-inline">\
    <div class="well">\
        <p class="time"><span v-show="is_today(item.time)" class="label label-danger">today</span>&nbsp<span class="badge">{{item.category}}</span>&nbsp;{{item.time}}</p>\
        <h2 class="text">{{item.text}}</h2>\
        <p class="details">{{item.details}}</p>\
    </div>\
    </li>\
    ',
    props: ['item'],
    methods: {
        moment: function (something) {
            return moment(something);
        },
        is_today: function (time) {
            return moment(time, settings.date_format + ' ' + settings.time_format).format(settings.date_format) == moment().format(settings.date_format)
        }
    }
});
var vmNotifications = new Vue({
    el: '#notifications-area',
    data: {
        notifications: []
    },
    methods: {
        clearAll: function () {
            if (confirm('Are you shure you want to remove all notifications?')) {
                this.notifications = [];
                loadNotificationsToSettings();
                updateAppSettings();
            }
        }
    }
});

