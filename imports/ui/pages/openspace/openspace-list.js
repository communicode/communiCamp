import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import './openspace-list.html';
import '../../components/form-elements'
import '../../../api/openspace/openspace-methods'

Template.openspaceList.helpers({
    openSpaces(){
        return Openspaces.find({},{sort:{date:-1, status: -1}});
    }
});

Template.openspaceList.onCreated(function () {
    Meteor.subscribe('openspaces');
});


