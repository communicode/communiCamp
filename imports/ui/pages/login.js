import {Session} from "meteor/session";
import "./login.html";

Template.login.onCreated(function () {
    Meteor.setTimeout(() => {
        if (Meteor.user() || Meteor.loggingIn()) {
            FlowRouter.go("openTopicList");
        }
    }, 100);
});
Template.login.onRendered(function () {
    Materialize.updateTextFields();
});
Template.login.events({
    'submit #loginForm'(event, template) {
        event.preventDefault();
        let email = template.find("#email").value;
        let password = template.find("#password").value;
        Meteor.loginWithPassword(email, password, (error) => {
            if (!error) {
                FlowRouter.go('openTopicList');
                return;
            }
            Materialize.toast(error.reason, 4000)
        });
    },
    'click #resetPassword'() {
        let email = $("#email").val();
        if (!email) {
            Materialize.toast("Bitte trage deine Email ein.", 4000);
            return;
        }
        Accounts.forgotPassword({email}, (e) => {
            if (e) {
                return Materialize.toast(e.reason, 4000);
            }
            Materialize.toast("E-Mail wurde versendet.", 4000);
        });
    }
});

