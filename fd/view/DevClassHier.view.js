jQuery.sap.declare("fd.view.DevFormatConvert");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.DevClassHier", {
		metadata : {
			properties : {
				
			}
		},

		getControllerName : function() {
			return "fd.controller.DevClassHier";
		},

		// Just reuse the JSView is enough
		renderer :"sap.ui.core.mvc.JSViewRenderer",
		
		doInit : function(oController) {
			this._d3Tree = new fd.uilib.D3Tree();
			this.addContent(this._d3Tree );

			// then manually call the controller init work
			this.getController().onAfterDoInit();
		},

		createContent : function(oController) {
			return null;
		},
		
		_d3Tree : null,
		
});		