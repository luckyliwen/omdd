jQuery.sap.declare('fd.controller.MDTableTemplate');
jQuery.sap.require("fd.controller.MDTemplate");
jQuery.sap.require("sap.ui.table.AnalyticalTable");
jQuery.sap.declare("fd.ulib.ContronInfo");

fd.controller.MDTemplate.extend("fd.controller.MDTableTemplate", {

	_createSmartTable: function( evt ) {
	    var smartTable = new sap.ui.comp.smarttable.SmartTable({
	    			entitySet: this._mSetting.entitySet,
	    			tableType: this._mSetting.tableType,
	    		});
	    if (this._mSetting.useSmartFilter && this._mSetting.smartFilterId) {
	    	smartTable.setSmartFilterId( this._mSetting.smartFilterBarId );
	    }
	    this._smartTable = smartTable;
	    return smartTable;
	},

	_createSmartTable_ControlInfo: function(control) {
		var aProp = ["entitySet", "tableType"];
	    if (this._mSetting.useSmartFilter && this._mSetting.smartFilterId) {
	    	aProp.push("smartFilterId");
	    }
		
		return this.getControlInfoFromControl(control, aProp);
	},

	_createConcreteTable: function(  ) {
	    var ret;
	    var bindRowPath = "/" + this._mSetting.entitySet;
	    switch (this._mSetting.tableType) {
			case fd.Template.TableType.Table:
				ret = new sap.ui.table.Table({
				});
				break;
			case fd.Template.TableType.ResponsiveTable:
				ret = new sap.m.Table();
				break;
			case fd.Template.TableType.AnalyticalTable:
				ret = new sap.ui.table.AnalyticalTable();
				break;
			case fd.Template.TableType.TreeTable:
				ret = new sap.ui.table.TreeTable();
				break;										
	    }

	    //now can bind the rows?? 
	    if ( ret instanceof sap.ui.table.Table){
	    	ret.bindRows(bindRowPath);
	    } 
	    return ret;
	},

	//get the table control Information, here it can directly extract information from the availabel table
	_createConcreteTable_ControlInfo: function(table){ 
		var tableInfo = this.getControlInfoFromControl(table);
		//add all the columns 
		var aColumnInfo = [];

		var aColumn = table.getColumns();
		for (var i=0; i < aColumn.length; i++) {
			var column = aColumn[i];
			var columnInfo = this.getControlInfoFromControl(column);

			if ( table instanceof sap.ui.table.Table) {
				var mAggr = {
					label: this.getCommonControlInfoFromControl( column.getLabel()),
					template: this.getCommonControlInfoFromControl( column.getTemplate())
				};
				columnInfo.setAggregationMap(mAggr);
			} else {
				var header = column.getHeader();
				var headerInfo = this.getControlInfoFromControl(header, ["text"]);

				columnInfo.setAggregationMap( {
					header: headerInfo
				} );
			}

			aColumnInfo.push(columnInfo);
		}
		
		var bindPath = "{/" + this._mSetting.entitySet + "}";
		if ( table instanceof sap.ui.table.Table){
	    	tableInfo.addProperty("rows", bindPath);
	    	tableInfo.setAggregationMap({
				columns: aColumnInfo
			});
	    } else {
	    	//also get the item information 
	    	var aCells = this._mobileTableItemTemplate.getCells();
	    	var aCellInfo = [];
	    	for (var iCell =0; iCell < aCells.length; iCell++) {
	    		var  cell = aCells[iCell];
	    		aCellInfo.push(this.getCommonControlInfoFromControl(cell));
	    	}

	    	var itemInfo = new fd.uilib.ControlInfo({
	    		name: "sap.m.ColumnListItem",
	    		aggregationMap: {
	    			cells: aCellInfo
	    		}
	    	});
	    	
			tableInfo.addProperty("items", bindPath);
	    	tableInfo.setAggregationMap({
					columns: aColumnInfo,
					items: itemInfo
			});
	    }

		return tableInfo;
	},


	_createSmartFilter: function( evt ) {
	    if (this._mSetting.useSmartFilter) {
	    	return new sap.ui.comp.smartfilterbar.SmartFilterBar({
	    		entityType: this._mSetting.entityType
	    	});
	    }
	    return null;
	},

	_createSmartFilter_ControlInfo: function(control) {
		return this.getControlInfoFromControl(control, ["entityType"]);
	},
	
	//return single or an array
	_createConcreteControl_ControlInfo: function(  ) {
		var controlInfo;

	    switch (this._mSetting.smartTableType) {
	    	case fd.Template.SmartTableType.SmartTable:
	    		controlInfo = this._createSmartTable_ControlInfo(this._smartTable );
	    		break;
	    	case fd.Template.SmartTableType.SmartTableTable :
				var smartTableInfo  = this._createSmartTable_ControlInfo(this._smartTable );
				var tableInfo = this._createConcreteTable_ControlInfo(this._concreteTable);

				smartTableInfo.setAggregationMap({
					"items": tableInfo
				});
				controlInfo = smartTableInfo;

	    		break;
	    	case fd.Template.SmartTableType.Table :
	    		controlInfo = this._createConcreteTable_ControlInfo(this._concreteTable);
	    		break;
	    }

	    if (this._mSetting.useSmartFilter) {
	    	var smartFilterInfo = this._createSmartFilter_ControlInfo( this._smartFilter);
	    	return [smartFilterInfo, controlInfo];
	    } else {
	    	return [controlInfo];
	    }
	},


	//return single or an array
	_createConcreteControl: function(  ) {
		var retTable;

	    switch (this._mSetting.smartTableType) {
	    	case fd.Template.SmartTableType.SmartTable:
	    		this._smartTable = this._createSmartTable();
	    		retTable = this._smartTable;
	    		break;
	    	case fd.Template.SmartTableType.SmartTableTable :
				this._smartTable = this._createSmartTable();
	    		retTable = this._smartTable;

				this._concreteTable = this._createConcreteTable();
				//add it to smart table
				retTable.addItem( 	this._concreteTable);
	    		break;
	    	case fd.Template.SmartTableType.Table :
	    		this._concreteTable = this._createConcreteTable();
	    		retTable = this._concreteTable;
	    		break;
	    }

	    this.setConcreteControl(retTable);

	    if (this._mSetting.useSmartFilter) {
	    	var smartFilter = this._createSmartFilterBar();
	    	this._smartFilter = smartFilter;
	    	return [smartFilter, retTable];
	    } else {
	    	return [retTable];
	    }
	},

	_createColumn: function( item ) {
	    if ( this._mSetting.tableType == fd.Template.TableType.Table || 
	    	this._mSetting.tableType == fd.Template.TableType.TreeTable) {
		    return new sap.ui.table.Column({
		    	label: this.createLabel(item),
		    	template: this.createTemplate(item)
		    });
		} else if (this._mSetting.tableType == fd.Template.TableType.AnalyticalTable) {
			 return new sap.ui.table.AnalyticalColumn({
		    	label: this.createLabel(item),
		    	template: this.createTemplate(item)
		    });
		} else {
			//for the mobile talle, need two parts,
			var column = new sap.m.Column({
				header: this.createLabel(item)
			}) ;

			var tempalte = this.createTemplate(item);
			return [column, tempalte];
		}
	},
	
	_refreshTable:  function(  ) {
	    this._concreteTable.invalidate();
	    if ( !(this._concreteTable instanceof sap.ui.table.Table)){
	    	var bindPath = "/" + this._mSetting.entitySet;
	    	this._concreteTable.bindItems(bindPath,  this._mobileTableItemTemplate);	
	    } 
	},
	
	
	doTableOperate: function( table, column, action, param ) {
		if (table instanceof  sap.ui.table.Table) {
			switch ( action) {
	    		case "Add":
	    			table.addColumn(column);
	    			break;
	    		case "Del":
	    			table.removeColumn(column);
	    			break;
	    	}
		} else {
			//it is sap.m.Table, so need care both column and items
			switch ( action) {
	    		case "Add":
	    			table.addColumn(column[0]);

	    			if ( !  this._mobileTableItemTemplate) {
	    				this._mobileTableItemTemplate = new sap.m.ColumnListItem();
	    			}
	    			this._mobileTableItemTemplate.addCell(column[1]);
	    			break;
	    		
	    		case "Del":
	    			table.removeColumn(column[0]);
	    			this._mobileTableItemTemplate.removeCell(column[1]);

	    			//here column is the cell of the ColumnListItem
	    			// var pos = this._mobileTableItemTemplate.indexOfCell(column);
	    			// if (pos != -1) {
	    			// 	this._mobileTableItemTemplate.removeCell(column);
	    			// 	var mtableColumn = table.getColumns()[pos];
	    			// 	table.removeColumn(mtableColumn);
	    			// } else {
	    			// 	fd.assert(false,"doTableOperate can't find cell in ColumnListItem");
	    			// }
	    			break;
	    	}
		}
	   
	},
	

	addItems: function( aItem ) {
	    // need be implemented by subclass
	    for (var i=0; i < aItem.length; i++) {
	    	var  item = aItem[i];
	    	var column = this._createColumn(item);
	    	// this._concreteTable.addColumn(column);
			this.doTableOperate(this._concreteTable, column, fd.AggrActionType.Add);

	    	item._ui5Control = column;
	    }

	    this._refreshTable();
	},

	changeItem: function( item, changeItemType, newValue) {
		var column, label;
		if ( this._mSetting.tableType == fd.Template.TableType.ResponsiveTable) {
			column = item._ui5Control[0];
			label = column.getHeader();
			if (label) {
				label.setText(newValue);
			}
		} else {
			column = item._ui5Control;
			label = column.getLabel();
			if (label) {
				label.setText(newValue);
			}
		}
	},

	delItems: function( aItem ) {
	    // need be implemented by subclass
	   	for (var i=0; i < aItem.length; i++) {
	   		var  item = aItem[i];
	   		if ( item._ui5Control) {
	   			//remove itself from parent
	   			// this._concreteTable.removeColumn(item._ui5Control);
	   			this.doTableOperate(this._concreteTable, item._ui5Control, fd.AggrActionType.Del);
	   		}
	   	}
	   	
	},

	moveItems: function( aItem, moveDirection ) {
	    var i;
	    if ( this._concreteTable instanceof sap.ui.table.Table) {
		    switch ( moveDirection) {
		    	case "Top":
		    		//first remove all, then reverse add 
		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control);
		    		}

		    		for (i=aItem.length-1; i>=0; i--) {
		    			this._concreteTable.insertColumn(aItem[i]._ui5Control, 0);
		    		}
		    		break;
		    	case "Up": 
	    			//it is same move the one before the first item to the end of the aItem
	    			var firstPos = this._concreteTable.indexOfColumn(aItem[0]._ui5Control);
	    			fd.assert(firstPos != -1);
	    			var prevPos = firstPos -1;
	    			var prevColumn = this._concreteTable.getColumns()[ prevPos];
	    			this._concreteTable.removeColumn( prevColumn);
	    			//need move over the whole array
	    			prevPos += aItem.length;
	    			this._concreteTable.insertColumn( prevColumn, prevPos);
		    		break;

		    	case "Down":
		    		//it is same move the one next the last item to the before of the aItem
		    		var lastItem = aItem[  aItem.length -1]._ui5Control;
	    			var lastPos = this._concreteTable.indexOfColumn(lastItem);
	    			fd.assert(lastPos != -1);
	    			var nextPos = lastPos + 1;
	    			var nextColumn = this._concreteTable.getColumns()[ nextPos];
	    			this._concreteTable.removeColumn( nextColumn);
	    			//need move over the whole array
	    			nextPos -= aItem.length;
	    			this._concreteTable.insertColumn( nextColumn, nextPos);
		    		break;
		    	case "Bottom":
		    		//first delete all, the add to end one by one
	    			for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control);
		    		}

		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.addColumn( aItem[i]._ui5Control);
		    		}
		    		break;
		    }
		} else {
 			switch ( moveDirection) {
		    	case "Top":
		    		//first remove all, then reverse add 
		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control[0]);
		    			this._mobileTableItemTemplate.removeCell(aItem[i]._ui5Control[1]);
		    		}

		    		for (i=aItem.length-1; i>=0; i--) {
		    			this._concreteTable.insertColumn(aItem[i]._ui5Control[0], 0);
		    			this._mobileTableItemTemplate.insertCell(aItem[i]._ui5Control[1], 0);
		    		}
		    		break;

		    	case "Up": 
	    			//it is same move the one before the first item to the end of the aItem
	    			firstPos = this._concreteTable.indexOfColumn(aItem[0]._ui5Control[0]);
	    			fd.assert(firstPos != -1);
	    			prevPos = firstPos - 1;
	    			prevColumn = this._concreteTable.getColumns()[ prevPos];
	    			this._concreteTable.removeColumn( prevColumn);

	    			var prevCell = this._mobileTableItemTemplate.getCells()[prevPos];
	    			this._mobileTableItemTemplate.removeCell(prevCell);

	    			//need move over the whole array
	    			prevPos += aItem.length;
	    			this._concreteTable.insertColumn( prevColumn, prevPos);
					this._mobileTableItemTemplate.insertCell(prevCell, prevPos);
		    		break;

		    	case "Down":
		    		//it is same move the one next the last item to the before of the aItem
		    		lastItem = aItem[  aItem.length -1]._ui5Control[0];
	    			lastPos = this._concreteTable.indexOfColumn(lastItem);
	    			fd.assert(lastPos != -1);
	    			nextPos = lastPos + 1;
	    			nextColumn = this._concreteTable.getColumns()[ nextPos];
	    			this._concreteTable.removeColumn( nextColumn);

	    			var nextCell = this._mobileTableItemTemplate.getCells()[nextPos];
	    			this._mobileTableItemTemplate.removeCell( nextCell );

	    			//need move over the whole array
	    			nextPos -= aItem.length;
	    			this._concreteTable.insertColumn( nextColumn, nextPos);
	    			this._mobileTableItemTemplate.insertCell( nextCell , nextPos);
		    		break;

		    	case "Bottom":
		    		//first delete all, the add to end one by one
	    			for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control[0]);
		    			this._mobileTableItemTemplate.removeCell(aItem[i]._ui5Control[1]);
		    		}

		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.addColumn( aItem[i]._ui5Control[0]);
		    			this._mobileTableItemTemplate.addCell(aItem[i]._ui5Control[1]);
		    		}
		    		break;
		    }
		}
	},

	


	//global variable
	//_concreteTable: 
	//_smartTable
	////_smartFilter
	// _mobileTableItemTemplate: 
});