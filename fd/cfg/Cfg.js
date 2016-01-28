//For simple, just use fd.cfg instead of fd.cfg.Cfg
fd.cfg = {
	
	getDocumentBaseUrl: function() {
		return this.mCfg.misc.documentBaseUrl;
	},
	
	isCompacted: function() {
		return this.mCfg.format.compacted;
	},

	getFioriLibs : function( evt ) {
	    return ["sap.ui.core", "sap.m", "sap.ui.layout", "sap.ui.table", "sap.ui.comp", "sap.ushell"];
	},
	
	getXmlnsMap : function() {
		return this.mCfg.xmlns;
	},
	
	getIndent: function() {
		return this.mCfg.format.identSpace;
	},
	
	getMaxRowLength: function() {
		return this.mCfg.format.maxRowLength;
	},
	
	
	isKeepUnknownProp: function() {
		return this.mCfg.format.keepUnknownProp;
	},
	
	isFiori: function() {
		return this._bFiori;
	},

	isSpecialAggregationNode: function( aggrNodeName) {
	    return this.mCfg.aSpecialAggrNode.indexOf(aggrNodeName) !== -1;
	},
	

	needSupportCustomerControl: function( evt ) {
	    return this._bSupportCustomerControl;
	},
	
	
	//ue two level for later easy extension
	mCfg: {
		misc: {
			/*
			 * The base url of the UI5 APIs, you can change to local for speed:
			 * For example the sap.m.Button api local url http://localhost:8080/1.14/#docs/api/symbols/sap.m.Button.html
			 * The global url is:  
			 */
			//documentBaseUrl: "http://10.58.67.2:8080/1.14/",
			documentBaseUrl: "https://openui5.hana.ondemand.com/",
		},

		/**
		 * The prefer namespace for the xml, 
		 */
		xmlns: {
			//means the xmlns="sap.ui.commons"
			'default': 	'sap.m',

			'html'   :	'http://www.w3.org/1999/xhtml',  
			"core"	:	"sap.ui.core",
			"mvc"	 : "sap.ui.core.mvc",
			"customData" : "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",

			'commons': "sap.ui.commons",
			"clayout":	"sap.ui.commons.layout",
			"cform"	:	"sap.ui.commons.form",

			'viz'    :  "sap.viz.ui5",
			"makit"  :   "sap.makit",
			"suite"  :   "sap.suite.ui.commons",
			"unified"        :   "sap.ui.unified",
			"richtexteditor" :   "sap.ui.richtexteditor",
			"inbox":  "sap.uiext.inbox",
			"ushell": "ushell",

			"layout" :  "sap.ui.layout",
			"form"	 :  "sap.ui.layout.form", 
			
			"table"	:	"sap.ui.table",
			'me'     :  "sap.me",
			"semantic" : "sap.m.semantic",
			"ux3"	 :  "sap.ui.ux3",

			//for fiori
			'caui'   :  "sap.ca.ui",
			'camd'   : "sap.ca.scfld.md",
			'cachart':  "sap.ca.ui.charts.Chart",
			
			//comp 
			"filterbar":  "sap.ui.comp.filterbar",
			"navpopover":   "sap.ui.comp.navpopover",
			"personalization": "sap.ui.comp.personalization" ,

			//smart serial
			"smarttable"     : "sap.ui.comp.smarttable",
			"smartfilterbar" : "sap.ui.comp.smartfilterbar",
			"smartfield"     : "sap.ui.comp.smartfield",
			"smartform"      : "sap.ui.comp.smartform",
			"smartvariants"  : "sap.ui.comp.smartvariants",
			"valuehelpdialog": "sap.ui.comp.valuehelpdialog", 
		},

		format: {
			//compacted means attribute and node will put at one line if not exceed the max length 
			compacted :      false,
			
			//how many space for the indent
			'identSpace'   : "    ",
			
			//one row how long 
			'maxRowLength' : 100,
			
			//whether keep the prop when it is unknown from the class prop list,normally when verison diff 
			'keepUnknownProp' : true, 
		},
	
		modelName: {
			//the list for the mode name, used for binding for multiple model  
			names: "i18n, img, device"
		},
		
		//??
		//default insert values
		defaultInsert: {
			//dore 
			"sap.ui.core.ExtensionPoint": { Prop: ["name"]},
			"sap.ui.core.Icon": { Prop: ["src"] },
			"sap.ui.core.Fragment": { Prop: ["fragmentName"] },

			//sap.m
			"sap.m.Button" : { Prop: ['text'],  Event: ['press']},
			"sap.m.Label" : { Prop: ['text'],  },
			"sap.m.Image" : {  Prop: ["src"] },
			"sap.m.Text"   : { Prop: ['text'] },

           	
           	"sap.m.VBox"   : {  Aggr: ['items'] },
           	"sap.m.HBox"   : {  Aggr: ['items'] },
           	"sap.m.Select"   : {  Aggr: ['items'] },
           	"sap.m.RadioButtonGroup"   : {  Aggr: ['buttons'] },
           	"sap.m.SegmentedButton"   : {  Aggr: ['buttons'] },
           	"sap.m.ActionSheet"   : {  Aggr: ['buttons'] },
           	"sap.m.Toolbar"   : {  Aggr: ['content'] },
        	"sap.m.List"   : { Prop: ['noDataText'],  Aggr: ['items'],  Event: ['select']},
           	"sap.m.ObjectListItem"   : { Prop: ['title',"number","numberUnit",'intro','icon'], 
           		Aggr: ['attributes','firstStatus',"secondStatus"]
           	},
           	"sap.m.ObjectHeader"   : { Prop: ['title',"number","numberUnit",'intro','icon'], 
           		Aggr: ['attributes','firstStatus',"secondStatus"]
           	},
           	"sap.m.ObjectNumber"   : { Prop: ['number',"numberUnit"]},
           	"sap.m.ObjectStatus"   : { Prop: ['text',"state"]},
           	"sap.m.ObjectAttribute"   : { Prop: ['text']},
           	"sap.m.Page"   : { Prop: [],       Aggr: ['content'] },
           	"sap.m.Dialog": {
           		Prop: ["title"],
           		Aggr: [ "content",  "beginButton",  "endButton"]
           	},
			"sap.m.SplitApp": {
           		Prop: ["title"],
           		Aggr: [  "masterPages","detailPages", ]
           	},
			"sap.m.Table": {
           		Prop: [ "mode"],
           		Aggr:  [ "items", "columns" ]  
            },
            //--------------semantic 
            "sap.m.semantic.SemanticButton" : {
            	Prop: ["type"]
            },

            "sap.m.semantic.FullscreenPage": {
            	Prop: ["title", "showNavButton"],
            	Aggr: ["content"]
            },

            "sap.m.semantic.MasterPage": {
            	Prop: ["title", "showNavButton"],
            	Aggr: ["semanticControls", "content"]
            },

            "sap.m.semantic.DetailPage": {
            	Prop: ["title", "showNavButton"],
            	Aggr: ["semanticControls", "content"]
            },

            //  -- comp
           	"sap.ui.comp.smartfilterbar.SmartFilterBar": {
           		Prop: ["id", "entityType"],
           		Aggr: ["controlConfiguration"]
           	},

           	"sap.ui.comp.smartfilterbar.ControlConfiguration": {
           		Prop: ["key"],
           		Aggr: []
           	},
           	"sap.ui.comp.smarttable.SmartTable": {
           		Prop: ["entitySet", "tableType", "header", "smartFilterId"],
           		Aggr: ["items"]
           	},
           	
           	"sap.ui.table.AnalyticalTable": {
           		Prop: [ "selectionMode"],
           		Aggr:  [ "columns" ]  
            },
            "sap.ui.table.Table": {
           		Prop: [ "selectionMode"],
           		Aggr:  [ "columns" ]  
            },
            "sap.ui.table.AnalyticalColumn": {
            	Aggr: ["label", "template"]
            },
 			"sap.ui.table.Column": {
            	Aggr: ["label", "template"]
            },
		},

		aSpecialAggrNode: ['customFooterContent']
	},	
	
	
	getDefaultInsertForClass: function(cls) {
		if ( cls in this.mCfg.defaultInsert) {
			return this.mCfg.defaultInsert[cls];
		}
		return null;
	},
	
	_bFiori: false,
	/*
	<core:View controllerName="view.name" xmlns:core="sap.ui.core"
		xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.commons" xmlns:table="sap.ui.table"
		xmlns:html="http://www.w3.org/1999/xhtml">
		*/
	_bSupportCustomerControl: true
};