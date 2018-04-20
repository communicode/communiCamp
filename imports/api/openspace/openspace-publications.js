Meteor.publish('openspaces', function openspacesPublication(id,status) {
    if (!this.userId) {
        return;
    }
    let query = {};
    if(id) {
        query['_id'] = id;
    }
    if(status) {
        query['status'] = status;
    }
    return Openspaces.find(query);
});