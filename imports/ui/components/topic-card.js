import './topic-card.html';
import '../../api/openspace/openspace-methods'
import './topic-to-openspace-form'
import '../components/card-modal'
import {Session} from 'meteor/session';

Template.topicCard.events({
    'dragstart'(e, t) {
        e.originalEvent.dataTransfer.setData('text/plain', 'Topic');
        Session.set('openspace-table-source', t.data.topic);
    },
    'dragend'(e, t) {
        let source = Session.get('openspace-table-source');
        let target = Session.get('openspace-table-target');
        Session.set('openspace-table-source', undefined);
        Session.set('openspace-table-target', undefined);
        if (!target) {
            return;
        }
        source['room'] = target.room;
        source['timeSlots'] = [target.timeSlot];
        Meteor.call('openspace.add.topic', source);
    },
    'click .js-open-context-menu'(e, t) {
        Blaze.renderWithData(Template.addTopicToOpenspace, this, t.find('.context-menu-wrapper'));
    },
    'click .js-interest': function () {
        Meteor.call('topic.toggle.vote', this._id, toastOnError);
    },
    'click .js-important': function () {
        let user = Meteor.user();
        if (this.importantMarks && this.importantMarks.find((item) => item.userId === user._id)) {
            Meteor.call('topic.remove.important', this._id, user._id, toastOnError);
        } else {
            Meteor.call('topic.add.important', this._id, toastOnError);
        }
    },
    'click .card-content'(e, t) {
        Blaze.renderWithData(Template.cardModal, this, $('#modal-wrapper').get(0));
    }
});
Template.topicCard.helpers({
    voted() {
        return this.votes && this.votes.find((vote) => vote.userId === Meteor.userId());
    },
    markedAsImportant() {
        return this.importantMarks && this.importantMarks.find((vote) => vote.userId === Meteor.userId());
    },
});