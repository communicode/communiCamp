import {Session} from "meteor/session";
import './navigation.html';

Template.navigation.onCreated(function () {
    Meteor.subscribe('openspaces', undefined, Openspace.Status.Open);
});
Template.navigation.onRendered(function () {
    $(".button-collapse").sideNav({
        closeOnClick: true,
        draggable: false,
        onClose: function (el) {
            let overlay = $('#sidenav-overlay');
            Meteor.setTimeout(() => {
                overlay.remove();
            }, 1000);
        }
    });
    $(".dropdown-button").dropdown({constrainWidth: false});
});
Template.navigation.events({
    'click #logoutBtn'() {
        Meteor.logout((e) => {
            if (!e) {
                FlowRouter.go("login");
            }
        });
    }
});
Template.navigation.helpers({
    openspace() {
        return Openspaces.findOne({status: Openspace.Status.Open});
    },
    isActive(name) {
        let route = Session.get('currentPage');
        return (route !== undefined && route === name) ? 'active' : '';
    }
});