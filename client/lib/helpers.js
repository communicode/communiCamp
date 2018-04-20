toastOnError = (e) => {
    if (e) {
        Materialize.toast(e.reason, 4000);
    }
};