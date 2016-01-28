fd.view.Helper = {};

fd.view.Helper.simulateControlClicked = function( id) {
		$("#" + id).click();
};


//used to cache dialog
fd.view.Helper.Cache = {
	InputDlg: {
		
	}
};


/**
 * One function for easy use
 * @param type
 * @returns
 * 
 */
fd.view.Helper.getInput = function(type, cbFunc, cbContext, cbData) {
	var dlg = null;
	
	if ( type in fd.view.Helper.Cache.InputDlg ) {
		dlg = fd.view.Helper.Cache.InputDlg[ type ];
		
		dlg.doReset(cbFunc, cbContext, cbData);
		
	} else {
		dlg = new fd.view.InputDlg( {
			inputType: type
		});
		dlg.doInit(cbFunc, cbContext, cbData);

		//save it
		fd.view.Helper.Cache.InputDlg[ type ] = dlg;
	}
	
	dlg.doOpen();
};


/**
 * Set the table columns width by factors
 * aWidth: like 1, 2, 3
 */
fd.view.Helper.setTableColumnsWidth = function( table, aWidth) {
	
	var total = 0;
	for(var i=0 ;i <aWidth.length;i++){
		total += aWidth[i];
	}
	
	var aCol = table.getColumns();
	fd.assert(  aCol.length == aWidth.length,  "Table columns not same as width array" );
	
	aCol.forEach( function(col, idx) {
		col.setWidth( aWidth[idx] * 100 / total +"%");
	});
	
};


/**
 * Create a list for single/multiple selection
 * selectedItems:  the array which should set as selected 
 */
fd.view.Helper.createSimpleList = function ( aText, mode, selectedItems) {
	
	var aSels = [];
	if ( selectedItems) {
		aSels = selectedItems;
		if ( ! ( selectedItems instanceof Array )) {
			aSels = [selectedItems];
		}
	}
	
	var list = new sap.m.List( { mode: mode});
	for ( var i = 0; i < aText.length; i++) {
		var text = aText[i];
		var item =  new sap.m.StandardListItem( { title:  aText[i]});
		list.addItem(item);
		
		if ( aSels.indexOf( text) != -1) {
			list.setSelectedItem(item, true);
		}
	}
	
	return list;
};

/**
 * Add the defualt ok/cancel button to the dialog, and set default action
 * if choose ok then set state to Success
 */
fd.view.Helper.addDefaultButtonForDialog = function(dlg) {
	
	

	return dlg;
};


fd.view.Helper.getPropFromTableSelection = function(table, prop) {
	var ret = [];
	var aIdx = table.getSelectedIndices();
	for (var i = 0; i < aIdx.length; i++) {
		var idx = aIdx[i];
		var context = table.getContextByIndex(idx);
		var val = context.getProperty(prop);
		ret.push( val );
	}
	return ret;
};

