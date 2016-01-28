/**
 * This class will hold the basic information for the control, it can help to create the xml view 
 * @type {Object}
 */
jQuery.sap.declare("fd.uilib.ControlInfo");

sap.ui.core.Element.extend("fd.uilib.ControlInfo", {
	metadata : {
		properties : {
			//the real control, if is 'string' then means the id
			'name'       : {type:"string", defaultValue: null, },
			
			//like a map, key is the name, content will be string 
			'propertyMap'       : {type:"any", defaultValue: null, },
			
			//like a  map, key is the aggregation name, child can be array or simple ControlInfo
			'aggregationMap'       : {type:"any", defaultValue: null, },
		}
	},

	//add an extra property to the map
	addProperty: function( propName, propValue ) {
	    var map = this.getPropertyMap();
	    if (map) {
	    	map[propName] = propValue;
	    } else {
	    	var mProp = {
	    		propName: propValue
	    	}

	    	this.setPropertyMap(mProp);
	    }
	},
	  

});