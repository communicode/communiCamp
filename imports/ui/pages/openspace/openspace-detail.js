import './openspace-detail.html'

Template.openspaceDetail.onCreated(function () {
    let instance = this;
    let openSpaceId = FlowRouter.getParam("id");
    instance.openSpace = ReactiveVar();
    instance.timeSlotIds = ReactiveVar();
    let topics = ReactiveVar();

    Meteor.subscribe('openspaces', openSpaceId);
    Meteor.subscribe('topics', undefined, Topic.Status.Open, {sort: {importantMarksCount: -1, voteCount: -1}});

    function getTimeSlot(id) {
        return instance.openSpace.get().settings.timeSlots.find((item) => item.id === id);
    }

    function calcMinutes(str) {
        if (!str) {
            return 3600;
        }
        let array = str.split(':');
        return parseInt(array[0]) * 60 + parseInt(array[1]);
    }

    function compareTimeSlots(t1, t2) {
        let m1 = calcMinutes(getTimeSlot(t1).start);
        let m2 = calcMinutes(getTimeSlot(t2).start);
        if (m1 < m2) {
            return -1;
        }
        if (m1 > m2) {
            return 1;
        }
        return 0;
    }


    instance.autorun(function () {
        let openSpace = Openspaces.findOne(openSpaceId);
        if (!openSpace || !openSpace.topics) {
            return;
        }
        instance.openSpace.set(openSpace);
        topics.set(openSpace.topics.reduce((acc, curr, arr) => {
            curr.timeSlots.forEach((ts) => {
                if (acc[ts]) {
                    acc[ts].push(curr);
                } else {
                    acc[ts] = [curr];
                }
            });
            return acc;
        }, {}));

        instance.timeSlotIds.set(Object.keys(topics.get()).sort(compareTimeSlots));
    });

    instance.topicsForTimeSlot = function (id) {
        return topics.get()[id];
    };

    instance.timeSlot = function (id) {
        return getTimeSlot(id);
    };

    instance.room = function (id) {
        return instance.openSpace.get().settings.rooms.find((item) => item.id === id);
    }


});

Template.openspaceDetail.onRendered(function () {
    $('.modal').modal();
});

Template.openspaceDetail.helpers({
    openSpace() {
        return Template.instance().openSpace.get();
    },
    timeSlotIds() {
        return Template.instance().timeSlotIds.get();
    },
    topicsForTimeSlot(id) {
        return Template.instance().topicsForTimeSlot(id);
    },
    timeSlot(id) {
        return Template.instance().timeSlot(id);
    },
    roomForId(id) {
        if (this.room && !id) {
            id = this.room;
        }
        return Template.instance().room(id).name;
    },
    openTopics() {
        return Topics.find({status: Topic.Status.Open}, {sort: {importantMarksCount: -1, voteCount: -1}});
    }
});