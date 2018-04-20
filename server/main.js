import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Email} from 'meteor/email';
import '/imports/api/topic/topic-methods';
import '/imports/api/topic/topic-publications';
import '/imports/api/openspace/openspace-methods';
import '/imports/api/openspace/openspace-publications';
import '/imports/api/user/user-methods';

const ncp = require('ncp').ncp;

Accounts.validateLoginAttempt((attemt) => {
    let user = attemt.user;
    if (!user || !attemt.allowed) {
        return false;
    }
    if (!Roles.userIsInRole(user, ['user']) && !Roles.userIsInRole(user, ['admin'])) {
        throw new Meteor.Error('user.not.verified', 'Du bist noch nicht freigeschaltet, bitte kontatiere einen Admin');
    }
    return true;
});

Accounts.onCreateUser((options, user) => {
    let appName = Meteor.settings.public.appName;
    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        user.profile = options.profile;
    }
    Meteor.users.find({'roles': {$in: ['admin']}}).fetch().forEach((adminUser) => {
        if (!adminUser.emails || adminUser.emails.length === 0) return;
        Email.send({
            to: adminUser.emails[0].address,
            from: 'no-reply@communicode.de',
            subject: appName + 'neue anmeldung',
            text: `${user.profile.name} (${user.emails[0].address}) wartet auf seine Freischaltung für ${appName}.`
        });

    });

    return user;
});

Meteor.startup(() => {
    let appName = Meteor.settings.public.appName;
    let publicImgFolder = process.env.PWD + (Meteor.isProduction ? '/programs/web.browser/app/img' : '/public/img');

    ncp(publicImgFolder + '/' + appName + '/favicon', publicImgFolder + '/favicon', function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('coping favicons done!');
    });

    Accounts.emailTemplates.from = appName + ' Account <no-reply@communicode.de>';
    Accounts.emailTemplates.resetPassword.from = () => {
        return appName + ' Password Reset <no-reply@communicode.de>';
    };
    process.env.MAIL_URL = 'smtp://mail.communicode.de:25';

    if (!Meteor.roles.findOne({name: "user"})) {
        Roles.createRole("user");
    }

    if (Meteor.users.find().count() === 0) {
        let id = Accounts.createUser({
            username: "admin",
            password: "nimda"
        });
        Roles.setUserRoles(id, 'admin',);

        ['Besprechungsraum Oben', 'Besprechungsraum 3', 'Küche', 'Büro'].forEach(function (room) {
            Meteor.users.update(id, {
                $addToSet: {
                    'profile.settings.openspace.rooms': {
                        id: Random.id(),
                        name: room
                    }
                }
            });
        });

        [{start: '13:45', end: '14:40'}, {start: '14:45', end: '15.40'}, {
            start: '15.45',
            end: '16:30'
        }].forEach(function (timeSlot) {
            Meteor.users.update(id, {
                $addToSet: {
                    'profile.settings.openspace.timeSlots': {
                        id: Random.id(),
                        start: timeSlot.start,
                        end: timeSlot.end
                    }
                }
            });
        });

        console.log('created admin user with password "nimda"');
    }
});