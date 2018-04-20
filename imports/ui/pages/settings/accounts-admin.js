import './accounts-admin.html'
Template.accountsAdminPage.events({
    'click #addUserRolesByHost'(e,t){
        let input = t.find('#emailHost');
        Meteor.call('user.add.user.role.by.host',input.value,(error, count) => {
            if(error) {
                return Materialize.toast(error.reason, 4000);
            }
            Materialize.toast(`<b>${count}</b>&nbsp;Benutzer aktualisiert`, 4000);
            input.value = '';
        });
    }
});