jQuery.sap.declare("fd.view.XmlDisplay");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

//??tmp
var gTree, gPropTable;

sap.ui.core.mvc.JSView.extend("fd.view.XmlDisplay", {
	metadata : {
		properties : {
			xmlString: {type:"string", defaultValue: ""},
			designController: { type:"object", defaultValue:null},
			
			viewWorkset :"object",
		}
	},

	getControllerName: function() {
		return "fd.controller.XmlDisplay";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",
	
	
	doInit: function() {
		//??how to control width/height
		//just create a HTML div as the parent container
		var html = new sap.ui.core.HTML( this.createId('XmlContainer'), {
			content: "<div></div>",
			afterRendering : function(){
				//?? who first
				//console.error("html ctrl afterRending");
			}
		});
		
		//top is a toolbar, use teh boarderLayout as we want to put it at center
		//??
		var saveBtn = new  sap.ui.commons.Button( this.createId('SaveToFile'), 
				{
					text: "Save XMLView To File",
					icon: "sap-icon://save"
				});

		/*var copyToClipboardBtn = new  sap.ui.commons.Button( this.createId('CopyToClipboard'), 
				{
					text: "Copy to clipboard"
				});*/

		var syncBtn = new  sap.ui.commons.Button( this.createId('SyncXmlBackToDesign'), 
				{
					text: "Save XMLView To File",
					icon: "sap-icon://synchronize"
				});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [saveBtn, syncBtn]
		});
		toolbar.addStyleClass('FDHCenter');
		
		
		/*var topLayout = new sap.ui.commons.layout.BorderLayout(
				{
					width:"1000px",
					height:"4em",
					
					top: {
						areaId : "top",
						size : "3em",
						contentAlign : "center",
						visible : true,		
						content: toolbar,
					}
				});
		*/
		

		var sourceEditor = new fd.uilib.SourceEditor( this.createId('xmlSourceEditor'),
				{
					rows: 240,
					sourceType: fd.SourceType.Xml
				});

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width:"100%",
			content : [ toolbar,
			            new sap.ui.commons.HorizontalDivider(),
			            sourceEditor]
		});
		
		this.addContent( vLayout);
		
		//then manually call the controller init work
		this.getController().onAfterDoInit();	
	},
	
   createContent : function(oController) {
	   return null;
   },
});