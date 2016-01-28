jQuery.sap.declare("fd.view.ViewDesign");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

//??tmp
var gTree, gPropTable;

sap.ui.core.mvc.JSView.extend("fd.view.ViewDesign", {
	metadata : {
		properties : {
			//nameOfView: "string",
			//nameOfController: "string"
				
			viewWorkset :"object",
			isFragment:      { type: "boolean", defaultValue: false}
		}
	},

	getControllerName: function() {
		return "fd.controller.ViewDesign";
	},	
	
	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",
	
	
	_createTreeToolbar: function(oControl) {
		var addBtn = new sap.ui.commons.Button( this.createId('AddChildNode'), 
				{
					text: "Add child"
				});
		
		var batchAddBtn = new sap.ui.commons.Button( this.createId('CreateBatch'), 
				{
					text: "Batch Create",
					tooltip: fd.model.HelpMng.getTooltip("BatchCreate")
				});
		

		var addBtnTemplate = new sap.ui.commons.Button( this.createId('AddChildNodeFromTemplate'), 
				{
					text: "Add Template"
				});
		
		var copyBtn = new  sap.ui.commons.Button( this.createId('CopyNode'), 
				{
					text: "Copy",
					tooltip: fd.model.HelpMng.getTooltip("TreeMultiSelection")
				});

		var cutBtn = new  sap.ui.commons.Button( this.createId('CutNode'), 
				{
					text: "Cut",
					tooltip: fd.model.HelpMng.getTooltip("TreeMultiSelection")
				});
		
		var delBtn = new  sap.ui.commons.Button( this.createId('DelNode'), 
				{
					text: "Del",
					tooltip: fd.model.HelpMng.getTooltip("TreeMultiSelection")
				});

		var checkBtn = new  sap.ui.commons.Button( this.createId('CheckXml'), 
				{
					text: "Check",
					// tooltip: fd.model.HelpMng.getTooltip("CheckValidation")
				});
		
		var toolbar0 = new sap.ui.commons.Toolbar({
			items: [addBtn, batchAddBtn, /*addBtnTemplate*/ copyBtn,cutBtn,delBtn, checkBtn ]
		});
		
		var pasteBtn = new  sap.ui.commons.Button( this.createId('PasteChildNode'), 
				{
					text: "Paste As Child"
				});
		
		var beforeBtn = new sap.ui.commons.Button( this.createId('PasteBeforeNode'), 
				{
					text: "Paste Before"
				});

		var afterBtn = new sap.ui.commons.Button( this.createId('PasteAfterNode'), 
				{
					text: "Paste After"
				});

		var moreBtn = new sap.ui.commons.Button( this.createId('MoreAction'), 
				{
					text: "More ..."
				});

		var toolbar1 = new sap.ui.commons.Toolbar({
			items: [pasteBtn, beforeBtn, afterBtn, moreBtn]
		});
		
		return new sap.ui.commons.layout.VerticalLayout({
			content : [toolbar0, toolbar1]
		});
	},
	
	_createTree: function(oControl) {
		//var t = new sap.ui.commons.Tree(this.createId('NodeTree'), 
		var t = new fd.uilib.Tree(this.createId('NodeTree'), 
				{
					height:"800px", //??tmp
					//height:"100%", //??tmp
					selectionMode: "Multi",
					title: "View Hierarchy",
					showHorizontalScrollbar: true,
				}
			);
		//??
		gTree = t;
		return t;
	},
	
	_createPropToolBar: function(oControl) {
		
		// var oCB = new sap.ui.commons.DropdownBox(this.createId('PropChoice'),
				// {displaySecondaryValues: false});
		
		// var oCB = new sap.m.ComboBox (this.createId('PropChoice'));
		
		var oCB = new sap.ui.commons.ComboBox (this.createId('PropChoice'));
		var template =  new sap.ui.core.ListItem( 
				{
					text: {
						path: "name",
						formatter: function(v) {
							return v;
						}
					},
					key:  "{name}",
				}
		);
		//oCB.bindItems( "/Prop",  template);
		this._mChoiceCtrl ["Prop"]    = oCB;
		this._mChoiceTemplate["Prop"] = template;
		
		var addBtn = new sap.ui.commons.Button( this.createId('AddProp'), 
				{
					text: "Add"
				});
		
		var addAllBtn = new sap.ui.commons.Button( this.createId('AddAllProp'), 
				{
					text: "Add All"
				});
		
		var delBtn = new sap.ui.commons.Button( this.createId('DelProp'), 
				{
					text: "Del"
				});
		
		var delAllBtn = new sap.ui.commons.Button( this.createId('DelAllProp'), 
				{
					text: "Del All"
				});
		
		var editBtn = new sap.ui.commons.Button( this.createId('EditProp'), 
				{
					text: "Edit",
					icon: "./images/edit.png"
				}).addStyleClass("FDLeftMargin");


		var copyBtn = new sap.ui.commons.Button( this.createId('CopyProp'), 
				{
					text: "Copy",
				}).addStyleClass("FDLeftMargin");
		var pasteBtn = new sap.ui.commons.Button( this.createId('PasteProp'), 
						{
							text: "Paste",
						});
		var clearBtn = new sap.ui.commons.Button( this.createId('ClearProp'), 
						{
							text: "Clear",
						});


		var toolbar = new sap.ui.commons.Toolbar({
			items: [oCB, addBtn,addAllBtn, delBtn, delAllBtn, editBtn, copyBtn, pasteBtn,clearBtn]
		});
		return toolbar;
	}, 
	
	_createRichTooltip: function( context) {
	    
	},
	

	_createNameTemplate: function(oControl) {
		var nameTempalte = new sap.ui.commons.TextView({
			text: "{name}",
			semanticColor: {
				path: "name",
				formatter: function(val) {
					var context = this.getBindingContext();
					if (context) {
						var invalid = context.getProperty("invalid");
						if (invalid) {

							var htmlContent = fd.util.formatHintToHtml( invalid); 
							var html = new sap.ui.core.HTML();
							html.setContent(htmlContent);

							var btn = null;
							var aSolution = context.getProperty("aSolution");
							if (aSolution && aSolution.length >0) {
								var text = "Quick Fix"; 
								var briefSolution = context.getProperty("briefSolution");
								if (briefSolution) {
									text += "Quick Fix ( {0} )".sapFormat(briefSolution);
								}
								btn = new sap.ui.commons.Button({
									text: text, 
									icon: "sap-icon://accept",
									press: [context, oControl.onQuickFixPressed, oControl]
								}).addStyleClass("FDTopMargin");
							}

							var tooltip;
							if (!btn) {
								tooltip = new sap.ui.commons.Callout({
									content: html
								});
							} else {
								tooltip = new sap.ui.commons.Callout({
									content: new sap.m.VBox( {
										items: [ html, btn]
									})
								});
							}

							this.setTooltip(tooltip);
							return "Negative"; //Critical";
						}
					}
					return "Default";
				}
			},

			// tooltip: {
			// 	path: "name",
			// 	formatter: function(val) {
			// 		var context = this.getBindingContext();
			// 		if (context) {
			// 			var invalid = context.getProperty("invalid");
			// 			if (invalid) {
			// 				return invalid;
			// 			}
			// 		}
			// 		return "";
			// 	}
			// },

			design: {
				path: "name",
				formatter: function(val) {
					var context = this.getBindingContext();
					if (context) {
						var invalid = context.getProperty("invalid");
						if (invalid) {
							return "H1"; //context.getProperty("design");
						}
					}
					return "Standard";
				}
			}
		});
		return nameTempalte;
	},
	
	_createPropTable: function(oControl) {
		var toolbar = this._createPropToolBar(oControl);

		var  colName = new sap.ui.table.Column({
				label : " Name",
				template:  this._createNameTemplate(oControl),
				
				sortProperty:  "name", 
				filterProperty: "name",
			});

			var  colType = new sap.ui.table.Column({
				label : "Type",
				template:  new sap.ui.commons.TextView( 
						{ 
							text: {
								path: "type",
								/*formatter: function(v) {
									//here must use the propType.call because otherwise when called the this is the parent of propType= control.formatter
									return oControl.formatter.propType.call(oControl,v);
								}*/
							} 
						}),
				sortProperty:  "type", 
				filterProperty: "type",
			});

			var  colDftValue = new sap.ui.table.Column({
				label : "Default Value",
				template:  new sap.ui.commons.TextView( 
						{ 
							text: "{defaultValue}",
						}),
				sortProperty:  "defaultValue", 
				filterProperty: "defaultValue",
			});
			
			var editor = new fd.uilib.SmartEdit(
					{
						name: "{name}",
						type: "{type}",
						value: "{value}",
						tooComplex:"{tooComplex}",
						//viewController: oControl,
						valueChanged: [oControl.onPropValueChanged, oControl],
					} );
			
			//editor.addStyleClass('sapUiTableCell');
			
			var  colEditor = new sap.ui.table.Column({
				label : "Value",
				template:  editor,
				// width:  "200px", //??not good, as not it need show the combox, otherwise it can't show if overflow
			});
			

			//paths
			var tfPaths = new sap.ui.commons.TextField( 
					{ value: "{paths}",
					  change: [ { name:"paths", meta: fd.MetaType.Prop},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfPaths.addStyleClass('TextFieldInsideTable');

			var  colPath = new sap.ui.table.Column({
				label : "Path or Parts",
				template:  tfPaths,
				sortProperty:  "paths", 
				filterProperty: "paths",
			});
			
			//formatter
			var tfFormatter = new sap.ui.commons.TextField( 
					{ value: "{formatter}",
					  change: [ { name:"formatter", meta: fd.MetaType.Prop},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfFormatter.addStyleClass('TextFieldInsideTable');
			
			var  colFormatter = new sap.ui.table.Column({
				label : "Formatter",
				template:  tfFormatter,
				sortProperty:  "formatter", 
				filterProperty: "Formatter",
			});
			
			
			var tfExtra = new sap.ui.commons.TextField( 
					{ value: "{extraStr}",
					  change: [ { name:"extraStr", meta: fd.MetaType.Prop},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfExtra.addStyleClass('TextFieldInsideTable');
			var  colExtra = new sap.ui.table.Column({
				label : "Extra ( Type, formatOptions...)",
				template:  tfExtra,
				sortProperty:   "extraStr", 
				filterProperty: "extraStr",
			});

			//??simple way, need change
			var noData = new sap.ui.commons.TextView({text: "\r\n\r\nNo property, please add by press Add..."});
			var oTable = new sap.ui.table.Table(  this.createId('PropTable'), 
				{

					selectionMode : "MultiToggle",
					// selectionBehavior: "RowSelector",
					allowColumnReordering : true,
					showColumnVisibilityMenu: true,
					showNoData: false,
					
					columns: [colName, colType, colDftValue, colEditor, colPath, colFormatter, colExtra],
					toolbar: toolbar,
					visibleRowCount:  7,
						
						//width: "1000px"  //??tmp 
				});

			gPropTable = oTable;
			
			//        [colName, colType,colDftValue, colEditor, colPath, colFormatter, colExtra],
			var aWidth = [ 1,    1,       1,           2,          2,     1,             1]; 
			fd.view.Helper.setTableColumnsWidth(oTable, aWidth); 
			
			// oTable.setNoData(noData);
			
			return oTable;
	},
	
	_createAggrToolBar: function(oControl) {
		var oCB = new sap.ui.commons.DropdownBox(this.createId('AggrChoice'),
				{displaySecondaryValues: true});
		var template =  new sap.ui.core.ListItem( 
				{
					text: "{name}",
					key:  "{name}",
				}
				);
		//oCB.bindItems( "/Aggr",  template);
		this._mChoiceCtrl ["Aggr"]    = oCB;
		this._mChoiceTemplate["Aggr"] = template;

		
		var addBtn = new sap.ui.commons.Button( this.createId('AddAggr'), 
				{
					text: "Add"
				});
		
		var addAllBtn = new sap.ui.commons.Button( this.createId('AddAllAggr'), 
				{
					text: "Add All"
				});

		var delBtn = new sap.ui.commons.Button( this.createId('DelAggr'), 
				{
					text: "Del"
				});
		
		var delAllBtn = new sap.ui.commons.Button( this.createId('DelAllAggr'), 
				{
					text: "Del All"
				});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oCB,addBtn, addAllBtn,delBtn, delAllBtn]
		});
		return toolbar;
	}, 
	
	_createAggrTable: function(oControl) {
			var toolbar = this._createAggrToolBar(oControl);
			var  colName = new sap.ui.table.Column({
				label : " Name",
				template:  new sap.ui.commons.TextView( { text: "{name}" }),
				sortProperty:  "name", 
				filterProperty: "name",
			});

			var  colType = new sap.ui.table.Column({
				label : "Type",
				template:  new sap.ui.commons.TextView( { text: "{type}" }),
				sortProperty:  "type", 
				filterProperty: "type",
			});
			
			var  colAltTypes = new sap.ui.table.Column({
				label : "altTypes",
				template:  new sap.ui.commons.TextView( { text: "{altTypesStr}" }),
				sortProperty:  "altTypesStr", 
				filterProperty: "altTypesStr",
			});
			
			
			//value, 	mainly used for some altType is string 
			var tfValue = new sap.ui.commons.TextField( 
					{ 
					  value: "{value}",
					  change: [ { name:"value", meta: fd.MetaType.Aggr},
					           oControl.onMetaValueChanged, oControl
					        ],
					 
					});
			
			tfValue.addStyleClass('TextFieldInsideTable');
			
			var tvMultiple = new sap.ui.commons.TextView();
			tvMultiple.bindText(
					{
						path:"multiple",
						formatter: function(v) {
							if (v) 
								return "Yes";
							else 
								return "";
						}
					});
			
			var  colMultiple = new sap.ui.table.Column({
				label : "Multiple",
				template:  tvMultiple,
				sortProperty:  "multiple", 
				filterProperty: "multiple",
			});
			
			var  colValue = new sap.ui.table.Column({
				label : "Value",
				template:  tfValue,
				sortProperty:  "value", 
				filterProperty: "value",
			});
			
			//??simple way, need change
			var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\nNo Aggregation, please add by press Add..."});
			var oTable = new sap.ui.table.Table(  this.createId('AggrTable'), 
				{
						selectionMode : "MultiToggle",
						selectionBehavior: "Row",
						allowColumnReordering : true,
						showColumnVisibilityMenu: true,
						showNoData: false,
						columns: [colName, colType, colAltTypes, colMultiple, colValue],
						toolbar: toolbar,
						visibleRowCount:  3
				});
			
			// oTable.setNoData(noData);
			//oTable.setWidth('100%');
			
			return oTable;
	},
	
	_createEventToolBar: function(oControl) {
		var oCB = new sap.ui.commons.DropdownBox(this.createId('EventChoice'),
				{displaySecondaryValues: true});
		var template =  new sap.ui.core.ListItem( 
				{
					text: "{name}",
					key:  "{name}",
				}
				);
		//oCB.bindItems( "/Event",  template);
		this._mChoiceCtrl ["Event"]    = oCB;
		this._mChoiceTemplate["Event"] = template;
		
		var addBtn = new sap.ui.commons.Button( this.createId('AddEvent'), 
				{
					text: "Add"
				});
		
		var addAllBtn = new sap.ui.commons.Button( this.createId('AddAllEvent'), 
				{
					text: "Add All"
				});
		
		var delBtn = new sap.ui.commons.Button( this.createId('DelEvent'), 
				{
					text: "Del"
				});
		
		var delAllBtn = new sap.ui.commons.Button( this.createId('DelAllEvent'), 
				{
					text: "Del All"
				});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oCB,addBtn, addAllBtn,delBtn,delAllBtn]
		});
		return toolbar;
	}, 
	
	_createEventTable: function(oControl) {
			var toolbar = this._createEventToolBar(oControl);
			var  colName = new sap.ui.table.Column({
				label : " Name",
				template:  this._createNameTemplate(),
				sortProperty:  "name", 
				filterProperty: "name",
			});

			//func
			var tfFunc = new sap.ui.commons.TextField( 
					{ value: "{value}",
					  change: [ { name:"value", meta: fd.MetaType.Event},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfFunc.addStyleClass('TextFieldInsideTable');

			var  colFunc = new sap.ui.table.Column({
				label : "Func",
				template:  tfFunc,
				sortProperty:  "value", 
				filterProperty: "value",
			});

			//Listener
			/*var tfListener = new sap.ui.commons.TextField( 
					{ value: "{listener}",
					  change: [ { name:"listener", meta: fd.MetaType.Event},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfListener.addStyleClass('TextFieldInsideTable');

			var  colListener = new sap.ui.table.Column({
				label : "Listener",
				template:  tfListener,
				sortProperty:  "listener", 
				filterProperty: "listener",
			});

			//data
			var tfData = new sap.ui.commons.TextField( 
					{ value: "{data}",
					  change: [ { name:"data", meta: fd.MetaType.Event},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfData.addStyleClass('TextFieldInsideTable');
			
			var  colData = new sap.ui.table.Column({
				label : "Data",
				template:  tfData,
				sortProperty:  "data", 
				filterProperty: "data",
			});
			*/
			
			//??simple way, need change
			var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\nNo Event, please add by press add..."});
			var oTable = new sap.ui.table.Table(  this.createId('EventTable'), 
				{
						selectionMode : "MultiToggle",
						selectionBehavior: "Row",
						allowColumnReordering : true,
						showColumnVisibilityMenu: true,
						// showNoData: true,
						columns: [colName, colFunc],
						toolbar: toolbar,
						visibleRowCount:  3
				});
			
			// oTable.setNoData(noData);
			//oTable.setWidth('100%');
			
			return oTable;
	},
	
	
	_createAssoToolBar: function(oControl) {
		var oCB = new sap.ui.commons.DropdownBox(this.createId('AssoChoice'),
				{displaySecondaryValues: true});
		var template =  new sap.ui.core.ListItem( 
				{
					text: "{name}",
					key:  "{name}",
				}
				);
		//oCB.bindItems( "/Asso",  template);
		this._mChoiceCtrl ["Asso"]    = oCB;
		this._mChoiceTemplate["Asso"] = template;

		
		var addBtn = new sap.ui.commons.Button( this.createId('AddAsso'), 
				{
					text: "Add"
				});
		
		var addAllBtn = new sap.ui.commons.Button( this.createId('AddAllAsso'), 
				{
					text: "Add All"
				});
		
		var delBtn = new sap.ui.commons.Button( this.createId('DelAsso'), 
				{
					text: "Del"
				});
		var delAllBtn = new sap.ui.commons.Button( this.createId('DelAllAsso'), 
				{
					text: "Del All"
				});
		
		var toolbar = new sap.ui.commons.Toolbar({
			items: [oCB, addBtn,addAllBtn, delBtn,delAllBtn]
		});
		return toolbar;
	}, 
	
	_createAssoTable: function(oControl) {
			var toolbar = this._createAssoToolBar(oControl);
			var  colName = new sap.ui.table.Column({
				label : " Name",
				template:  new sap.ui.commons.TextView( { text: "{name}" }),
				sortProperty:  "name", 
				filterProperty: "name",
			});

			var  colType = new sap.ui.table.Column({
				label : "Type",
				template:  new sap.ui.commons.TextView( { text: "{type}" }),
				sortProperty:  "type", 
				filterProperty: "type",
			});
			
			//id
			var tfId = new sap.ui.commons.TextField( 
					{ value: "{value}",
					  change: [ { name:"value", meta: fd.MetaType.Asso},
					           oControl.onMetaValueChanged, oControl]	
					});
			tfId.addStyleClass('TextFieldInsideTable');

			var  colId = new sap.ui.table.Column({
				label : "Id",
				template:  tfId,
				sortProperty:  "value", 
				filterProperty: "value;",
			});

			
			//??simple way, need change
			var noData = new sap.ui.commons.TextView({text: "\r\n\r\n\r\n\r\n\r\nNo Associations, please add by press add..."});
			var oTable = new sap.ui.table.Table(  this.createId('AssoTable'), 
				{
						selectionMode : "MultiToggle",
						selectionBehavior: "Row",
						allowColumnReordering : true,
						showColumnVisibilityMenu: true,
						// showNoData: true,
						columns: [colName, colType, colId],
						toolbar: toolbar,
						visibleRowCount:  1
				});
			
			// oTable.setNoData(noData);
			//oTable.setWidth('100%');
			
			return oTable;
	},
	
	_createLeftTreePart: function(oControl) {
		var treeToolbar = this._createTreeToolbar(oControl);
		var tree = this._createTree(oControl);
		
		return new sap.ui.commons.layout.VerticalLayout(
			{
			//width: "360px",  //as the toolbar can't show full
			width:"100%",
			content : [treeToolbar, tree]
			});
	},
	
	_createClassDocumentpart: function(oControl) {
		var clsHtml = new sap.ui.core.HTML(this.createId('ClsDoc_ClassName'));
		var clsApi =  new sap.ui.commons.Link( this.createId('ClsDoc_Api'),
				{text:"API  ", width:"6em"});
		
		//just seperate
		//var sep = new sap.ui.core.HTML({content: "<span style='width:2em;'><span>"});
		
		var clsTest =  new sap.ui.commons.Link( this.createId('ClsDoc_TestSuite'),
				{text:"TestSuite  ", width:"6em"});
		
		
		
		var layout = new sap.ui.commons.layout.HorizontalLayout({
			content : [ clsHtml, clsApi, clsTest ] 
		});
		return layout;
	},
	
	_createRightPart: function(oControl) {
		var panelProp = new sap.ui.commons.Panel({
			   title: new sap.ui.commons.Title({text: "Properties"}), 
			   content: this._createPropTable(oControl),
		});
		
		var panelAggr = new sap.ui.commons.Panel({
			   title: new sap.ui.commons.Title({text: "Aggregations"}), 
			   content: this._createAggrTable(oControl),
		});
		
		var panelEvent = new sap.ui.commons.Panel({
			   title: new sap.ui.commons.Title({text: "Events"}), 
			   content: this._createEventTable(oControl)
		});
		
		var panelAsso = new sap.ui.commons.Panel({
			   title: new sap.ui.commons.Title({text: "Associations"}), 
			   content: this._createAssoTable(oControl),
		});
		
		var docPart = this._createClassDocumentpart();
		this._aPanels = [docPart, 
		                 new sap.ui.commons.HorizontalDivider(),
		                 panelProp, panelAggr, panelEvent, panelAsso]; 
		
		return new sap.ui.commons.layout.VerticalLayout({
			width:"100%",
			//height:"100%",
			content : this._aPanels 
		});
		
	},
	
	/**
	 * for the aggregation, show more meaning information
	 */
	_createRightPartForAggregation: function() {
		//??how to easily put it at the center?
		var addNodeBtn = new sap.ui.commons.Button( this.createId('AggrAddNodeBtn'), 
			{
				text: "Add Childrend"
			}); 
		addNodeBtn.addStyleClass('MarginLeftRight');
		
		var oCB = new sap.ui.commons.DropdownBox(this.createId("AggrAddNodeComobBox"), 
				{
					displaySecondaryValues: true,
					width:        "400px",
					maxPopupItems : 40,
				}
		);
		oCB.addStyleClass('MarginLeftRight');
		
		this._oAggrChildListItemTempalte = new sap.ui.core.ListItem( 
		{
			text: {
				path: "name",
				formatter: function(v) {
					return v.sapLastPart();
				}
			},
			key:  "{name}",
			additionalText: {
				path: "name",
				formatter: function(v) {
					if (v != null) {
						var pos = v.lastIndexOf(".");
						return v.substr(0,pos);
					}
				}
			}
		});
		 
		oCB.setModel( fd.model.Metadata.getCandidateModel());
		//later when get the path then call bindItems oCB.bindItems( "/",  template);

		//put oCB and button at the center 
		var hbox = new sap.ui.layout.HorizontalLayout( {
			content: [oCB, addNodeBtn]
		});
		//??not good
		this._oAggrChildHLayout = hbox;
		
		//for easy the header part just use HTML
		//var header = new sap.ui.core.HTML(this.createId('AggrAddNodeHeader'));
		
		this._oRightSpecialControl = new sap.ui.layout.VerticalLayout({
			width:"100%",
			//content : [header, hbox],
		}); 
	},
	
	
	enablePanels: function(flag) {
		this._aPanels.forEach(function(panel) {
			panel.setEnabled(flag);
			//??
			panel.setVisible(flag);
		});
	},
	
	doInit: function() {
		this._mChoiceCtrl = {};
		this._mChoiceTemplate = {};

		var oControl = this.getController();
		var left = this._createLeftTreePart(oControl); 
		var right = this._createRightPart(oControl);
		
		
		//use a split 
		this._oSplit = new sap.ui.commons.Splitter( this.createId("SplitContent"),
				 {
			 		splitterOrientation : sap.ui.commons.Orientation.Vertical,
					splitterPosition	: "30%",
		 			minSizeFirstPane	: "15%",
		 			minSizeSecondPane	: "40%",
		 			width				: "100%",
		 			height				: "100%" ,
		 				
		 			firstPaneContent	: left,
		 			secondPaneContent	: right,
				 });
		this._oSplit.addStyleClass("sapUiSizeCompact");

		this._oRightNormalControl = right;
		
		//==just HTML so easy to show, old part 
		//this._oRightSpecialControl = new sap.ui.core.HTML(this.createId('SpecialDesc'));
		//this._oRightSpecialControl.addStyleClass('SpecialNodeDescription');
		 
		this._createRightPartForAggregation();
		
		this.addContent(this._oSplit);
		
		//then manually call the controller init work
		this.getController().onAfterDoInit();	
	},
	
   createContent : function(oController) {
	   return null;
   },
   
   rebindAllChoice: function() {
	   for (var meta in fd.MetaType) {
		  this.rebindOneMetaChose(meta);
	   }
   },

   rebindOneMetaChose: function( meta ) {
        if ( meta in this._mChoiceCtrl) {
			   this._mChoiceCtrl[ meta].unbindItems();
			   
			   var path = "/" + meta;
			   //??
			   this._mChoiceCtrl[ meta].setModel(null);
			   this._mChoiceCtrl[ meta].setModel(this.getController().choiceModel);

			   this._mChoiceCtrl[ meta].bindItems(path, this._mChoiceTemplate[meta]);
			   
			   //and set the selectedKey to null otherwise the new page will show old one
			   this._mChoiceCtrl[ meta].setSelectedKey("");
		}
   },
   
   
   switchToNormalRightPart: function() {
   
	   this._oSplit.removeAllSecondPaneContent();

	   this._oSplit.addSecondPaneContent( this._oRightNormalControl);
   },
   
   /**
    * Old just use html put at the center
    * @param desc
    */
   switchToSpecialRightPart_old: function(desc) {
	   
	   this._oRightSpecialControl.setContent(desc);
	   
	   this._oSplit.removeAllSecondPaneContent();
	   
	   this._oSplit.addSecondPaneContent( this._oRightSpecialControl);
   },

   /**
    * The controller have set the correct value for header and listItem
    */
   switchToSpecialRightPart: function(html, bMultiNode) {
	   this._oSplit.removeAllSecondPaneContent();
	   
	   this._oRightSpecialControl.removeAllContent();
	   this._oRightSpecialControl.addContent(new  sap.ui.core.HTML( { content:html}));
	   
	   if (!bMultiNode)
	   	this._oRightSpecialControl.addContent( this._oAggrChildHLayout );

	   this._oSplit.addSecondPaneContent( this._oRightSpecialControl);
   },
   
   onViewActivated: function() {
		if ("onViewActivated" in this.getController())
			this.getController().onViewActivated();
	},
	
	getAggrChildListItemTempalte:function() {
		return this._oAggrChildListItemTempalte;
	},
	
   //??not good
   
   _oSplit : null,
   _oRightNormalControl:null,  //the normal control for control
   _oRightSpecialControl : null,  //special description for the root and aggregation
   
   
	//_mChoiceCtrl:    {}, here it can't put here, as if put here then all the instance will share the same value
	// _mChoiceTemplate:{},
  
   _aPanels: [],
   
   //==for the aggregation
   _oAggrChildListItemTempalte: null,
   _oAggrChildHLayout: null,
   //_oAggrChildVLayout: null,
   
});