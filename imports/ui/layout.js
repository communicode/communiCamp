import './layout.html';
import './components/navigation';

Template.addButton.onRendered(function () {
    $('#' + this.data.targetModalId).modal();
});

Template.registerHelper('formatDate', function (date) {
    if (!date || !(typeof date.getMonth === 'function')) {
        console.error("cannot parse", date);
        return "";
    }
    return date.toLocaleString().split(',')[0];
});

Template.registerHelper('equals', (a1, a2) => {
    return a1 === a2;
});

Template.registerHelper('notEquals', (a1, a2) => {
    return a1 !== a2;
});

Template.registerHelper('isAdmin', () => {
    return isAdmin(currentUser());
});

Template.registerHelper('appName', () => {
    return Meteor.settings.public.appName;
});