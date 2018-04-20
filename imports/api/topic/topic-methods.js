import {Meteor} from "meteor/meteor";
import '../validators';

Meteor.methods({
    'topic.insert'(title, description) {
        let user = currentUser();
        if (!title || !description) {
            throw new Meteor.Error('data.incomplete', 'Bitte füllen Sie alle Felder aus');
        }
        Topics.insert({
            title: title,
            description: description,
            createdAt: new Date(),
            status: Topic.Status.Open,
            owner: {
                id: user._id,
                username: user.emails ? user.emails[0].address : user.username,
                name: user.profile && user.profile.name ? user.profile.name : user.username
            },
            votes: [],
            importantMarksCount: 0,
            voteCount: 0
        });
    },
    'topic.toggle.vote'(topicId) {
        let user = currentUser();
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        let topic = Topics.findOne(topicId);
        if (!openOpenspace) {
            throw new Meteor.Error('no.open.openspace', 'Es konnte kein offener Openspace gefunden werden');
        }
        if (!topic) {
            throw new Meteor.Error('topic.not.found', 'Das Thema konnte nicht gefunden werden');
        }
        if (topic.votes.find((item) => item.userId === user._id)) {
            //vote found, remove it from votes list
            if (user.profile.votesForCurrentOpenspace > 0) {
                Meteor.users.update(user._id, {
                    $inc: {'profile.votesForCurrentOpenspace': -1}
                });
            }
            Topics.update(topicId, {$pull: {votes: {userId: user._id}}, $inc: {voteCount: -1}});
        } else {
            //add vote and update current openspace
            if (user.profile.currentOpenspace !== openOpenspace._id) {
                Meteor.users.update(user._id, {
                    $set: {
                        'profile.currentOpenspace': openOpenspace._id,
                        'profile.votesForCurrentOpenspace': 1
                    }
                });
            } else {
                if (user.profile.votesForCurrentOpenspace >= 3) {
                    throw new Meteor.Error('too.many.votes', 'Du kannst maximal 3 Votes abgeben');
                }
                Meteor.users.update(user._id, {
                    $inc: {'profile.votesForCurrentOpenspace': 1}
                });
            }
            Topics.update(topicId, {$addToSet: {votes: {userId: user._id, name: user.profile.name || user.username}}, $inc: {voteCount: 1}});
        }
    },
    'topic.reset.votes'() {
        let user = currentUser();
        isAdmin(user);
        Topics.update({status: Topic.Status.Open}, {
            $set:
                {
                    votes: [],
                    voteCount: 0,
                    importantMarks: [],
                    importantMarksCount: 0
                }
        }, {multi: true});

        Meteor.users.update({}, {
            $set: {
                'profile.votesForCurrentOpenspace': 0,
                'profile.importantMarksForCurrentOpenspace': 0
            }
        }, {multi: true});
    },
    'topic.add.important'(topicId) {
        let user = currentUser();
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        if (!openOpenspace) {
            throw new Meteor.Error('no.open.openspace', 'Es konnte kein offener Openspace gefunden werden');
        }

        if (user.profile.currentOpenspace !== openOpenspace._id) {
            Meteor.users.update(user._id, {
                $set: {
                    'profile.currentOpenspace': openOpenspace._id,
                    'profile.importantMarksForCurrentOpenspace': 1
                }
            });
        } else {
            if (user.profile.importantMarksForCurrentOpenspace > 0) {
                throw new Meteor.Error('too.many.votes', 'Du hast bereits ein Thema als wichtig markiert');
            }
            Meteor.users.update(user._id, {
                $inc: {'profile.importantMarksForCurrentOpenspace': 1}
            });
        }

        Topics.update(topicId, {$addToSet: {importantMarks: {userId: user._id, name: user.profile.name || user.username}}, $inc: {importantMarksCount: 1}});

    },
    'topic.remove.important'(topicId) {
        let user = currentUser();
        if (user.profile.importantMarksForCurrentOpenspace > 0) {
            Meteor.users.update(user._id, {
                $inc: {'profile.importantMarksForCurrentOpenspace': -1}
            });
        }
        Topics.update(topicId, {$pull: {importantMarks: {userId: user._id}}, $inc: {importantMarksCount: -1}});
    },
    'topic.add.comment'(topicId, text) {
        let user = currentUser();
        if (!text) {
            throw new Meteor.Error('invalid.value', 'Was soll ich speichern?');
        }
        Topics.update(topicId, {
            $push: {
                comments: {
                    createdAt: new Date(),
                    text: text,
                    owner: {
                        id: user._id,
                        username: user.emails ? user.emails[0].address : user.username,
                        name: user.profile && user.profile.name ? user.profile.name : user.username
                    }
                }
            }
        });
    },
    'topic.remove'(id) {
        let user = currentUser();
        let topic = Topics.findOne(id);
        if (Roles.userIsInRole(user, ['admin']) || topic.owner.id === user._id) {
            Topics.remove(id);
            return;
        }
        throw new Meteor.Error('permission.denied', 'Aktion nicht erlaubt.');
    }
});