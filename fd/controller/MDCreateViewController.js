jQuery.sap.declare('fd.controller.MDCreateViewController');
jQuery.sap.require('fd.uilib.TableFacade');
jQuery.sap.require('fd.uilib.ListFacade');
jQuery.sap.require('fd.controller.MDTableTemplate');
jQuery.sap.require('fd.controller.MDFormTemplate');
jQuery.sap.require('sap.ui.model.odata.v2.ODataModel');


var gmdc;
var gmdt; //global metadata table
var gmdf;  //global metadata form

//====as there wil be more template be support,so put it here for later easy extend

//As later more and more code will be put for create different control, so put all code in this class
//in order to easy call the normal Controller function, it need just call connectToView  function
sap.ui.controller("fd.controller.MDCreateViewController",{
	//some control types, need keep consistent with the view 

	setMasterController : function( masterController ) {
	    this.masterController = masterController;
	},

	setMetadataInfo : function( oDataMetadataUrl , oDataMetadataContent, oDataNameSpace) {
	    this.oDataMetadataUrl = oDataMetadataUrl;
	    this.oDataMetadataContent = oDataMetadataContent;
	    this.oDataNameSpace = oDataNameSpace;
	},

	//create the odata metaddata for view canvas, need create the MockServer if user open from file or by content, can reuse the
	//created one
	createODataModelForCanvas: function( ) {
	    if (! this.oDataModelForCanvas) {
	    	var url;
	    	if (this.oDataMetadataUrl) {
	    		url = this.oDataMetadataUrl;
	    	} else {
	    		//for the local metadata, need use the Mock server 
	    		jQuery.sap.require("fd.util.MockServerExt");
	    		url =   this.oDataNameSpace;
	    		this.oMockServerExt = new fd.util.MockServerExt({
	    			rootUri: url + "/"
	    		});
	    		this.oMockServerExt.setMetadaConent(this.oDataMetadataContent);
	    		this.oMockServerExt.startSimulate();
	    	}

			this.oDataModelForCanvas = new sap.ui.model.odata.v2.ODataModel(url, true);

	    	//??as some odata not implement the batch model, so here disable it
	    	// this.oDataModelForCanvas.setCountSupported(false);
			this.oDataModelForCanvas.setUseBatch( false );
	    }
	    
	    return this.oDataModelForCanvas;
	},
	
	openSelectTemplateDialog: function( ) {
		gmdc = this;
	    if (!this.templateDlg) {
            this.templateDlg = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.MDSelectTemplateDlg", this);
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.templateDlg);
        }

		var currentMDInfo = this.masterController.getCurrentMetaDataInfo();

        //here need create it dynamic, otherwise all service will share same instance
		this.mViewData = {  
			setting: {
				"useXmlView": true,
				"viewName": "SampleView",
				"controllerName": "SampleController",
				"templateType": "FilterBarTable",   //Form FilterBarTable SmartTemplate
				"formType":   "Form",         //SmartForm  SimpleForm Form
				
				"tableType":    "Table",       //Table  ResponsiveTable  AnalyticalTable TreeTable
				"smartTableType": "SmartTableTable",  //SmartTable  SmartTableTable  Table,
				
				"addId"         : false,      //whether add add for each items
				"labelType"      : fd.Template.LabelType.MDLabel,   //like {/#PaytProposal/RunDate/@sap:label}

				//
				"bMobile" :     true,           //control the sap.m  or sap.ui.commons controls 
				"bReadonly" :    true,          //use sap.m.Text or sap.m.Input
				'bSapLabel' :    true,          //use sap:label or property name
				'bUseSmartFilterBar':     true,
				"smartFilterBarId":    "SmartFilterBar",
				"topControlType":  fd.Template.TopControlType.Page,

				//metadata related data, put here for convenient
				"entityType": currentMDInfo.entityType,
				"entitySet":  currentMDInfo.entitySet,

				//when add new type, ensure keep consistent

				aTopControlType: [
					{key:"Page", 	text: "sap.m.Page"},
					{key:"SemanticPage", text: "sap.m.semantic.SemanticPage"},
					{key:"NoPage", text: "Without Page"},
				],

				aTemplateType: [
					{key:"Form",   text: "Form type, such as SmartForm, SimpleForm..."},
					{key:"FilterBarTable", text: "Smart filter bar and table"},
					{key:"SmartTemplate", text: "Smart Template"},
				],
				aSmartTableType: [
					{key:"SmartTable",   text: "Pure SmartTable, auto generate table by $metadata"},
					{key:"SmartTableTable", text: "Smart Table and user defined table"},
					{key:"Table",     text: "user defined table"}
				],
				aTableType: [
					{key:"Table",    text: "General table - sap.ui.table.Table"},
					{key:"ResponsiveTable", text: "ResponsiveTable - sap.m.Table"},
					{key:"AnalyticalTable", text: "AnalyticalTable - sap.ui.table.AnalyticalTable"},
					{key:"TreeTable", text: "TreeTable - sap.ui.table.TreeTable"},
				],
				aFormType: [
					{key:"SmartForm" , text: "Smart Form"},
					{key:"SimpleForm" , text: "Simple form"},
					{key:"Form" , 	    text: "Normal form"}
				],

				aLabelType: [
					{key:"MDLabel",   text: "Metadata label, /#EntityType/property/@sap:label"},
					{key:"NameLabel", text: "Property name as Label"},
					{key:"NoLabel",   text: "Without Label"},
				],
			},

			aProp: [],  //entity type prop table, for simple just clone data here
			aGroup: [], 
			mFormItem: {},  //the detail item, 
			aTableItem: [],  //for the table {value:},
			aSmartFilterBarKey: [], //the selected keys by order
			aSmartFilterBarProp: [], //the candidate list of the prop with F4
		};

		//need clone the prop table as later it need add/remove
		var aProp = fd.util.collection.getLeafBindingData( this.masterController.mTable[ fd.MDObject.EntityType]);
		jQuery.extend(true, this.mViewData.aProp, aProp);

		//for the smart fitler bar list need create a table as otherwise after selected field then can't do selection
		this.mViewData.aSmartFilterBarProp = _.filter( aProp, 'f4');

		this.oViewModel = new sap.ui.model.json.JSONModel();
		this.oViewModel.setData(this.mViewData);
		this.oViewModel.setDefaultBindingMode("TwoWay");
		this.oViewModel.setSizeLimit(1000);

		this.byId("SelectCtrlDlg").setModel( this.oViewModel);
		this.templateDlg.bindElement("/setting");
		//set initial IncoBar selected key same as the template type
		this.byId("detailSettingIconTabBar").setSelectedKey( this.mViewData.setting.templateType );
		
        
        this.templateDlg.open();
	},

	onTemplateTypeChanged:function( oEvent ) {
	    this.byId('detailSettingIconTabBar').setSelectedKey( this.mViewData.setting.templateType);
	},
	


	onTemplateDialogCancelPressed: function(oEvent) {
		this.templateDlg.close();
	},

	onTemplateDialogOkPressed: function(oEvent) {
		this.templateDlg.close();

		if (!this.createViewDlg) {
            this.createViewDlg = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.MDCreateCtrlDlg", this);
            //first time copy the prop data
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.createViewDlg);

            //here need set the TableFacade in order to ensy handle the 3 tables 
            this.tableProp = this.byId('tableCreateProp');
            this.oPropFacade = new fd.uilib.TableFacade({
            	controller: this
            });
            fd.util.setPropMapToElement( this.oPropFacade,
	            {
	            	control:  this.byId('tableCreateProp'),
	            	monitButtons:   "propAddBtn"          	
	            });
            this.oPropFacade.attachDefaultSelectionChangeEvent();
            //for the prop add button, also need check with current group selection
            this.oPropFacade.addMonitButtonsFurtherChecker(this.getGroupSelectionStatus, this);
            
            //for group
            this.tableGroup = this.byId('tableCreateGroup');
            this.oGroupFacade = new fd.uilib.ListFacade({controller: this});
          	fd.util.setPropMapToElement( this.oGroupFacade, {
	            	control:  this.byId('tableCreateGroup'),
	            	moveButtons: ["groupTopBtn","groupUpBtn","groupDownBtn","groupBottomBtn"],
	            	monitButtons:  'groupDeleteBtn'          	
	            });
            this.oGroupFacade.attachDefaultSelectionChangeEvent();
            

 			this.tableItem = this.byId('tableCreateItem');
            this.oItemFacade = new fd.uilib.TableFacade({controller: this});
          	fd.util.setPropMapToElement( this.oItemFacade, {
            	control:  this.byId('tableCreateItem'),
            	moveButtons: ["itemTopBtn","itemUpBtn","itemDownBtn","itemBottomBtn"],
            	monitButtons:  "itemDeleteBtn"           	
            });
            this.oItemFacade.attachDefaultSelectionChangeEvent();

            this.oPreviewCanvas = this.byId("PreviewCanvas");

            //set the initial content, later can easily control it 
            
            var canvas = "<div class='PreviewCanvas_Container' id={0}/>".sapFormat(
            	this.getCanvasContainerId());
            this.oPreviewCanvas.setContent(canvas);
        }

        //by different template, need adjust the visibility 
        this.createViewDlg.setModel( this.oViewModel);

		this.oGroupFacade.setInitialButtonStatus();
		this.oPropFacade.setInitialButtonStatus();
 		this.oItemFacade.setInitialButtonStatus();

		this.prepareTemplateAndCanvas();

        this.adjustViewByTemplateType();
        
        //need ensure the canvas id is there, so need delay call
        jQuery.sap.delayedCall(50, this, this.showMainControl);
        this.createViewDlg.open();

        if (this.byId("itemDefineSmartFilterBar").getEnabled()) {
			this.onDefineSmartFilterBarPressed();        	
        }
	},
	
	showMainControl: function(  ) {
	    if (this.mainCtrl) {
	    	this.mainCtrl.placeAt(this.getCanvasContainerId(), "only");
	    }
	},
	

	getCanvasContainerId: function( evt ) {
	    return this.createId("PreviewCanvasContainer");
	},
	
	adjustViewByTemplateType: function( evt ) {
		var enableSmartFilterBarBtn = (this.mViewData.setting.templateType == "FilterBarTable") &&
								this.mViewData.setting.bUseSmartFilterBar;  
		this.byId("itemDefineSmartFilterBar").setEnabled(enableSmartFilterBarBtn);
		
	    switch ( this.mViewData.setting.templateType ) {
        	case fd.Template.TemplateType.Form:
        		this.tableGroup.setVisible(true);
        		this.tableProp.bindRows("/aProp");
        		// this.tableGroup.bindElement("/aGroup");
        		//item table need wait after create the group
        		this.onCreateGroupAddPressed();

        		this.tableGroup.attachSelectionChange(this.onGroupSelectionChanged, this);
        		break;
        	case fd.Template.TemplateType.FilterBarTable:
        		this.tableGroup.setVisible(false);
        		this.tableProp.bindRows("/aProp"); //need rebind to refresh data
        		this.tableItem.bindElement("/aTableItem");
        		break;
        	case fd.Template.TemplateType.SmartTemplate:
        		this.tableGroup.setVisible(true);

        		break;
        }
	},

	getNextGroupPath: function(  ) {
		this.nextGroupIndex++;
	    return "group" + this.nextGroupIndex;
	},
	
	 

	//create the new control and insert it to the canvas part, if old existed then need remove the old one
	prepareTemplateAndCanvas: function( evt ) {
	    //also create the Template to delege the work
        switch (this.mViewData.setting.templateType) {
        	case fd.Template.TemplateType.Form:
        		this.templateDelegate = new fd.controller.MDFormTemplate({
        			viewData: this.mViewData
        		} );
        		break;
            case fd.Template.TemplateType.FilterBarTable:
        		this.templateDelegate = new fd.controller.MDTableTemplate({
        			viewData: this.mViewData
        		} );
        		break;
       		case fd.Template.TemplateType.SmartTemplate:
        		this.templateDelegate = null; 
        		break;            				
        }

		
        //now create the main control with the odata model
        this.mainCtrl = this.templateDelegate.createMainControl(
        	this.createODataModelForCanvas()
        );
	},
	

	//=======================save to file,  export view 
	onCreateViewDialogCancelPressed: function(oEvent) {
		this.createViewDlg.close();
	},

	onCreateViewDialogCreateViewPressed: function(oEvent) {
		this.createViewDlg.close();

		var setting = this.mViewData.setting;
		var  xmlContent = this.templateDelegate.createXmlContent();

		var treeNode = fd.util.io.readViewFromStringContent( fd.ViewType.Xml, xmlContent);

		var mName = { 
			ViewName: setting.viewName,  
			viewCtrlNodeContent: treeNode,
			bFragment:    treeNode.isFragment(),
		};

		//add new entry into it and publish event
		fd.bus.publish("view", "NewView", mName);
	},

	onCreateViewDialogSaveToFilePressed: function( evt ) {
		var ext = "fragment.xml";
		var setting = this.mViewData.setting;
		
		if ( setting.useXmlView) {
			ext = "view.xml";
		}

		var fileName =setting.viewName + "." + ext;
		this.templateDelegate.saveXmlContentAsFile(fileName);
	},
	
	//
	createItemLabel: function( name ) {
		var ret;
	    switch (this.mViewData.setting.labelType) {
	    	case fd.Template.LabelType.MDLabel: 
	    		//<Label text="{/#PaytProposal/RunDate/@sap:label}" />
	    		ret = "{/#{0}/{1}/@sap:label}".sapFormat(
	    			this.mViewData.setting.entityType, name);
	    		break;
	    	case fd.Template.LabelType.NameLabel: 
	    		ret = name;
	    		break;
	    	default:
	    		break;
	    }
	    return ret;
	},

	createItemId: function( name ) {
	    //??
	    return "";
	},
	
	
	//===prop part
	onCreateAddPropPressed: function( evt ) {
	    var arr = this.oPropFacade.deleteSelection();
	    // var aItem = [];
	    //??in order to later easy restore back, here just keep the old value
	    for (var i=0; i < arr.length; i++) {
	    	// var entry = {label: "", name: arr[i].name, id:"" };
	    	// aItem.push(entry);
	    	var name  = arr[i].name;
	    	if (arr[i]) {
		    	arr[i].id= this.createItemId(name);
		    	arr[i].labelValue = this.createItemLabel(name);
	    	} 
	    }
	    this.oItemFacade.insertCollection(arr);	

	    this.templateDelegate.addItems( arr );
	},
	 
	// === the create button for table
	onCreateGroupAddPressed: function() {
		var entry = {
			label: "",
			groupPath : this.getNextGroupPath()
		};
		// var data = this.mViewData;

		this.mViewData.aGroup.push(entry);
		this.mViewData.mFormItem[ entry.groupPath] = [];
		//need bind to new path for item
		this.tableItem.bindElement(  "/mFormItem/" + entry.groupPath); 

		this.tableGroup.getModel().setData(this.mViewData);

		var items = this.tableGroup.getItems();
		var lastItem = items[  items.length -1];
		this.tableGroup.setSelectedItem(lastItem);

		this.tableGroup.fireSelectionChange();

		this.templateDelegate.addGroup(entry);

		//now if has prop selection, then it can enabled now 
		if (this.oPropFacade.hasSelection()) {
			this.byId('propAddBtn').setEnabled(true);
		}
		
	},

	getGroupSelectionStatus: function( btn ) {
		if (btn.getId().sapEndWith('propAddBtn')) {
			if (this.mViewData.setting.templateType == 'Form') {
				return this.tableGroup.getSelectedItem() != null;
			}
		}
		return true;
	},
	

	onGroupValueChanged: function( oEvent ) {
		var source = oEvent.getSource();
		var bc = source.getBindingContext();
		var mData = bc.getProperty();
	    this.templateDelegate.changeGroupLabel( mData, oEvent.getParameter('liveValue'));
	},

	onGroupSelectionChanged: function( oEvent ) {
	    var source = oEvent.getSource().getSelectedItem();
	    var bc = source.getBindingContext();
	    var item = bc.getProperty();

		this.tableItem.bindElement(  "/mFormItem/" + item.groupPath); 	    
	    this.templateDelegate.changeGroupSelection(item);
	},
	
	
	onCreateGropDelPressed: function(oEvent) {
		var oldPos = this.oGroupFacade.getFirstSelectionIndex();

		var aDel = this.oGroupFacade.deleteSelection();

		//the item part need remove all content, restore back to prop table 
		var group = aDel[0];
		var aItem = this.mViewData.mFormItem[ group.groupPath];
		_.each(aItem, function( item ) {
		    item._ui5Control = null;
		} );
		delete this.mViewData.mFormItem[ group.groupPath];
		//put back to prop table
		this.oPropFacade.insertCollection(aItem);
	
		//after delete, the item table need change selection, just select the up part
		this.templateDelegate.delGroup(aDel[0]);

		//still selection the same position 
		var items = this.tableGroup.getItems();
		if (items.length >0 ) {
			if (oldPos == items.length) {
				//previous is the last one 
				oldPos --;
			}
			this.tableGroup.setSelectedItem( items[oldPos] );
			this.tableGroup.fireSelectionChange();
		} else {
			//now no itme any more 
			this.tableItem.unbindRows();
			//also can't add 
			this.byId('propAddBtn').setEnabled(false);
		}

	},
	onCreateGroupTopPressed: function(oEvent) {
		var aMove = this.oGroupFacade.moveSelection("Top");
		this.templateDelegate.moveGroup(aMove[0], "Top");
	},
	onCreateGroupUpPressed: function(oEvent) {
		var aMove = this.oGroupFacade.moveSelection("Up");
		this.templateDelegate.moveGroup(aMove[0], "Up");
	},
	
	onCreateGroupDownPressed: function(oEvent) {
		var aMove = this.oGroupFacade.moveSelection("Down");
		this.templateDelegate.moveGroup(aMove[0], "Down");
	},
	onCreateGroupBottomPressed: function(oEvent) {
		var aMove = this.oGroupFacade.moveSelection("Bottom");
		this.templateDelegate.moveGroup(aMove[0], "Bottom");
	},

	//============item part
	onItemLabelChanged: function( oEvent ) {
	   this.onItemPropChanged(oEvent, fd.Template.ItemChangeType.Label);
	},

	onItemIdChanged: function( oEvent ) {
	    this.onItemPropChanged(oEvent, fd.Template.ItemChangeType.Id);
	},

	onItemPropChanged : function( oEvent, itemChangeType ) {
	    var source = oEvent.getSource();
	    var newValue = source.getValue();
	    var bc = source.getBindingContext();
	    var item = bc.getProperty();

	    this.templateDelegate.changeItem( item, itemChangeType, newValue);
	},
	
	
	
	onCreateItemlDelPressed: function(oEvent) {
		var arr = this.oItemFacade.deleteSelection();
		this.oPropFacade.insertCollection(arr);

		this.templateDelegate.delItems(arr);
	},

	onCreateItemTopPressed: function(oEvent) {
		var selection = this.oItemFacade.getSelection();
		this.oItemFacade.moveSelection("Top");

		this.templateDelegate.moveItems(selection, "Top");

	},
	onCreateItemUpPressed: function(oEvent) {
		var selection = this.oItemFacade.getSelection();
		this.oItemFacade.moveSelection("Up");
		this.templateDelegate.moveItems(selection, "Up");
	},
	
	onCreateItemDownPressed: function(oEvent) {
		var selection = this.oItemFacade.getSelection();
		this.oItemFacade.moveSelection("Down");
		this.templateDelegate.moveItems(selection, "Down");
	},
	onCreateItemBottomPressed: function(oEvent) {
		var selection = this.oItemFacade.getSelection();
		this.oItemFacade.moveSelection("Bottom");
		this.templateDelegate.moveItems(selection, "Bottom");
	},

	onDefineSmartFilterBarPressed: function( oEvent ) {
	    if (!this._oDefineSmartFilterBarDlg) {
			this._oDefineSmartFilterBarDlg = sap.ui.xmlfragment(this.getView().getId(),
					 "fd.view.fragments.DefineSmartFilterBarDialog", this);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDefineSmartFilterBarDlg);
			this.byId("tableSmartFilterBarKey").setModel( this.oViewModel);
		}
		//the table may change to different row, need reresh 
		this.byId("tableSmartFilterBarKey").bindRows("/aSmartFilterBarProp");

		this._oDefineSmartFilterBarDlg.open();
	},

	onSmartFilterBarRowSelectionChanged: function(oEvent) {
		var table = oEvent.getSource();
		var changedIdxs = oEvent.getParameter("rowIndices");
		var selIdx = table.getSelectedIndices();
		var text =  this.byId('selectedSmartFilterBarKeys').getValue();

		for (var i=0; i < changedIdxs.length; i++) {
			var  idx = changedIdxs[i];
			
			var context =table.getContextByIndex(idx);
			var key = context.getProperty('name');

			var pos = selIdx.indexOf(idx);
			if (pos == -1) {
				//remove the key, perhaps need remove the , also
				if ( text.indexOf( key + ',') != -1) {
					text = text.replace(key + ',' , '');
				} else {
					text = text.replace(key  , '');
				}
			} else {
				//add to the end, need check whether already existed or not 
				if (text.indexOf(key) == -1) {
					if (text.length) {
						text = text + "," + key;
					} else {
						text = key;
					}
				}
			}
		}

		this.byId('selectedSmartFilterBarKeys').setValue(text);
	},

	onDefineSmartFilterBarOkPressed: function( evt ) {
		var newKeys = this.byId('selectedSmartFilterBarKeys').getValue().split(',');
		var bSame = _.eq(this.mViewData.aSmartFilterBarKey, newKeys);
		this.mViewData.aSmartFilterBarKey = newKeys;
		if (!bSame) {
			// this.templateDelegate.changeSmartFilterBarKeys(newKeys);
		}

	    this._oDefineSmartFilterBarDlg.close();
	},
	
	onDefineSmartFilterBarCancelPressed: function( evt ) {
	    this._oDefineSmartFilterBarDlg.close();
	},
	

	
	
	//=======global variables
	//oMockServerExt 
	// templateDelegate  :
	// mViewData
	// tableProp  tableGroup  tableItem
	// oPropFacade, oGroupFacade  oItemFacade
	// oPreviewCanvas  this.oPreviewCanvas = this.byId("PreviewCanvas");
	// ---from MDDisplay.controller, 
	//   this.oDataMetadataUrl = oDataMetadataUrl;
	// this.oDataMetadataContent = oDataMetadataContent;
	// 
	// oDataModelForCanvas
	nextGroupIndex : 0
});