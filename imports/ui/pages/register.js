import './register.html';
import {Accounts} from "meteor/accounts-base";

Template.register.onCreated(function () {
    Meteor.setTimeout(() => {
        if (Meteor.user() || Meteor.loggingIn()) {
            FlowRouter.go("/");
        }
    }, 100);
});

Template.register.events({
    'submit #signupForm'(event, template) {
        event.preventDefault();

        let serializeArray = $('#signupForm').serializeArray();
        for (index = 0; index < serializeArray.length; ++index) {
            let element = serializeArray[index];
            if (!element.value) {
                Materialize.toast(element.name + " wird benötigt.", 4000);
                return;
            }
        }

        let profile = {
            name: template.find("#firstname").value + " " + template.find("#lastname").value
        };

        let email = template.find("#email").value;
        let password = template.find("#password").value;
        let password2 = template.find("#password-repetition").value;

        if (!email) {
            Materialize.toast("Bitte trage deine Email ein", 4000);
            return;
        }

        if (password !== password2) {
            Materialize.toast("Die Passwörter müssen übereinstimmen", 4000);
            return;
        }
        let username = email;
        Accounts.createUser({username, email, password, profile}, (error) => {
            if (error) {
                Materialize.toast(error.reason);
                if(error.error !== "user.not.verified") {
                    return;
                }
            }
            FlowRouter.go("/");
        });
    }
});
