/**
 * Class for change prop dynamic,
 */
fd.model.DebugCtrl = {

	/**
	 * From the ui5 control create the data for all prop
	 * @param ctrl
	 */
	buildDebugData: function(ctrl) {
		//bind the control itself, so later can easy get the value
		var m ={ Prop: [], "Ctrl": ctrl};
		
		var clsName = ctrl.getMetadata().getName();
		var meta = fd.model.Metadata.getMetadataForControl(clsName);
		
		for (var name in meta.Prop) {
			var map = meta.Prop[name];
			var entry = {};

			entry['name'] = map.name;
			entry['type'] = map.type;
			entry['editable'] = true;
			entry['changed'] = false; //used it to control whether show button or not
			
			//the value need get from control
			//for the id just call getId
			if (name =="id") {
				entry['value'] = ctrl.getId();
				entry['editable'] = false;
			} else {
				//here need use the getXX instead of getProperty, as some class may overwrite the getXX 
				var cmd ="get" + map.name.sapCapital();
				
				entry['value'] = ctrl[ cmd ](); 
			}
			
			//also the id can't change
			m.Prop.push(entry);
		}

		return m;
	},
	
	createPropTableForSingleCtrl: function(id, fnValueChanged,fnLiveValueChanged, fnApplyPressed,fnContext) {
		var  colName = new sap.ui.table.Column({
			label : "Name",
			template:  new sap.ui.commons.TextView( { text: "{name}" }),
			sortProperty:  "name", 
			filterProperty: "name",
		});

		var editor = new fd.uilib.SmartEdit(
				{
					type: "{type}",
					value: "{value}",
					editable: "{editable}",
					valueChanged: [fnValueChanged, fnContext],
				} );
		
		var  colChangeBack = new sap.ui.table.Column({
			label : "Apply",
			template:  new sap.ui.commons.Button( {
				visible: "{changed}",
				// text:"Apply",
				icon: "sap-icon://cart-approval",
				press: [fnApplyPressed, fnContext]
			})
		});

		//may or may not provide
		if (fnLiveValueChanged) {
			editor.attachLiveValueChanged(fnLiveValueChanged, fnContext);
		}
		
		var  colEditor = new sap.ui.table.Column({
			label : "Value",
			template:  editor,
		});

		var oTable = new sap.ui.table.Table( id, 
			{
					allowColumnReordering : true,
					columns: [colName, colEditor,colChangeBack],
					visibleRowCount:  20,
			});
		
		//        [colName, colEditor, colChangeBack],
		var aWidth = [ 3,  4,  1 ]; 
		fd.view.Helper.setTableColumnsWidth(oTable, aWidth); 
		return oTable;
	},
	
	/**
	 * 
	 * @param id
	 * @param num		how many control
	 * @param fnValueChanged
	 * @param fnContext
	 * @returns {sap.ui.table.Table}
	 */
	createPropTableForMultipleCtrl: function(id, num, fnValueChanged, fnContext) {
		var  colName = new sap.ui.table.Column({
			label : " Name",
			template:  new sap.ui.commons.TextView( { text: "{name}" }),
			sortProperty:  "name", 
			filterProperty: "name",
		});

		var editor = new fd.uilib.SmartEdit(
				{
					type: "{type}",
					value: "{value}",
					valueChanged: [fnValueChanged, fnContext],
				} );
		
		var  colEditor = new sap.ui.table.Column({
			label : "Value",
			template:  editor,
		});

		var oTable = new sap.ui.table.Table( id, 
			{
					allowColumnReordering : true,
					columns: [colName, colEditor],
					visibleRowCount:  7,
			});
		
		//        [colName, colEditor],
		var aWidth = [ 1,    1,  ]; 
		fd.view.Helper.setTableColumnsWidth(oTable, aWidth); 
		return oTable;
	},
	
};