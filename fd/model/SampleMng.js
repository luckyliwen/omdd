fd.model.SampleMng = {
		
	init: function() {
		this._oModel = new sap.ui.model.json.JSONModel();
		this._oModel.setData(this._mData);
		this._oModel.setSizeLimit(1000);

		for (var i=0; i < this._mData.length; i++) {
			var  item = this._mData[i];
			item.image = "./images/" + item.image;

			if ( ! item.viewUrl.sapEndWith(".xml")) {
				item.viewUrl = "./samples/" + item.viewUrl + ".view.xml";
			}

			if ( item.controllerUrl) {
				item.controllerUrl = "./samples/" + item.controllerUrl + ".controller.js";
			}
		}
	},

	getModel: function( ) {
	    return this._oModel;
	},

	_mData:  [
		{  "category" : "Controls",  
		   "subCategory": "Grid", 
		  "description" : "use StandardListItem and span property to display task flow",
		  "image"       :  "Grid_TaskDisplay.png",
		  "viewUrl"    :  "Grid_TaskDisplay",
		  "controllerUrl" : ""
		},
		/*{  "category" : "Controls",  
		   "subCategory": "SimpleForm", 
		  "description" : "This is an example of a dual-column 4:8:0 layout (label:input:emptyspace) using the SimpleForm controlse StandardListItem and span property to display task flow",
		  "image"       :  "SimpleForm_Dual.png",
		  "viewUrl"    :  "SimpleForm_Dual",
		  "controllerUrl" : ""
		},*/

		{  "category" : "FioriApp",  
		   "subCategory": "FullScreen", 
		  "description" : "Typical full screen app: Smart Filter bar  +   iconTabBar + Smart Table. !!need SAPUI5 version 1.29 if need preview",
		  "image"       :  "FioriFS_FilterIconTable.png",
		  "viewUrl"    :  "FioriFS_FilterIconTable",
		  "controllerUrl" : ""
		},

		{  "category" : "Controls",  
		   "subCategory": "List", 
		  "description" : "use ObjectListItem. Show how easily it is to use the data binding",
		  "image"       :  "list_ObjectItem.png",
		  "viewUrl"    :  "list_ObjectItem",
		  "controllerUrl" : "list_ObjectItem"
		},

		{  "category" : "Controls",  
		   "subCategory": "sap.m.Table", 
		  "description" : "The Table shares many features with the List and, in addition, introduces columns. The table is fully responsive and can hide columns or shown them in-place if the screen space is not sufficient.",
		  "image"       :  "MTable_Columns.png",
		  "viewUrl"    :  "MTable_Columns",
		  "controllerUrl" : "MTable_Columns"
		},
	]
};