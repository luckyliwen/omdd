fd.model.EnumMng = {
		
	init: function() {
		this._oModel = new sap.ui.model.json.JSONModel();
		this._oModel.setSizeLimit(1000);
		this._oModel.setData( this._mEnum );

		this.addSpecialEnum();
	},

	addSpecialEnum: function(  ) {
	   /* var fragmentType = [{ name: "XML", value: "XML"},
			{ name: "JS", value: "JS"},
			{ name: "HTML", value: "HTML"}
	    ];

	    this._mEnum[ "fd.enum.FragmentType"] = fragmentType;*/
	},
	

	/**
	 * 
	 * @returns
	 */
	getModel : function() {
		return this._oModel;
	},
	

	getAllValueForEnumObj : function(type) {
		var arr; 
		if ( ! (type in fd.model.EnumMng._mEnum)) {
			arr = fd.util.getArrayFromEnumObj(type);
			fd.model.EnumMng._mEnum[ type] = arr;
		} else {
			arr = fd.model.EnumMng._mEnum[ type];
		}

		var ret = "";
		for (var i = 0; i < arr.length; i++) {
			var ele = arr[ i ] ; 
			ret += ele.name ;

			if (i<arr.length-1)
				ret +=", ";
		}
		return ret;
	},

	/**
	 * As it is often need map from the enum object to an JsonModel, so can create it once and later only load if not there
	 * @param type
	 * @returns
	 */
	getPathForEnumObj : function(type) {
		if ( type in this._mEnum) {
			return "/" + type;
		} else {
			//need load it
			var arr = fd.util.getArrayFromEnumObj(type);
			this._mEnum[ type] = arr;
			return "/" + type;
		}
	},
	
	/**
	 * As it is often need map from the enum object to an JsonModel, so can create it once and later only load if not there
	 * @param type
	 * @returns
	 */
	getArrayForEnumObj : function(type) {
		if ( !(type in this._mEnum)) {
			var arr = fd.util.getArrayFromEnumObj(type);
			this._mEnum[ type] = arr;
		}
		return this._mEnum[ type];
	},

	/**
	 * 
	 * @param type
	 * @returns {Boolean}
	 */
	isEnumableProp: function(type) {
		var ret = false;
		if (type.sapStartWith('sap.')) {
			//exclude checkable
			if ( ! fd.model.EnumMng.isArrayProp(type)) {
				if ( ! fd.model.EnumMng.isCheckableProp(type)) {
					ret = true;
				}	
			}
		}
		return ret;	
	},

	isNumberProp: function(type) {
		return type =="int" || type=="float"; 
	},

	//as some prop is icon but the type is string
	isIcon : function( name, type) {
	    var ret = false;
	    if ( type === "sap.ui.core.URI") {
	    	ret = true;
	    } else {
	    	if (name.sapContainNoCase("icon") && type === "string" )
	    		ret = true;
	    }
	    return ret;
	},
	
	
	/**
	 * As we don't know which new type will create, so here need first check from some known data type, then check whether it has some common type 
	 * to know whether it is inherit from the base.DataType like:

sap.ui.commons.SplitterSize = sap.ui.base.DataType.createType('sap.ui.commons.SplitterSize', {
    isValid : function(vValue) {
      return /^((0*|([0-9]+|[0-9]*\.[0-9]+)([pP][xX]|%)))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

	 * @param  {[type]}  type [description]
	 * @return {Boolean}      [description]
	 */
	isCheckableProp: function ( type ) {
		if ( fd.model.EnumMng._aCheckable.indexOf(type) != -1) {
			return true;
		}

		//{getName: function, isValid: function, isArrayType: function, getDefaultValue: function, getBaseType: function…}
		//then check whether has some basic functions now only need two 
		//??later add try/catch
		var sapType;
		try {
			sapType = eval( type);
		} catch (err) {
			fd.assert(false, "why eval " + type +" fail?");
			return false;
		}

		if ("getName" in sapType &&"isValid" in sapType &&"getBaseType" in sapType) {
			fd.model.EnumMng._aCheckable.push(type);
			return true;
		}

		return false;
	},

	isArrayProp: function(type) {
		if ( type.indexOf('[]') != -1) {
			return true;
		} 
		return false;
	},
	
	/**
	 * 
	 * @param type  : the class property type
	 * @param value
	 */
	convertPropValueByType: function(type, value) {
		//var propType = this.getPropType(type);
		var ret = value;
		
		//only need considerate convert to number
		if ( this.isNumberProp(type)) {
			if ( type =="int") {
				ret = parseInt(value);
			} else if (type =='float') {
				ret = parseFloat(value);
			}
		}
		
		return ret;
	},

	/**
	 * From the Property type return the corresponding provider (control) type, 
	 * As some like 
	 */
	getPropType: function(type) {
		//for performance first filter the two common type
		if (type=='boolean') {
			return fd.PropType.Boolean;
		} else if (type=='string') {
			return fd.PropType.String;
		}

		//!! now for the array, just treat as string, later can first remove the[] then check it
		if (this.isArrayProp(type)) {
			return fd.PropType.String;	
		}
		
		//may be number
		if ( this.isNumberProp(type)) {
			return fd.PropType.Number;
		} else {
			if (type.sapStartWith('sap.')) {
				//checkable
				if (this.isCheckableProp(type)) {
					return fd.PropType.Checkable;
				} else {
					//??also need check is enumable
					//??fd.assert(this._aEnumable.indexOf(type) != -1, "Not know enum obj object " + type);
					return fd.PropType.Enumable;
				}
			} else {
				//common, now only string
				fd.assert(this._aCommon.indexOf(type) != -1, "Not know common proptype " + type);
			}
		}
		
		return fd.PropType.String;
		
	},

	/**
	 * 
	 */
	doUnitTest: function() {
		var type ="sap.m.BackgroundDesign";
		var path = fd.model.EnumMng.getPathForEnumObj(type);
		var propType = fd.model.EnumMng.getPropType(type);
		
		var propTypeCheckable  = fd.model.EnumMng.getPropType(sap.ui.commons.SplitterSize);
		
		console.log( type + "infor: path, propType, propTypeCheckable", path, propType, propTypeCheckable);
		console.log("Model data", this.getModel().getData());		
	},
	
	
	_oModel: null,
	_mEnum: {},
	
	//some common object
	_aCommon: ['any', "int", "float", "object", 'sap.ui.core.Control', 'string', "string[]"],
	
	//??for the new vesion, how to ensure it is ok??
	_aCheckable: [
	             "sap.ui.commons.SplitterSize", "sap.ui.commons.form.GridElementCells", "sap.ui.core.CSSSize", 
	             "sap.ui.core.Collision",        "sap.ui.core.Dock", "sap.ui.core.Percentage", "sap.ui.core.URI"
	             ],

	//later those can get from core,              	
	_aEnumable: []          
};