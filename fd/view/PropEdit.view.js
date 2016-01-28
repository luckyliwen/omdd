jQuery.sap.declare("fd.view.PropEdit");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.PropEdit", {
	metadata : {
		properties : {
		}
	},

	getControllerName: function() {
		return "fd.controller.PropEdit";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",

	_createEntityList: function() {
		var box = new sap.ui.commons.DropdownBox(this.createId('EntityList'),{
			width: "30rem",
			maxPopupItems: 10
		});

		var template =  new sap.ui.core.ListItem( {
			text: "{name}",
			key: "{key}"
		});

		box.setModel( fd.model.ODataMng.getModel());
		box.bindItems( fd.model.ODataMng.getEntityNamePath(), template);
		return box;   
	},

	

	_createODataTableToolBar: function(oControl) {
		var addPropBtn = new sap.ui.commons.Button(this.createId('AddProp'), {
			text: "Add Property",
			enabled: false
		});
		var addLabelBtn = new sap.ui.commons.Button(this.createId('AddLabel'), {
			text: "Add @sap:label",
			enabled: false
		});

		var toolbar = new sap.ui.commons.Toolbar({
			items: [addPropBtn, addLabelBtn]
		});
		return toolbar;
	},

	_createODataTable: function(oControl) {
		var toolbar = this._createODataTableToolBar(oControl);
		//key is Lable,  value is path
		var mCol = {
			"Name": "name",
			"Type": "type",
			"Label": "extensions/0/value"
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


		var oTable = new sap.ui.table.Table(this.createId('PropTable'), {
			selectionMode: "MultiToggle",
			selectionBehavior: "Row",
			allowColumnReordering: true,
			showNoData: true,

			columns: aColumn,
			toolbar: toolbar,
			visibleRowCount: 6,

			width: "600px",
		});
		oTable.setModel( fd.model.ODataMng.getModel());

		//        [colName, colType, colLabel],
		var aWidth = [2, 1, 3, ];
		fd.view.Helper.setTableColumnsWidth(oTable, aWidth);
		return oTable;
	},

	
	_createTypeList: function() {
		var box = new sap.ui.commons.DropdownBox(this.createId('TypeList'),{
			width: "20rem",
			maxPopupItems: 10
		});

		var template =  new sap.ui.core.ListItem( {
			text: "{name}",
			key: "{key}"
		});

		box.setModel( fd.model.TypeMng.getModel());
		box.bindItems( fd.model.TypeMng.getTypePath(), template);
		return box;   
	},

	_createFormatOptionList: function() {
		var box = new sap.ui.commons.DropdownBox(this.createId('FormatOptionList'),{
			width: "30rem",
			maxPopupItems: 10,
			displaySecondaryValues: true
		});

		box.setModel( fd.model.TypeMng.getModel());
		// box.bindIems("", template);
		return box;   
	},

	_createConstraintList: function() {
		var box = new sap.ui.commons.DropdownBox(this.createId('ConstraintList'),{
			width: "30rem",
			maxPopupItems: 10
		});

		var template =  new sap.ui.core.ListItem( {
			text: "{name}",
			// key: "{key}"
		});

		box.setModel( fd.model.TypeMng.getModel());
		
		return box;   
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

		var that = this;

		var items = [
			//parts 
			new sap.ui.commons.Label({
				text: "Part or parts (separate by ,)",
				design: "Bold"
			}),
			new sap.m.HBox({
				items: [
					new sap.ui.commons.TextField(this.createId("PartsProp"), {
						width: "40rem"
					}),
					new sap.ui.commons.Button({
						text: "Clear",
						press: function(evt) {
							that.byId("PartsProp").setValue("");
						},
					}).addStyleClass("FDLeftMargin")
				]
			}).addStyleClass("FDLeftMargin"),
		];

		//odata part only load if load the OData metadata
		if (fd.model.ODataMng.isMetadataLoad()) {
			items.push(
				new sap.m.HBox({
					items: [
						new sap.m.Label({
							text: "Entity: "
						}),
						this._createEntityList().addStyleClass("FDTopMarginHalf")
					]
				}).addStyleClass("FDLeftMargin")
			);
			//??later add the i18n, odata selection

			items.push(
				this._createODataTable().addStyleClass("FDLeftMargin")
			);
		}

		//format part always will create
		var aOtherItems = [
			//then the formatter
			new sap.ui.commons.Label({
				text: "Formatter",
				design: "Bold"
			}).addStyleClass("FDTopMargin"),
			new sap.m.HBox({
				items: [
					new sap.ui.commons.TextField(this.createId("FormatterProp"), {
						width: "40rem"
					}),
					new sap.ui.commons.Button({
						text: "Clear",
						press: function(evt) {
							that.byId("FormatterProp").setValue("");
						},
					}).addStyleClass("FDLeftMargin")
				]
			}).addStyleClass("FDLeftMargin"),

			//type
			new sap.ui.commons.Label({
				text: "Type, select from drop list or directly type:",
				design: "Bold"
			}).addStyleClass("FDTopMargin"),
			new sap.m.HBox({
				items: [
					this._createTypeList().addStyleClass("FDLeftMargin"),
					new sap.ui.commons.TextField(this.createId("TypeProp"), {
						width: "30rem"
					}).addStyleClass("FDLeftMargin"),
					new sap.ui.commons.Button({
						text: "Clear",
						press: function(evt) {
							that.byId("TypeProp").setValue("");
						},
					}).addStyleClass("FDLeftMargin")
				]
			}).addStyleClass("FDTopMarginHalf"),

			//format options
			new sap.ui.commons.Label({
				text: "Format Options, select the key from drop list then add the options vallue:",
				design: "Bold"
			}).addStyleClass("FDTopMargin"),
			new sap.m.HBox({
				items: [
					this._createFormatOptionList().addStyleClass("FDLeftMargin"),
					new sap.ui.commons.TextField(this.createId("FormatOptionProp"), {
						width: "30rem"
					}).addStyleClass("FDLeftMargin"),
					new sap.ui.commons.Button({
						text: "Clear",
						press: function(evt) {
							that.byId("FormatOptionProp").setValue("");
						}
					}).addStyleClass("FDLeftMargin")
				]
			}).addStyleClass("FDTopMarginHalf"),

			//constraint
			new sap.ui.commons.Label({
				text: "Validation Constraints, select the key from drop list then add the options vallue:",
				design: "Bold"
			}).addStyleClass("FDTopMargin"),
			new sap.m.HBox({
				items: [
					this._createConstraintList().addStyleClass("FDLeftMargin"),
					new sap.ui.commons.TextField(this.createId("ConstraintProp"), {
						width: "30rem"
					}).addStyleClass("FDLeftMargin"),
					new sap.ui.commons.Button({
						text: "Clear",
						press: function(evt) {
							that.byId("ConstraintProp").setValue("");
						},
					}).addStyleClass("FDLeftMargin")
				]
			}).addStyleClass("FDTopMargin")
		];
		
		var content = new sap.m.VBox({
			items: items.concat(aOtherItems)
		});

		var dialog = new sap.ui.commons.Dialog({
			title: "Edit parts, type, format options and validation constraints:",
			buttons: [btnOk, btnCancel],
			content: content
			
		});
		this._oDialog = dialog;
		return dialog;
	},


	createContent:function( evt ) {
		return null;
	},
	
});