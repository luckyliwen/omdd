sap.ui.controller("fd.controller.Main", {

    onInit: function() {

        //The main view can open/close other workset, so it need listen to the view related events

        fd.bus.subscribe("view", "NewView", this.onNewView, this);
        fd.bus.subscribe("view", "OpenView", this.onOpenView, this);
        fd.bus.subscribe("view", "CloseView", this.onCloseView, this);

        fd.bus.subscribe("view", "NewMetadata", this.onNewMetaData, this);

        fd.bus.subscribe("main", "Setting", this.openSettingDialogByKey, this);

        this.view = this.getView();

        //register to global 
        fd.setMainController(this);
        this.initSettingDialog();
    },

    openSettingDialogByKey: function(channel, event, key) {
        this.onSettingPressed();
        this._oSettingController.setSelecttedKey(key);
    },

    onSettingPressed: function() {
        this.initSettingDialog();
        this._oSettingController.open();
    },

    initSettingDialog: function(evt) {
        if (!this._oSettingController) {
            var view = sap.ui.xmlview("SetttingView", {
                viewName: "fd.view.Setting"
            });
            this._oSettingController = view.getController();
        }
    },



    onHelpPressed: function() {

    },

    /**
     * Now mainly used from the fragment name try to get the content, so can be directly replace the content
     * @param  {[type]} viewName [description]
     * @return {[type]}          [description]
     */
    getTopTreeNodeByViewName: function(viewName) {
        var worksetView = this.getView().getWorksetViewByName(viewName);
        if (worksetView) {
            return worksetView.getViewCtrlNodeContent();
        }

        return null;
    },

    openWorksetView: function(id) {
        var navItem = this.getNavItemById(id);
        navItem.setVisible(true);
    },

    closeWorksetView: function(id) {
        var navItem = this.getNavItemById(id);
        navItem.setVisible(false);
    },

    removeWorksetView: function(id) {
        var navItem = this.getNavItemById(id);
        var shell = this.getView().getShell();
        shell.removeWorksetItem(navItem);
    },


    getNavItemById: function(id) {
        return this.getView()._mNavItem[id];
    },

    getWorksetViewById: function(id) {
        return this.getView()._mView[id];
    },

    getWorksetControllerById: function(id) {
        var view = this.getView()._mView[id];
        return view.getController();
    },

    getDesignControllerById: function(id) {
        var worksetView = this.getWorksetViewById(id);
        return worksetView.getDesignController();
    },

    onNewView: function(channel, event, data) {
        var id = this.view.createViewWorkset(data);
        if (!('bNotActiveView' in data)) {
            this.activateViewById(id);
        }

        //write back the id, so it can control later
        data.id = id;
        fd.bus.publish("view", "NewViewCreated", data);
    },

    onNewMetaData : function(channel, event, data) {
        var id = this.view.createMetadataView(data);
        this.activateViewById(id);
        //??no need show in the project
    },

    onOpenView: function(channel, event, data) {
        //perhaps it hide previous, so first try to make it visible if not
        var id = this.view.getNaviItemIdByViewName(data);
        fd.byId(id).setVisible(true);

        this.view.activateView(id);
    },

    /**
     * Here only close but didn't delete the corresponding view, so just set the visible is enough
     * @param channel
     * @param event
     * @param data:  just view name
     */
    onCloseView: function(channel, event, data) {
        var id = this.view.getNaviItemIdByViewName(data);
        fd.byId(id).setVisible(false);
    },

    /**
     * Active the view means switch to the corresponding view
     * @param viewName
     */
    activateViewById: function(id) {
        fd.byId(id).setVisible(true);

        this.view.activateView(id);
    },

});