/**
 * 
 */
sap.ui.core.Control.extend("fd.uilib.SourceEditor", {
	metadata : {
		publicMethods : [
		                 ],
		
		properties : {
			//used to control whether ignore the wrapped control
			'sourceType'  : {type:"string", defaultValue: null, bindable : "bindable"},
			
			//!! because now when call the setProperty('value')  it is costly, so we just use a internal variable to store the latest value
			'value'  : {type:"string", defaultValue: null, bindable : "bindable"},
	
			'rows'  : {type:"int", defaultValue: 120},
			"visible" : {type : "boolean", group : "", defaultValue : true},
			"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue :"100%"},
		},
		
	},

	getValue: function() {
		/*if (this.oCodeMirror) {
			return this.oCodeMirror.getValue();
		}*/
		return this._oLatestValue;
	},
	
	setRows: function(rows) {
		this.getRealControl().setRows(rows);
		this.setProperty("rows", rows);
	},
	
	setValue: function(value) {
		//this.getRealControl().setValue(value);
		this.setProperty("value", value, true);
		
		this._oLatestValue = value;

		if (this.oCodeMirror) {
			this.oCodeMirror.setValue(value);
		}
	},
	
	init: function() {
		this.oRealEditor = this.createControl();
		this._oLatestValue = "";
	},
	
	onAfterRendering: function() {
		//console.error("---sourceEdit onAfterRendering");
		this.createCodeMirror();
		this.tryRestroreValue();
	},

	createCodeMirror: function() {
		// if (!this.oCodeMirror) {
			var id = this.oRealEditor.getId();
			var textArea = document.getElementById(id);

			var that = this;
			//get the text Area first
			var sourceType = this.getSourceType();
			var mode = "javascript";
			if (sourceType == "Xml") {
				mode = "xml";
			} 
			this.oCodeMirror = CodeMirror.fromTextArea(textArea, {
				mode: mode,
				lineNumbers: true,
				lineWrapping: true,

				// change: function() {
				// 	that.onValueChanged();
				// }
			});
		// }
		// this.oCodeMirror.foldCode(CodeMirror.Pos(8, 0));
		
		 this.oCodeMirror.on("change", function(instance) {
		 	//
		 	// console.error('-- now value changed');
	     	that.onValueChanged(instance);
	     });

	     /*this.oCodeMirror.on("blur", function(instance) {
			console.error("--blur", instance.getValue());
		  });*/

/*	     editor.on("change", function(instance) {
			console.error("<<<now value change", instance.getValue());
		});
		editor.on("blur", function(instance) {
			console.error("--blue", instance.getValue());
		});
*/	},
		
	onValueChanged: function(instance) {
		//save the value down
		// console.error('&&-- normal value changed');
		// this.setProperty("value", this.oCodeMirror.getValue(), true);
		this._oLatestValue = instance.getValue();
	},
	
	createControl : function() {
		var ctrl = new sap.ui.commons.TextArea(
				{
					width: this.getWidth(),
					rows:  this.getRows(),
					// change: [this.onValueChanged, this],
				});
		return ctrl;
	},
	
	getRealControl: function() {
		if ( !this.oRealEditor) {
			this.oRealEditor = this.createControl();
		}
		return this.oRealEditor;
	},
	
	tryRestroreValue: function() {
		if (this.oCodeMirror) {
			this.oCodeMirror.setValue( this._oLatestValue );
		}
	},
	
	renderer : function(oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		
		if (oControl.getWidth() && oControl.getWidth() !="") {
			oRm.addStyle("width", oControl.getWidth());
		}
		
		oRm.writeStyles();
		
		oRm.writeClasses();
		
		oRm.write(">");

		var realCtrl = oControl.getRealControl();
		oRm.renderControl(realCtrl);

		oRm.write("</div>");
		
		//console.error("$$$ render of SourceEditro");
		
		
	},
	
	//real control
	oRealEditor: null,
	oCodeMirror: null,
});