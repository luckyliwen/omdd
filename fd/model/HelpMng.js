fd.model.HelpMng = {
	getTooltip : function( id) {
		if ( id in this._mTooltip)
			return this._mTooltip[id];
		return "";
	},

	getWarning: function( id ) {
	    if ( id in this._mWarning)
			return this._mWarning[id];
		return "";
	},
	

	_mTooltip : {
		GenerateControllerContent:
			"Old data will be overwrited, Press the \"Setting\" at the right top to choose OData or Json data...",
		TreeMultiSelection: 
			"Press \"Ctrl\" or \"Shift\" to select multiple node. But don't overlap the selections",
		BatchCreate:  
			"First choose ore several nodes as template,then choose some OData property from one Entity to create multiple nodes",
		PseudoData: 
			"Use special data to illustrate where some i18n text or binding data will come. For example the i18n>CompanyCode will illustrate as ::i18n>CompanyCode::",
	    SaveRunableHtml:
	    	"Press the \"Setting\" at the right top to adjust the setting such as UI5 library locaction, libs...",
	    ApplyAllChange:
	    	"All changes made for this control will apply back to design",
	    DiscardAllChange:
	    	"All changes made for this control will be discard for the batch apply",
	      	
	},

	_mWarning: {
		TreeNodeOverlap: 
			"You selection tree nodes are overlapp which means one node is the parent of another node. Can't support operation. Please reselect and retry",
		BatchCreateNeedSameParent: 
			"For Batch Create all the node must reside at same parent"
	}
};