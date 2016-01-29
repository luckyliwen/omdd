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
	
	doInit_old: function() {
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

   createTileControls: function( aMeta, controller) {
   		var aRet = [];
   		for (var i=0; i < aMeta.length; i++) {
   			var meta  = aMeta[i];
   			if ( meta.loadFromFile) {
   				var realTile = new sap.m.StandardTile({
   					title: meta.title,
   					icon:  meta.icon,
   					press: [controller.onTilePressed, controller] 
   				});

				var multiple = !! meta.multiple;
				var filechoose = new fd.uilib.FileChoose({
					id: this.createId(meta.id),
					realControl: realTile,
					accept :"text/xml",
					multiple: multiple
				});
				//need use custome tile to wrap it, otherwise can't pass the aggregation validation
				var wrapTile = new sap.m.CustomTile({
					content: filechoose
				});
				// aRet.push(filechoose);   				
				aRet.push(wrapTile);
   			} else {
  				var tile = new sap.m.StandardTile({
   					id:  this.createId(meta.id),
   					title: meta.title,
   					icon:  meta.icon,
   					press: [controller.onTilePressed, controller] 
   				});
				aRet.push(tile);
   			}
   		}
       	return aRet;
   },
   
   doInit: function() {
   		var controller = this.getController();
  		var tileData = 
        {
            "xml": [
                {
                	"id" : "NewView",
                    "title": "Create XML View",
                    "icon": "sap-icon://customer-view"
                },
                {
                	"id" : "NewFragment",
                    "title": "Create XML Fragment",
                    "icon": "sap-icon://document"
                },
                {
                	"id" : "OpenFromFileChoose",
                    "title": "Load From File",
                    "icon": "sap-icon://attachment-text-file",
                    loadFromFile: true,
                    multiple:  true
                },
                {
                	"id" : "OpenSamples",
                    "title": "Open Samples",
                    "icon": "sap-icon://example"
                },
                 {
                 	"id" : "CheckSyntax",
                    "title": "Check Semantic",
                    "icon": "sap-icon://check-availability"
                }
            ],
          
            "mdd": [
                {
                	"id" : "mddLoadFromUrl",
                    "title": "Load From URL",
                    "icon": "sap-icon://cloud"
                },
                {
                	"id" : "mddLoadFromFile",
                    "title": "Load From File",
                    "icon": "sap-icon://attachment-text-file",
                    loadFromFile: true
                },
                {
                	"id" : "mddCreateProject",
                    "title": "Create OData Metadata",
                    "icon": "sap-icon://business-objects-mobile"
                }
            ]
        };

   		//xml part
   		var xmlTileContainer = new sap.m.TileContainer({
				height: '300px',
				tiles:  this.createTileControls(tileData.xml, controller)
   		});
   		var xmlPanel = new sap.m.Panel({
             headerText: "SAPUI5 View Operations",
             content: xmlTileContainer
   		});

   		//mdd part
	    var mddTileContainer = new sap.m.TileContainer({
				height: '300px',
				tiles:  this.createTileControls(tileData.mdd, controller)
   		});
   		var mddPanel = new sap.m.Panel({
             headerText: "OData Metadata Operations",
             content: mddTileContainer
   		});
 		
   		var vBox = new sap.m.VBox({
   			items: [xmlPanel, mddPanel ]
   		});
		this.addContent( vBox);

		//then manually call the controller init work
		this.getController().onAfterDoInit();
	},
   
});
