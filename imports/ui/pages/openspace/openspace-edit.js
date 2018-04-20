import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Session} from 'meteor/session'
import '../../components/edit-openspace-table-cell'
import './openspace-edit.html';

Template.openspaceEdit.onCreated(function () {
    Meteor.subscribe('openspaces');
    let id = FlowRouter.getParam("id");
    let instance = this;
    instance.openspace = ReactiveVar();
    instance.autorun(function () {
        let openspace = Openspaces.findOne(id);
        if (openspace) {
            instance.openspace.set(openspace);
        }
    });
});

Template.openspaceEdit.helpers({
    'openspace'() {
        return Openspaces.findOne(FlowRouter.getParam("id"));
    },
    'updateStartTime'() {
        return function (id, value) {
            Meteor.call('openspace.settings.update.timeSlot', FlowRouter.getParam("id"), id, value, 'start');
        }
    },
    'updateEndTime'() {
        return function (id, value) {
            Meteor.call('openspace.settings.update.timeSlot', FlowRouter.getParam("id"), id, value, 'end');
        }
    },
    isOpen() {
        let openspace = Template.instance().openspace.get();
        return openspace && openspace.status === Openspace.Status.Open;
    }
});

Template.openspaceEdit.events({
    'click #close-openspace'() {
        Meteor.call('openspace.set.status', FlowRouter.getParam("id"), Openspace.Status.Closed);
    },
    'click #open-openspace'() {
        Meteor.call('openspace.set.status', FlowRouter.getParam("id"), Openspace.Status.Open);
    },
    'click #addTimeSlot'() {
        Meteor.call('openspace.settings.add.timeslot', FlowRouter.getParam("id"));
    },
    'click .js-remove-timeslot'() {
        Meteor.call('openspace.settings.remove.timeslot', FlowRouter.getParam("id"), this.id);
    },
    'click #addRoom'() {
        Meteor.call('openspace.settings.add.room', FlowRouter.getParam("id"));
    },
    'click .js-remove-room'() {
        Meteor.call('openspace.settings.remove.room', FlowRouter.getParam("id"), this.id);
    },
    'click #removeAllTopics'() {
        Meteor.call('openspace.remove.all.topics', FlowRouter.getParam("id"));
    },
    'blur .js-room-input'(e, t) {
        Meteor.call('openspace.settings.update.room', FlowRouter.getParam("id"), this.id, e.target.value);
    }
});