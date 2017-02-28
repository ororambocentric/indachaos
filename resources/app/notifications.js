Vue.component('notification-item', {
    template: '\
    <li class="notification list-inline">\
    <div class="well">\
        <p class="time"><span class="badge">{{item.category}}</span>&nbsp;{{item.time}}</p>\
        <h2 class="text">{{item.text}}</h2>\
        <p class="details">{{item.details}}</p>\
    </div>\
    </li>\
    ',
    props: ['item']
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

