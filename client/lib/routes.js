import {Session} from "meteor/session";
import '/imports/ui/layout';
import '/imports/ui/components/communicode-brand.html'
import '/imports/ui/pages/login';
import '/imports/ui/pages/register';
import '/imports/ui/pages/topic/topic-list-open';
import '/imports/ui/pages/topic/topic-list';
import '/imports/ui/pages/topic/topic-detail';
import '/imports/ui/pages/openspace/openspace-new';
import '/imports/ui/pages/openspace/openspace-edit';
import '/imports/ui/pages/openspace/openspace-list';
import '/imports/ui/pages/openspace/openspace-detail';
import '/imports/ui/pages/settings/profile';
import '/imports/ui/pages/settings/accounts-admin';
import '/imports/ui/pages/settings/openspace-settings';


const REDIRECT_AFTER_LOGIN = 'redirectAfterLogin';

FlowRouter.triggers.enter([function (context, redirect, stop) {
    Session.set('currentPage', context.route.name);
}]);

Accounts.onLogin(function () {
    let redirect = Session.get(REDIRECT_AFTER_LOGIN);
    if (redirect) {
        Session.set(REDIRECT_AFTER_LOGIN, undefined);
        if (redirect === '/login' || redirect === '/signup') {
            return FlowRouter.go('openTopicList');
        }
        return FlowRouter.go(redirect);
    }
});

let exposed = FlowRouter.group({});
let loggedIn = FlowRouter.group({
    triggersEnter: [
        function () {
            let route;
            if (!(Meteor.loggingIn() || Meteor.userId())) {
                route = FlowRouter.current();
                if (route.route.name !== 'login') {
                    Session.set(REDIRECT_AFTER_LOGIN, route.path);
                }
                return FlowRouter.go('login');
            }
        }
    ]
});

exposed.route('/login', {
    name: 'login',
    action(params, queryParams) {
        BlazeLayout.render('loginLayout', {content: 'login'});
    }
});

exposed.route('/register', {
    name: 'register',
    action(params, queryParams) {
        BlazeLayout.render('loginLayout', {content: 'register'});
    }
});

loggedIn.route('/topic/list/open', {
    name: 'openTopicList',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'openTopicList'});
    }
});
loggedIn.route('/', {
    action: function (params, queryParams) {
        FlowRouter.go('openTopicList')
    }
});

loggedIn.route('/topic/list', {
    name: 'topicList',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'topicList'});
    }
});

loggedIn.route('/topic/detail/:topicId', {
    name: 'topicList',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'topicDetail'});
    }
});

loggedIn.route('/openspace/create', {
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'newOpenspace'});
    }
});

loggedIn.route('/openspace/list', {
    name: 'openSpaceList',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'openspaceList'});
    }
});

loggedIn.route('/openspace/detail/:id', {
    name: 'openSpaceDetail',
    action: function (params, queryParams) {
        BlazeLayout.render('layout', {content: 'openspaceDetail'});
    }
});

loggedIn.route('/openspace/edit/:id', {
    action: function (params, queryParams) {
        BlazeLayout.render('layout', {content: 'openspaceEdit'});
    }
});

loggedIn.route('/profile', {
    name: 'profile',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'userSettings'});
    }
});

loggedIn.route('/accounts-admin', {
    name: 'accountsAdmin',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'accountsAdminPage'});
    }
});

loggedIn.route('/opensapce-settings', {
    name: 'openSpaceSettings',
    action: function (params, queryParams) {
        BlazeLayout.render('containerLayout', {content: 'openspaceSettings'});
    }
});