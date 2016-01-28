jQuery.sap.declare("fd.view.CreateBatch");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.CreateBatch", {
	metadata: {
		properties: {}
	},

	getControllerName: function() {
		return "fd.controller.CreateBatch";
	},

	_createEntityList: function() {
		var box = new sap.ui.commons.DropdownBox(this.createId('EntityList'),{
			width: "30rem",
			maxPopupItems: 10
		}).addStyleClass("FDTopMargin");

		var template =  new sap.ui.core.ListItem( {
			text: "{name}",
			key: "{key}"
		});

		box.setModel( fd.model.ODataMng.getModel());
		box.bindItems( fd.model.ODataMng.getEntityNamePath(), template);
		return box;   
	},

	_createODataTableToolBar: function(oControl) {
		var addHeadBtn = new sap.ui.commons.Button(this.createId('AddHead'), {
			text: "Add to Head",
			enabled: false
		});
		var addBeforeBtn = new sap.ui.commons.Button(this.createId('AddBefore'), {
			text: "Add Before",
			enabled: false
		});
		var addAfterBtn = new sap.ui.commons.Button(this.createId('AddAfter'), {
			text: "Add After",
			enabled: false
		});

		var addTailBtn = new sap.ui.commons.Button(this.createId('AddTail'), {
			text: "Add to Tail",
			enabled: false
		});

		var csvBtn = new sap.ui.commons.Button(this.createId('ExportToCSV'), {
			text: "Export To CSV",
			enabled: true
		});

		var toolbar = new sap.ui.commons.Toolbar({
			items: [addHeadBtn, addBeforeBtn, addAfterBtn, addTailBtn, csvBtn]
		});
		return toolbar;
	},

	_createODataTable: function(oControl) {
		var toolbar = this._createODataTableToolBar(oControl);
		//key is Lable,  value is path
		var mCol = {
			"Name": "name",
			"Type": "type",
			"Label": "label"
		};

		var aColumn = [];
		for (var key in mCol) {
			var path = mCol[key];
			aColumn.push(
				new sap.ui.table.Column({
					label: key,
					template: new sap.ui.commons.TextView({
						text: {
							path: path
						}
					}),
					sortProperty: path,
					filterProperty: path,
				})
			);
		}

		// //now the label postion is not fixed, so need use a formatter to get it by check the label
		// var labelTemplate = new sap.ui.table.Column({
		// 	label: "Label",
		// 	template: new sap.ui.commons.TextView({
		// 		text: {
		// 			path: "label",
		// 			formatter: function(val) {
		// 				if (val && val.length && val.length > 0) {
		// 					for (var i= 0; i < val.length; i++) {
		// 						var entry = val[i];
		// 						//namespace: "http://www.sap.com/Protocols/SAPData")
		// 						if (entry.name == "label" ) {
		// 							return entry.value;
		// 						} 
		// 					}
		// 					return "";
		// 				}
		// 			}
		// 		}
		// 	})
		// });
		// aColumn.push( labelTemplate);

		var oTable = new sap.ui.table.Table(this.createId('PropTable'), {
			selectionMode: "MultiToggle",
			selectionBehavior: "Row",
			allowColumnReordering: true,
			showNoData: true,
			showColumnVisibilityMenu: true,

			columns: aColumn,
			toolbar: toolbar,
			visibleRowCount: 20,

			width: "600px",
		});
		oTable.setModel( fd.model.ODataMng.getModel());

		//        [colName, colType, colLabel],
		var aWidth = [2, 1, 3, ];
		fd.view.Helper.setTableColumnsWidth(oTable, aWidth);
		return oTable;
	},

	_createPropertyList: function() {
		var listBox = new sap.ui.commons.ListBox(this.createId("PropertyListBox"), {
			width: "20rem",
			height: "31rem"
		}).addStyleClass("FDTopMargin");

		var vBox = new sap.m.VBox({
			items: [
				new sap.ui.commons.Label({
					text: "Or add property manually seperate by , :",
					design: "Bold"
				}),
				new sap.ui.commons.TextField(this.createId("ManuallyTextField"),
				{
					width: "20rem"
				}).addStyleClass("FDTopMargin"),
				
				new sap.m.HBox({
					items: [
						new sap.ui.commons.Button( this.createId("ManuallyAdd"),{
							text: "Add User Input",
							width: "8rem"
						}),
						new sap.ui.commons.Button( this.createId("ClearAll"),{
							text: "Clear All",
							width: "8rem"
						}).addStyleClass("FDLeftMargin")
					] }).addStyleClass("FDTopMargin"),

				listBox
			]
		}).addStyleClass("FDLeftMargin");
		return vBox;
	},

	createDialog: function() {
		var btnOk = new sap.ui.commons.Button(this.createId('Ok'), {
			text: "Ok",
		});
		var btnCancel = new sap.ui.commons.Button(this.createId('Cancel'), {
			text: "Cancel",
			press: [function() {
				this._oDialog.close();
			}, this],
		});

		var icon = new sap.m.Image({
			src: "sap-icon://arrow-right"
		}).addStyleClass("FDVCenter");

		var content = new sap.m.VBox({
			items: [
				new sap.m.HBox({
					items: [
						new sap.ui.commons.Label({ 
							text: "1: First define the property which you want to changed:",
							design: "Bold"
						}),

						new sap.ui.commons.TextField(this.createId("TemplatePropertyTextField"),
						{
							width: "20rem"
						}).addStyleClass("FDLeftMargin"),
					] }),
				
				new sap.ui.commons.Label({ 
							text: "2: Then select property from OData Entity or manually input values:",
							design: "Bold"
				}).addStyleClass("FDTopMargin"),

				this._createEntityList(),

				new sap.m.HBox({
					items: [
						this._createODataTable(),
						icon,
						this._createPropertyList()
					]
				}).addStyleClass("FDTopMargin")
			]
		});

		var dialog = new sap.ui.commons.Dialog({
			title: "Choose properties then create based on selected template",
			buttons: [btnOk, btnCancel],
			content: content,
		});
		this._oDialog = dialog;
		return dialog;
	},

	createContent:function( evt ) {
		return null;
	},
	

	// Just reuse the JSView is enough
	renderer: "sap.ui.core.mvc.JSViewRenderer",
});