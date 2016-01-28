var gpe;
sap.ui.controller("fd.controller.PropEdit", {
    onInit: function() {
    	gpe = this;
    },
    
    
    onOkPressed: function( evt ) {
	    this._oDialog.close();
	    var param = {
	    	"iPropIndex" : this.iPropIndex,
	    	"paths": this.byId("PartsProp").getValue(),
	    	"formatter": this.byId("FormatterProp").getValue(),
	    	"type": this.byId("FormatterProp").getValue(),
	    	"formatOption": this.byId("FormatOptionProp").getValue(),
	    	"constraint": this.byId("ConstraintProp").getValue(),
	    };

		this.fnCallback.call( this.fnContext, param);
	},
	
	getEntityName : function( evt ) {
	   	return this.oEntityList.getSelectedKey();
	},
	
	onEntityChanged:     function ( evt) {
		var source = evt.getSource();
		var key = evt.getParameter("selectedItem").getKey();
		if (  key ) {
			//for the first line prompt just clear the destination
			this.oPropTable.bindRows(  fd.model.ODataMng.getEntityPath( key ));
		} else {
			this.oPropTable.unbindRows();
		}
	},

	onTypeListChangeded: function(evt) {
		var source = evt.getSource();
		var key = evt.getParameter("selectedItem").getKey();
		this.oTypeProp.setValue( key );
		if (  key ) {
			this.oFormatOptionList.bindItems(fd.model.TypeMng.getFormatOptionPath(key),
				new sap.ui.core.ListItem({
					text: "{name}",
					additionalText: "{explain}"
				})
			);
			//also select the first item
			fd.util.setFirstItemForList(this.oFormatOptionList);

			this.oConstraintList.bindItems(fd.model.TypeMng.getConstraintPath(key),
				new sap.ui.core.ListItem({
					text: "{name}"
				})
			);
			//also select the first item
			fd.util.setFirstItemForList(this.oConstraintList);
		} else {
			this.oFormatOptionList.unbindItems();
			this.oConstraintList.unbindItems();
		}
	},

	onFormatOptionListChangeded: function(evt) {
		var source = evt.getSource();
		var text = evt.getParameter("selectedItem").getText() + ":";
		if ( !text.sapStartWith("--")) {
			this.oFormatOptionProp.setValue( text );
		}
	},

	onConstraintChangeded: function(evt) {
		var source = evt.getSource();
		var text = evt.getParameter("selectedItem").getText() + ":";
		var value = this.oConstraintProp.getValue();
		if (!text.sapStartWith("--")) {
			if (value) {
				this.oConstraintProp.setValue(value + "," + text);
			} else {
				this.oConstraintProp.setValue(text);
			}

			this.oConstraintProp.focus();
		}
	},

	onAddPropPressed: function( evt ) {
	    var aName = fd.view.Helper.getPropFromTableSelection(this.oPropTable, "name");
	    var str = aName.join(',');
		var val = this.oPartsProp.getValue().trim();
		if (val) {
			if (val.sapEndWith(","))
				val += str;
			else
				val = val + "," + str;
		} else {
			val = str;
		}
		this.oPartsProp.setValue( val );
	},
	
	onAddLabelPressed: function( evt ) {
	    var aName = fd.view.Helper.getPropFromTableSelection(this.oPropTable, "name");
		
		var entityName = this.getEntityName();
		var arr = [];
		for (var i=0; i < aName.length; i++) {
			var name  = aName[i];
			var val = "/#{0}/{1}/@sap:label".sapFormat(entityName, name);
			arr.push(val);
		}	

		var str = arr.join(",");
		val = this.oPartsProp.getValue().trim();
		if (val) {
			if (val.sapEndWith(","))
				val += str;
			else
				val = val + "," + str;
		} else {
			val = str;
		}
		
		this.oPartsProp.setValue( val );
	},
	

	onPropTableSelectChanged: function( evt ) {
		var tableSel = this.oPropTable.getSelectedIndex() !== -1;
		this.byId("AddProp").setEnabled( tableSel );
	    this.byId("AddLabel").setEnabled( tableSel );
	},
	
	/**
	 * Here we need use the call back, as if use event then need know who is the sendre
	 * @param  {[type]} index      [description]
	 * @param  {[type]} mProp      [description]
	 * @param  {[type]} fnCallback [description]
	 * @param  {[type]} fnContext  [description]
	 * @return {[type]}            [description]
	 */
	openEditPropDialog: function(index, mProp, fnCallback, fnContext) {
		/*if ( ! fd.model.ODataMng.isMetadataLoad()  && fd.model.ODataMng.isFirstTimePrompt()) {
			var str = "You not load the OData model," + 
				"Please first load OData metadata in \"Project\" panel \"Load OData Metadata\" button\r\n" +
				"And next time will directly use the simple verison if still not load the OData $metata";
			fd.uilib.Message.warning(str);
			fd.model.ODataMng.setIsFirstTimePrompt(false);
			return;
		}*/
		this.iPropIndex = index;
		
		this.fnCallback = fnCallback;
		this.fnContext = fnContext;

		if (!this._oDialog) {
			this._oDialog = this.getView().createDialog();

			this.oPropTable = this.byId("PropTable");
			this.oEntityList = this.byId("EntityList");

			//several prop
			this.oPartsProp = this.byId("PartsProp");
			this.oFormatterProp = this.byId("FormatterProp");
			this.oTypeProp = this.byId("TypeProp");
			this.oFormatOptionProp = this.byId("FormatOptionProp");
			this.oConstraintProp = this.byId("ConstraintProp");

			//3 drop list
			this.oTypeList = this.byId("TypeList");
			this.oFormatOptionList = this.byId("FormatOptionList");
			this.oConstraintList = this.byId("ConstraintList");

			this.oTypeList.attachChange(this.onTypeListChangeded, this);
			this.oFormatOptionList.attachChange(this.onFormatOptionListChangeded, this);
			this.oConstraintList.attachChange(this.onConstraintChangeded, this);

			if ( fd.model.ODataMng.isMetadataLoad()  ) {
				this.oPropTable.attachRowSelectionChange(this.onPropTableSelectChanged, this);

				this.byId("EntityList").attachChange(this.onEntityChanged, this);
				this.byId("AddProp").attachPress("head", this.onAddPropPressed, this);
				this.byId("AddLabel").attachPress("before", this.onAddLabelPressed, this);
			}
			this.byId("Ok").attachPress(this.onOkPressed, this);
		}

		//set the prop value to the control
		this.oPartsProp.setValue( mProp.paths );
		this.oFormatterProp.setValue( mProp.formatter );
		//type, format options and constrants need seperate it 


/*var typeReg = /type\s*\:\s*'([^']+)'|"([^"]+)"/;
var s = "type: 'a.b.type'  "
var match = typeReg.exec(s);



var typeReg = new RegExp("type\s*\:\s*['\"]");
var s = "type: 'a.b.type'  "
var match = typeReg.exec(s);

		extraStr: "type: 't', options: 'o', kk: 'kk'"
		formatter: ""name: "id"
		paths: ""tooComplex: falsetype: "string"value: "SmartTableList"*/

		this._oDialog.open();
	},

	_oDialog: null
});