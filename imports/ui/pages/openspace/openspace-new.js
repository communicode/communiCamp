import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Session} from 'meteor/session'

import './openspace-new.html'

Template.newOpenspace.events({
    'submit form'(e, t) {
        e.preventDefault();
        let dateString = t.find('[name=date]').value;
        let date = new Date(dateString);
        Meteor.call('openspace.insert', date, (e, d) => {
            if (e) {
                Materialize.toast(e.reason, 4000);
            } else {
                FlowRouter.go('openSpaceDetail', {id: d})
            }
        });
    }
});