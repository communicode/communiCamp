import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';
import '../validators';

Meteor.methods({
    'user.settings.add.timeslot'() {
        if (!Meteor.isServer) {
            // execute this method only on server cause of the use of Random.id()
            // for a short moment the timeslot item has a different random id at client side, so problems are to be expected
            // especially in this case the new timeslot gets rendered and has a id which is not equal to the id on the server
            // since the timepicker is out of reactive scope this causes errors
            return;
        }
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }
        Meteor.users.update(user._id, {
            $addToSet: {
                'profile.settings.openspace.timeSlots': {
                    id: Random.id(),
                    start: undefined,
                    end: undefined
                }
            }
        });
    },
    'user.add.user.role.by.host'(host) {
        if(!host) {
            throw new Meteor.Error('no.hostname.specified', `Bitte geben Sie einen Hostname ein`);
        }
        let users = Meteor.users.find({
            'emails.address': {$regex: host + '$'},
            'roles': {$nin: ['user']
            }
        });
        let count = users.count();
        if (!users || count === 0) {
            throw new Meteor.Error('no.users.found.by.specified.hostname', `Keine Benutzer für:&nbsp;<b>${host}</b>&nbsp;gefunden.`);
        }
        Roles.addUsersToRoles(users.fetch(), 'user');
        return count;
    },
    'user.settings.update.timeSlot'(id, value, isStart) {
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }

        let setVal = isStart ? {
            'profile.settings.openspace.timeSlots.$.start': value
        } : {
            'profile.settings.openspace.timeSlots.$.end': value
        };

        Meteor.users.update({_id: user._id, 'profile.settings.openspace.timeSlots.id': id}, {$set: setVal});
    },
    'user.settings.remove.timeslot'(id) {
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }

        Meteor.users.update(user._id, {
            $pull: {
                'profile.settings.openspace.timeSlots': {id: id}
            }
        });
    },


    'user.settings.add.room'(name) {
        if (!Meteor.isServer) {
            // same as for user.settings.add.timeslot
            return;
        }
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }
        Meteor.users.update(user._id, {
            $addToSet: {
                'profile.settings.openspace.rooms': {
                    id: Random.id(),
                    name: name
                }
            }
        });
    },
    'user.settings.update.room'(id, name) {
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }
        if (!id || !name) {
            return;
        }
        Meteor.users.update({
            _id: user._id,
            'profile.settings.openspace.rooms.id': id
        }, {$set: {'profile.settings.openspace.rooms.$.name': name}});
    },
    'user.settings.remove.room'(id) {
        let user = currentUser();
        if (!Roles.userIsInRole(user._id, 'admin')) {
            throw new Meteor.Error('unauthorized',
                'You must be Admin');
        }
        Meteor.users.update(user._id, {
            $pull: {
                'profile.settings.openspace.rooms': {id: id}
            }
        });
    }

});