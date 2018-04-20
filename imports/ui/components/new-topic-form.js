import './new-topic-form.html';
import '../../api/topic/topic-methods'

Template.newTopicForm.events({
    'submit form'(e, t) {
        e.preventDefault();
        let title = t.find('[name=title]').value;
        let description = t.find('[name=description]').value;
        Meteor.call('topic.insert', title, description, (e) => {
            if (e) {
                Materialize.toast(e.reason, 4000);
            } else {
                t.find('[name=title]').value = '';
                t.find('[name=description]').value = '';
                $('#newTopicModal').modal('close');
            }
        });

    }
});