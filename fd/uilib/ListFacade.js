/*
	The implementation for the table
*/
jQuery.sap.declare('fd.uilib.ListFacade');
jQuery.sap.require('fd.uilib.CollectionFacade');

fd.uilib.CollectionFacade.extend("fd.uilib.ListFacade",{
	attachDefaultSelectionChangeEvent: function() { 
		if (this._oList) {
			this._oList.attachSelectionChange(this._onDefaultSelectionChanged, this);
		}
	},
	
	setControl: function(control) {
		fd.uilib.CollectionFacade.prototype.setControl.call(this,control);
		
		//add the short cut for easy access
		this._oList = control;
	},

	
	_getSelectedIndices: function() {
		if (!this._oList)
			return [];
		var aPath  = this._oList.getSelectedContextPaths();
		return _.map(aPath, function( path ) {
		    return parseInt(path.sapLastPart("/"));
		} );
	},

	_getLength: function() {
		var binding = this._oList.getBinding('items');
		return binding.getLength();
	},

});