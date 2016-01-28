jQuery.sap.declare("fd.view.ViewWorkset");
jQuery.sap.require("sap.ui.core.mvc.JSView");

jQuery.sap.require("fd.view.ViewDesign");
jQuery.sap.require("fd.view.XmlDisplay");
jQuery.sap.require("fd.view.ViewPreview");

jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * The ViewWorkset contain the sub item of one view, include: design, viewSource
 */
sap.ui.core.mvc.JSView.extend("fd.view.ViewWorkset", {
	metadata : {
		properties : {
			// can't use property as viewName as it is the paramter for create
			// new view
			nameOfView : "string",
			nameOfController : "string",
			viewCtrlNodeContent: "any",      

			//the content of the initial value controller,
			//the content of the view, can't set by this way as it will treat it as some special binding
			// controllerContent: "any",  
			isFragment:      { type: "boolean", defaultValue: false},  //used to show for normal view or fragment

			extensionName : { type : "string", defaultValue: ".view.xml"}
		}
	},

	setIsFragment: function(flag) {
		this.setProperty("isFragment", flag, true);
		if (flag) {
			this.setExtensionName(".fragment.xml");
		}
	},

	setControllerInitialContent: function( value) {
		//for the load sample, need set the initial controller content also
		this._viewController.getController().setControllerContent( value );
	},

	getControllerName : function() {
		return "fd.controller.ViewWorkset";
	},

	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",

	_createTabStrip : function() {
		// === designer
		var viewDesign = new fd.view.ViewDesign({
					viewName :"fd.view.ViewDesign",
					viewWorkset : this, 
					isFragment  : this.getIsFragment(),
				});
		
		this._viewDesigner = viewDesign;
		
		// == xml
		var viewXml = new fd.view.XmlDisplay({
					viewName :"fd.view.XmlDisplay",
					// ??why need
					designController : viewDesign.getController(),

					viewWorkset 	: this 	,
				});
		this._xmlDisplayView = viewXml;
		
		
		// controller
		var viewController = new fd.view.ViewController({
			viewName :"fd.view.ViewController",
			viewWorkset : this,

		});
		this._viewController = viewController;
		

		//Preview
		var viewPreview = new fd.view.ViewPreview({
					viewName :"fd.view.ViewPreview",
					viewWorkset : this,

				});
		this._previewView = viewPreview;

		//Put all the doInit() together as in order to ensure when do the init in the controller all the view/controller is existed
		viewDesign.doInit();
		viewXml.doInit();
		viewController.doInit();
		viewPreview.doInit();
		
		this._aTabView = [viewDesign, viewXml,  viewController, viewPreview];

		var tabStrip = new sap.ui.commons.TabStrip({
					width : "100%",
					tabs : [

							new sap.ui.commons.Tab(
									this.createId('TabDesigner'), {
										title : new sap.ui.commons.Title({
													text : "  Designer  "
												}),
										content : viewDesign,
										selected : false
										,
									}),

							new sap.ui.commons.Tab(this
											.createId('TabXmlSource'), {
										title : new sap.ui.commons.Title({
													text : " XML Source  "
												}),
										content : viewXml,
										selected : true
										,
									}),
									
						   new sap.ui.commons.Tab(this
											.createId('TabControllerSource'), {
										title : new sap.ui.commons.Title({
													text : " Controller  "
												}),
										content : viewController,
										selected : false
										,
									}),
									
							new sap.ui.commons.Tab(this.createId('TabPreview'),
									{
										title : new sap.ui.commons.Title({
													text : "  Preview "
												}),
										content : viewPreview
										,
									})],
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

	getDesignController: function() {
		return this._viewDesigner.getController();
	},
	
	getViewControllerController: function() {
		return this._viewController.getController();
	},
	
	getControllerController: function() {
		return this._viewController.getController();
	},
	
	getTreeNodeForNavigation: function() {
		var tn = this._viewDesigner.getController().getTreeNodeForNavigation();
		return tn;
	},
	
	getMappingTreeNode: function( mappingPath ) {
	    var tn = this._viewDesigner.getController().getMappingTreeNode(mappingPath);
		return tn;
	},
	

	getHtmlViewContent : function() {
		var htmlString = this._htmlDisplayView.getController().getHtmlViewContent();
		return htmlString;
	},

	/*getControllerContent : function() {
		var controllerString = this._controllerDisplayView.getController().getControllerContent();
		return controllerString;
	},*/

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
		this._aTabView[idx].onViewActivated();
	},

	_viewDesigner   : null,
	_viewController : null,
	_xmlDisplayView : null,
	_htmlDisplayView : null,
	// _controllerDisplayView : null,
	_previewView : null,

	_oTabStrip : null,
	_aTabView : null
	,
});