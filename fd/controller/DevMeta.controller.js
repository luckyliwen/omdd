sap.ui.controller("fd.controller.DevMeta", {

		
    onInit: function() {
    },
    
	/**
	 *  In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		this.view = this.getView();
		this.byId('GenerateBtn').attachPress(  this.onGenerateBtnPressed,   this );

		for (var i = 0; i < this.view.aContentCheckBox.length; i++) {
			var cb = this.view.aContentCheckBox[ i ] ; 
			cb.attachChange( this.onCheckBoxChanged, this);
		}
		for ( i = 0; i < this.view.aLibCheckBox.length; i++) {
			cb = this.view.aLibCheckBox[ i ] ; 
			cb.attachChange( this.onCheckBoxChanged, this);
		}
	},

	onCheckBoxChanged: function ( ) {
		var selContent = false;
		for (var i = 0; i < this.view.aContentCheckBox.length; i++) {
			var cb = this.view.aContentCheckBox[ i ] ; 
			if (cb.getChecked()) {
				selContent = true;
				break;
			}
		}				

		var selLib = false;
		for ( i = 0; i < this.view.aLibCheckBox.length; i++) {
			cb = this.view.aLibCheckBox[ i ] ; 
			if (cb.getChecked()) {
				selLib = true;
				break;
			}
		}	

		this.byId('GenerateBtn').setEnabled( selContent && selLib );
	},

	onGenerateBtnPressed: function ( evt ) {
		//first ensure at least select one content and libs select
		var selOne = false;
		for (var i = 0; i < this.view.aContentCheckBox.length; i++) {
			var cb = this.view.aContentCheckBox[ i ] ; 
			if (cb.getChecked()) {
				selOne = true;
				break;
			}
		}				
		if (!selOne) {
			fd.uilib.Message.showErrors('Please select at least one content: Control, or Element or Type');
			return;
		}

		selOne = false;
		for ( i = 0; i < this.view.aLibCheckBox.length; i++) {
			cb = this.view.aLibCheckBox[ i ] ; 
			if (cb.getChecked()) {
				selOne = true;
				break;
			}
		}				
		if (!selOne) {
			fd.uilib.Message.showErrors('Please select at least one library');
			return;
		}

		var bPerFile = true;
		if (this.view.aFileRadioButton[1].getSelected())
			bPerFile = false;

		var bControl = this.view.aContentCheckBox[0].getChecked();
		var bElement = this.view.aContentCheckBox[1].getChecked();
		var bType = this.view.aContentCheckBox[2].getChecked();
		var aLib = [];

		for (i = 0; i < this.view.aLibCheckBox.length; i++) {
			cb = this.view.aLibCheckBox[ i ] ; 
			if (cb.getChecked())
				aLib.push(cb.getText());
		}

		fd.model.CodeAssist.buildLibByName(aLib, bPerFile, bControl, bElement, bType);
	},
});