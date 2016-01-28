/**
 * Depending on the value type,it will provide radio button, comobox, or color selector or normal filed editor
 */
sap.ui.core.Control.extend("fd.uilib.SmartEdit", {
	metadata : {
		publicMethods : ['checkValidity','onValueChanged'
		                 ],
		
		properties : {
			//the prop name, as need it to decide whether is the icon
			'name'       : {type:"string", defaultValue: "", bindable : "bindable"},

			//used to control whether ignore the wrapped control
			'type'       : {type:"string", defaultValue: null, bindable : "bindable"},
			
			//like the ID then the set editable is false
			'editable'       : {type:"boolean", defaultValue: true, bindable : "bindable"},
			//??order matter
			
			//some property like { path :"cart>/totalPrice", 	formatter :"util.Formatter.totalPrice" } EUR, don't care the type just use the text editor
			'tooComplex':     { type:"boolean", defaultValue: false},
			
			"defaultValue" : {type: "any"},  //if don't have default value then use "" so can show 
			'value'       : {type:"any", defaultValue: null, bindable : "bindable"},
			//"realControl" : {type: "object", defaultValue: null},
			
			//the view control, used for call back when data update
			//"viewController": { type: "object"},
		},
		
		aggregations : {
			"realControl" : {type : "sap.ui.core.Control", multiple : false}
		},
		
		events: 
		{
			"valueChanged" : {},
			"liveValueChanged" : {},
		}
		
	},
	
	//??is it proper to set an good value for it
	setValue: function(v) {
		//??first time create it as the template
		if (v == null)
			return this;
		
		//console.error("call Smart setValue", v);
		var convertedValue = v;
		
		//need get the real value from it
		if (v == undefined) {
			//get the default value
			convertedValue = this.getDefaultValue();
		} else 	if (this.getType() =="boolean") {
			//sometime it binding to a property, then no need set it
			if ( v != "")
				convertedValue = eval(v);
		} else {
			//?? for the enum, need eval
		}
		
		//??As now it just get the string so can set directly, later need do the eval
		//else 	if (this.getType() !="string")
		//	convertedValue = eval(v);
		this.setProperty('value', convertedValue);
		return this;
	},
	
	setType: function(v) {
		if (v == null )
			return this;
		
		//console.error("call Smart setType", v);
		
		this.setProperty('type',v,true);
		return this;
	},
	
	/**
	 * by the different type, try to get the value
	 */
	getValueFromControl: function() {
		var ctrl = this.getRealControl();
		var propType = fd.model.EnumMng.getPropType(this.getType());
		
		var val;
		switch ( propType) {
			case fd.PropType.Boolean:
				val = ctrl.getSelectedIndex() ==0 ? true:false;
				break;
			case fd.PropType.Enumable:
				//As now the ComboBox may input a value not in the list, so always use the getValue() instead of ctrl.getSelectedKey();
				val = ctrl.getValue();
				break;
			//for the others, just string
			default: 
				val = ctrl.getValue();
				break;
		}
		
		return val;
	},
	
	/**
	 * realValue : used for the icon 
	 * @param oEvent
	 */
	onValueChanged: function(oEvent, realValue) {
		//get the index
		//update the tooltip for normal contorl 
		if ( oEvent && oEvent.getSource() instanceof sap.ui.commons.TextField) {
			oEvent.getSource().setTooltip( "" + oEvent.getSource().getValue() );
		}

		var context = this.getBindingContext(); 
		var path = context.getPath();
		var idx = parseInt(path.sapLastPart("/"));
		var val = realValue ? realValue :  this.getValueFromControl();
		var type = context.getProperty('type');
		
		//use the event to nofity outside
		this.fireValueChanged({
			value: val,
			index: idx,
			type:  type
		});
		
	},
	
	 /* 
	  * @param oEvent
	 */
	onLiveValueChanged: function(oEvent) {
		//get the index
		var context = this.getBindingContext(); 
		var path = context.getPath();
		var idx = parseInt(path.sapLastPart("/"));
		var val = oEvent.getParameter('liveValue');
		var type = context.getProperty('type');
		
		//use the event to nofity outside
		this.fireLiveValueChanged({
			value: val,
			index: idx,
			type:  type,
		});
	},
	
	
	/**
	 * return true/false for the data validity
	 */
	checkValidity: function() {
		
	},
	
	/*
	 How to decide the default value of one property:
	 1: if have set, then use the set value
	 2: If have the default value, then use the default value
	 3: choose "" if default is null,   
	 
	 defaultValue : true
	 */
	
	//Only when it is an enum, such as the 
	createEnumableControl: function() {
		// var oCB = new sap.ui.commons.DropdownBox(
		// as the dropdownBox can't accept the value not in the list,but we need keep the original value for check, so here
		// we use th ComboBox
		var oCB = new sap.ui.commons.ComboBox(
		);
		
		
		var template =  new sap.ui.core.ListItem( 
				{
					text: "{name}",
					key:  "{value}",
				}
			);
		
		//model
		var model = fd.model.EnumMng.getModel();
		oCB.setModel( model);
		
		//bind
		var path = fd.model.EnumMng.getPathForEnumObj( this.getType());
		oCB.bindItems(path, template);
		
		//then set the selected keys
		oCB.setSelectedKey( this.getValue());
		//as sometime the value may a wrong key, but need keep it for check 
		oCB.setValue( this.getValue());

		oCB.addStyleClass('ComobBoxInsideTable');
		
		oCB.attachChange( this.onValueChanged,this);
		
		//console.error("***The CB id is", oCB.getId());
		return oCB;
	},
	
	createBooleanControl: function() {
		//like true, false
		var rbg = new sap.ui.commons.RadioButtonGroup(
				{
					columns: 2,
					items: [ new sap.ui.core.Item({text:"true"}),
					         new sap.ui.core.Item({text:"false"})
						]
				});
		
		//set the value
		/*var realValue = eval( value.value);
		if ( realValue == undefined) {
			//then get the default value
			realValue = this.getDefaultValue();
			if ( realValue == undefined)
				realValue = false;
		}
		*/
		
		//??can ensure the boolean have default value??
		var val = this.getValue();
		if (val == null || val == undefined) {
			val = false;
			this.setValue( val);
		}
		
		rbg.setSelectedIndex( val ? 0:1);  //first is true then false
		
		rbg.attachSelect( this.onValueChanged,this);
		
		return rbg;
	},
	
	/*getValueData : function() {
		var value = this.getValue();
		if (  value.value != "") {
			tf.setValue(value.value);
		} 
	},*/
	
	/*createColorPickerControl: function() {
		var cp = new sap.ui.commons.ColorPicker();	
		if (this.getValue() != "") {
			cp.setColorString( this.getValue() );	
		}
		return cp;
	},*/
	
	init: function() {
		//console.error("**init of SmartEditor id->", this.getId());
	},
	
	onIconButtonPressed: function( evt ) {
	     fd.model.ImageMng.openIconDialog( this.onIconConfirmed, this, evt.getSource(), this);
	},

	onIconConfirmed: function( iconUrl ) {
	    this.setProperty('value', iconUrl);
	    this.oTextControl.setValue(iconUrl);

	    //also need fire the event so it will inform the listener
	    this.onValueChanged(null, iconUrl);
	},
	
	createIconControl: function( evt ) {
	    var normalCtrl = this.createDefaultControl();
	    //need it as later need save the vale back
	    this.oTextControl = normalCtrl;

	    var btn = new sap.ui.commons.Button({
	    	icon: "./images/icon.png",
	    	press: [ this.onIconButtonPressed, this],
	    }).addStyleClass("FDLeftMargin1");

	    var hbox = new sap.m.HBox({
	    	// width: "100%",
	    	items: [ normalCtrl, btn]
	    });
	    return hbox;
	},
	
	//just use the TextField
	createDefaultControl: function() {
		var val = this.getValue();
		
		//?? default is null, then for the string, just ""
		if (val == null || val == undefined) {
			val = "";
		}
		
		var tf = new sap.ui.commons.TextField(
				{
					value: val,
					tooltip: "" + val,
				});
		
		if ( !this.getEditable()) {
			tf.setEditable(false);
		}
		
		//TextFieldInsideTable
		tf.addStyleClass('SmartTextFieldInsideTable');
		
		//?? if both the change and live change have attached, only valide the live for performance
		tf.attachChange( this.onValueChanged,this);
		
		tf.attachLiveChange( this.onLiveValueChanged,this);
		
		return tf;
	},
	
	createControl : function() {
		var type = this.getType();
		//for the first time, type is null then no need do anything
		if ( ! type ) {
			return;
		}
		
		//may be called multiple times, so need check it and no need create it again
		if ( this.getRealControl() != null) {
			//alert("Recalled render so have control already?");
			//??so it will reuse the old need 
			//this.setRealControl(null);
		}
		
		//var vc = this.getViewController();
		//var vid = vc.getView().getId();
		//console.error("--The smart edit for vc, view", vc, vid);
		
		
		var ctrl=null;

		//for the icon, need provide an button to let user change it
		if (fd.model.EnumMng.isIcon( this.getName(), type)) {
			ctrl = this.createIconControl();
		} else {

			var propType = fd.model.EnumMng.getPropType(type);
		    
			if ( this.getTooComplex()) {
				propType = fd.PropType.String;
			}
			
			//depend on the type, there are several different choice
			switch ( propType) {
				case fd.PropType.Boolean:
					ctrl = this.createBooleanControl();
					break;
				case fd.PropType.Enumable:
					ctrl = this.createEnumableControl();
					break;
				case fd.PropType.Number: //fall down				
				case fd.PropType.String:
					ctrl = this.createDefaultControl();
					break;
				case fd.PropType.Checkable:
					ctrl = this.createDefaultControl();
					break;
					
				default: 
					fd.assert(false,"not know type" + propType);
					break;
			}
		}
		this.setRealControl(ctrl);
	},
	
	renderer : function(oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}
		
//		oRm.write("<span");
		var writeId = 1;
		
		if (writeId) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			
			oRm.addClass('sapUiTableCell');
			
			oRm.writeStyles();
			oRm.writeClasses();
			
			oRm.write(">");
		}
		
		oControl.createControl();
		//console.error("Smart Edit id", oControl.getId());
		var realControl = oControl.getRealControl();
		oRm.renderControl(realControl);
		
		//oRm.write("</span>");
		if (writeId)
			oRm.write("</div>");
	},
	
	//the real value
	valueData: null,
	oTextControl: null,  //only used for icon button
});
