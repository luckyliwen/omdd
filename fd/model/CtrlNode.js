jQuery.sap.declare('fd.model.CtrlNode');
jQuery.sap.require('sap.ui.commons.TreeNode');

//the global preview class index
fd.model.gPreviewClassIdx = 0;
var gtrid = 0;

/**
 * This class will contain all the information for a "Control". As it need
 * display as a Tree, so have two method: A: Use one class just contain the
 * control information, and put in a map, then from the TreeNode like to to this
 * map B: Extend the TreeNode
 * 
 * Method B is more simple
 */
sap.ui.commons.TreeNode.extend("fd.model.CtrlNode", {
	metadata : {
		properties : {
			//!! all start by node in order to avoid confilct
			//the control name, such as sap.m.Button
			nodeName: 	  { type: "string"},  
			nodeType: {type: "string", defaultValue: ""},

			//now only used for preview tree node, as need get the original node
			mappingNodePath: {type: "string", defaultValue: null},
			
			controllerName: {type:"string", defaultValue: ""},
			fragmentName : {type:"string", defaultValue: ""},
			
			//??only used for xml export , check later 
			xmlNodeNs:    { type:"string"},
			xmlNodeName:  { type:"string"},
			
			//use defined the default aggr, only valid for html view by "data-sap-ui-default-aggregation
			customizeDftAggr: {type:"string", defaultValue: ""},
			
			//for ui5 whether can found the class
			foundClass :   { type:"boolean", defaultValue: true},
			
			isFragment : { type: "boolean", defaultValue: false}, //only valid for the RootNode

			//===for the preview
			placeHolderNode :   { type:"any", defaultValue: null},
			
			previewClassName: {type:"string", defaultValue: ""},
			
			//used for generate demo data, now like {modelName: "", path: ""},
			//for the initial phase, set to null, once finished finding, then set to default value so later no need search again
			bindingParentInfo: { type:"any"},  
			
			//the value for change prop value dynamic
			debugData :   { type:"any", defaultValue: null},

			// for validation node itself
			invalidNode: {type:"string", defaultValue: ""},
			//for validation node prop or event
			invalidMeta: {type:"string", defaultValue: ""},
			errorCount: {type: "int", defaultValue: "0"}, //the error count for meta
			//used to identify the treenode
			// uniqueId: {type: "string"},
			// bAddCustomData: {}
		},

		/*aggregations : {
	    	"props" : {type : "object", multiple : true, singularName : "prop"},
	    	"aggrs"  : {type : "object", multiple : true, singularName : "aggrs"},
	    	"assos" : {type : "object", multiple : true, singularName : "aggs"},
		},
		*/
		
		events : {}
	},
	
	safePush: function( arr, nameValue, entry) {
		var pos = arr.sapIndexOf("name", nameValue);
		if (pos == -1) {
			arr.push( entry );
		} else {
			// for the aggr node, the prop will add once, but later for the default aggr node need add also, so here no need report warn
			// fd.assert(false, "Insert mutiple times");
		}
	},
	

	/**
	 * Means now only know the name, then the CtrlNode need find out the type, alt type by itself, mailly use when 
	 * add a aggr node smartly
	 * @param name
	 * @param forConvert
	 */
	addAggrMetaDataByName: function(name, forConvert) {
		//??
		//name,type,altTypesStr, value, forConvert
		var types = fd.model.Metadata.getAggrTypeInfo( this.getNodeName(), name);
		
		this.addAggrMetaData(name, types[0], types[1], types[2], "", forConvert);
	},
	
	//only the Aggr have the altTypes, so just add a shortcut for it
	addAggrMetaData: function(name, type, altTypesStr, multiple, value,  forConvert) {
		var entry={};
		entry.name      = name ;
		
		if (forConvert) {
			entry.fastValue = value;
		} else {
			entry['type'] = type ;
			entry['altTypesStr'] =  (altTypesStr == undefined) ? "": altTypesStr ;
			entry['value'] = (value == undefined) ? "":value ;
			entry['multiple'] = multiple;
		}
		
		this.safePush(this.mData['Aggr'], name, entry);
	},
	
	/**
	 * 
	 * @param meta
	 * @param name
	 * @param type
	 * @param value
	 * @param forConvert  if not set then is add normal
	 */
	addMetaData: function(meta, name,type,value, forConvert) {
		var entry={};
		
		if ( name==="xmlns" && meta === "Prop") {
			//!! now we just put all the xmlns to the top, so here if meet we just ignore it, otherwise it is too complex 
			//!! as for different scope the default xmlns is different 
			return;
		}

		if (forConvert) {
			entry.name      = name ;
			entry.fastValue = value;
		} else {
		
			//depend on different type, need set different default value
			entry['name'] = name ;
			if ( type != "")
				entry['type'] = type ;
			
			//some default value
			if (meta == fd.MetaType.Prop) {
				//entry = {paths: "", formatter:""};
				//??later may use the ui5 implementation
				var complexValue = fd.util.parseBindingInfor(value);
				
				entry = $.extend( entry, complexValue);
				var dftValue = fd.model.Metadata.getPropDefaultValueByName( this.getNodeName(), name);
				entry.defaultValue = dftValue;

			} else if (meta == fd.MetaType.Event) {
				//listener:"", data: ""  for xmlviw only function supported
				//?? just use value for simple entry = {func: ""};
				
				entry.value = value ;
				
			} else if (meta == fd.MetaType.Asso) {
				entry.value = value ;
			} else if (meta == fd.MetaType.Aggr) {
				//??for aggr, how to add value
				//entry = {id: ""};
				entry.value = value ;
			} else {
				entry = {};
			} 
			
			//As the value type is different, so can't just pass the value otherwise it can't pass check. 
			//??need type also
			//entry.value = ( (value != undefined) && (value != null)) ? value: "";
			//entry.value = value; //if user not set then let it be, later it can get the default value if any
		}
		
		//??the controller name may get from the prop, so need set if not here
		if (meta == fd.MetaType.Prop ) {
			if (name === "controllerName") {
				this.setControllerName(value);
			} else if ( name === "fragmentName") {
				this.setFragmentName(value);
			}
		} 
		
		this.safePush(this.mData[meta] , name, entry);
	},
	
	/**
	 * For the format convert, no need detail information, just save 
	 * @param meta
	 * @param name
	 * @param type
	 * @param value
	 */
	addMetaDataForConvert: function(meta, name,value) {
		var entry={};
		
		//some default value

		//depend on different type, need set different default value
		entry['name'] = name ;
		
		//As the value type is different, so can't just pass the value otherwise it can't pass check. 
		//??need type also
		//entry.value = ( (value != undefined) && (value != null)) ? value: "";
		entry.fastValue = value; //if user not set then let it be, later it can get the default value if any
		
		this.safePush(this.mData[meta] , name, entry);
	},
	
	/**
	 * Change the meta data
	 * @param meta
	 * @param idx
	 * @param name
	 * @param value
	 */
	changeMetaData: function(meta,idx, name,value) {
		
		//the controller name may get from the prop, so need set if not here
		if (meta == fd.MetaType.Prop ) {
			if ( this.mData[meta][idx]["name"] === "controllerName" ) {
				this.setControllerName(value);
			} else if (this.mData[meta][idx]["name"] === "fragmentName") {
				this.setFragmentName(value);
			}
		}
		
		this.mData[meta][idx][name] = value;
	},


/*extraStr: "
"formatter: "
"name: "controllerName"
paths: ""
tooComplex: false
type: "string"
value: "list_ObjectItem"*/
	
	//
	
	/**
	 * now used from the preview change value back, as it only know the name and value, so need check whether is add or change
	 * @param  {[type]} name  [description]
	 * @param  {[type]} type  [description]
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	mergePropMetaData: function( name, type,value ) {
	    var pos = this.mData.Prop.sapIndexOf("name", name);
	    if (pos !== -1 ) {
	    	this.mData.Prop[ pos ]["value"] = value;
	    } else {
	    	//!! later check the default value 
	    	var dftValue = fd.model.Metadata.getPropDefaultValueByName( this.getNodeName(), name);
	    	var entry = {
	    		name : name,
	    		type : type,
	    		value : value,
	    		defaultValue: dftValue,
	    	};
	    	this.mData.Prop.push(entry);
	    }
	},

	// now this is called from the Paste, need ensure that the name and type can mapping
	pastePropMetaData: function( aEntry ) {
		for (var i=0; i < aEntry.length; i++) {
			var  entry = aEntry[i];
		    
		    //only when the name and type match, then can add 
		    if (fd.model.Metadata.isMatchedPropByNameAndType( this.getNodeName(), entry.name, entry.type )) {
			    var pos = this.mData.Prop.sapIndexOf("name", entry.name);
			    if (pos !== -1 ) {
			    	this.mData.Prop[ pos ]["value"] = entry.value;
			    	this.mData.Prop[ pos ]["formatter"] = entry.formatter;
			    	this.mData.Prop[ pos ]["extraStr"] = entry.extraStr;
			    } else {
			    	this.mData.Prop.push(entry);
			    }
			}
		}
	},

	
	getPropEntryByName: function( prop ) {
	    var pos = this.mData.Prop.sapIndexOf("name", prop);
	    if (pos === -1) {
	    	return null;
	    } else {
	    	var entry = this.mData.Prop[pos];
	    	return {
	    		value: entry.value,
	    		paths: entry.paths,
	    		formatter:  entry.formatter 
	    	};
	    }
	},
	
	
	//!! later we can add more nested structure
	addDefaultInformations: function() {
		var mDft = fd.cfg.getDefaultInsertForClass( this.getClassName());
		if (!mDft)
			return;
		
		var clsMeta = fd.model.Metadata.getMetadataForControl(this.getClassName());
		if ( !clsMeta)
			return;
			
		for ( var key in fd.MetaType) {
			var meta = fd.MetaType[key];
			
			if ( ( meta in mDft) && mDft[meta].length ) {
				
				for ( var i = 0; i < mDft[meta].length; i++) {
					var name = mDft[meta][i];
					
					//as the control may change in new version,so some default aggr/prop may not existed in new version, 
					//so need co check 
					if ( name in clsMeta[meta]) {
						if (meta == fd.MetaType.Aggr ) {
							this.addAggrMetaData(name, 
									clsMeta[meta][name].type,
									clsMeta[meta][name].altTypesStr,
									clsMeta[meta][name].multiple,
									"",
									false);
							
							//for the aggr, need check whether need add the node also
							if ( clsMeta[meta][name].altTypesStr == "" ) {
								var newTn = new fd.model.CtrlNode( {
									nodeType: fd.NodeType.Aggr,
									nodeName: name,
								});
								newTn.doInit();
								this.addNode(newTn);
							} //end of if ( clsMeta[meta].altTypesStr == "" )
						} else {
							this.addMetaData(meta, name, 
									clsMeta[meta][name].type,
									"",
									false);
						}
					}
				}
			}	
		}
		
	},
	
	
	
	/**
	 *
	 * @param meta
	 * @param aIdx:  The index array of the mData, may like 1,3, 5
	 * @return:  The array of deleted entries's name ( it can help for the choice part)
	 */
	delMetaData: function(meta, aIdx) {
		//so first need sort it
		var arr = aIdx.sort();
		var ret=[];
		 
		var entry;
		//need from big to small in order to keep the previous index still valid
		for (var i=arr.length-1; i>=0; i--)  {
			var idx = arr[i];
			if ( idx < this.mData[meta].length) {
				//when del the controllName, then need update the controllName also 
				if (meta === "Prop") {
					if ( this.mData.Prop[idx].name === "controllerName") {
						this.setControllerName(null);
					}
				}
				entry = this.mData[meta].splice( idx, 1);
				ret.push( entry[0].name);
			} else {
				fd.assert(false, "call delMetaData try to del Meta not existed");
			}
		}
		
		return ret;
	},
	
	delAllMetaData: function(meta, name) {
		//here if for the controller name then need update also
		if ( meta === "Prop") {
			if ( this.isRootNode()) {
				this.setControllerName(null);
			}
		}
		this.mData[meta] = [];
	},
	
	/*
	//As we need use the data bind to show all the metadata, so need use json data instead of use the sapui5 extend mechanism to generate method
	mData: {
		"Prop": [
			//like  {name:"title",  value: ""} 
			
		],
		
		"Aggr" : [
		          
			
		],
		
		"Event": [
			
		],
		
		"Asso": [
			
		],
	},
	*/
	
	//some help function 
	isRootNode: function() {
		return this.getNodeType() == fd.NodeType.Root;
	},

	//!!!! only have meeting for top node
	isFragment: function() {
		return this.getIsFragment();
	},


	
	isHtmlNode: function() {
		return this.getNodeType() == fd.NodeType.Html;
	},
	
	isUi5Node: function() {
		return this.getNodeType() == fd.NodeType.Ui5;
	},
	
	isUi5FragmentNode: function(  ) {
	    return this.isUi5Node() && this.getNodeName() === fd.StrFragment;
	},
	
	isUi5ExtPoint: function( evt ) {
		return this.isUi5Node() && this.getNodeName() === fd.StrExtPoint;   
	},
	  

	isRootOrHtmlNode: function() {
		return this.getNodeType() == fd.NodeType.Root || this.getNodeType() == fd.NodeType.Html;
	},
	
	isAggrNode: function() {
		return (this.getNodeType() == fd.NodeType.Aggr);
	},
	
	isAggrNodeOfName: function(name) {
		return (this.getNodeType() == fd.NodeType.Aggr) &&
			   (name == this.getNodeName());
	},

	getClassName: function() {
		if ( this.isRootNode() ) {
			if ( this.isFragment())
				return fd.StrFragmentDefinition;
			else 
				return fd.StrCoreView;
		} else if ( this.isUi5Node()) {
			return this.getNodeName();
		} else if ( this.isHtmlNode()) {
			return "HTML tag " + this.getNodeName();
		} else {
			fd.assert(false, "for aggr, shoult not call this");
		}
	},
	
	//now just share same marking with the node itsel, later can use different symbol
	markMetaInvalid: function(flag, detailText) {
		var tooltip= this.getText();
		if (flag) {
			this.setInvalidMeta(detailText);
			if ( this.getInvalidNode()) {
				tooltip = this.getInvalidNode() + "\r\n" + detailText;
			} else {
				this.addOrRemoveInvalidCustomData(true);
				tooltip = detailText;
			}
		} else {
			this.setInvalidMeta("");
			if ( this.getInvalidNode()) {
				tooltip = this.getInvalidNode() ;
			} else {
				this.addOrRemoveInvalidCustomData(false);
			}
		}
		this.setTooltip(tooltip);
	},

	

	//use to mark the node itself invalid
	markNodeInvalid : function(flag, invalidText) {
		this.addOrRemoveInvalidCustomData(flag);

		if ( flag) {
			this.setProperty('invalidNode', invalidText, true);
		} else {
			this.setProperty('invalidNode', "", true);
		}

		if ( flag) {
			this.setTooltip(invalidText);
		} else {
			this.setTooltip( this.getText());
		}
	},
	
	addOrRemoveInvalidCustomData : function( bAdd ) {
		if (bAdd) {
		    var customData =  new sap.ui.core.CustomData({
						writeToDom: true, 
						key: "fd-invalid", 
						value: "yes"
			});
			this.addCustomData(customData );
		} else {
			if (this.data("fd-invalid")) {
				//try to remove it
				this.removeAllCustomData();
			}
			// this.invalidate();
		}
	},

	//As when call the init, the passed parameter can't get, so need call it manually
	doInit: function() {
		//each node add a unique id to dom, so when do validate, can easily know it
		// var uniqueId = fd.getNextTreeNodeIndex();
		// this.setUniqueId( uniqueId);
		/*this.addCustomData(
			 new sap.ui.core.CustomData({
					writeToDom: true, 
					key: "FDTreeNode", 
					value: uniqueId
		}) );*/

		//need generate new instance, otherwise all the CtrlNode will share same
		this.mData =  {
			"Prop": [ 
				//like  {name:"title",  value: ""} 
			],
			
			"Aggr" : [ ],
			
			"Event": [],
			
			"Asso": [ ],
			//for the root and html node
			'Extra' : []
		};
		
		//from the name/nodetype, decide the text and icon
		//??later need add icon
		var text = "";
		var name = this.getNodeName();
		
		if ( this.getNodeType() == "") {
			this.setNodeType( fd.util.getNodeTypeByName(name));
		}
		
		switch (this.getNodeType()) {

			case fd.NodeType.Root:
				if (! this.isFragment()) {
					this.setNodeName(fd.StrCoreView);
					text = fd.StrCoreView;
					this.setIcon("sap-icon://documents");
				} else {
					this.setNodeName(fd.StrFragmentDefinition);
					text = fd.StrFragmentDefinition;

					this.setIcon("sap-icon://document");
				}
				
				//??for the Fragment, how to deal the controller name?
				//for the Root, may define the controlerName, if so then set here, so later can use the unify way to export property
				var ctrlname = this.getControllerName() ; 
				if ( ctrlname != "") {
					this.safePush(this.mData["Prop"] ,"controllerName", 
							{ name:"controllerName", type:"string",  value: ctrlname} );
				}
				break;
			case fd.NodeType.Ui5:
				text = name.sapLastPart();
				if (name === fd.StrFragment) {
					this.setIcon("sap-icon://document");
				} else if ( name === fd.StrExtPoint) {
					this.setIcon("sap-icon://edit-outside");
				} else {
					var iconUrl = fd.model.ImageMng.getControlIcon(name);
					if (iconUrl) {
						this.setIcon(iconUrl);
					}
				}
				break;
			case fd.NodeType.Html:
				text = name;
				break;
			case fd.NodeType.Aggr:
				text = "{ " + name + " }";
				break;
			default:
				break;
		}
		
		this.setText(text);
		//??icon later
		
		if (this.isUi5Node()) {
			//just try to get the metadata
			this.setFoundClass(  fd.model.Metadata.canFindClass( this.getClassName()));
		}
	},

	createSpecialClassForNavigation :  function() {
		fd.model.gPreviewClassIdx = fd.model.gPreviewClassIdx + 1;
		return "gfdPreview_" + fd.model.gPreviewClassIdx; 
	},
	
	
	/**
	 * If exists the class then add to the end, otherwise just add new
	 * @param arr
	 */
	addSpecialClassForNavigation: function(arr) {

		//for the aggr node, no need
		if ( this.isAggrNode())
			return;
		
		var navCls = this.createSpecialClassForNavigation();
		//also save it 
		this.setPreviewClassName(navCls);
		
		for ( var i = 0; i < arr.length; i++) {
			var entry = arr[i];
			
			if ("class" in entry ) {
				entry['class'] = entry['class'] + "  " + navCls;
				return;
			}
		}
		
		//just append 
		arr.push( {'class': navCls});
	},
	
	getPropArrayFastMode : function() {
		var arr = [];
		
		//prop
		for ( var i = 0; i < this.mData.Prop.length; i++) {
			var m = this.mData.Prop[i];
			
			//used to control different option: only value, path, or parts, or path+formatter, or parts+formatter
			var entry = {};
			
			//check parts:
			var paths = "";
			
			//for the CSSSize special property, if is path then need igore it as normally it create the value by formater
			if (m.paths  && m.paths!= "") {
				
				//for the checkable prop ( such as CSSSize) the psuedo prop can't pass check so just ignore it
				/*if ( fd.model.EnumMng.isCheckableProp( m.type ) ) {
					continue;
				} else if ( fd.model.EnumMng.isEnumableProp(m.type)) {
					continue;
				}*/
				var propType = fd.model.EnumMng.getPropType(m.type);
				//only when is pure string type can set 
				
				if (propType == fd.PropType.String) {
					//number inside the string 
					if ( ! fd.model.EnumMng.isNumberProp(m.type)){	
						paths = m.paths.trim();
						entry[ m.name] =  "::" + paths + "::";
					}
				}
			} else {
				entry[ m.name] = m.value;
			}
			arr.push(entry);
		}
		
		//here need add the special class for later easy navigation
		this.addSpecialClassForNavigation(arr);
		
		//for the aggr only need those alter types
		for (  i = 0; i < this.mData.Aggr.length; i++) {
			m = this.mData.Aggr[i];
			
			//then the value not null, no need the altTypesStr
			if ( m.value!="" && m.altTypesStr!="") {
				entry = {};
				entry[ m.name] =  m.value;
				arr.push( entry); 
			}
		}
		
		//Asso, just value as id
		for ( i = 0; i < this.mData.Asso.length; i++) {
			m = this.mData.Asso[i];
			
			var assoEntry = {};
			assoEntry[ m.name] = m.value;
			
			arr.push( assoEntry);
		}
		
		//??for the extra attribute, main for the root and html
		return arr;
	},
	
	/**
	 * Return the array for export, like [ {title:"my title"}, need considerate some property have the value, parts, formatter
	 */
	getPropArray : function( mCfg) {
		var arr = [];
		
		//prop
		for ( var i = 0; i < this.mData.Prop.length; i++) {
			var m = this.mData.Prop[i];
			
			//used to control different option: only value, path, or parts, or path+formatter, or parts+formatter
			var entry = {};
			
			//for convert
			if ("fastValue" in m ) {
				entry[ m.name] =  m.fastValue;
				arr.push( entry); 
				continue;
			}
			
			
			//check parts:
			var paths = "";
			if (m.paths  && m.paths!= "") {
				paths = m.paths.trim();
			}
			if ( paths != "") {
				//{parts:[{path:'birthday/day'},{path:'birthday/month'},{path:'birthday/year'}]
				//or path :"cart>PictureUrl",
				
				var aPart = paths.split(',');
				var realParts = [];
				for ( var idx = 0; idx < aPart.length; idx++) {
					var path = aPart[idx].trim();
					if (path !="") {
						realParts.push( path);
					}
				}
				
				if (realParts.length >1) {
					//use parts,like [{path:'birthday/day'},{path:'birthday/month'},{path:'birthday/year'}],
					var strVal = "[";
					for ( idx = 0; idx < realParts.length; idx++) {
						path = realParts[idx];
						//create like {path:'birthday/day'}
						strVal += "{ path: '" + path + "'},";
					}
					//just remove the last ,
					strVal = strVal.substr( 0, strVal.length-1);
					strVal += "]";
					
					entry.parts = strVal;
					
					
				} else if (realParts.length == 1) {
					//just one value, juse simple way
					entry.path = "'" + realParts[0] + "'";
				} else {
					fd.assert(false, "just , need checked out before");
				}
			} //end of if ( paths != "")
			
			//like  {name:"title",  value: ""} 
			var formatter = "";
			if (m.formatter && m.formatter!="") {
				formatter = m.formatter.trim();	
			}
			
			if (formatter != "") {
				entry.formatter = "'" + formatter + "'";
			}
			
			//paths: "", formatter:""
			//??now if it is an property binding, must put it under the"parts", not support write {tile} in value 
			var keyCnt = fd.util.getKeyCount(entry);
			
			var propEntry = {};
			if (keyCnt == 2) {
				//both, then it will like { path: "", formatter:""}
				propEntry[ m.name] = this.encodingPartsFormatter(entry);
			} else if (keyCnt ==1) {
				//ony one, must be parts or path
				//??propEntry[ m.name] = this.encodingPartsFormatter(entry);
				
				//?? only one, then is the path, for the simple case, just {} in enough
				fd.assert("path" in entry ||"parts" in entry);
				
				if ( m.extraStr == "") {
					//if only path, then just {}
					if ("path" in entry ) {
						propEntry[ m.name] = "{" + entry.path.sapPureName() + "}";
					} else {
						//parts, 
						propEntry[ m.name] = this.encodingPartsFormatter(entry);
					}
				} else {
					//has extra, so can't use simple way
					propEntry[ m.name] = this.encodingPartsFormatter(entry);
				}
				
				fd.assert( !('formatter' in entry), "Only format, not parts??");
			} else {
				propEntry[ m.name] = m.value;
			}
			
			//?? only when it has the extraStr and others also is complex, then will combine them together
			if ( m.extraStr   && m.extraStr != "") {
				var valueStr = propEntry[ m.name];
				
				if ( valueStr[0] =="{"  && valueStr.slice(-1)=='}' ) {
					//just insert it 
					valueStr = valueStr.sapRemoveLast(1);
					valueStr +=',' +  m.extraStr +"}";
					
					propEntry[ m.name] = valueStr;
				} else {
					//Only the extra can ??
					fd.assert( false, "value + extra??");
					propEntry[ m.name] ="{" +  m.extraStr +"}";
				}
			}
			
			arr.push(propEntry);
		}
		
		//for the aggr only need those alter types
		for ( i = 0; i < this.mData.Aggr.length; i++) {
			m = this.mData.Aggr[i];
			
			//for convert
			if ("fastValue" in m ) {
				entry = {};
				entry[ m.name] =  m.fastValue;
				arr.push( entry); 
				continue;
			}
			
			//then the value not null, no need the altTypesStr
			if ( m.value!="") {
				entry = {};
				entry[ m.name] =  m.value;
				arr.push( entry); 
			}
		}
		
		//add class for easy nivigation
		if ( mCfg && mCfg.preview) {
			this.addSpecialClassForNavigation(arr);
		}
		
		//events
		for ( i = 0; i < this.mData.Event.length; i++) {
			m = this.mData.Event[i];
			
			//for convert
			if ("fastValue" in m ) {
				entry = {};
				entry[ m.name] =  m.fastValue;
				arr.push( entry); 
				continue;
			}
			
			
			 //{func: "", listener:"", data: ""};
			m.value =  m.value ? m.value.trim() : "";
			if ( m.value == "") {
				fd.assert( false, "Function can't be empty");
				continue;
			} else {
				var eventEntry = {};
				eventEntry[ m.name] = m.value;
				
				arr.push( eventEntry);
			}
		}
		
		//Asso, just value as id
		for ( i = 0; i < this.mData.Asso.length; i++) {
			m = this.mData.Asso[i];
			
			//for convert
			if ("fastValue" in m ) {
				entry = {};
				entry[ m.name] =  m.fastValue;
				arr.push( entry); 
				continue;
			}
			
			var assoEntry = {};
			assoEntry[ m.name] = m.value;
			
			arr.push( assoEntry);
			
		}
		
		
		//??for the extra attribute, main for the root and html
		
		return arr;
	},
	
	/**
	 * map like { path: "", formatter: ""}
	 * need return like: 
	 * {parts:[{path:'birthday/day'},{path:'birthday/month'},{path:'birthday/year'}], 
					formatter:'my.globalFormatter'}
	 * 
	 * use the JSON.stringfy it like "{"parts":[{"path":"birthday/day"},{"path":"birthday/month"},{"path":"birthday/year"}],"formatter":"my.globalFormatter"}"
	 * so must do it by myself
	 */
	encodingPartsFormatter: function(map) {
		var ret = "{";
		for ( var key in map) {
			var val = map[key];
			
			//??for parts, still ok??
			ret += key + ":" + val + ",";
		}
		
		//remove last ,
		ret = ret.substr(0, ret.length-1);
		ret += "}";
		
		return ret;
	},
	
	/**
	 * For all the sub node, find by name, main used to check the default aggr
	 * @param name
	 */
	getSubNodeByName: function(name) {
		var arr = this.getNodes();
		for ( var i = 0; i < arr.length; i++) {
			var subNode = arr[i];
			
			if (subNode.getNodeName() == name)
				return subNode;
		}
		
		return null;
	},
	
	//??here need directly get from the Metadata, need change later
	/**
	 * 
	 */
	getUi5Metadata: function() {
		if ( this.isUi5Node()) {
			var cmd = this.getNodeName() + ".getMetadata()";
			//now can't directly do the eval, as it may not existed
			try {
				return eval( cmd);
			} catch ( ex) {
				fd.assert(false, "Run cmd " + cmd + " error due to " + ex);
				return null;
			}
		} else {
			return null;	
		}
		
	},
	
	/**
	 * If one multiple binding not set in the aggregation, then add that to the path
	 * @param ctrlInfo: 
	 */
	getControllerInfo: function(ctrlInfo) {
		
		this.setBindingParentInfo( null);
		//first add this, then the childens
		this.addControlInforForNode(ctrlInfo);
		
		var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			node.getControllerInfo(ctrlInfo);
		}
		return ctrlInfo;
	},
	
	_splitBindingInfo: function(path) {
		var bindInfo = 	{modelName: "", path: ""};
		var pos = path.indexOf('>');
		if (pos == -1) {
			bindInfo.path = path.trim();
		} else {
			bindInfo.modelName= path.substr(0, pos).trim();
			bindInfo.path= path.substr(pos+1).trim();
		}
		return bindInfo;
	},
	
	/**
	 * Get the aggregation binding information for generate the demo data
	 * @param  {[type]} ctrlInfo [description]
	 * @return {[type]}          [description]
	 */
	checkMultipleBinding: function(ctrlInfo) {
		
		var bindInfo = this.getBindingParentInfo();
		if (bindInfo) 
			return bindInfo;
		
		//else first set the initial info
		bindInfo = 	{modelName: "", path: ""};
		
		//get parent, if is aggr and multiple, then check the corresponding name
		var parent = this.getParent();
		while (true) {
			if ( parent.isRootNode() )
				break;
			
			// ?? logic not clear now, 
			//so if found one is aggr and multiple, and have the aggr value, then add, other just ignore it
			if ( parent.isAggrNode()) {
				//
				var parentParent = parent.getParent();
				
				//!!! it is not robust, need change later
				var aggrProp = null;
				var aggrNodeName = parent.getNodeName();
				//for normal binding, just use the Aggr node name, but for Table, now binding to rows, but the template defined by columns
				//then in this case, should use the mapping Aggr node rows
				if ( aggrNodeName=== "columns") {
					if (parentParent.getNodeName().indexOf("Table") !== -1) {
						aggrNodeName = "rows";
					}
				}

				var idx = parentParent.mData.Aggr.sapIndexOf('name', aggrNodeName);
				if (idx != -1) {
					aggrProp = parentParent.mData.Aggr [ idx];	
				}
				
				if (aggrProp && aggrProp.multiple) {
					//then the value
					var val = aggrProp.value.trim();

					if (val != "") {
						//use the regExp is more easy 
						var reg  = /path\s*\:\s*[\'\"]([^'"]+)[\'\"]/;
						var match = reg.exec(val);
						var bindPath = "";
						if (match) {
							bindPath = match[1];
						} else {
							//the simple way, just {/path}
							reg = /\{([a-zA-Z0-9_\/>]+)\}/;
							match = reg.exec(val);
							if (match) {
								bindPath = match[1];
							}
						}

						if (bindPath) {
							bindInfo = this._splitBindingInfo(bindPath);
							break;
						}
					} //end: if (val != "") {
				} //end: if (aggrProp && aggrProp.multiple)
			} //end: if ( parent.isAggrNode())
			
			parent = parent.getParent();
		}
		
		this.setBindingParentInfo( bindInfo );
		return bindInfo;
	},
	
	getParamByPathArray: function(arr) {
		var arrLastName = [];
		for ( var i = 0; i < arr.length; i++) {
			var path = arr[i];
			
			//if have > then omit the >, 
			var pos = path.indexOf(">");
			if (pos != -1) {
				path = path.substr(pos+1);
			}
			
			//if have / then get last
			var lastPos = path.indexOf("/");
			if (lastPos != -1) {
				arrLastName.push( path.substr(lastPos+1) );
			} else {
				arrLastName.push( path);
			}
		}
		return arrLastName.join(',');
	},
	
	addControlInforForNode: function(ctrlInfo) {
		//first check the prop
		//prop
		if ( ! this.isUi5Node()) {
			return;
		}
		
		for ( var i = 0; i < this.mData.Prop.length; i++) {
			var m = this.mData.Prop[i];
			
			//used to control different option: only value, path, or parts, or path+formatter, or parts+formatter
			var entry = {};
			
			//check parts:
			var paths = "";
			if (m.paths  && m.paths!= "") {
				paths = m.paths.trim();
			}
			if ( paths == "")
				continue;
			
			var aRealPath = [];
			
				//{parts:[{path:'birthday/day'},{path:'birthday/month'},{path:'birthday/year'}]
				//or path :"cart>PictureUrl",
				
			var aPart = paths.split(',');
			
			for ( var idx = 0; idx < aPart.length; idx++) {
				var path = aPart[idx].trim();

				//need ignore the special case like <Label text="{/#PaytProposal/RunDate/@sap:label}" />
				if (path.sapStartWith("/#"))
					continue;
				if (path !="") {
					aRealPath.push( path);
				}
			}
			if ( aRealPath.length === 0)
				continue;
			

			var propType = fd.model.EnumMng.getPropType(m.type);
			
			
			//and check the multiple binding??
			var bindInfo  = this.checkMultipleBinding(ctrlInfo);
			
			ctrlInfo.addDataBinding(aRealPath, bindInfo, propType);
			
			
			//like  {name:"title",  value: ""} 
			var formatter = "";
			if (m.formatter && m.formatter!="") {
				formatter = m.formatter.trim();	
			}
			
			
			if (formatter != "") {
				var param = this.getParamByPathArray(aRealPath);
				//??the last name same??
				if ( formatter[0] ==".") {
					ctrlInfo.addLocalFormatter(formatter.substr(1), param);
				} else {
					ctrlInfo.addExternalFormatter(formatter, param);
				}
			}
			
		}
		
		//then the event 
		//events
		for ( i = 0; i < this.mData.Event.length; i++) {
			m = this.mData.Event[i];
			
			//for convert
			m.value = m.value ? m.value.trim() : "";
			if ( m.value != "") {
				ctrlInfo.addEventHandler(m.value);
			} 
		}
	},
	
	/**
	 * [cloneAndApplyTemplate description]
	 * @param  {[type]} templateProperty : template property used to create nodes
	 * @param  {[type]} newProp          : the property which will be apply
	 * @return {[type]}                  [description]
	 */
	cloneAndApplyTemplate: function(templateProperty, newProp) {
	    var ret = this.cloneNode();
	    ret.applyTemplateChange(templateProperty, newProp);
	    return ret;
	},
	

	/**
	 * Close the node and all it's children
	 */
	cloneNode: function() {
		//first just clone the node itself, then clone all by iteration 
		var clone = this.cloneNodeWithoutChildren();
		
		var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			var subClone = node.cloneNode();
			clone.addNode(subClone);
		}
		
		return clone;
	},

	clearCheckHistory: function( ) {
		if (this.getInvalidNode()) {
			this.markNodeInvalid(false);
		}

		if (this.getInvalidMeta()) {
			this.markMetaInvalid(false);

			//prop and event clear
			if ( this.isUi5Node() || this.isRootNode()) {
				for (var idx=0; idx < this.mData.Prop.length; idx++) {
					var  prop = this.mData.Prop[idx];
					prop.invalid = "";
				}

				//then clear the event 
				for (var i=0; i < this.mData.Event.length; i++) {
					var event = this.mData.Event[i];
					event.invalid = "";
				}
			}
		}

	    //then the sub nodes 
	    var nodes = this.getNodes();
		for ( var k = 0; k < nodes.length; k++) {
			var node = nodes[k];
			node.clearCheckHistory();
		}
	},

	/**
	 * [doQuickFixForAll description]
	 * @return How many error have been fixed 
	 */
	doQuickFixForAll: function( mRet ) {
		if (!mRet) {
			mRet = {fixCount: 0};
		}

	    //then the sub nodes 
	    this.doQuickFixForNodeMeta(mRet);

	    var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			node.doQuickFixForAll(mRet);
		}
		return mRet.fixCount;
	},

	doQuickFixForNodeMeta: function( mRet ) {
	    if (this.getInvalidMeta()) {
	    	var totalFix = 0; 
	    	//here need from down to top, as some fix need delete the node,then by that way will ensure the position not collapse
	    	var idx = this.mData.Prop.length-1;
	    	for ( ; idx >=0; idx--) {
				var  prop = this.mData.Prop[idx];
				var  aSolution = prop.aSolution;
				if (aSolution && aSolution.length) {
					this.doQuickFixBySolution(aSolution, idx);
					mRet.fixCount++;

					totalFix++;
				}
			}

			//now fix several meta error, so need refresh the invalid mark
			if (totalFix) {
			    var errorCount = this.getErrorCount();
			    errorCount -= totalFix;
			    this.setErrorCount(errorCount);

			    if (errorCount === 0) {
			    	this.markMetaInvalid(false);	
			    } else {
			    	var errorStr = "Total " + errorCount + " error for property or events.";
					this.markMetaInvalid(true,errorStr);
			    }
			}
	    }
	},
	
	// -- this function will do quickFix by one property, trigger by the tooltip button
	//context:  sPath: "/Prop/1"}
	//action: "del" name: "lableFor"
	// action: "add" metaType: "Prop" name: "lableFor" value: "payingcompanyCode"
	// aSolution.push({ action: "chg", name: sPropertyName, value: aMatch[0]});
	doQuickFix: function( context) {
	    var arr = context.getPath().split("/");
	    //it like, so just shift to remove the first "" ["", "Prop", "1"]
	    arr.shift();
	    var mainIndex = arr[1];

	    var aSolution = context.getProperty("aSolution");
	    this.doQuickFixBySolution(aSolution, mainIndex);

	    //now fix a meta error, so need refresh the invalid mark
	    var errorCount = this.getErrorCount();
	    errorCount --;
	    this.setErrorCount(errorCount);

	    if (errorCount === 0) {
	    	this.markMetaInvalid(false);	
	    } else {
	    	var errorStr = "Total " + errorCount + " error for property or events.";
			this.markMetaInvalid(true,errorStr);
	    }
	},

	/**
	 * [doQuickFixBySolution description]
	 * @param  {[type]} aSolution   
	 *         mainIndex: the index of the prop/event 
	 * @return {[type]}           [description]
	 */
	doQuickFixBySolution: function( aSolution, mainIndex ) {
	    if (aSolution && aSolution) {
	    	for (var i=0; i < aSolution.length; i++) {
	    		var  solution = aSolution[i];

	    		switch ( solution.action) {
	    			case "del": 
	    				//just del itself 
	    				this.mData[solution.metaType].splice( mainIndex, 1);
	    				break;
	    			case "add": 
	    				//check which metaType it will add to
	    				var entry = { name: solution.name, value: solution.value};
	    				if (solution.paths) {
	    					entry.paths = solution.paths;
	    				} 
	    				if (solution.formatter) {
	    					entry.formatter = solution.formatter;
	    				}

	    				//the type, default and other value need query dynamic 
	    				var clsMeta = fd.model.Metadata.getMetadataForControl( this.getNodeName());
	    				if ( solution.metaType === "Prop") {
	    					entry.type = clsMeta.Prop[ solution.name].type;
	    					entry.defaultValue =  fd.model.Metadata.getPropDefaultValueByName( this.getNodeName(), solution.name);
	    				} else if (solution.metaType === "Asso") {
	    					entry.type = clsMeta.Asso[ solution.name].type;
	    				} 

	    				this.safePush(this.mData[solution.metaType] , solution.name, entry);
	    				break;
	    			case "chg": 
	    				//now just change value, and only for prop 
	    				this.mData.Prop[ mainIndex].value = solution.value; 
	    				break;
	    		}
	    	}
	    } 
	},
	
	

	/**
	 * Check the syntax and semantic for node
	 * @param  {[type]} mGlobal: which will hold some information need considerate for all the node, such as the id then need sure no duplidate
	 * @return {[type]}      [description]
	 */
	checkSemantic: function( mGlobal ) {
	    if ( !mGlobal) {
	    	mGlobal = { 
	    		errorCount: 0,
	    		aId: [], 
	    		aNode: [],  //the node with error
	    	};
	    }

	    this.checkSemantic_NodeSelf(mGlobal);
	    this.checkSemantic_PropAndEvent(mGlobal);
	    
	    //then the sub nodes 
	    var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			node.checkSemantic(mGlobal);
		}

		if (this.isRootNode()) {
			return mGlobal;
		}
	},
	
	checkSemantic_PropAndEvent : function( mGlobal ) {
		//try get the id and other prop
		var oldErrorCount = mGlobal.errorCount;

		if ( this.isUi5Node() || this.isRootNode()) {
			var clsMeta = fd.model.Metadata.getMetadataForControl( this.getNodeName());

			for (var idx=0; idx < this.mData.Prop.length; idx++) {
				var  prop = this.mData.Prop[idx];
				var  value = prop.value;

				//id need add to global so can check duplicate 
				if ( prop.name === 'id') {
					if ( ! fd.util.isValidId(value)) {
						mGlobal.errorCount ++;
						prop.invalid = "Invalid id";
					}

					if ( mGlobal.aId.indexOf( value ) === -1 ) {
						mGlobal.aId.push( value );
					} else {
						mGlobal.errorCount ++;
						prop.invalid = "Duplicate id";
					}
					continue;
				} else if ( prop.name === "class") {
					if ( ! fd.util.isValidCssClass(value)) {
						mGlobal.errorCount ++;
						prop.invalid = "Invalid css class";
					}
					continue;
				}

				//??here if some property have the paths, but name not correct, then it will be missed!!

				if ( prop.paths && prop.paths != "") {
					if ( ! fd.util.isValidBindingPath(prop.paths))  {
						mGlobal.errorCount ++;
						prop.invalid = "Invalid binding path";
						continue;
					}

					if (prop.formatter && prop.formatter != "") {	
						if ( ! fd.util.isValidFunction(prop.formatter))  {
							mGlobal.errorCount ++;
							prop.invalid = "Invalid formatter function name";
							continue;
						}
					}
				} else {
					//just value, use ui5 internal to do check 
					var aSolution = [];
					var error = fd.model.Metadata.checkPropertyValidation(clsMeta, prop.name, value, prop, aSolution);
					if (error) {
						mGlobal.errorCount ++;
						prop.invalid = error;
						if ( aSolution.length) {
							prop.aSolution = [];
							for (var iSol=0; iSol < aSolution.length; iSol++) {
								prop.aSolution.push( aSolution[iSol]);
							}							
						}
					}
				}
				
				//?? only when it has the extraStr and others also is complex, then will combine them together
				//if ( m.extraStr   && m.extraStr != "") {
				//}
			}

			//then check the event 
			for (var i=0; i < this.mData.Event.length; i++) {
				var event = this.mData.Event[i];
				//eveent name and value should be ok 
				if ( event.name in clsMeta.Event) {
					if ( !fd.util.isValidFunction(event.value)) {
						mGlobal.errorCount ++;
						event.invalid = "Invalid event function name";
					}
				} else {
					//!! as now when we can't get the meta info, then we put it into the property, so normally will not go here
					mGlobal.errorCount ++;
					event.invalid = "Invalid event name ";

					// var aEventSolution = [];
					// var error = fd.model.Metadata.getSimilarMetaInfor(clsMeta, event.name, event, aEventSolution);
					// if (error) {
					// 	prop.invalid += error;
					// 	if ( aEventSolution.length) {
					// 		event.aSolution = [];
					// 		for (var iEventSol=0; iEventSol < aEventSolution.length; iEventSol++) {
					// 			event.aSolution.push( aEventSolution[iEventSol])
					// 		}							
					// 	}
					// }
				}
			}
		}

		var errorCount = mGlobal.errorCount - oldErrorCount;
		if ( errorCount ) {
			//the node event or property have error, also mark it 
			this.setErrorCount(errorCount);
			var errorStr = "Total " + errorCount + " error for property or events.";
			this.markMetaInvalid(true,errorStr);
			if (mGlobal.aNode.indexOf(this) === -1) {
				mGlobal.aNode.push(this);
			}
		}
	},
	 
	checkSemantic_NodeSelf: function( mGlobal ) {
		var parentMeta;
		var parent;
		var aggrInfo;

	    if (this.isRootNode()) {
	    	//now for root node no need check 
	    } else if ( this.isAggrNode()) {
	    	parent = this.getParent();
	    	if ( !parent.isUi5Node()) {
	    		mGlobal.errorCount ++;
	    		this.markNodeInvalid(true, "Aggregation node only allow put into normal UI5 node");
	    		mGlobal.aNode.push(this);
	    	} else {
	    		//just check is a valid node or not 
	    		parentMeta = fd.model.Metadata.getMetadataForControl( parent.getNodeName());
	    		if (parentMeta) {
	    			aggrInfo = fd.model.Metadata.getClassAggrInfor( parent.getNodeName(), this.getNodeName());
	    			if ( !aggrInfo) {
	    				mGlobal.errorCount ++;
	    				this.markNodeInvalid(true, "Invalid Aggregation node for control " + parent.getNodeName());
	    				mGlobal.aNode.push(this);
	    			}
	    		}
	    	}
	    } else if ( this.isUi5Node()) {
	    	//check whether is valid candidate for the parent node 
	    	if ( this.isUi5FragmentNode() || this.isUi5ExtPoint() ) {
	    		//for the fragment it is very difficult  to get the real code so now just ignore it 
	    	} else {
		    	parent = this.getParent();
		    	if ( parent.isAggrNode()) {
					//!!now there are some controls which implemented itself logic for Aggr, for example the 
					// SemanticPage.prototype.addCustomFooterContent , then it means even the customFooterContent type is sap.m.Button
					// but now it can add all the controls, for this case just maintain it in cfg,
					if ( !  fd.cfg.isSpecialAggregationNode( parent.getNodeName())) {
			    		var parentParent = parent.getParent();
			    		if ( parentParent.isUi5Node()) {
							aggrInfo = fd.model.Metadata.getClassAggrInfor( parentParent.getNodeName(), parent.getNodeName());
							if (aggrInfo) {
								var aggrType = aggrInfo.type;
								if (!fd.model.Metadata.isValidCandidate( aggrType, this.getNodeName()) ) {
									mGlobal.errorCount ++;
									this.markNodeInvalid(true, "Invalid candidate for Aggregation node " + parent.getNodeName());
									mGlobal.aNode.push(this);
								}
							} else {
								console.error("!!why aggrInfo = fd.model.Metadata.getClassAggrInfor error");
							}
			    		}
			    	}
		    	}	
	    	}
	    }
	},
	
	
	/**
	 * need check whether the node and sub-nodes only contain one path
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	canApplyTemplate: function( evt ) {
	    return true;
	},

	canAddExtension: function( evt ) {
		return true;
		//!! need more strict judge
	    // return  this.isRootNode() || 
	    // 		this.isAggrNode() || ;
	},

	canAddFragment : function( evt ) {
	    //??;
	    return true;
	},
	
			
	
	/**
	 * use the newProp to replace old prop, now only support odata, need considerate following:
	 * Prop:  paths,  value: (like {})
	 * Aggr:  value
	 * @param  {[type]} newProp [description]
	 * @return {[type]}         [description]
	 */
	applyTemplateChange: function( templateProperty, newProp ) {
		this._applyTemplateForTop(templateProperty, newProp);

	    var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			node.applyTemplateChange(templateProperty, newProp);
		}
		
		return this;
	},

	//!!just use the regexp to do replace 
	_applyTemplateForTop: function(templateProperty,  newProp ) {
		//for prop
		var regexp = new RegExp(templateProperty, 'g');

	    for (var i=0; i < this.mData.Prop.length; i++) {
	    	var  prop = this.mData.Prop[i];
	    	if (prop.paths) {
    			prop.paths = prop.paths.replace( regexp, newProp);
	    	}

	    	if (prop.value) {
	    		prop.value = prop.value.replace( regexp, newProp);
	    	}
	    	//??
	    }

	    //for aggr
	    /*for (i=0; i < this.mData.Aggr.length; i++) {
	    	var  aggr = this.mData.Aggr[i];
	    	if (aggr.value) {
	    		//same way as the match 
	    		match = aggr.value.match(reg);
	    		if (match) {
	    			aggr.value ="/#{0}/{1}/@sap:label".sapFormat( match[1], newProp);
	    		} 
	    	}
	    }
        */
	},
	

	_applyTemplateForTop_old: function(templateProperty,  newProp ) {
		var reg = new RegExp("/#([^/]+)/([^/]+)/@sap:label");
		//for prop
	    for (var i=0; i < this.mData.Prop.length; i++) {
	    	var  prop = this.mData.Prop[i];
	    	if (prop.paths) {
	    		//check for the label 
	    		var match = prop.paths.match(reg);
	    		if (match) {
	    			prop.paths ="/#{0}/{1}/@sap:label".sapFormat( match[1], newProp);
	    		} else {
	    			prop.paths = newProp;
	    		}
	    	}

	    	if (prop.value) {
	    		if (prop.value.sapStartWith("\{")) { 
	    			alert("now complex value not support");
	    		} else {
	    			prop.value = newProp;
	    		}
	    	}
	    	//??
	    }

	    //for aggr
	    for (i=0; i < this.mData.Aggr.length; i++) {
	    	var  aggr = this.mData.Aggr[i];
	    	if (aggr.value) {
	    		//same way as the match 
	    		match = aggr.value.match(reg);
	    		if (match) {
	    			aggr.value ="/#{0}/{1}/@sap:label".sapFormat( match[1], newProp);
	    		} 
	    	}
	    }

	},
	
	
		
	/**
	 * Just clone the node top most part
	 * @returns {___newNode0}
	 */
	cloneNodeWithoutChildren: function() {
		var newNode = new fd.model.CtrlNode(
				{
					nodeName: this.getNodeName(),
					nodeType: this.getNodeType(),
					text    : this.getText(),
					icon   : this.getIcon()
				}
		);
		newNode.doInit();
		
		newNode.mData = $.extend( true, {}, this.mData);
		
		//clone the data
		return newNode;
	},


	getMappingTreeNode: function( mappingNodePath ) {
	    if (mappingNodePath=== "")
	    	return this;

	    //then one by one drill down
	    var arr = mappingNodePath.split(",");
	    var firstPath = arr.shift();
	    var firstPos = parseInt(firstPath);

	    var subNode = this.getNodes()[ firstPos ];
	    var remainPath = arr.join(",");
	    return subNode.getMappingTreeNode( remainPath);
	},
	
	
	//??for safe, just copy the clone source code so it is free to change
	cloneForNavigation : function(mappingNodePath) {
		if ( !mappingNodePath )
			mappingNodePath = "";

		//first just clone the node itself, then clone all by iteration 
		var clone = this.cloneNodeWithoutChildren_Navigation(mappingNodePath);
		
		var nodes = this.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			//for the placeholder, as the original can't show so just use the placeholder
			if ( node.getPlaceHolderNode()) {
				node = node.getPlaceHolderNode();
			}
			var subMappingPath = mappingNodePath ? mappingNodePath + "," + i : "" + i;
			var subClone = node.cloneForNavigation(subMappingPath);
			clone.addNode(subClone);
		}
		
		return clone;
	},
	
	/**
	 * Just clone the node top most part
	 * @returns {___newNode0}
	 */
	cloneNodeWithoutChildren_Navigation: function(mappingNodePath) {
		var newNode = new fd.model.CtrlNode(
				{
					nodeName: this.getNodeName(),
					nodeType: this.getNodeType(),
					text    : this.getText(),
					icon   : this.getIcon(),

					mappingNodePath: mappingNodePath,
					
					//also the clss id 
					previewClassName: this.getPreviewClassName(),
				}
		);
		newNode.doInit();
		
		//no need data
		newNode.mData = null; 
		
		//clone the data
		return newNode;
	},
	

	//??for safe, just copy the clone source code so it is free to change
	createTreeTable : function(mappingNodePath, nodeTree, mUi5Node) {
		var bTopNode = false;
		if ( !mappingNodePath ) {
			mappingNodePath = "";
			nodeTree = {};
			mUi5Node = {};
			bTopNode = true;
		}

		//first just add the node self informaton
		nodeTree.nodeName = this.getNodeName();
		nodeTree.nodeIcon = this.getIcon();
		nodeTree.nodeType = this.getNodeType();
		nodeTree.mappingNodePath = mappingNodePath;
		nodeTree.existed = false; //means the prop
		//?? now directly format the AggrNode, later need considerate use the formatter 
		if ( this.isAggrNode()) {
			nodeTree.nodeName = "{" + this.getNodeName() + "}";
		}
		// nodeTree.value = "";
		
		//only the ui5 node will have id and prop
		if (this.isUi5Node()) {
			if (  nodeTree.nodeName in mUi5Node) {
				mUi5Node [ nodeTree.nodeName].count  ++;
			} else {
				mUi5Node [ nodeTree.nodeName] = { count: 1 , aProp: []};				
			}

			//try get the id and other prop
			for (var idx=0; idx < this.mData.Prop.length; idx++) {
				var  prop = this.mData.Prop[idx];
				var pos = mUi5Node [ nodeTree.nodeName].aProp.indexOf(  prop.name);
				if (pos === -1) {
					 mUi5Node [ nodeTree.nodeName].aProp.push( prop.name );
				}

				//id if for thei treeNode
				if ( prop.name === 'id') {
					nodeTree.id = prop.value;
				}
			}
		}
		
		var nodes = this.getNodes();
		if (nodes.length) {
			//init the parent placehold for children
			nodeTree.children = [];
		}
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			//for the placeholder, as the original can't show so just use the placeholder
			if ( node.getPlaceHolderNode()) {
				node = node.getPlaceHolderNode();
			}
			var subMappingPath = mappingNodePath ? mappingNodePath + "," + i : "" + i;

			//add empty node for it
			nodeTree.children.push( {});

			node.createTreeTable(subMappingPath, nodeTree.children[i], mUi5Node);
		}
		
		if (bTopNode) {
			//as only show the node sub nodes, so we remove the top node itself 
			if ( this.isUi5Node()) {
				if ( mUi5Node[ nodeTree.nodeName].count > 1) {
					mUi5Node[ nodeTree.nodeName].count --;
				} else if ( mUi5Node[ nodeTree.nodeName].count === 1) {
					delete mUi5Node[ nodeTree.nodeName];
				}
			}

			//first just for prompt
			var aControl = [ {key: "", text: "--Choose one Control--", text2: ""}];
			//create new data structure which contain the prop array
			var mControlProp = { empty: []  } ;  //the empty will be used for when not select any control

			for (var key in mUi5Node) {
				mControlProp[ key ] = [];

				for ( i=0; i < mUi5Node[key].aProp.length; i++) {
					prop = mUi5Node[key].aProp[i];
					mControlProp[key].push( { key: mUi5Node[key].aProp[i]});
				}	

				var count = mUi5Node[key].count;
				aControl.push({
					key: key, 
					text: key,
					text2: count
				});

			}

			//as it will use a list to show the controls, so conver it to an array`
			var ret = {
				mTree : nodeTree.children,
				aControl: aControl,
				mControlProp : mControlProp
			};
			return ret;			
		}
	},
	
	
	/*just use the html view, the content set class*/
	createFastModePlaceHolder : function() {
		var node = new fd.model.CtrlNode( {
			nodeName: "sap.ui.core.HTML",
			nodeType:  fd.NodeType.Ui5
		} );
		node.doInit();
		
		//just add two prop
		node.addMetaData(fd.MetaType.Prop,"class","string","FastModePlaceHolderControl", false);
		
		var str = "<div> Placeholder of <strong>" + this.getClassName() +  "</strong> as can't find class</div>"; 
		node.addMetaData(fd.MetaType.Prop,"content","string", str, false);
		
		//also set it
		this.setPlaceHolderNode( node );
		return node;
	},

	/**
	 * One time insert all nodes from array
	 * @param  {[type]} aNode [description]
	 * @param  {[type]} pos   [description]
	 * @return {[type]}       [description]
	 */
	insertNodes: function( aNode, pos ) {
	    var insertPos = pos;
	    for (var i=0; i < aNode.length; i++) {
	    	var  node = aNode[i];
	    	this.insertNode( node, insertPos);
	    	insertPos ++;
	    }
	},

	addNodes: function( aNode ) {
	    for (var i=0; i < aNode.length; i++) {
	    	var  node = aNode[i];
	    	this.addNode( node);
	    }
	},
	
});
