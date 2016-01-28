/**
  * Manage load the required modules */

fd.model.Metadata = {
		
	init: function() {
		
		this.createSpecialMetadata();
		
		this._oControlNode  = new sap.ui.commons.TreeNode( { text: fd.StrControl});
		this._oElementNode  = new sap.ui.commons.TreeNode( { text: fd.StrElement});
		
		//the model for aggregation candidate
		
		this._oCandidateModel = new sap.ui.model.json.JSONModel();
		this._oCandidateModel.setSizeLimit(1000);
		this._oCandidateModel.setData( this._mMeta );
	},
	
	/**
	 * Get class name from control or element
	 * @param ctrl
	 */
	getClassName : function(ctrl) {
		var meta = ctrl.getMetadata();
		return meta.getName();
	},
	
	getCandidateModel: function() {
		return this._oCandidateModel;
	},

	isMatchedPropByNameAndType: function( control, propName, propType ) {
	    var meta = this.getMetadataForControl(control);
	    if ( meta && propName in meta.Prop) {
	    	return ( propType == meta.Prop[ propName].type);
	    } else {
	    	return false;
	    }
	},
	

	getPropTypeByName: function( control, propName) {
	    var meta = this.getMetadataForControl(control);
	    fd.assert( propName in meta.Prop, "logic error for call getPropTypeByName");
	    if ( meta && propName in meta.Prop)
	    	return meta.Prop[ propName].type;
	    else
	    	return "";
	},
	
	getPropDefaultValueByName: function( control, propName) {
	    var meta = this.getMetadataForControl(control);
	    // fd.assert( propName in meta.Prop, "logic error for call getPropDefaultValueByName");
	    if ( meta && propName in meta.Prop)
	    	return meta.Prop[ propName].defaultValue;
		else {
			return "";
		}
	},
	
	/**
	 * Get the path for the availabale candidate of the interface/element/control
	 * For example for the sap.ui.commons.ToolbarItem then need get all control which implement the sap.ui.commons.ToolbarItem interface
	 * @param cls
	 */
	getCandidatePath: function( cls, retArr) {
		var clsType = fd.model.ModuleMng.getClassType(cls);
		var key, v;
		if (clsType == fd.ClassType.Interface ) {
			//try to build if not there
			if ( !(cls in this._mMeta.interfaces)) {
				var newArr = [];
				for (key in this._mMeta) {
					var map = this._mMeta[key];
					if ( map.aInterface && map.aInterface.indexOf(cls) != -1) {
						newArr.push( {'name': key});
					}
				}
				
				//add it 
				this._mMeta.interfaces[cls] = newArr;	
			}
			
			if (retArr) {
				var eleArr = this._mMeta.interfaces[cls];
				eleArr.forEach( function(ele) {
					retArr.push( ele.name);
				});
			}
			
			return "/interfaces/" + cls ;
		} else if (clsType == fd.ClassType.Element || clsType == fd.ClassType.Control) {
			if (retArr) {
				eleArr = this._mMeta[cls].aChild;
				eleArr.forEach( function(ele) {
					retArr.push( ele.name);
				});
			}
			
			//for the element and control, all the child include itself has build in begin
			return "/" + cls+ "/aChild";
		} else {
			fd.assert(false, "Unknow type for class " + cls);
			return null;
		}
	},
	
	/**
	 * Check whether the available control is an valid candidate or not 
	 * @param  {[type]}  type             [description]
	 * @param  {[type]}  candidateClsName [description]
	 * @return {Boolean}                  [description]
	 */
	isValidCandidate: function( type, candidateClsName ) {
		//!! in some case the element/class not list in libs, so we can first use simple way to do check , just by name
		//can find some case
		if ( type == candidateClsName) {
			return true;
		}

	    var path = this.getCandidatePath(type);
	    if ( path) {
	    	//nwo path like /interfaces/sap.m.Button or /sap.m.List/aChild
	    	var arr = path.split("/");
	    	fd.assert( arr.length === 3);

	    	var aCandidate;
	    	if (arr[1] in this._mMeta ) {
	    		if ( arr[2] in  this._mMeta[ arr[1] ]) {
		    		aCandidate = this._mMeta[ arr[1] ][ arr[2] ];
		    		var pos = aCandidate.sapIndexOf( "name", candidateClsName);
		    		return pos !== -1;
		    	}
	    	}
	    } 
	    
	    //no enough knowledge to check, so just return true
	    return true;
	    
	},

	/**
	 * Try to get a similar meta from the class metadata, if found (means just one) then the aSolution will contain the value
	 * @param  {[type]} clsMeta   [description]
	 * @param  {[type]} sMetaName [description]
	 * @param  {[type]} aSolution [description]
	 * @return {[type]}           : aSolution:  just one meta win
	 *                           string : Choice for user       
	 */
	getSimilarMetaInfor: function( clsMeta, sMetaName, metaProp,aSolution) {
		var aMeta = [].concat( clsMeta.names.Prop);
		aMeta = aMeta.concat( clsMeta.names.Asso);
		aMeta = aMeta.concat( clsMeta.names.Event);

		var aMatch = fd.string.getSimilarFromArray( sMetaName, aMeta);
		var ret = "";
		if (aMatch.length === 0) {
			ret =  "";
		} else if ( aMatch.length === 1) {
			var metaType = this.getMetaTypeByName( clsMeta,aMatch[0]);
			var metaFullname = this.getMetaTypeFullName( metaType);
			
			//how to fix it ? first del the old 
			aSolution.push({ action: "del", name: sMetaName, metaType: "Prop"});
			var entry = {action: "add",  name: aMatch[0], metaType: metaType, value: metaProp.value};
			//try to add the paths, formatter if existed 
			if ( metaProp.paths) {
				entry.paths = metaProp.paths;
			}
			if ( metaProp.formatter) {
				entry.formatter = metaProp.formatter;
			}
			aSolution.push(entry);
			metaProp.briefSolution = "Del property {0} and add {1} {2}".sapFormat(sMetaName, metaFullname, aMatch[0]);

			ret = "You intended for " + metaFullname + " \"" + aMatch[0] + "\"";
		} else {
			ret = "You intened for \"" + aMatch.join(",") + "\"";
		}
		return ret;
	},

	getMetaTypeByName: function( clsMeta, sMetaName ) {
	    if ( clsMeta.names.Prop.indexOf( sMetaName) !== -1) {
	    	return "Prop";
	    } else if ( clsMeta.names.Asso.indexOf( sMetaName) !== -1) {
	    	return "Asso";
	    } else if ( clsMeta.names.Event.indexOf( sMetaName) !== -1) {
	    	return "Event";
	    } else if ( clsMeta.names.Aggr.indexOf( sMetaName) !== -1) {
	    	return "Aggr";
	    } 
	},
	
	getMetaTypeFullName: function( metaType) {
		var mName = {
			"Prop":  "Property",
			"Aggr":  "Aggregation",
			"Asso":  "Association",
			"Event":  "Event"
		};
	    return mName[ metaType ];
	},
	
	/**
	 * code is similar as function ManagedObject.prototype.validateProperty
	 * @param  {[type]}  sPropertyName [description]
	 * @param  {[type]}  oValue        [description]
	 * @return : return "" means no error, else return the error description
	 */
	checkPropertyValidation : function( clsMeta, sPropertyName, oValue, prop,aSolution) {
		var oProperty = null, oType;
		if ( sPropertyName in clsMeta.Prop)
			oProperty = clsMeta.Prop[ sPropertyName];

		if (!oProperty) {
			//if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1") 
			//now it may like customData:persoKey, in UI5 it will add customer data, so just do simple check
			if ( sPropertyName.indexOf(":") != -1) {
				return "";
			} else {
				var extraInfor = this.getSimilarMetaInfor( clsMeta, sPropertyName, prop, aSolution);
				var simpleInfor = "Property \"" + sPropertyName + "\" does not exist. ";
				if (extraInfor) {
					return simpleInfor + extraInfor;
				} else {
					//metaProp.briefSolution = "Del property {0} and add {1} {2}".sapFormat(sMetaName, metaFullname, aMatch[0]);
					//simple solution would be delete it 
					aSolution.push({ action: "del", name: sPropertyName, metaType:"Prop"});
					prop.briefSolution = "Del property {0}".sapFormat(sPropertyName);
					return simpleInfor;
				}
			}
		}
		oType = sap.ui.base.DataType.getType(oProperty.type);

		// If property has an array type, clone the array to avoid modification of original data
		if (oType instanceof sap.ui.base.DataType && oType.isArrayType() && jQuery.isArray(oValue)) {
			oValue = oValue.slice(0);
		}

		// In case null is passed as the value return the default value, either from the property or from the type
		if (oValue === null || oValue === undefined) {
			//just pass
		} else if (oType instanceof sap.ui.base.DataType) {
			// Implicit casting for string only, other types are causing errors

			if (oType.getName() == "string") {
				// if (!(typeof oValue == "string" || oValue instanceof String)) {
				// 	oValue = "" + oValue;
				// }
			} else if (oType.getName() == "string[]") {
				// For compatibility convert string values to array with single entry
				if (typeof oValue == "string") {
					oValue = [oValue];
				}
				if (!jQuery.isArray(oValue)) {
					return "\"" + oValue + "\" is of type " + typeof oValue + ", expected string[]" +
							" for property \"" + sPropertyName ;
				}
			} else  {
				//here the value is string like "true", so need covnert to to the corresponding data type,
				var  parsedValue = null; 
				//but for the enum type can't use the parseValue as it will return null, then the prompt willl lost real value 
				if ( oProperty.type.sapStartWith("sap.")) {
					// if (parseValue == null) {
					// 	parseValue = oValue;
					// }
					parsedValue = oValue;
				} else {
					parsedValue = oType.parseValue(oValue);
				}
				if ( !oType.isValid(parsedValue) ) {
					//here normal case is a enum value not correct, then we also try to get the correct value 
					extraInfor = "";
					if ( fd.model.EnumMng.isEnumableProp(oProperty.type)) {
						var aEnumCandidate  = fd.model.EnumMng.getArrayForEnumObj( oProperty.type);
						var aName = aEnumCandidate.sapSubArray("value");
						var aMatch = fd.string.getSimilarFromArray(parsedValue, aName);
						if (aMatch.length === 1) {
							aSolution.push({ action: "chg", name: sPropertyName, value: aMatch[0]});
							extraInfor = "You intended for \"" + aMatch[0] + "\"";
							prop.briefSolution = "Change from {0} to {1}".sapFormat(parsedValue, aMatch[0]);
						} else if ( aMatch.length > 1) {
							extraInfor = "You intened for \"" + aMatch.join(",") + "\"";
						}
					}
					return "\"" + parsedValue + "\" is of type " + typeof parsedValue + ", expected " +
						oType.getName() + " for property \"" + sPropertyName + "." + extraInfor;
				}
			}
		}

		return "";
	},
	
	/**
	 * 
	 * @param aClass:  element or controls
	 */
	buildMetadata: function( aClass, classType) {
		for ( var i = 0; i < aClass.length; i++) {
			var cls = aClass[i];
			this.getMetadataForControl(cls);
		}
		
		//try to add the for "Control" for later easy get all child for the control
		if (classType === fd.ClassType.Control) {
			var m = {
				aChild: [],
				aInterface: []
			};
			aClass.forEach(function(cls){
				m.aChild.push( {'name':cls});
			});
			
			this._mMeta [ fd.StrControl ] = m;
		} else if ( classType === fd.ClassType.Element ) {
			//for the element, aChild contain both the Element and child, so need add both
			//?? check wheter need add here or in post build
			var aEleChild  =  []; 
			var allClass = aClass.concat( fd.model.ModuleMng.getControls() );
			allClass.forEach(function(cls){
				aEleChild.push( {'name':cls});
			});
			
			this._mMeta [ fd.StrElement ].aChild = aEleChild;
		}
	},
	
	/**
	 * after all the control/element have build the treeNode, then now can get the children information
	 */
	postBuildMedata: function() {
		for ( var key in this._mMeta) {
			//!!later need check how to deal the aDirectChild
			//as the Control and elemnt have build so just ignore it
			if (key == fd.StrControl ||  key === fd.StrElement) {
				map.aDirectChild = []; //as too many so just for simple to omit 
				continue;
			} else if ( key =="interfaces") {
				continue;
			}
			
			
			var map = this._mMeta[key];
			if ( !map.treeNode) {
				//??check alter for the core.view,don't need build the sub-element
				continue;
			}
			
			//in order for build the list, array element like {name: xx } 
			var arr = fd.util.getTreeNodeChildNames( map.treeNode);
			//also add the class itself,
			arr.unshift(key);
		
			//do do a map
			map.aChild = [];
			arr.forEach( function(name) {
				map.aChild.push( {'name': name});
			});

			//also build the aDirectChild for metadata access
			map.aDirectChild = fd.util.getTreeNodeDirectChildNames(map.treeNode);
		}
	},
	
	
	
	/**
	 * Not like normal control, following special metadata need create manually: view, fragment, fragmentDefintion, ExtensionPoint
	 */
	createSpecialMetadata: function() {
		var mData = {
			"sap.ui.core.View":      ["viewName", 		"controller", "controllerName", "resourceBundleName",
		             					"resourceBundleUrl", 		"resourceBundleLocale",		"resourceBundleAlias",
										{name: "width",   type: "sap.ui.core.CSSSize", defaultValue: '100%'},
										{name: "height",   type: "sap.ui.core.CSSSize", defaultValue: null},
										{name: "displayBlock",   type: "boolean", defaultValue: false},
		             				],
		    "sap.ui.core.mvc.View": ["viewName", 		"controller", "controllerName", "resourceBundleName",
		             					"resourceBundleUrl", 		"resourceBundleLocale",		"resourceBundleAlias",
										{name: "width",   type: "sap.ui.core.CSSSize", defaultValue: '100%'},
										{name: "height",   type: "sap.ui.core.CSSSize", defaultValue: null},
										{name: "displayBlock",   type: "boolean", defaultValue: false},
		             				],         					
			"sap.ui.core.Fragment":  ["id","fragmentName","type"],
			"sap.ui.core.FragmentDefinition":  [],
			"sap.ui.core.ExtensionPoint": ["name"],
		};

		for (var key in mData) {
			var m = {
				Prop: {},
				Aggr: {},
				Event: {},
				Asso: {},
				
				//the array only contians name
				names: {
			 		Prop: [],
			 		Event:[],
			 		Aggr: [],
			 		Asso: []
			 	}
			};

			var aAttr = mData[key];
			for ( var i = 0; i < aAttr.length; i++) {
				var attr = aAttr[i];
				var name = aAttr[i];
				if ( typeof name === 'string' ) {
					m.Prop[ name] = {'name': name, type:"string", bindable: "", singularName: "", altTypesStr:"", defaultValue:'' };
				} else {
					name = attr.name;
					m.Prop[ name] = {'name': name, type: attr.type, bindable: "", singularName: "", altTypesStr:"", 
										defaultValue: attr.defaultValue
									};
				}
				m.names.Prop.push(name);
			}


			//set it to global variable
			this._mMeta[ key ] = m;
		}
	},

	/**
	 * Not like other control, the view have some special metadata which will be parse when create new view, so need here
	 */
	getCoreViewMetadata: function() {
		var m = {
				Prop: {},
				Aggr: {},
				Event: {},
				Asso: {},
				
				//the array only contians name
				names: {
			 		Prop: [],
			 		Event:[],
			 		Aggr: [],
			 		Asso: []
			 	}
			};
		//have following props
		var aAttr = ["viewName", 		"controller", "controllerName", "resourceBundleName",
		             "resourceBundleUrl", 		"resourceBundleLocale",		"resourceBundleAlias"];
		
		for ( var i = 0; i < aAttr.length; i++) {
			var name = aAttr[i];
			
			m.Prop[ name] = {'name': name, type:"string", bindable: "", singularName: "", altTypesStr:""};
			
			m.names.Prop.push(name);
		}
		return m;
	},
	
	
	//?? merge with getAggrTypeInfo
	getClassAggrInfor: function(cls, aggrNode) {
		if ( cls in this._mMeta) {
			if ( aggrNode in this._mMeta[ cls].Aggr) {
				return this._mMeta[ cls].Aggr[ aggrNode];
			}
		} 
		return null;
	},
	
	//??as now in begin have get all the information, so can just get it
	/**
	 * @return [array]
	 */
	getAggrTypeInfo:function( clsName, aggrName) {
		try {
			jQuery.sap.require(clsName);
			var meta = eval( clsName +".getMetadata()");
			var mAggr = meta.getAllAggregations();
			
			if ( aggrName in mAggr) {
				var val = mAggr[aggrName];
				
				var arr = [ val.type];
				
				//as some have the altTypes but type like array, then just use  altTypesStr for easy consume
				if ( ("altTypes" in  val) &&  val.altTypes )  {
					arr.push( val.altTypes.toString()); 
				} else {
					arr.push( "");
				}
				
				//then the multiple
				arr.push( val.multiple);
				return arr;
				
			} else {
				fd.assert( false, "Aggr name " + aggrName +" not in class " + clsName);
			}
			
		} catch (ex) {
			fd.assert(false, "In getAggrTypeInfo got exception " + ex);
		}
		
		return ["sap.ui.core.Control",  "", false];
	},
	
	
	canFindClass : function(ctrl) {
		var mCfg = {notFound: true};
		fd.model.Metadata.getMetadataForControl(ctrl, mCfg);
		return ! mCfg.notFound;
	},
	
	
	/**
	 * 
	 * @param ctrl control name
	 * @returns
	 */
	getMetadataForControl: function(ctrl, mCfg) {
		//??
		if (mCfg) {
			mCfg.notFound = false;	
		}
		
		if ( ctrl in this._mMeta) {
			return this._mMeta[ctrl];
		}
		
		var m = {
				Prop: {},
				Aggr: {},
				Event: {},
				Asso: {},
				
				//the array only contians name
				names: {
			 		Prop: [],
			 		Event:[],
			 		Aggr: [],
			 		Asso: []
			 	},
			 	
			 	//==following used for get the candidate
			 	aParent: [],
			 	aChild: [],
			 	aInterface: [],  //implemented interfaces
			 	treeNode: null,
		};

		//ensure it is loaded
		try {
			jQuery.sap.require(ctrl);
		} catch (ex) {
			if (mCfg) {
				mCfg.notFound = true;
			}
			return m;
		}
		
		var meta = null;
		try {
			meta = eval( ctrl +".getMetadata()");
		} catch (ex) {
			console.error("Run getMetadata() for" + ctrl + " error", ex);
			
			if (mCfg) {
				mCfg.notFound = true;
			}
			
			return null;
		}
		//??later may need know what is direct property, what is inherit from parent
		
		//props
		//For all the prop need add the class and id as the default property, so put it at head
		m.Prop['id'] =    {name: "id",    bindable: "", 	defaultValue: null, group: "Mis",	type: "string"};
		m.names.Prop.push('id');
		
		//??later check whether need the class m.Prop['class'] = {name: "class", bindable: "", 	defaultValue: null, group: "Mis",	type: "string"};
		//??m.names.Prop.push('class');
		
		var mProp = meta.getAllProperties();
		for ( var k in mProp) {
			var v= mProp[k];
		
			//as some property can't bind, so need create the default value
			var base = { bindable: "", };
			var prop = $.extend( base, v);
			
			m.Prop[k] = prop;
			m.names.Prop.push(k);
		}
		m.propCnt = m.names.Prop.length;
	
		//aggrs
		var mAggr = meta.getAllAggregations();
		for (  k in mAggr) {
			v= mAggr[k];
		
			//as some property can't bind, so need create the default value
			base = { bindable: "", singularName: "", altTypesStr:"", multiple: false};
			var aggr = $.extend( base, v);

			//as some have the altTypes but type like array, then just use  altTypesStr for easy consume
			if ("altTypes" in v) {
				//as in 1.28.5 can't run, so add protection
				if ( v.altTypes   &&  v.altTypes.toString)
					aggr.altTypesStr = v.altTypes.toString(); 
				else
					aggr.altTypesStr = "";
			}
			
			m.Aggr[k] = aggr;
			m.names.Aggr.push(k);
		}
		//try to get the defaultAggrName
		m.aggrDftName = meta.getDefaultAggregationName();
		m.aggrCnt = m.names.Aggr.length;

		//event
		var mEvent = meta.getAllEvents();
		for ( k in mEvent) {
			//just name is enough
			m.Event[k] = { name: k};
			m.names.Event.push(k);
		}
		m.eventCnt = m.names.Event.length;

		//assos
		var mAsso = meta.getAllAssociations();
		for ( k in mAsso) {
			v= mAsso[k];
		
			m.Asso[k] = v;
			m.names.Asso.push(k);
		}
		m.assoCnt = m.names.Asso.length;

		//Try to build the hierarchy information
		this.buildHierarchyInformation(ctrl, m, meta);
		
		this._mMeta[ctrl] = m;

		return this._mMeta[ctrl];
	},
	
	/**
	 * 
	 * @param name  control/element name
	 * @param map	used to store the hierarchy information
	 * @param meta	metaData
	 */
	buildHierarchyInformation: function(name, map, meta) {
		map.aParent  =  this.getClassPathArray(name, meta);

		var node = this.buildHierarchyNode(name, map.aParent);
		//also store the node here, so later can easy reach it
	 	map.treeNode = node;
	 	
	 	map.aInterface = meta.getInterfaces();
	},
	
	/**
	 * 
	 * @param name
	 * @param aParent
	 */
	buildHierarchyNode: function(name, aParent) {
		var node = this.getTopNode( aParent[0]);
		
		//as the top most is there, and the last one is the node itself, so create a new array first
		var  aName = aParent.slice(1);
		aName.push(name);
		
		for ( var i = 0; i < aName.length; i++) {
			var nodeName = aName[i];
			
			//the node may existed, so need check first
			var subNode = fd.util.getTreeNodeSubNode(node, nodeName);
			if (subNode) {
				//just move down
				node = subNode;
			} else {
				//add new node
				var newNode = new sap.ui.commons.TreeNode({text: nodeName});
				node.addNode( newNode);
				node = newNode;
			}
		}
		
		return node;
	},
	
	getTopNode: function(name) {
		if (name == fd.StrControl)
			return this._oControlNode;
		else
			return this._oElementNode;
	},
	
	/**
	 * Get the hier class as an array, so for sap.m.Button then it will like * sap.ui.core.Control sap.m.Button
	 * @param clsName
	 */
	getClassPathArray : function(name, meta) {
		var arr = [];
		var parent = meta.getParent();
		fd.assert(parent, "in [getClassPathArray] parent is null");
		
		while ( parent) {
			arr.push( parent.getName());
			if ( parent.getName() == fd.StrControl || parent.getName() == fd.StrElement) {
				break;
			} else {
				parent = parent.getParent();
			}
		}
		return arr.reverse();
	},
	
	getElementNode: function() {
		return this._oElementNode;
	},
	
	getControlNode: function() {
		return this._oConrolNode;
	},

	isControlOrElement: function( name ) {
	    return name in this._mMeta;
	},
	
	
	/**
	 * it will like :
	 sap.m.List: {
	 	Prop: {
	 		headerText: {name: "headerText", bindable: true, type: "string", group:"mis"},
	 		},
	 		
	 		
	 	Event: { 
	 		select: {name:"select"}],
	 	},
	 	Aggr  :  [
			{name: "items"	 	
	 		bindable: "bindable"
			multiple: true
			singularName: "item"
			type: "sap.m.ListItemBase"}
	 	],
	 	
	 	Asso: {
	 		name: "labelFor",
	 		type:"ap.ui.core.Control"
	 	},
	 	
	 	//In order easy know the remain names, put all the name as an array also
	 	names: {
	 		Prop: [],
	 		Event:[],
	 		Aggr: [],
	 		Asso: []
	 		
	 	}
	 }
	 */
	_mMeta: {
		//for the build interface, such as the sap.ui.commons.ToolbarItem, then only need build once
		interfaces: {
			
		}
	},
	
	//the tree node for control and element, 
	_oControlNode: null,
	_oElementNode: null,
};