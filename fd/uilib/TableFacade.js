/*
	The implementation for the table
*/
jQuery.sap.declare('fd.uilib.TableFacade');
jQuery.sap.require('fd.uilib.CollectionFacade');

fd.uilib.CollectionFacade.extend("fd.uilib.TableFacade",{
	attachDefaultSelectionChangeEvent: function() { 
		if (this._oTable) {
			this._oTable.attachRowSelectionChange(this._onDefaultSelectionChanged, this);
		}
	},
	
	setControl: function(control) {
		fd.uilib.CollectionFacade.prototype.setControl.call(this,control);
		
		//add the short cut for easy access
		this._oTable = control;
	},

	
	_getSelectedIndices: function() {
		if (!this._oTable)
			return [];
		return this._oTable.getSelectedIndices();
	},

	_getLength: function() {
		var binding = this._oTable.getBinding('rows');
		return binding.getLength();
	},


	//================some function for the selections, need overrite by subclass in order to not use the complex switch case
	// /**
	//  * Delete the selection, 
	//  * @param  {[type]} evt [description]
	//  * @return {[type]}     [description]
	//  */
	// deleteSelection: function( evt ) {
	// 	if (!this._oTable)
	// 		return [];
	// 	return fd.util.collection.deleteSelectionFromTable(this._oTable);
	// },

	// *
	//  * Get the selection data as an array
	//  * @param  {[type]} bClone [description]
	//  * @return {[type]}        [description]
	 
	// getSelection: function( bClone ) {
	//     ;
	// },

	// /**
	//  * Insert(notrmally is append) some collection to the Table/list
	//  * @param {[type]} aData :
	//  * @param {[type]} pos, insert position (index), optional, if not set means append to end, 
	//  */
	// insertCollection: function(aData, pos ) {
	//     ;
	// },

});