import './openspace-settings.html';
import '../../../api/user/user-methods';
import '../../components/form-elements'


Template.openspaceSettings.events({
    'click #addTimeSlot'() {
        Meteor.call('user.settings.add.timeslot');
    },
    'click .js-remove-timeslot'() {
        Meteor.call('user.settings.remove.timeslot', this.id);
    },
    'click #addRoom'() {
        Meteor.call('user.settings.add.room');
    },
    'click .js-remove-room'() {
        Meteor.call('user.settings.remove.room', this.id);
    },
    'blur .js-room-input'(e, t) {
        Meteor.call('user.settings.update.room', this.id, e.target.value);
    }
});

Template.openspaceSettings.helpers({
    'updateStartTime'() {
        return function (id, value) {
            Meteor.call('user.settings.update.timeSlot', id, value, true);
        }
    },
    'updateEndTime'() {
        return function (id, value) {
            Meteor.call('user.settings.update.timeSlot', id, value, false);
        }
    },
});