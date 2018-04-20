currentUser = function () {
    let user = Meteor.user();
    if (!user) {
        throw new Meteor.Error('unauthorized',
            'You must be logged in');
    }
    return user;
};

isAdmin = function (user) {
    if (!Roles.userIsInRole(user, ['admin'])) {
        throw new Meteor.Error('permission.denied', 'Aktion nicht erlaubt.');
    }
};