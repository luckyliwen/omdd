jQuery.sap.declare("fd.view.DevWorkset");
jQuery.sap.require("sap.ui.core.mvc.JSView");

jQuery.sap.require("fd.view.ViewDesign");
jQuery.sap.require("fd.view.XmlDisplay");
jQuery.sap.require("fd.view.ViewPreview");

jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * The ViewWorkset contain the sub item of one view, include: design, viewSource
 */
sap.ui.core.mvc.JSView.extend("fd.view.DevWorkset", {
	metadata : {
		properties : {
			
		}
	},

	getControllerName : function() {
		return "fd.controller.DevWorkset";
	},

	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",

	_createTabStrip : function() {
		var viewConvert = new fd.view.DevFormatConvert({
					viewName :"fd.view.DevFormatConvert",
				});
		viewConvert.doInit();
		
		var viewHier = new fd.view.DevClassHier({
			viewName :"fd.view.DevClassHier",
		});
		viewHier.doInit();

		var viewMeta = new fd.view.DevMeta({
			viewName :"fd.view.DevMeta",
		});
		viewMeta.doInit();
		
		this._aTabView = [viewConvert, viewHier, viewMeta];

		var tabStrip = new sap.ui.commons.TabStrip({
					width : "100%",
					tabs : [

							new sap.ui.commons.Tab(
									this.createId('TabFormatConvert'), {
										title : new sap.ui.commons.Title({
													text : "  View Format Convert  "
												}),
										content : viewConvert,
										selected : false
										,
									}),
									
							new sap.ui.commons.Tab(
									this.createId('TabClassHier'), {
										title : new sap.ui.commons.Title({
													text : "  UI5 Class Hierarchy  "
												}),
										content : viewHier,
										selected : false
										,
									}),		

							new sap.ui.commons.Tab(
									this.createId('TabMeta'), {
										title : new sap.ui.commons.Title({
													text : "  Meta Information  "
												}),
										content : viewMeta,
										selected : true
										,
									}),		


							],
					select : [this.onTabStripSelected, this]
				});

		//

		return tabStrip;
	},

	onTabStripSelected : function(oEvent) {
		var tabStrip = oEvent.getSource();
		var idx = tabStrip.getSelectedIndex();

		// just forward the event
		var controller = this._aTabView[idx].getController();
		if ('onTabSelected' in controller )
			controller.onTabSelected();
	},

	
	doInit : function() {
		// As if used the nested workset of Ux3 shell, then all sub item need
		// different ID
		var tabStrip = this._createTabStrip();
		this.addContent(tabStrip);

		this._oTabStrip = tabStrip;

		// then manually call the controller init work
		this.getController().onAfterDoInit();
	},

	createContent : function(oController) {
		return null;
	},

	onViewActivated : function() {
		// just tell the view that is current focused
		var idx = this._oTabStrip.getSelectedIndex();
		//this._aTabView[idx].onViewActivated();
	},

	_oTabStrip : null,
	_aTabView : null
	,
});