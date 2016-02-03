/**
  * Mng the OData metadata , now only support one Metadata
  * */
var gdata;
fd.model.ODataMng = {
		
	init: function() {
		this._oDesignModel = null; 
		this.oDataMetadataUrl ="";
		this.oDataMetadataContent = "";

		fd.bus.subscribe("metadata", "OpenFromUrl", this.loadMetadataFromUrl, this);
		fd.bus.subscribe("metadata", "OpenFromFile", this.loadMetadataFromFile,this);
	},

	setDesignModel: function(oModel) {
		this._oDesignModel  = oModel;
		//??
		gdata = oModel.getData();
	},

	//this model is the design model
	getModel: function( ) {
	    return this._oDesignModel;
	},
	
	getODataMetadaUrl: function( ) {
	    return this.oDataMetadataUrl;
	},

	//the model array, entry like name: , model: 
	getModelArray: function() {
		return this._aModelEntry;
	},
	
	loadMetadataFromFile: function(channel, envent, mArg ) {
	    this.oDataMetadataContent = mArg.content; 
		this.parseMetadata( this.oDataMetadataContent, true);
	},
	
	loadMetadataFromUrl: function( channel, envent, mArg ) {
	    var url = mArg.url.trim();
		//some case user input the /$metadata, in this case just simple remove it 
		url = url.replace("/$metadata", "");
		this.oDataMetadataUrl = url;

		this.oDataModel  = new  sap.ui.model.odata.ODataModel(url, true);
		this.oDataModel.attachMetadataFailed( true, this.onODataMetadataFailed, this);
		this.oDataModel.attachMetadataLoaded( true, this.onODataMetadataLoad, this);
	},
	

	onOkPressed: function() {
		this.oDataMetadataUrl ="";
		this.oDataMetadataContent = "";

		if ( this._oRBUrl.getSelected()) {
			//load from url
			var url = this._oUrlControl.getValue().trim();
			if (!url) {
				fd.uilib.Message.warning("Please enter URL");
				return;
			} else {
				//some case user input the /$metadata, in this case just simple remove it 
				url = url.replace("/$metadata", "");
				this.oDataMetadataUrl = url;

				this.oDataModel  = new  sap.ui.model.odata.ODataModel(url, true);
				this.oDataModel.attachMetadataFailed( this._oDesignModelCheckBox.getChecked(), this.onODataMetadataFailed, this);
				this.oDataModel.attachMetadataLoaded( this._oDesignModelCheckBox.getChecked(), this.onODataMetadataLoad, this);
				this._oDialog.close();
			}
		} else {
			//directly load content
			this.oDataMetadataContent = this._oContentControl.getValue().trim();

			if ( this.oDataMetadataContent.length === 0) {
				fd.uilib.Message.warning("Please input OData Metadata content");
				return;
			}

			if (this.parseMetadata( this.oDataMetadataContent, this._oDesignModelCheckBox.getChecked())) {
				this._oDialog.close();	
			} else {
				this._oContentControl.setValue("");
			}
		} 
	},

	onODataMetadataFailed: function( oEvent ) {
		var brief = oEvent.getParameter("message");
		var detail = "";
		var resp  = oEvent.getParameter("response");
		detail = resp.body ? resp.body : "";

		fd.uilib.Message.showErrors("Get metadata failed", [ brief, detail]);
	},

	onODataMetadataLoad: function( oEvent , bUsedAsDesignModel) {
		var oData = oEvent.getParameter('metadata').oMetadata;
		this.processODataMetada(oData, bUsedAsDesignModel);

	    // console.error("load suss", oData);
	},



	//!! how to get from odata
//om.getMetaModel().oModel.oData
// om.attachMetadataFailed
// ODataModel.attachMetadataFailed(oData, fnFunction, oListener)
// om.attachMetadataLoaded
// ODataModel.attachMetadataLoaded(oData, fnFunction, oListener)
// 

	onOpenFromFileChanged: function(evt) {
		this._oOpenFileChoose.startRead();
	},
	
	/**
	 * Call back for open all the file content
	 * @param evt
	 */
	onOpenFromFileLoadOne: function(evt) {
		if (evt.getParameter("success")) {
			var content = evt.getParameter("content");
			this.oDataMetadataContent = content;
			if (this.parseMetadata(content,  this._oDesignModelCheckBox.getChecked())) {
				this._oDialog.close();	
			}
		}
	},

	onClearButtonPressed:     function ( evt) {
	    this._oContentControl.setValue("");
		this._oUrlControl.setValue("");
	},

	buildChooseDialog: function() {
		var btnOk = new sap.ui.commons.Button({
			text: "Ok",
			press: [this.onOkPressed, this]
		});
		btnOk.addStyleClass("FDLeftMargin");

		var btnCancel = new sap.ui.commons.Button({
			text: "Cancel",
			press: [function() {
				this._oDialog.close();
			}, this],
		});

		var btnClear = new sap.ui.commons.Button({
			text: "Clear",
			press: [this.onClearButtonPressed, this],
		});

		//now open from file need special control
		var openFileBtn = new sap.ui.commons.Button(
				{
					text: "Open From Files",
					width: "20rem",
					style: "Emph"
				});

		this._oOpenFileChoose = new fd.uilib.FileChoose({
			buttonControl : openFileBtn,
			accept :"text/xml",
			multiple: false,
			change: [this.onOpenFromFileChanged, this],
			loadOne: [this.onOpenFromFileLoadOne, this]
		}).addStyleClass("FDLeftMargin");
		// .addStyleClass("FDTopMarginHalf")

		this._oUrlControl = new sap.ui.commons.TextField({
			width: "50rem",
			placeholder: "such as placeholder https://ldciq95.wdf.sap.corp:9501/sap/opu/odata/sap/FAP_REVISE_PAYMENT_PROPOSAL",
			change: function(evt) {
				//need update to the global setting also
				fd.getSettingController().setODataUrlIfEmpty( evt.getSource().getValue() );
			}
		}).addStyleClass("FDLeftMargin");
		
		this._oContentControl = new sap.ui.commons.TextArea({ 
			width: "50rem",
			rows: 10
		}).addStyleClass("FDLeftMargin");

		/*this._oRBFile = new sap.ui.commons.RadioButton({text: "Load from File",
			selected: true
		}).addStyleClass("FDTopMargin");*/

		this._oRBUrl = new sap.ui.commons.RadioButton({
			text: "Load from URL (only support run in local model and disable security) !!not support now",
			// enabled: false,
			selected: true
			
		}).addStyleClass("FDTopMargin");
		this._oRBContent = new sap.ui.commons.RadioButton({text: "Directly load file content",
			// selected: true
		}).addStyleClass("FDTopMargin");
		

		this._oDesignModelCheckBox = new sap.ui.commons.CheckBox({
			text: "As default design metadata model, you can change it later from 'Setting'",
			checked: true
		});

		var content = new sap.m.VBox({
			items: [
				// new sap.m.HBox({
				// 	items: [
						// this._oRBFile,
						// this._oOpenFileChoose,
				// 	]
				// }),

				this._oDesignModelCheckBox,

				this._oRBUrl,
				this._oUrlControl,

				this._oRBContent,
				this._oContentControl
			]
		});

		

		var dialog = new sap.ui.commons.Dialog({
			title: "Load the OData Metadata",
			buttons: [this._oOpenFileChoose, btnOk, btnCancel, btnClear],
			content: content,
		});
		return dialog;
	},

	openODataLoadDialog: function() {
		if ( !this._oDialog ) {
			this._oDialog = this.buildChooseDialog();
		} else {
			this.onClearButtonPressed();
		}
		//if the design model has been set then by default not select the check box
		if (this._oDesignModel) {
			this._oDesignModelCheckBox.setChecked( false );
		}

		this._oDialog.open();
	},

	/**
	 * [parseMetadata description]
	 * @param  {[type]} content [description]
	 * @return {[type]}         [description]
	 */
	parseMetadata: function( content , bUsedAsDesignModel) {
		//just use simple way to check whether is ok or not
		try {
			$.parseXML(content);
		} catch (e) {
			fd.uilib.Message.showErrors("Invalid $metadata file", [ e.message]);
			return false;
		}

		//just use the OData internal method to parse the xml, so later can use the same model as the normal load by url
		var response = {
			headers: {
				"Content-Type": "application/xml",
				"DataServiceVersion": "2.0",
			},
			statusCode: 200,
			statusText: "OK",

			body: content
		};

		var metaHandler = OData.metadataHandler;
		var ret = metaHandler.read(response);
		if (!ret) {
			fd.uilib.Message.showErrors("Parse $metadata failed", ["Please check the file content and retry"]);
		} else {
			this.processODataMetada( response.data, bUsedAsDesignModel);
		}
		return true;
	},


	mapEntityTypeData: function(mData,entityType) {
		var entry = {
			aKey : [],  //
			aProp: [],
			aNavigation: [],
			bAggr:  false
		};
		var aKey =[]; //just key name for later easy handle 
		entry.name = entityType.name;

		//extension only need check the semantics 
		if (entityType.extensions && entityType.extensions.length) {
			var semaExt = _.find(entityType.extensions,  {name: "semantics"} );
			if (semaExt) {
				entry.bAggr = true;
			}
		}

		//keys, 
		var i;
		for ( i=0; i < entityType.key.propertyRef.length; i++) {
			var propRef = entityType.key.propertyRef[i];
			aKey.push(propRef.name);
		}

		//then prop
		for ( i=0; i < entityType.property.length; i++) {
			var prop = entityType.property[i];

			var propData = {
				maxLength: prop.maxLength,
				name: 		prop.name, 
				nullable:   this.getBooleanValue('nullable', prop.nullable), 
				type:   	prop.type,
				label: 		"", //default value 
				key: 		false,  //whether is key
			};
			//check whether is key
			if (aKey.indexOf( prop.name) != -1) {
				propData.key = true;
			}

			//other property from extension 
			if (prop.extensions) {
				for (var iExt=0; iExt< prop.extensions.length; iExt++) {
					var ext = prop.extensions[iExt];
					// like name: "label"
					// namespace: "http://www.sap.com/Protocols/SAPData"
					// value: "Country Dialing Code"
					propData[ ext.name] = this.getBooleanValue(ext.name, ext.value);
				}
			} else {
				//??why no extensions 
			}
			entry.aProp.push( propData);
		}

		//navigationProperty
		if (entityType.navigationProperty  && entityType.navigationProperty.length>0) {
			for ( i=0; i < entityType.navigationProperty.length; i++) {
				var naviProp = entityType.navigationProperty[i];
				naviProp.relationship = naviProp.relationship.sapLastPart(".");
				entry.aNavigation.push(naviProp);
			}
		}

		return entry;
	},

	getBooleanValue: function(name, value) {
		if (name.sapEndWith('able')) {
			var type = typeof value;

			if (value == undefined) 
				value = false;
			
			if (type != 'boolean') {
				if ( value =='false')
					value = false;
				else if (value == 'true')
					value = true;
			}
		}
		return value;
	},

	mapEntitySetData: function(mData, entitySet) {
		var entry = {
			creatable: false,   updatable: false, deletable:false, 
			searchable: false,  pageable: false,  addressable: false
		};
		entry.name = entitySet.name ;
		entry.entityType = entitySet.entityType.sapLastPart(); //entityType: "FCLM_BM_SRV.F4_DeliveryType" 

		//from the extensions get the xxable property
		//creatable  updatable  deletable  searchable pageable  addressable  content-version
		var extensions = entitySet.extensions;
		if (extensions) {
			for (var i=0; i < extensions.length; i++) {
				var  ext = extensions[i];
				entry[  ext.name ] = this.getBooleanValue( ext.name, ext.value);
			}
		} else {
			//??why the entity no extension 
		}

		//get the entityType index now 
		entry.entityTypeIndex = mData.aEntityType.sapIndexOf("name", entry.entityType);
		if (entry.entityTypeIndex != -1) {
			//set the entitySet to entityType 
			mData.aEntityType[ entry.entityTypeIndex ].entitySet = entry.name ;
		}
		return entry;
	},

	mapAnnotationData: function( mData, mInfo ) {
		//!!here the property start by Upper case as it just copy from original data
	    var entry = {Target: "", Term: "", aParameter: [] , Label:"", CollectionPath:"",
					SearchSupported: false};

	    // Target="FAP_REVISE_PAYMENT_PROPOSAL.PaytProposal/CoTargetCodeList"
	    entry.Target = mInfo.target.sapLastPart(".");
	    var aName = entry.Target.split("/");
	    entry.entityType = aName[0];
		entry.property = aName[1];

	    if (  ! ( mInfo.annotation && mInfo.annotation[0])) {
	    	return entry;
	    }

	    var anno = mInfo.annotation[0];
	    entry.Term = anno.term;
	    // term: "com.sap.vocabularies.Common.v1.ValueList"
	    if (anno.term.sapEndWith("ValueList")) {
	    	var record = anno.record;
	    	var propertyValue = record && record.propertyValue;
	    	if (propertyValue && propertyValue.length) {

	    		for (var i=0; i < propertyValue.length; i++) {
	    			var value = propertyValue[i];
	    			//3 simple value like:
					// property: "Label"
					// string: "Company Codes"
					var property = value.property;
					if (property =="Label" || property=="CollectionPath") {
						entry[property] = value.string;
					} else if (property=="SearchSupported") {
						entry[property] = value.bool;
					} else if ( property == "Parameters") {
						var collection = value.collection;
						var aRecord = collection && collection.record;
						if (aRecord && aRecord.length>0) {
							//it may have one or two value, like
							// 0
							// 	property: "LocalDataProperty"
							// 	propertyPath: "CoCodeList"
							// 1
							// 	property: "ValueListProperty"
							// 	string: "Bukrs"
							// type: "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
							for (var idx=0; idx < aRecord.length; idx++) {
								record = aRecord[idx];
								//check the sub property
								var param = {};
				    			param.type = record.type.sapLastPart(".");

				    			var aPropertyValue  = record.propertyValue;
				    			if (aPropertyValue && aPropertyValue.length>0) {
					    			for (var iProp =0; iProp < aPropertyValue.length; iProp++) {
					    				var  paramProp = aPropertyValue[iProp];
					    				if (paramProp.property == "ValueListProperty") {
					    					param.ValueListProperty = paramProp.string;
					    				} else if (paramProp.property == "LocalDataProperty") {
					    					param.LocalDataProperty = paramProp.propertyPath;
					    				}
					    			}
					    			
				    				entry.aParameter.push(param);
				    			}

							}
						}
					}
	    		}//for (var i=0; i < propertyValue.length; i++)
	    	}//if (propertyValue && propertyValue.length)
	    }//if (anno.term.sapEndWith("ValueList")) {

	    return entry;
	},
	
	mapAssociationData: function( mData, mAsso ) {
		var asso =jQuery.extend(true, {}, mAsso);

		//two end type only need the lat part name 
		asso.end[0].type = asso.end[0].type.sapLastPart(".");
		asso.end[1].type = asso.end[1].type.sapLastPart(".");

		//for the referentialConstraint, need get the entityType so later can easy jump
		if ( asso.referentialConstraint && asso.referentialConstraint.dependent) {
			var role = asso.referentialConstraint.dependent.role;

			if (asso.end[0].role == role) {
				asso.dependentEntityType = asso.end[0].type;
				asso.principalEntityType = asso.end[1].type;
				asso.dependentEnd = "End 0";
				asso.principalEnd = "End 1";
			} else {
				asso.dependentEntityType = asso.end[1].type;
				asso.principalEntityType = asso.end[0].type;
				asso.dependentEnd = "End 1";
				asso.principalEnd = "End 0";

			}
		}
		return asso;
	},
	

	buildMetadaRelationShip: function( mData ) {
		//from annotation ValueList can link to EntityType
		var i;
		for ( i=0; i < mData.aAnnotation.length; i++) {
			var  anno = mData.aAnnotation[i];
			if (anno.Term.sapEndWith("ValueList")) {
				//first by entityType find the entitytType pos
				var pos = mData.aEntityType.sapIndexOf("name", anno.entityType);
				if (pos != -1) {
					//then by the property find the sub pos 
					var propPos = mData.aEntityType[pos].aProp.sapIndexOf("name", anno.property);
					if (propPos != -1) {
						mData.aEntityType[pos].aProp[propPos].f4 = 'yes';
					} else {
						fd.assert(false, "Annotation can't find the entityType property");
					}
					
				} else {
					fd.assert(false, "Annotation can't find the entityType");
				}
			}
		}

		//for the entity type, need add the enittyType and multiplicity text for both the from and to
		for ( i=0; i < mData.aEntityType.length; i++) {
			var  et = mData.aEntityType[i];

			//add the key 
			var aKey = [];
			_.each( et.aProp, function( prop ) {
			    if (prop.key)
			    	aKey.push(prop.name);
			} );
			et.aKey = aKey;

			for (var iNavi = 0; iNavi < et.aNavigation.length; iNavi++) {
				var navi = et.aNavigation[iNavi];
				this.addNavigationInformation(mData, et, navi);
			}
		}

		//after add all the aFrom , then can check the node with bidirection 
		for ( i=0; i < mData.aEntityType.length; i++) {
			et = mData.aEntityType[i];
			if (!et.aFrom || et.aFrom.length==0 ) {
				continue;
			}

			for (var iFrom = et.aFrom.length-1; iFrom>=0; iFrom--) {
				var from = et.aFrom[iFrom];
				var toEt = _.find(  et.aNavigation, {entityType: from.entityType});
				if (toEt) {
					toEt.bBidirection = true;
					//also need remove it 
					et.aFrom.splice( iFrom, 1);
				}
			}
		}
	},
	
	/**
	 * [addNavigationInformation description]
	 * @param {[type]} mData [description]
	 * @param {[type]} navi  [description]
	 */
	addNavigationInformation: function( mData, entityType, navi ) {
	    /*fromRole: "FromRole_InvoiceToAttachment"
name: "AttachmentSet"
relationship: "InvoiceToAttachment"
toRole: "ToRole_InvoiceToAttachment"
entityType
aMultiplicity;*/
		var asso = _.find( mData.aAssociation, {name: navi.relationship});
		if (!asso) {
			fd.assert(false, "should can find the association by name");
			return;
		}
		var fromEnd = asso.end[0];
		var toEnd = asso.end[1];

		if (navi.toRole == asso.end[0].role) {
			fromEnd = asso.end[1];
			toEnd = asso.end[0];
		}
		navi.entityType = toEnd.type;
		navi.aMultiplicity = [fromEnd.multiplicity,  toEnd.multiplicity]; 

		//now can add the aFrom information for the navigation to entityType
		var toET = _.find( mData.aEntityType, {name: navi.entityType});
		if (!toET) {
			fd.assert(false,  "Can't find the to entity Type ");
			return;
		}

		if ( !toET.aFrom ) {
			toET.aFrom = [];
		} 

		toET.aFrom.push({
			entityType: entityType.name, 
			aMultiplicity:  [toEnd.multiplicity, fromEnd.multiplicity]
		});
	},
	

	/**
	 * Get the entity set, entity, annotation as array so later can use easily
	 * @param  {[type]} odata [description]
	 * @return {[type]}       [description]
	 */
	processODataMetada: function( odata,  bUsedAsDesignModel) {
		if ( ! (odata.dataServices && odata.dataServices.schema && odata.dataServices.schema.length ===1) ){
			alert("Parsed OData error, please check the OData!");
			return;
		} 

		//in order to later easy handle, change the data format here 
		var mData = {
			aEntityTypeName : [
				{
					key: "",
					name: "--First select one Entity then choose properties:--"
				}
			],
			aEntityType: [],
			aEntitySet: [],
			aAnnotation: [],
			aFunctionImport: [],
			aAssociation: [],
			aAssociationSet: [],
			aMockData: [], 
			// general: {}, //the 
		};

		var schema = odata.dataServices.schema[0];
		var i;
		for ( i=0; i < schema.entityType.length; i++) {
			mData.aEntityTypeName.push({
				key: schema.entityType[i].name,
				name: schema.entityType[i].name,
			});

			mData.aEntityType.push( this.mapEntityTypeData(mData, schema.entityType[i]));
		}

		/*//get the useful names: entityType, entitySet, annotation */
		//entity set 
		var container = schema.entityContainer[0];
		if ( container.entitySet && container.entitySet.length) {
			for (i=0; i< container.entitySet.length; i++){
				mData.aEntitySet.push( this.mapEntitySetData(mData, container.entitySet[i]));
			}
		}

		//function import 
		if ( container.functionImport && container.functionImport.length) {
			for ( i=0; i < container.functionImport.length; i++) {
				var  funcImp = container.functionImport[i];
				//like returnType: "FAP_REVISE_PAYMENT_PROPOSAL.PaytProposalInvoice", so only get last part
				if (funcImp.returnType)
					funcImp.returnType = funcImp.returnType.sapLastPart();
				mData.aFunctionImport.push(funcImp);
			}
		}

		//association
		if (schema.association && schema.association.length) {
			for (i=0; i < schema.association.length; i++) {
				
				var asso = this.mapAssociationData(mData, schema.association[i]);

				mData.aAssociation.push( asso );
			}
		}

		//association set
		if ( container.associationSet && container.associationSet.length) {
			for (i=0; i < container.associationSet.length; i++) {
				var  assoSet = container.associationSet[i];
				//association only need the real name association: "FAP_REVISE_PAYMENT_PROPOSAL.PaytProposalParameterToPayment"
				assoSet.association = assoSet.association.sapLastPart(".");
				mData.aAssociationSet.push(assoSet);
			}
		}
		
		//annotation 
		if (schema.annotations) {
			for ( i=0; i < schema.annotations.length; i++) {
				var anno =  this.mapAnnotationData(mData, schema.annotations[i]);
				mData.aAnnotation.push( anno );
			}
		}
		

		//build the relationship between different part 
		this.buildMetadaRelationShip(mData);

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setSizeLimit(1000);		
		oModel.setDefaultBindingMode("TwoWay");
		oModel.setData( mData);

		if (bUsedAsDesignModel) {
			this.setDesignModel(oModel);
		}

		fd.uilib.Message.showToast("Load OData $metada successful!");

		//??need check the name not duplicate??
		var entry = {
			name: "Metadata: "+schema.namespace,
			model: oModel,
			oDataMetadataUrl:  this.oDataMetadataUrl, //if get from the url
			oDataMetadataContent: this.oDataMetadataContent, //the pure odata $metadata, so later it can use it to create the mockserver
		};
		this._aModelEntry.push(entry);

		//use the event to notify other listener
		fd.bus.publish("view", "NewMetadata",entry);
	},

	/**
	 * Get the whole entity name path
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	getEntityNamePath: function( evt ) {
	    return "/aEntityTypeName";
	},

	/**
	 * use for get property for one entity
	 * @param  {[type]} entity [description]
	 * @return {[type]}        [description]
	 */
	getEntityPath: function( entity ) {
		//first by entity name get the position
		if ( this._oDesignModel  ) {
			var mData = this._oDesignModel.getData();
			var idx = mData.aEntityType.sapIndexOf('name', entity);
			if (idx != -1) {
				return "/aEntityType/" + idx +  "/aProp";
			}
		}
		return "";
	},
	

	isMetadataLoad: function() {
		return this._oDesignModel;
	},

	isFirstTimePrompt: function( evt ) {
	    return this._bIsFirstTimePrompt;
	},

	setIsFirstTimePrompt : function( flag ) {
	    this._bIsFirstTimePrompt = flag;
	},
	
	
	_oDialog: null,
	_aModelEntry: [],
	_bIsFirstTimePrompt: true,

	//oDataMetadataUrl  or oDataMetadataContent
};
 