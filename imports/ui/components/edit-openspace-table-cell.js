import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Session} from 'meteor/session';

import './edit-openspace-table-cell.html';

Template.topicCell.events({
    'dragstart .topic-cell-item'(e, t) {
        e.originalEvent.dataTransfer.setData('text/plain', 'Topic');
        let source = {
            room: t.data.room,
            timeSlot: t.data.timeSlot,
            topic: t.data.topic
        };
        Session.set('openspace-table-source', source);
    },
    'dragenter .topic-cell-item'(e, t) {
        let target = {
            room: t.data.room,
            timeSlot: t.data.timeSlot,
            topic: t.data.topic
        };
        let source = Session.get('openspace-table-source');
        if (source.topic === undefined) {
            Session.set('openspace-table-target', target);
            let cell = $(e.target).closest('td');
            cell.addClass('hover');
            return
        }
        if (source.room === target.room && source.timeSlot === target.timeSlot) {
            Session.set('openspace-table-target', undefined);
            return;
        }
        let timeSlotCount = source.topic.timeSlots.length;
        let cell = $(e.target).closest('td');
        let row = cell.closest('tr');
        let rows = $('.openspace-table tr.time-slot-row');
        let timeSlotIndex = rows.index(row);
        let newEndTimeSlotIndex = timeSlotIndex + timeSlotCount;
        if (newEndTimeSlotIndex > rows.length) {
            Session.set('openspace-table-target', undefined);
            return;
        }

        cell.addClass('hover');
        cell.find('.topic-card').hide();
        if (timeSlotCount > 1) {
            //TODO display hover when multiple slots
        }
        Session.set('openspace-table-target', target);
    },
    'dragleave .topic-cell-item'(e, t) {
        let cell = $(e.target).closest('td');
        cell.removeClass('hover');
        cell.find('.topic-card').show();
    },
    'dragend .topic-cell-item'(e, t) {
        let changeRequest = {
            source: Session.get('openspace-table-source'),
            target: Session.get('openspace-table-target'),
            openspace: t.data.openspace
        };
        if (!changeRequest.target) {
            return;
        }
        Meteor.call('openspace.switch.topic', changeRequest);
    },
    'click #add-slot'() {
        let topic = this.topic;
        let openspace = this.openspace;
        let timeSlots = openspace.settings.timeSlots.map((item) => item.id);
        let timeSlotIdx = timeSlots.findIndex((item) => topic.timeSlots[topic.timeSlots.length - 1] === item);
        let nextSlotId = timeSlots[timeSlotIdx + 1];
        let next = topicOfOpenspace(openspace, nextSlotId, topic.room);
        if (next.id) {
            Materialize.toast("Der nächste Timeslot ist bereits belegt.", 4000);
            return;
        }
        Meteor.call('openspace.topic.add.timeslot', openspace, topic, nextSlotId);
    },
    'click .remove-slot'(e, t) {
        let topic = this.topic;
        let timeSlot = this.timeSlot;
        let openspace = this.openspace;
        Meteor.call('openspace.topic.remove.timeslot', openspace, topic, timeSlot);
    }
});

Template.topicCells.helpers({
    'topic'(openspace, timeSlotId, roomId) {
        return topicOfOpenspace(openspace, timeSlotId, roomId);
    }
});

function toggleCardColorClass() {
    let card = cell.find('.topic-card');
    if (card.hasClass('blue-grey')) {
        card.remove('blue-grey')
    }
}