jQuery.sap.declare('fd.controller.MDTemplate');

jQuery.sap.require("fd.uilib.ControlInfo");

/**
 * It use to create the control based on the templated and property/group/items
 * @type {Object}
 */
sap.ui.core.Element.extend("fd.controller.MDTemplate", {
	metadata : {
		properties : {
			//the setting for the how to create controls as template
			// 'setting'       : {type:"any", defaultValue: null, },
			viewData: {type:"any", defaultValue: null }
		}
	},
	/**
	 * Some important interal data
	*/
	init: function( evt ) {
		//the Page/SemantiPage or empty, if no need then it will be set to the 
	    this._oTopControl = null;  
	    //the concrete control:  table, or form
	    this._oConcreteControl = null;
	    //the setting defined in the MDCreateViewController 
	    this._mSetting = null;
	},

	//need be called by sub class
	setConcreteControl: function( ctrl ) {
	    this._oConcreteControl = ctrl;
	},
	getConcreteControl : function( evt ) {
	    return this._oConcreteControl;
	},

	/*setSetting: function( setting ) {
	    this._mSetting = setting;
	},*/

	setViewData : function( mViewData ) {
	    this._mViewData = mViewData;
	    this._mSetting = mViewData.setting;
	},
	
	saveXmlContentAsFile: function( fileName) {
	    var content = this.createXmlContent();
	    fd.util.Export.saveToFile(content, fileName);
	},
	
	//create the xml content, so user can save to file, or easily use it to open as an normal project
	//here use the standard xml as iterface because: it no need know the Fast Designer internal project interface, easy maintain
	createXmlContent: function() {
	    var topControlInfo = this.createMainControl_ControlInfo();

	    var mProp = {};
		var ctrlName = fd.StrFragmentDefinition;
		if (this._mSetting.useXmlView) {
			ctrlName = fd.StrCoreView;
			if ( this._mSetting.controllerName) {
				mProp.controllerName = this._mSetting.controllerName;
			} 
		}
		var ctrlInfo = new fd.uilib.ControlInfo({
			name: ctrlName,
			propertyMap: mProp,
			aggregationMap: {
				"": topControlInfo  //no need aggre name
			}
		}); 

		return fd.util.Export.createXmlFromControlInfo(ctrlInfo);
	    
	},

	createMainControl: function( odataModel ) {
	    //outpart is the page/semanticPage/empty
	    switch ( this._mSetting.topControlType) {
	    	case fd.Template.TopControlType.Page:
	    		this._oTopControl = new sap.m.Page();
	    		break;
	    	case fd.Template.TopControlType.SemanticPage:
	    		this._oTopControl = new sap.m.semantic.SemanticPage();
	    		break;
	    	case fd.Template.TopControlType.NoPage:
	    		break;	    			    		 
	    }

	    //then add the concreate control 
	    if ( this._oConcreteControl) {
	    	this._oConcreteControl.destroy();
	    }
	    var aConcreateControl = this._createConcreteControl();
	    //may be two or one 
	    
	    if (this._oTopControl) {
	    	for (var i=0; i < aConcreateControl.length; i++) {
	    		this._oTopControl.addContent(  aConcreateControl[i]);
	    	}
	    } else {
	    	//??so for the smart filter bar + table how to handle??
	    	fd.assert( aConcreateControl.length == 1);
	    	this._oTopControl = aConcreateControl[0];
	    }

		
		this._oTopControl.setModel(odataModel);
	    return this._oTopControl;

	},

	//it can directly reuse the Controls created previous, then use the utility function to extract useful information
	createMainControl_ControlInfo: function( evt ) {
		var controlInfo = null;
		var aConcreateInfo = this._createConcreteControl_ControlInfo();

		if (this._mSetting.topControlType != "NoPage") {
	    	controlInfo = this.getControlInfoFromControl(this._oTopControl);
	    	controlInfo.setAggregationMap({
	    		content: aConcreateInfo
	    	});
		} else {
	    	controlInfo = aConcreateInfo;
		}
		
	 	return controlInfo;		
	},

	//==common functions shared 
	createLabel: function( item ) {
		var text  = item.labelValue
		/*if ( this._mSetting.bSapLabel ) {
			//{/#PaytProposal/RunDate/@sap:label}
			text = "{/#" + this._mSetting.entityType + "/" + item.label + "/@sap:label}";
		}*/
	    if (this._mSetting.bMobile) {
	    	return new sap.m.Label({text: text });
	    } else {
	    	return new sap.ui.commons.Label({text: text});
	    }
	},

	createTemplate: function( item ) {
		var name = "{" + item.name + "}";

		//for smart form, need SmartField 
		if ( this._mSetting.templateType == fd.Template.TemplateType.Form &&
			  this._mSetting.formType == fd.Template.FormType.SmartForm) {
			return new sap.ui.comp.smartfield.SmartField( {value: name});
		}

	    if (this._mSetting.bMobile) {
	    	if (this._mSetting.bReadonly)
	    		return new sap.m.Text({text: name});
	    	else
	    		return new sap.m.Input({value: name});
	    } else {
	    	if (this._mSetting.bReadonly)
	    		return new sap.ui.commons.TextView({text: name});
	    	else
	    		return new sap.ui.commons.TextField({value: name});
	    }
	},
	
	//from the control, by the getBindingInfo can know whether it is binding or pure value prop
	getPropertyInfoFromControl : function( control, propName ) {
		//?? need get the main part ?? 
		if (propName == 'id')
			return control.getId();

	    var binding = control.getBindingInfo(propName);

	    if (binding && binding.parts && binding.parts.length ==1) {
	    	//??now only support one binding 
	    	//for the binding, need add '{' '}'
	    	return '{' + binding.parts[0].path + '}';
	    }

	    //??fall back, 
	    return control.getProperty(propName);
	},
	

	//for some control, only need give the defined prop to the ControlInfo
	getControlInfoFromControl: function( control, aProp ) {
		var mProp = {};
		if (!aProp)
			aProp = [];

		for (var i=0; i < aProp.length; i++) {
			var  prop = aProp[i];
			var propInfo = this.getPropertyInfoFromControl( control, aProp[i]);
	    	mProp[prop] = propInfo; 
		}

		var ctrlName = control.getMetadata().getName();
		return new fd.uilib.ControlInfo({
	    	name: ctrlName,
	    	propertyMap: mProp
	    });
	},

	/**
	 * From some common used control instance to get the ControlInformaiton
	 * @param  {[type]} control [description]
	 * @return {[type]}         [description]
	 */
	getCommonControlInfoFromControl: function( control ) {
	    var ctrlName = control.getMetadata().getName();

	    var propName = "";
	    //now use an array, so later can easily add more prop from it
	    var mKnownProp = {
	    	"sap.m.Label": 			 ["text"],
	    	"sap.ui.commons.Label":  ["text"],
	    	"sap.m.Text" : 			 ["text"],
	    	"sap.m.Input" :             ["value"],
	    	"sap.ui.commons.TextView" : ["text"],
	    	"sap.ui.commons.TextField" : ["value"],
	    };
	    var aProp = mKnownProp[ ctrlName];

	    return this.getControlInfoFromControl(control, aProp);
	},
	
	

	//=================the function need be overwrite by the subclass
	_createConcreteControl: function(){ return null;},

	_createConcreteControl_ControlInfo: function(){ return null;},

	changeItem: function( item, changeItemType, newValue) {
	    
	},
	
	addItems: function( aItem ) {
	    // need be implemented by subclass
	},

	delItems: function( aItem ) {
	    // need be implemented by subclass
	},
	moveItems: function( aItem, moveDirection ) {
	    // need be implemented by subclass
	},

	highLightItmes: function( aItem,  bSelect ) {
	    
	},


	addGroup: function( mData) {
	    
	},

	delGroup: function( mData) {
	},

	moveGroup: function( mData, moveDirection) {
	},

	changeGroupLabel: function( mData, newLabel ) {
	},
	changeGroupSelection : function( mData) {
	},
	
	
	//==common funciton for xml view content , all start by xml
	_xmlWrapControl: function(arr, start, end ) {
	    arr.unshift(start);
	    arr.push(end);
	    return arr;
	},


	//--global variable
	
});			
	


	