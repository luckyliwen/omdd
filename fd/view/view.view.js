jQuery.sap.declare("fd.view.ViewDesign");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

//??tmp
var gTree, gPropTable;

sap.ui.core.mvc.JSView.extend("fd.view.ViewDesign", {
	metadata : {
		properties : {
		}
	},

	getControllerName: function() {
		return "fd.controller.ViewDesign";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",
});