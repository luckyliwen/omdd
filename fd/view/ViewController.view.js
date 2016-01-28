jQuery.sap.declare("fd.view.ViewController");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");


sap.ui.core.mvc.JSView.extend("fd.view.ViewController", {
	metadata : {
		properties : {
			viewWorkset :"object",
		}
	},

	getControllerName: function() {
		return "fd.controller.ViewController";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",
	
	
	doInit: function() {
		var generateBtn = new  sap.ui.commons.Button( this.createId('GenerateController'), 
				{
					text: "Generate Controller Content",
					tooltip: fd.model.HelpMng.getTooltip("GenerateControllerContent")
				});
		
		var saveBtn = new  sap.ui.commons.Button( this.createId('SaveToFile'), 
				{
					text: "Save Controller To File"
				});
		
		var fileChooseBtn = new sap.ui.commons.Button(this
				.createId('OpenControllerFileBtn'), {
			text :"Read content from file"
		});

		var fileChoose = new fd.uilib.FileChoose(this.createId('ControllerFileChoose'), {
			buttonControl : fileChooseBtn,
			//accept :"text/*",
			multiple: false,
		});

		
		var copyBtn = new  sap.ui.commons.Button( this.createId('CopyToClipboard'), 
				{
					text: "Copy to Clipboard"
				});
		
		var clearBtn = new  sap.ui.commons.Button( this.createId('Clear'), 
				{
					text: "Clear"
				});
		var toolbar = new sap.ui.commons.Toolbar({
			items: [generateBtn,saveBtn, fileChoose, copyBtn,clearBtn ]
		});
		toolbar.addStyleClass('FDHCenter');
		
		var sourceEditor = new fd.uilib.SourceEditor( this.createId('SourceEditor'),
				{
					rows: 240,
					sourceType: fd.SourceType.Js
				});
		
		/*var sourceEditor = new sap.ui.commons.TextArea( this.createId('SourceEditor'),
				{
					rows: 80,
					cols: 240,
					//sourceType: fd.SourceType.Js
				});*/
		
		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width:"100%",
			content : [ toolbar,
			            new sap.ui.commons.HorizontalDivider(),
			            sourceEditor,
			            ]
		});
		
		this.addContent( vLayout);
		
		//then manually call the controller init work
		this.getController().onAfterDoInit();	
	},
	
   createContent : function(oController) {
	   return null;
   },
});