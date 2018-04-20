import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Session} from 'meteor/session'
import '../../components/topic-card';
import '../../components/new-topic-form';

import './topic-list-open.html';

Template.openTopicList.onCreated(function () {
    Meteor.subscribe('topics', undefined, Topic.Status.Open);
    Meteor.subscribe('openspaces', Openspace.Status.Open);
});

Template.openTopicList.helpers({
    topics() {
        return Topics.find({status: Topic.Status.Open}, {sort: {createdAt: -1}});
    }
});

Template.openTopicList.events({
    'change #sortList'(e, t) {
        Session.set(LIST_SORT, e.target.checked);
    }
});