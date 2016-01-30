jQuery.sap.declare("fd.util.collection");

/**
 * All the collection related function put here: table, list, tree
 * @type {Object}
 */
fd.util.collection = {
	mCollectionType: {
		List: "List",
		Table: "Table",
		Unsupported: "Unsupported"
	},

	isTable: function( ctrl ) {
	    if (ctrl instanceof sap.ui.table.Table) {
	    	return true;
	    } else {
	    	//some time instanceof will not work, in such case just check the metadtaa
	    	var name = ctrl.getMetadata().getName();
	    	if (name == 'sap.ui.table.Table' || name == 'sap.ui.table.TreeTable' || name == 'sap.ui.table.AnalyticalTable')
	    		return true;
	    	else 
	    		return false;
	    }
	},

	isList: function( ctrl ) {
	    if (ctrl instanceof sap.m.List) {
	    	return true;
	    } else {
	    	var name = ctrl.getMetadata().getName();
	    	if (name == 'sap.m.List' || name == 'sap.m.Table')
	    		return true;
	    	else 
	    		return false;
	    }
	},
	
	
	/**
	 * Get the array which binding to the table
	 * @param  {[type]} table [description]
	 * @return {[type]}       [description]
	 */
	_getLeafBindingData: function(ctrl, binding) {
		if (!binding)
			return [];
		var path = binding.getPath();
		var bindingContext = ctrl.getBindingContext();
		if (bindingContext) {
			//use the relative binding, need both 
			path = bindingContext.getPath() + "/" + path;
		} 

		var model = binding.getModel();
		var leafData = model.getProperty(path);
		return leafData;
	},
	

	_getCtrlInfo: function( ctrl ) {
	    if ( this.isTable(ctrl)) {
	    	return {
	    		type: "Table",
	    		binding: "rows"
	    	};
	    } else if ( this.isList(ctrl) )  {
	    	return {
	    		type: "List",
	    		binding: "items"
	    	};
	    } else {
	    	return {
	    		type: "Unsupported",
	    		binding: ""
	    	};
	    }
	},

	//get the leaf binding: work for absolute binding or relative binding
	getLeafBindingData: function(ctrl) {
		var ctrlInfo = this._getCtrlInfo(ctrl);
		if (ctrlInfo.binding != "")
			return fd.util.collection._getLeafBindingData(ctrl, ctrl.getBinding(ctrlInfo.binding));
		else
			return null;
	},

	getModel: function( ctrl ) {
		var ctrlInfo = this._getCtrlInfo(ctrl);
		if (ctrlInfo.binding != "") {
			var binding =  ctrl.getBinding(ctrlInfo.binding);
			if (!binding)
				return binding.getModel();
		}
		return null;
	},

	getFirstSelectionIndex: function( ctrl ) {
		if (this.isTable(ctrl)) {
	    	var arr = ctrl.getSelectedIndices();
			if (arr.length == 0)
				return -1;
			var context = ctrl.getContextByIndex(arr[0]);
			return parseInt(context.getPath().sapLastPart("/"));
		} else {
			//for list 
			var paths = ctrl.getSelectedContextPaths();
			if (paths.length ==0)
				return -1;
			else {
				//now only get first 
				var path = paths[0].sapLastPart('/');
				return parseInt(path);
			}
		}
	},
	

	//??for list how ??
	getSelection: function( ctrl, bClone ) {
		var ret = [];
		var leafData = this.getLeafBindingData(ctrl);
		if (!leafData)
			return [];
		
		var i, context, realIdx;

		if (this.isTable(ctrl)) {
		    var arr = ctrl.getSelectedIndices();
			if (arr.length == 0)
				return [];
			
			if (bClone) {
				for (i=0; i < arr.length; i++) {
					context = ctrl.getContextByIndex(arr[i]);
					realIdx = context.getPath().sapLastPart("/");
					ret.push( jQuery.extend(true, {}, leafData[realIdx]) );
				}
			} else {
				for (i=0; i < arr.length; i++) {
					context = ctrl.getContextByIndex(arr[i]);
					realIdx = context.getPath().sapLastPart("/");
					ret.push( leafData[realIdx]);
				}
			}
		} else {
			var paths = ctrl.getSelectedContextPaths();
			if (paths.length ==0)
				return [];

			if (bClone) {
				for (i=0; i < paths.length; i++) {
					realIdx = paths[i].sapLastPart('/');
					ret.push( jQuery.extend(true, {}, leafData[realIdx]) );
				}
			} else {
				for (i=0; i < paths.length; i++) {
					realIdx = paths[i].sapLastPart('/');
					ret.push(leafData[realIdx]);
				}
			}
		}
		
		return ret;
	},


	setSelection: function( ctrl, indexFrom, length ) {
		if (this.isTable(ctrl))
	    	ctrl.setSelectionInterval(indexFrom, indexFrom + length -1);
	    else {
	    	//??now only support one for list 
	    	var items = ctrl.getItems();
	    	ctrl.setSelectedItem( items[indexFrom]);
	    }
	},
	

	/**
	 * Call this after the underlying binded data has changed
	 * @param  {[type]} ctrl [description]
	 * @return {[type]}      [description]
	 */
	refreshCtrl: function( ctrl ) {
		if ( this.isTable(ctrl)) {
		    var ctrlInfo = this._getCtrlInfo(ctrl);
			if (ctrlInfo.binding != "") {
				var binding =  ctrl.getBinding(ctrlInfo.binding);
				if (binding) {
					//for table just bindRows, for others how to smart fresh 
					if (ctrlInfo.type == 'Table')
						ctrl.bindRows(binding.getPath());
				}
			}
		} else {
			var data  = ctrl.getModel().getData();
			ctrl.getModel().setData(data);
		}

		//??just invalidate can work ?? 
		ctrl.invalidate();
	},
	
	appendCollection: function( ctrl, aData ) {
	    return this.insertCollection(ctrl, aData);
	},
	
	insertCollection: function(ctrl, aData, pos) {
		var leafData = this.getLeafBindingData(ctrl);
		if (!leafData)
			return;
		var i;
		if ( pos === undefined) {
			//just append
			for ( i=0; i < aData.length; i++) {
				leafData.push(aData[i]);
			}
		} else {
			//here need insert one by one
			for (i=0; i < aData.length; i++) {
				var item = aData[i];
				leafData.splice(pos+i, 0, item);
			}
			
		}

		this.refreshCtrl(ctrl);
	},

	getSelectedIndices: function( ctrl ) {
	    if (this.isTable(ctrl)) {
	    	return ctrl.getSelectedIndices();
	    } else {
	    	var paths = ctrl.getSelectedContextPaths();
			if (paths.length ==0)
				return [];
			return _.map( paths, function( path ) {
			    return  parseInt(path.sapLastPart('/'));
			} );
	    }
	},
	
	/**
	 * Delete  the selection, and return the deleted array
	 * @param  {[type]} ctrl [description]
	 * @return {[type]}      [description]
	 */
	deleteSelection: function(ctrl) {
		var arr = this.getSelectedIndices(ctrl);
		if (arr.length == 0)
			return [];
	
		//now data point to the array 
		//as the table may change order, so need get the binding path then sort it 
		var aIndex = [];
		if ( this.isTable(ctrl)) {
			jQuery.each(arr, function(idx, selIdx) {
				var contextPath = ctrl.getContextByIndex(selIdx);
				if (contextPath) {
					//here we need use the int , otherwise the order is not correct is >10
					aIndex.push( parseInt(contextPath.getPath().sapLastPart('/')));
				} else {
					alert("?? why context path null");
				}
			});
		} else {
			aIndex = arr;
		}

		//need use the value sort 
		aIndex.sort(function(a,b){
			if (a>b)
				return 1;
			else if (a==b)
				return 0;
			else
				return -1;
		});

		//from the last to 0 to remove 
		var leafData = this.getLeafBindingData(ctrl);
		var ret = [];
		for (var idx = aIndex.length - 1; idx >= 0; idx--) {
			//the splice will return an array event it only contain one data
			var delArray = leafData.splice(aIndex[idx],1);

			//??here sometime the ret array item will became undefined, need check reason, and now just clone it 
			ret.unshift( delArray[0]);
			// ret.unshift( jQuery.extend(true, [], delArray[0]));
		}

		//refresh table, call bindRows( ) is better ??
		// model.setData(topData);
		// var binding = ctrl.getBinding('rows');
		// ctrl.bindRows(binding.getPath());
		if (this.isTable(ctrl)) {
			ctrl.clearSelection();
		} else {
			var selItems = ctrl.getSelectedItems();
			_.each(selItems, function( item ) {
			    item.setSelected(false);
			} );
		}

		this.refreshCtrl(ctrl);

		return ret;
	}
};

fd.util.table = {
	//all the tables put here
	//just directly call table.getModel() as it many binding by name
	deleteSelection: function(table) {
		var arr = table.getSelectedIndices();
		if (arr.length == 0)
			return [];

		var binding = table.getBinding('rows');
		if (!binding)
			return [];

		var model = binding.getModel();
		var data = model.getData();

		//as all the context have the similar structrue, so just use the first context path to reach to the data
		var contextPath = table.getContextByIndex(arr[0]).getPath();
		//remove the last and first  / (if have)

		var pos = contextPath.lastIndexOf('/');
		contextPath = contextPath.substr(0, pos);
		if (contextPath.substr(0, 1) == '/')
			contextPath = contextPath.substr(1);

		var aPath = contextPath.split('/');
		var topData = data;
		for (var i = 0; i < aPath.length; i++) {
			var path = aPath[i];
			data = data[path];
		}

		//now data point to the array 
		//as the table may change order, so need get the binding path then sort it 
		var aIndex = [];
		jQuery.each(arr, function(idx, selIdx) {
			contextPath = table.getContextByIndex(selIdx);
			aIndex.push( parseInt(contextPath.getPath().sapLastPart('/')));
		});
		aIndex.sort();

		//from the last to 0 to remove 
		var ret = [];
		for (var idx = aIndex.length - 1; idx >= 0; idx--) {
			ret.push( data.splice(idx,1));
		}

		//refresh table, call bindRows( ) is better ??
		model.setData(topData);

		table.clearSelection();

		return ret;
	},

	copySelectedRowToClipboard: function(table, contentType) {
		var arr = table.getSelectedIndices();
		if (arr.length == 0)
			return;
		var aContent = [];

		for (var i = 0; i < arr.length; i++) {
			var selIdx = arr[i];
			var context = table.getContextByIndex(selIdx);
			var content = context.getProperty("");
			aContent.push(jQuery.extend({}, content));
		}

		// fd.model.Clipboard.copyContentByType(contentType, aContent);
	},

	pasteRowFromClipboard : function(table, aContent) {
		var binding = table.getBinding('rows');
		if (!binding)
			return;

		var model = binding.getModel();
		var leafData = model.getProperty(binding.getPath());
		if (jQuery.isArray(leafData)) {
			for (var i = 0; i < aContent.length; i++) {
				leafData.push(aContent[i]);
			}

			var topData = model.getData();
			model.setData(topData);
		}
	},

	/**
	 * Ensure the row in the table is visible,if not then need scroll it
	 * @param  {[type]} table     [description]
	 * @param  {[type]} propName  : property name used to check the value, such as "name"
	 * @param  {[type]} propValue : proprty value used for search
	 * @param  {[type]} bSelect :  flag whether need clear the old selection and set the row selected
	 */
	ensureRowVisible: function(table, propName, propValue, bSelect) {
		//find all the binding, from top to bottom to search
		//!!later need considerate remove the filter, as in such case some row can't find
		var model = table.getModel();
		var len = table.getBinding('rows').getLength();

		for (var i=0; i < len; i++) {
			var context = table.getContextByIndex(i);
			var path = context.getPath();
			path = path + "/" + propName;
			var modelValue = model.getProperty(path);
			if (modelValue == propValue) {
				if (bSelect) {
					table.clearSelection();
					table.setSelectedIndex(i);
				}

				// var firstVisibleRow = table.get
				table.setFirstVisibleRow(i);
				break;
			}
		}
	}
};

	
fd.util.list = {
	/**
	 * Ensure the item in the list is visible
	 */
	ensureItemVisible: function(list, item) {
		var dom = item.getDomRef();
		if (dom) {
			dom.scrollIntoView({
		    	behavior: "smooth",
    			block:    "start" 
	    	});
		}
	}
	
};