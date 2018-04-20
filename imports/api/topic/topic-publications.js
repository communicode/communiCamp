Meteor.publish('topics', function topicPublication(id, status, options) {
    if (!this.userId) {
        return;
    }
    let query = {};
    if (id) {
        query._id = id;
    }
    if (status) {
        query.status = status;
    }
    return Topics.find(query);
});