import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';
import '../validators';

topicOfOpenspace = function (openspace, timeSlotId, roomId) {
    let result = (openspace.topics || []).find((topic) => {
        if (topic.room !== roomId) {
            return false;
        }
        return (topic.timeSlots || []).find((timeSlot) => {
            return timeSlot === timeSlotId;
        });
    });
    return result || {};
};

Meteor.methods({
    'openspace.insert'(date) {
        let user = currentUser();
        isAdmin(user);
        if (!date) {
            throw new Meteor.Error('data.incomplete', 'Bitte füllen Sie alle Felder aus.');
        }
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        if (openOpenspace) {
            Openspaces.update(openOpenspace._id, {
                $set: {
                    status: Openspace.Status.Closed
                }
            });
        }
        let settings = user.profile.settings.openspace;
        return Openspaces.insert({
            date: date,
            status: Openspace.Status.Open,
            createdAt: new Date(),
            settings: settings
        });
    },
    'openspace.add.topic'(topic) {
        let user = currentUser();
        isAdmin(user);
        if (!topic.title || !topic.description) {
            throw new Meteor.Error('topic.incomplete', 'Das Thema ist nicht ausreichend beschrieben');
        }
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        if (!openOpenspace) {
            throw new Meteor.Error('topic.invalide', 'Es konnte kein offener Openspace gefunden werden');
        }

        let blocker = openOpenspace.topics && openOpenspace.topics.find((openSpaceTopic) => {
            if (openSpaceTopic.room !== topic.room || !openSpaceTopic.timeSlots) return false;
            return openSpaceTopic.timeSlots.find((timeSlot) => {
                return topic.timeSlots.indexOf(timeSlot) > -1;
            });
        });

        if (blocker) {
            throw new Meteor.Error('topic.invalide', `Es gibt Überschneidungen mit &nbsp; <strong>${blocker.title}</strong>`);
        }

        Openspaces.update(openOpenspace._id, {
            $addToSet: {
                topics: topic
            }
        });
        Topics.update(topic._id, {
            $set: {status: Topic.Status.Planned}
        });
    },
    'openspace.topic.add.timeslot'(openspace, topic, timeSlotId) {
        let user = currentUser();
        isAdmin(user);
        Openspaces.update({_id: openspace._id, 'topics._id': topic._id}, {
            $addToSet: {
                'topics.$.timeSlots': timeSlotId
            }
        });
    },
    'openspace.topic.remove.timeslot'(openspace, topic, timeSlotId) {
        let user = currentUser();
        isAdmin(user);
        Openspaces.update({_id: openspace._id, 'topics._id': topic._id}, {$pull: {'topics.$.timeSlots': timeSlotId}});
        if (topic.timeSlots.length === 1) {
            Openspaces.update({_id: openspace._id}, {$pull: {'topics': {'_id': topic._id}}});
            Topics.update({_id: topic._id}, {$set: {'status': Topic.Status.Open}});
        }
    },
    'openspace.remove.all.topics'(openspaceId) {
        let user = currentUser();
        isAdmin(user);
        let openspace = Openspaces.findOne(openspaceId);
        Openspaces.update(openspaceId, {$set: {'topics': []}});
        let ids = openspace.topics.map((item) => item._id);
        Topics.update({_id: {$in: ids}}, {$set: {'status': Topic.Status.Open}}, {multi: true});
    },
    'openspace.settings.add.timeslot'(openspaceId) {
        if (!Meteor.isServer) {
            return;
        }
        let user = currentUser();
        isAdmin(user);
        Openspaces.update(openspaceId, {
            $addToSet: {
                'settings.timeSlots': {
                    id: Random.id(),
                    start: undefined,
                    end: undefined
                }
            }
        });
    },
    'openspace.set.status'(id, status) {
        let user = currentUser();
        isAdmin(user);
        Openspaces.update(id, {$set: {status: status}});
    },
    'openspace.settings.update.timeSlot'(openspaceId, id, value, field) {
        let user = currentUser();
        isAdmin(user);
        let setVal = {['settings.timeSlots.$.' + field]: value};
        Openspaces.update({_id: openspaceId, 'settings.timeSlots.id': id}, {$set: setVal});
    },
    'openspace.settings.remove.timeslot'(openspaceId, id) {
        let user = currentUser();
        isAdmin(user);
        let openspace = Openspaces.findOne(openspaceId);
        let topicForSlot = (openspace.topics || []).find((topic) => {
            return (topic.timeSlots || []).find((timeSlot) => {
                return timeSlot === id;
            });
        });
        if (topicForSlot && topicForSlot.timeSlots.length === 1) {
            Topics.update({_id: topicForSlot._id}, {$set: {status: Topic.Status.Open}});
        }
        Openspaces.update(openspaceId, {$pull: {'settings.timeSlots': {id: id}}});
    },
    'openspace.settings.add.room'(openspaceId) {
        if (!Meteor.isServer) {
            return;
        }
        let user = currentUser();
        isAdmin(user);
        Openspaces.update(openspaceId, {
            $addToSet: {
                'settings.rooms': {
                    id: Random.id(),
                    name: undefined
                }
            }
        });
    },
    'openspace.settings.update.room'(openspaceId, id, name) {
        let user = currentUser();
        isAdmin(user);
        Openspaces.update({_id: openspaceId, 'settings.rooms.id': id}, {$set: {'settings.rooms.$.name': name}});
    },
    'openspace.settings.remove.room'(openspaceId, id) {
        let user = currentUser();
        isAdmin(user);
        let openspace = Openspaces.findOne(openspaceId);
        let topicForRoom = (openspace.topics || []).find((topic) => {
            return topic.room === id;
        });
        if (topicForRoom) {
            Topics.update({_id: topicForRoom._id}, {$set: {status: Topic.Status.Open}});
        }
        Openspaces.update(openspaceId, {$pull: {'settings.rooms': {id: id}}});
    },
    'openspace.switch.topic'(changeRequest) {
        let user = currentUser();
        isAdmin(user);
        let openspace = changeRequest.openspace;
        let timeSlots = openspace.settings.timeSlots.map((timeSlot) => {
            return timeSlot.id
        });

        let switchPosition = function (source, target) {
            let topic = source.topic;
            let topicIndex = openspace.topics.findIndex((item) => item._id === topic._id);
            if (topicIndex < 0) {
                return;
            }
            let firstTimeSlot = timeSlots.findIndex((timeSlot) => timeSlot === target.timeSlot);
            let newTimeSlots = timeSlots.slice(firstTimeSlot, firstTimeSlot + topic.timeSlots.length);
            topic.room = target.room;
            topic.timeSlots = newTimeSlots;
            openspace.topics[topicIndex] = topic;
        };


        switchPosition(changeRequest.source, changeRequest.target);
        switchPosition(changeRequest.target, changeRequest.source);

        Openspaces.update(openspace._id, {$set: openspace});
    }
});