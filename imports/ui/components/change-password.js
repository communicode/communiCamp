import './change-password.html'

Template.changePassword.events({
    'submit #changePassword'(e, t) {
        e.preventDefault();
        let oldPassword = t.find('#oldPassword').value;
        let newPassword = t.find('#newPassword').value;
        Accounts.changePassword(oldPassword, newPassword, (e) => {
            if (e) {
                Materialize.toast(e.message, 5000);
            } else {
                Materialize.toast("Dein Passwort wurde geändert", 4000);
                t.$('input').val('').blur();

            }
        });
    }
});