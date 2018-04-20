import './topic-detail.html'

Template.topicDetail.onCreated(function () {
    Meteor.subscribe('topics', FlowRouter.getParam('topicId'));
});

Template.topicDetail.helpers({
    topic() {
        return Topics.findOne(FlowRouter.getParam('topicId'));
    },
    deletable() {
        let user = Meteor.user();
        return Roles.userIsInRole(user, ['admin']) || this.owner.id === user._id;
    }
});

Template.topicDetail.events({
    'submit form'(e, t) {
        e.preventDefault();
        let val = t.$('#commentText').val();
        Meteor.call('topic.add.comment', FlowRouter.getParam('topicId'), val, toastOnError);
        t.$('#commentText').val("");
    },
    'click #removeTopic'() {
        let remove = confirm('Möchtest du dieses Thema wirklich unwiederruflich löschen?');
        if (!remove) return;
        Meteor.call('topic.remove', this._id, (e) => {
            if (e) {
                Materialize.toast(e.reason, 4000);
            } else {
                window.history.back();
            }
        });

    }
});