import './form-elements.html'

Template.formSelect.helpers({
    isSelected() {
        let selectedValue = Template.instance().data.selectedValue;
        return selectedValue === this.value ? 'selected' : '';
    }
});

Template.formSelect.onRendered(function () {
    $('select').material_select();
});

Template.formDatepicker.onRendered(function () {
    let datepicker = this.$('.datepicker');
    datepicker.pickadate({
        selectMonths: true,
        selectYears: 15,
        today: 'Today',
        clear: 'Löschen',
        close: 'Ok',
        closeOnSelect: true
    });
    let initialDate = Template.instance().data.initialDate || new Date();
    if (initialDate) {
        let picker = datepicker.pickadate('picker');
        picker.set('select', new Date(initialDate));
    }
});

Template.formTimepicker.onRendered(function () {
    let caller = this.data;
    let timepicker = this.$('.timepicker');
    timepicker.pickatime({
        default: 'now', // Set default time: 'now', '1:30AM', '16:30'
        fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
        twelvehour: false, // Use AM/PM or 24-hour format
        donetext: 'OK', // text for done-button
        cleartext: 'Löschen', // text for clear-button
        canceltext: 'Abbrechen', // Text for cancel-button
        autoclose: false, // automatic close timepicker
        ampmclickable: true, // make AM PM clickable
        afterDone: function () {
            if (caller.callback) {
                caller.callback(caller.id, timepicker.val());
            }
        }
    });
});