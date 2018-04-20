import './profile.html'
import '../../components/change-password'

Template.userSettings.events({
    'click .js-reset-votes'() {
        Meteor.call('topic.reset.votes', (e) => {
            if (e) {
                Materialize.toast(e.reason, 4000);
            } else {
                Materialize.toast("die Votes wurden erfolgreich zurückgesetzt!", 4000);
            }
        });
    }
});