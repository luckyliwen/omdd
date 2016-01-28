jQuery.sap.declare("fd.view.Project");
jQuery.sap.require("sap.ui.core.mvc.JSView");

sap.ui.core.mvc.JSView.extend("fd.view.Project", {
	metadata : {
		properties : {
			
		},
		
		// ---- control specific ----
		library : "sap.ui.core",
	},

	getControllerName: function() {
		return "fd.controller.Project";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",
	
	
	createProjectButtons: function(oControl) {
		var newBtn = new sap.ui.commons.Button( this.createId("NewProject"), 
				{
					text: "New Project"
				});
		
		var openBtn = new sap.ui.commons.Button( this.createId("OpenProject"), 
				{
					text: "Open Project"
				});
		
		var saveBtn = new sap.ui.commons.Button( this.createId("SaveProject"), 
				{
					text: "Save Project"
				});
		
		var previewBtn = new sap.ui.commons.Button( this.createId("PreviewProject"), 
				{
					text: "Preview Project"
				});
		
		return [newBtn, openBtn, saveBtn, previewBtn]; 
	},		
	
	createTableToolbar: function(oControl) {
		
		var newBtn = new sap.ui.commons.Button( this.createId("NewView"), 
				{
					text: "New View"
				});
		var newFragmentBtn = new sap.ui.commons.Button( this.createId("NewFragment"), 
				{
					text: "New Fragment"
				});
		

		var openFileBtn = new sap.ui.commons.Button( this.createId("OpenFromFileView"), 
				{
					text: "Open From Files"
				});

		var fileChoose = new fd.uilib.FileChoose(this.createId("ProjectFileChoose"), {
			buttonControl : openFileBtn,
			accept :"text/html, text/xml",
			multiple: true,
		});

		
		var openFileContentBtn = new sap.ui.commons.Button( this.createId("OpenFromFileContent"), 
				{
					text: "Open From String Content"
				});
		
		var openSampletn = new sap.ui.commons.Button( this.createId("OpenSamples"), 
				{
					text: "Open Samples"
				});
		
		var previewBtn = new sap.ui.commons.Button( this.createId("PreviewView"), 
				{
					text: "Preview"
				});
		
		var metadataBtn = new sap.ui.commons.Button( this.createId("LoadODataMetadata"), 
				{
					text: "Load OData Metadata"
				});
		
		var checkBtn = new sap.ui.commons.Button( this.createId("CheckSyntax"), 
				{
					text: "Check", 
					enabled:  false
				});

		var  moreBtn = new sap.ui.commons.Button( this.createId("MoreAction"), 
				{
					text: "More..."
				});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [newBtn, newFragmentBtn,
			        //openFileBtn,
			        fileChoose,
			        openFileContentBtn, openSampletn, /*openBtn,  closeBtn, previewBtn,*/ metadataBtn, checkBtn,moreBtn ]
		});
		toolbar.addStyleClass("FDHCenter");
		
		return toolbar;
	}, 
		
	
	
	createViewTable : function(oControl) {
			var toolbar = this.createTableToolbar(oControl);
			
			var colView = new sap.ui.table.Column({
				label : "View name",
				template:  new sap.ui.commons.TextView( {
								//checked:  "{checked}",
								text:  "{ViewName}"
							}),
				sortProperty:  "ViewName", 
				filterProperty: "ViewName",
			});
			
			var colControl = new sap.ui.table.Column({
				label : "Controller name",
				template:  new sap.ui.commons.TextView( {
								text:  "{ControllerName}"
							}),
				sortProperty:  "ControllerName", 
				filterProperty: "ControllerName",
			});
			
			
			//??simple way, need change
			var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\nNo View, please add by press New..."});
			var oTable = new sap.ui.table.Table(this.createId("ViewTable"), {
				title: "Views and Controllers",
				width: "1100px",

				selectionMode: "MultiToggle",
				selectionBehavior: "Row",
				allowColumnReordering: true,

				//selectionBehavior:sap.ui.table.SelectionBehavior.RowOnly,
				showNoData: true,

				columns: [colView, colControl],
				toolbar: toolbar,
				visibleRowCount: 15
			});
			
			oTable.setNoData(noData);
			
			return oTable;
	},
	
	doInit: function() {
		var aBtns = this.createProjectButtons();
		
		var topToolbar = new sap.ui.commons.Toolbar({
			items: aBtns
		});
		
		var table = this.createViewTable();
		
		
		var layout = new sap.ui.layout.HorizontalLayout({
			content: table
		});
		layout.addStyleClass("FDHCenter");
		//layout.addStyleClass("FDVCenter");

		this.addContent( layout);
		
		//then manually call the controller init work
		this.getController().onAfterDoInit();
	},
	
   createContent : function(oController) {
	   return null;
   },
   
   onResize:function(){
	   var id = "#" + this.getId();
	   var width = $(id).width();
	   alert("new id is " + width);
   },
   
});
