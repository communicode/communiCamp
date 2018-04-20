import './topic-to-openspace-form.html'


Template.addTopicToOpenspace.events({
    'click .js-add-to-openspace'(e, template) {
        let room = template.$('select[name="room"]').val();
        let slot = template.$('select[name="slot"]').val();

        if (!room || !slot) {
            Materialize.toast("Bitte wähle einen Raum und einen Slot aus!", 4000);
            return;
        }

        let slots = Array.isArray(slot) ? slot : [slot];
        let topic = this;
        topic['room'] = room;
        topic['timeSlots'] = slots;

        Meteor.call('openspace.add.topic', topic, (e) => {
            if (e) {
                Materialize.toast(e.reason, 4000);
            } else {
                Blaze.remove(template.view);
                Materialize.toast(`<b>${this.title}</b> &nbsp; wurde hinzugefügt`, 4000);
            }
        });
    },
    'click .js-cancel'(e, t) {
        Blaze.remove(t.view);
    }
});

Template.addTopicToOpenspace.helpers({
    rooms() {
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        if (!openOpenspace) {
            return false;
        }
        return openOpenspace.settings.rooms.map((room) => {
            return {
                value: room.id,
                name: room.name
            }
        });
    },
    slots() {
        let openOpenspace = Openspaces.findOne({status: Openspace.Status.Open});
        if (!openOpenspace || !openOpenspace.settings.timeSlots) {
            return false;
        }
        return openOpenspace.settings.timeSlots.map((slot) => {
            return {
                value: slot.id,
                name: slot.start + " - " + slot.end
            }
        });
    }
});