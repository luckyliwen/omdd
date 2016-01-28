/**
 * Manage the copy/paste
 */
fd.model.Clipboard = {
	copyText: function( text) {
        if (window.clipboardData) { 
	        window.clipboardData.setData("Text", text);
    	} else {  
    		fd.uilib.Message.warning("Sorry, your browser not support copy to clipboard");
    	}
	},
	
	//??later need add the notification mechanism
		
	/**
	 * Copy the node to clipboard.
	 * @param node  -- tree node
	 */	
	copy: function(nodeOrNodes,  viewId) {
		var aNode = nodeOrNodes;
		if ( !jQuery.isArray( aNode)) {
			aNode = [ nodeOrNodes ];
		}

		this._aCopyData = [];
		for (var i=0; i < aNode.length; i++) {
			var  node = aNode[i];
			this._aCopyData.push( node.cloneNode() );
		}
	
		//need publish the event, as they need update the button status
		fd.bus.publish('clipboard', "copy", {viewId:viewId});
	},

	
	clear: function() {
		this._aCopyData = [];
		
		fd.bus.publish('clipboard', "clear");
	},
	
	
	getCopyContent: function() {
		//here need clone it first, otherwise can't paste multiple times
		var ret = [];
		for (var i=0; i < this._aCopyData.length; i++) {
			var  node = this._aCopyData[i];
			ret.push( node.cloneNode());
		}
		return ret;
	},
	
	hasCopyContent:function() {
		return this._aCopyData.length;
	},
	
	//==================the prop support
	// by the viewId know who copy the data, so in the call back, the sender can ignore the update
	copyProp: function( arr, viewId ) {
	    if ( ! arr instanceof Array) {
	    	arr = [arr];
	    }
	    this._aCopyProp=[];
	    for (var i=0; i < arr.length; i++) {
	    	var  entry = arr[i];
	    	this._aCopyProp.push(entry);
	    }

	    fd.bus.publish('clipboard', "copyProp", viewId);
	},

	hasPropContent: function( evt ) {
	    return this._aCopyProp.length > 0;
	},
	
	getPropContent: function( evt ) {
	    return this._aCopyProp;
	},
	
	
	_aCopyProp: [],
	_aCopyData: [],
};

