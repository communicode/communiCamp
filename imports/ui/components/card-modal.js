import './card-modal.html'

Template.cardModal.onRendered(function () {
    let modal = this.$('.modal');
    modal.modal({
        complete: () => {
            Blaze.remove(this.view);
        }
    });
    modal.modal('open');
});

