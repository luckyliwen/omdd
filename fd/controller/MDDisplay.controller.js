// "use strict";
var gmdd,gtt,glist;
jQuery.sap.require('fd.uilib.TableFacade');
jQuery.sap.require("fd.util.collection");

sap.ui.controller("fd.controller.MDDisplay",{
	 
	onInit: function() {
		gmdd = this;
	},

	setMetaData: function(data) {
		this.getView().setModel(data.model);

		this.oDataMetadataUrl = data.oDataMetadataUrl;
		this.oDataMetadataContent = data.oDataMetadataContent;
		this.oDataNameSpace = data.name.sapLastPart(':').trim();

		this.doInitWork(data.model);
	},

	onEntitySetLinkPressed: function(oEvent) {
		var name = oEvent.getSource().getText();
		this.showMetaDataByName( fd.MDObject.EntitySet, name);
	},

	onOverallItemLinkPressed: function(oEvent, mdType) {
		var name = oEvent.getSource().getText();
		if (mdType == "Annotation") {		
			//by entity type and property
			var aName = name.split("/");
			this.showMetaDataByName(mdType, aName[0], aName[1]);
		} else {
			this.showMetaDataByName(mdType, name);
		}
	},

	addOverallDetailItems: function(mdType, mData) {
		var grid = this.byId('grid' + mdType);
		var mdData = mData[ 'a' + mdType];
		if (mdData) {
			for (var i=0; i<mdData.length; i++) {
				var name = mdData[i].name;
				if ( mdType == "Annotation") {
					name = mdData[i].Target;
				} 
				var link = new sap.m.Link({
					text: name,
					press: [mdType, this.onOverallItemLinkPressed, this]
				});

				grid.addContent(link);
			}
		}
	},


	doInitWork: function(model) {
		//there are several object, so use the map to control as a whole
		this.oIconTabBar = this.byId("iconTabBar");
		this.mList = {};
		this.mTable = {};
		this.mDPage = {};


		for (var name in fd.MDObject) {
			this.mList[name] = this.byId("list" + name);
			this.mTable[name] = this.byId("table" + name);
			this.mDPage[name] = this.byId("dpage" + name);

			//initial select first one 
			if (this.mList[name]) {
				var items = this.mList[name].getItems();
				if (items && items.length) {
					var selItem = items[0];
					selItem.setSelected(true);

					// also manually define the binding for the detail part
					this.onListSelectionChanged(null, name);
				}
			}

			this.addOverallDetailItems(name, model.getData());
		}

		glist = this.byId('listEntityType');
	},

	onEntityItemPressed: function(oEvent) {
		console.error(oEvent);

	},


	onListSearchPressed: function(oEvent) {
		console.error(oEvent);
	},

	onListSearchLiveChanged: function(oEvent) {
		var val = oEvent.getParameter('newValue');
		var selKey = this.oIconTabBar.getSelectedKey();
		var list = this.mList[selKey];
		if (list) {
			var binding = list.getBinding('items');
			if (binding) {
				//for Annotation, need special
				var filter = new sap.ui.model.Filter("name", 'Contains', val);
				if (selKey == "Annotation") {
					filter = new sap.ui.model.Filter({
							 filters: [
								new sap.ui.model.Filter("entityType", 'Contains', val),
								new sap.ui.model.Filter("property", 'Contains', val)
							 ],
							 and: false
					});

				}
				binding.filter( filter);
			}
		}
	},

	/**
	 * In order to reuse this function for the initial selection (which will not trigger by UI5), so here define an extra parameter
	 * @param  {[type]} oEvent     [description]
	 * @param  {[type]} definedKey [description]
	 * @return {[type]}            [description]
	 */
	onListSelectionChanged: function(oEvent, definedKey) {
		var selKey = definedKey;
		if (!selKey)
			selKey = this.oIconTabBar.getSelectedKey();

		var item =  this.mList[selKey] && this.mList[selKey].getSelectedItem(); 
		// var list = oEvent && oEvent.getSource();
		// var item =  list && list.getSelectedItem(); 

		if (item) {
			var context = item.getBindingContext();
			// var table = this.mTable[ selKey ];
			// if (table) {
			// 	// table.setBindingContext( context.getPath());
			// 	var path = context.getPath();
			// 	// table.bindRows( path + '/aProp');
			// }

			//for entity set just binding element
			var dpage = this.mDPage[ selKey ];
			if (dpage) {
				dpage.bindElement( context.getPath() );
			}
		} 
	},


	onEntityLinkPressed: function(oEvent) {
		var et = oEvent.getSource().getText();

		this.showMetaDataByName(fd.MDObject.EntityType, et);
	},

	/**
	 * Jump to the entity type view, and high light the row by property
	 * @param  {[type]} entityType [description]
	 * @param  {[type]} property   [description]
	 * @return {[type]}            [description]
	 */
	jumpToEntityTypePropertyRow: function( entityType, property) {
	    this.showMetaDataByName("EntityType", entityType);

	    //As just bind to new element, now the data is still old data,need run it later
	    var that = this;
	    jQuery.sap.delayedCall(100, fd.util.table, "ensureRowVisible", [
	    		that.mTable.EntityType,  "name", property, true
	    	]);
	    // fd.util.table.ensureRowVisible( this.mTable.EntityType, "name", property, true);
	},
	

	formatReferentialConstraintVisible: function( value ) {
	    return !! value;
	},
	
	formatETNavigationVisible: function( value ) {
		return value >0;
	},

	onEntityType_NavigationLinkPressed: function( oEvent ) {
		var link = oEvent.getSource();
		var bindContext = link.getBindingContext();
		var assoName = bindContext.getProperty("relationship");

		this.showMetaDataByName(fd.MDObject.Association, assoName);
	},

	onEntityType_TableChartSelected: function( oEvent ) {
	    var selButtonId = oEvent.getSource().getSelectedButton();
	    var bTable = selButtonId.sapEndWith('tableView');
	    this.byId("tableBox").setVisible(bTable);
	    this.byId("diagramBox").setVisible(!bTable);
	},
	
	onEntityType_F4LinkPressed: function( oEvent ) {
	    var icon = oEvent.getSource();
	    var prop = icon.getAlt();

	    //entityType can find from the current page binding 
	    var detailPage = this.mDPage[ "EntityType"];
	    var bindContext = detailPage.getBindingContext();
	    var entityType = bindContext.getProperty("name");

	    this.showMetaDataByName(fd.MDObject.Annotation, entityType, prop);
	},
	

	onAnnotation_CollectionPathLinkPressed: function( oEvent ) {
		var entitySet = oEvent.getSource().getText();
	    this.showMetaDataByName(fd.MDObject.EntitySet, entitySet);
	},

	onAssociation_PrincipalPropertyRefLinkPressed: function( oEvent ) {
		var prop = oEvent.getSource().getText();
		var bindContext = this.mDPage.Association.getBindingContext();
		var entityType = bindContext.getProperty("principalEntityType");
		this.jumpToEntityTypePropertyRow(entityType, prop);
	},

	onAssociation_DependentPropertyRefLinkPressed: function( oEvent ) {
		var prop = oEvent.getSource().getText();
		var bindContext = this.mDPage.Association.getBindingContext();
		var entityType = bindContext.getProperty("dependentEntityType");
		this.jumpToEntityTypePropertyRow(entityType, prop);
	},


	onAssociation_EntityTypeLinkPressed: function( oEvent ) {
		var entityType = oEvent.getSource().getText();
	    this.showMetaDataByName(fd.MDObject.EntityType, entityType);
	},

	onAnnotation_TargetLinkPressed: function( oEvent ) {
		var name = oEvent.getSource().getText();
		//like PaytProposal/CoCodeList
		var aName = name.split("/");
		var entityType = aName[0];
	    this.showMetaDataByName(fd.MDObject.EntityType, entityType);
	},
	
	onAnnotation_ValueListPropertyLinkPressed: function( oEvent ) {
	    var prop = oEvent.getSource().getText();
		var bindContext = this.mDPage.Annotation.getBindingContext();
		var entitySet = bindContext.getProperty("CollectionPath");	    

		//from entitySet find the entityType
		var model = this.getView().getModel();
		var mData = model.getData();
		var pos = mData.aEntitySet.sapIndexOf("name", entitySet);
		if (pos != -1) {
			var entityType = mData.aEntitySet[pos].entityType;
			this.jumpToEntityTypePropertyRow(entityType, prop);
		} 

	},
	

	onAssociationSet_AssociationLinkPressed: function(oEvent) {
		var name = oEvent.getSource().getText();
		this.showMetaDataByName(fd.MDObject.Association, name);
	},

	onAssociationSet_EntitySetLinkPressed: function(oEvent) {
		var name = oEvent.getSource().getText();
		
		this.showMetaDataByName(fd.MDObject.EntitySet, name);
	},

	onAssociationSet_RoleLinkPressed: function(oEvent) {
		var link = oEvent.getSource();
		var bindContext = link.getBindingContext();
		var bindPath = link.getBinding('text');
		var path = bindPath.getPath().sapRemoveLast("role") + "entitySet";
		var etName = bindContext.getProperty(path);

		this.showMetaDataByName(fd.MDObject.EntitySet, etName);

	},


	showMetaDataByName: function(mdType, name, extraProp) {
		this.oIconTabBar.setSelectedKey(mdType);
		
		//?? check the search ??
		var list = this.mList[mdType];
		var items = list.getItems();
		for (var i=0; i<items.length;i++) {
			var item = items[i];
			//for the Annotation, need check the title="{entityType}"  number="{property}"
			if (mdType == "Annotation") {
				if (item.getTitle() == name) {
					//then from attributes text to check the prop
					var attr = item.getAggregation("attributes");
					if (attr.length ) {
						if (attr[0].getText() == extraProp) {
							item.setSelected(true);
							this.onListSelectionChanged(null, mdType);

							fd.util.list.ensureItemVisible(this.mList[mdType], item);
							break;
						}
					}
				}  
			} else {
				if (item.getTitle() == name) {
					item.setSelected(true);
					this.onListSelectionChanged(null, mdType);
					fd.util.list.ensureItemVisible(this.mList[mdType], item);
					break;
				}
			}
		}

	},


	onEntityTypePropCopyPressed: function(oEvent) {

	},

	onEntityType_CreateCtrlPressed: function(oEvent) {
		if ( !this._createViewController) {
			//first time need connect it to the view 
			jQuery.sap.require("fd.controller.MDCreateViewController");
			this._createViewController = sap.ui.controller("fd.controller.MDCreateViewController");

			this._createViewController.setMetadataInfo(this.oDataMetadataUrl,this.oDataMetadataContent, this.oDataNameSpace);

			// new fd.controller.MDCreateViewController();
			this._createViewController.connectToView(this.getView());

			this._createViewController.setMasterController(this);
		}

		this._createViewController.openSelectTemplateDialog();

	},

	//know which entitySet, entityName it selected
	getCurrentMetaDataInfo: function( evt ) {
	    var page = this.mDPage.EntityType;
	    var bindingContext = page.getBindingContext();
	    var model = bindingContext.getModel();
	    var data = model.getProperty(  bindingContext.getPath());

	    //??later need according current selected Key know which data need return
	    var mData = {
	    	entityType: data.name,
	    	entitySet: data.entitySet
	    };
	    return mData;
	},

	//global data: 
	//passed from ODataMng
	// this.oDataMetadataUrl = data.oDataMetadataUrl;
	// this.oDataMetadataContent = data.oDataMetadataContent;
});