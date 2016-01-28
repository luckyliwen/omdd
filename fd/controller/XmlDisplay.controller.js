sap.ui.controller("fd.controller.XmlDisplay", {

    onInit: function() {
    },
    
    
	/**
	 *  In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		this.view = this.getView();
	    this.designControler = this.view.getDesignController();
	    
	    this.byId('SaveToFile').attachPress(  this.onSaveToFilePressed,   this );
	    this.byId('SyncXmlBackToDesign').attachPress(  this.onSyncXmlBackToDesignPressed,   this );
	},
	
	onSaveToFilePressed: function() {
		var name = this.view.getViewWorkset().getNameOfView() + 
				 this.view.getViewWorkset().getExtensionName(); 

		// fd.util.Export.saveToFile( this.xmlString, name);
		fd.util.Export.saveToFile( this.byId("xmlSourceEditor").getValue(), name);
	},

	onSyncXmlBackToDesignPressed: function( oEvent ) {
	    alert("Coming soon!");
	},
	
	
	onCopyToClipboardPressed: function() {
		var text = this.getXmlViewStringContent();
		fd.model.Clipboard.copyText( text );
	},
	

	displayXml: function() {
		this.xmlString = this.designControler.exportToXml();
		
		if ( this.xmlString != "") {
			this.byId("xmlSourceEditor").setValue(this.xmlString);


			// var containerId = this.createId('XmlContainer');
			// //
	  //  		loadXMLString(containerId, this.xmlString );
		}
	},
	
	/**
	 * Call back for the Tab being selected, need update and show the latest XMLview
	 */
	onTabSelected: function() {
		this.displayXml();
	},
	
	
	 
	getXmlViewStringContent: function() {
		this.xmlString = this.designControler.exportToXml();
		//??need ensure is latest
		return this.xmlString;
	},
	
	
	//just some shortcut 
	view: null,
	designControler:null,
	xmlString : null,
});