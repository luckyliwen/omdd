"use strict";
sap.ui.controller("fd.controller.CreateBatch", {
	onInit: function() {
		
	},

	/**
	 * In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {

	},

	onOkPressed: function( evt ) {
		//try to get data, no just an array
		if ( this.byId)
		var templateProperty = this.byId("TemplatePropertyTextField").getValue().trim();
		if ( templateProperty.length ===0) {
			fd.uilib.Message.warning( "Please first define the property value you want to used change");
			return;
		}

		var arr = this.oPropListBox.getItems();
		if (arr.length === 0 ) {
			fd.uilib.Message.warning( "Please add at least one property to create batch nodes");
			return;
		}

		var aProp = [];
		for (var i=0; i < arr.length; i++) {
			var prop = arr[i].getText();
			aProp.push(prop);
		}
	    this._oDialog.close();
	    var param = {
	    	templateProperty: templateProperty,
	    	entityName: this.oEntityList.getValue(),
	    	aProp: aProp
	    };

	    this.fnCallback.call(this.fnContext, param);
	},
	
	onEntityChanged:     function ( evt) {
		var source = evt.getSource();
		var key = evt.getParameter("selectedItem").getKey();
		if (  key ) {
			//for the first line prompt just clear the destination
			this.clearPropList();
			this.oPropTable.bindRows(  fd.model.ODataMng.getEntityPath( key ));
		} else {
			this.oPropTable.unbindRows();
		}
	},

	onClearAllPressed: function( evt ) {
	    this.clearPropList();
	},
	
	clearPropList: function( evt ) {
	    this.oPropListBox.removeAllItems();
	},
	

	onAddToDestination: function ( evt, pos) {
		var aProp = fd.view.Helper.getPropFromTableSelection( this.oPropTable, "name");
		//by the pos can know where to insert. For head and tail can just choose by list lenght, for before/after need by current list selection 
		
		var insertPos = -1;
		switch( pos) {
			case "head": 
				insertPos = 0; 
				break;
			case "before": 
				insertPos = this.oPropListBox.getSelectedIndex(); 
				break;
			case "after": 
				insertPos = this.oPropListBox.getSelectedIndex() + 1; 
				break;
			case "tail": 
				insertPos = this.oPropListBox.getItems().length; 
				break;
		}

		for (var i = 0; i < aProp.length; i++) {
			var prop = aProp[i];
			var item = new sap.ui.core.Item({text: prop});
			this.oPropListBox.insertItem(item, insertPos + i);
		}
	},

	onManuallyTextFieldChanged: function(evt) {
		var value = this.byId("ManuallyTextField").getValue().trim();
		var aName  = value.split(",");
		for (var i=0; i < aName.length; i++) {
			var name = aName[i].trim();
			if (name.length) {
				var item = new sap.ui.core.Item({text: name});
				this.oPropListBox.addItem(item);
			}
		}
		this.byId("ManuallyTextField").setValue("");
	},

	onManuallyAddPressed: function( evt ) {
	    this.onManuallyTextFieldChanged();
	},
	

	onPropTableSelectChanged: function( evt ) {
		var tableSel = this.oPropTable.getSelectedIndex() !== -1;
		this.byId("AddTail").setEnabled( tableSel );
	    this.byId("AddHead").setEnabled( tableSel );

		//for addBefore AddAfter also depend on the list , so just call it
		this.onPropListBoxSelected();  
	},
	
	onPropListBoxSelected: function( evt ) {
	    var flag = this.oPropListBox.getSelectedIndex()!== -1;
	    var tableSel = this.oPropTable.getSelectedIndex() !== -1;
	    flag = flag && tableSel;

	    this.byId("AddBefore").setEnabled( flag );
	    this.byId("AddAfter").setEnabled( flag );
	},
	

	onExportToCSVPressed: function(oEvent) {
		fd.util.saveTable2CSV(this.oPropTable);
	},

	openCreateBatchDialog: function(fnCallback, fnContext) {
		/*if ( ! fd.model.ODataMng.isMetadataLoad()) {
			fd.uilib.Message.showErrors("Please first load OData metadata in \"Project\" panel \"Load OData Metadata\" button");
			return;
		}*/
		this.fnCallback = fnCallback;
		this.fnContext = fnContext;

		if (!this._oDialog) {
			this._oDialog = this.getView().createDialog();

			this.oPropTable = this.byId("PropTable");
			this.oPropListBox = this.byId( "PropertyListBox");
			this.oEntityList = this.byId("EntityList");

			this.oPropListBox.attachSelect( this.onPropListBoxSelected, this);

			this.oPropTable.attachRowSelectionChange(this.onPropTableSelectChanged, this);

			this.byId("EntityList").attachChange(this.onEntityChanged, this);
			this.byId("AddHead").attachPress("head", this.onAddToDestination, this);
			this.byId("AddBefore").attachPress("before", this.onAddToDestination, this);
			this.byId("AddAfter").attachPress("after", this.onAddToDestination, this);
			this.byId("AddTail").attachPress("tail",this.onAddToDestination, this);
			this.byId("ExportToCSV").setVisible(true);
			this.byId("ExportToCSV").attachPress(this.onExportToCSVPressed, this);
			
			
			this.byId("ManuallyTextField").attachChange(this.onManuallyTextFieldChanged, this);
			this.byId("ManuallyAdd").attachPress(this.onManuallyAddPressed, this);
			this.byId("ClearAll").attachPress(this.onClearAllPressed, this);
			this.byId("Ok").attachPress(this.onOkPressed, this);
		}

		this._oDialog.open();
	},

	_oDialog: null
});