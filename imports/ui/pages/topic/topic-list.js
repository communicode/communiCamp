import './topic-list.html'

Template.topicList.onCreated(function () {
    Meteor.subscribe('topics');
});
Template.topicList.onRendered(function () {
    $('.collapsible').collapsible();
});
Template.topicList.helpers({
    topics() {
        return Topics.find({}, {sort: {createdAt: -1}});
    }
});