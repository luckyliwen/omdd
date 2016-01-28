/**
 * Provide some common functions to show error/warning
 */
fd.uilib.Message = {
	warningById: function( id ) {
	    this.warning( fd.model.HelpMng.getWarning(id));
	},
	
	information: function( msg) {
	    if (sap.m.MessageBox && sap.m.MessageBox.information)
	   		sap.m.MessageBox.information(msg);
	   	else
	   		alert(msg);
	},
	
	warning: function( msg ) {
		if (sap.m.MessageBox && sap.m.MessageBox.warning)
	   		sap.m.MessageBox.warning(msg);
	   	else
	   		alert(msg);
	},

	showToast: function( msg ) {
		if ( sap.m.MessageToast )
	    	sap.m.MessageToast.show(msg);
	    else
	    	alert(msg);
	},
	
	
	buildDialog: function(title, content) {
		var dlg = new sap.ui.commons.Dialog({
			title: title,
			content: content,
			width: "800px"
		});
		return dlg;
	},
	
	showErrors: function( title, aError) {
		var details = aError;
		if ( aError instanceof Error) {
			details = [ aError.message];
		} else if ( ! (aError instanceof  Array)) {
			if ( ! aError)
				details = [];
			else 
				details = [ aError];
		}

		// var hint = "You may get extra information from the Console log window. Copy it and contact Author lucky.li01@sap.com";
		// if ( !aError ) {
		// 	aError = [ hint];
		// } else { 
		// 	aError.push( hint );
		// }

		if (sap.m.MessageBox && sap.m.MessageBox.error) {
			var detailStr = details.length>0 ? details.join("\r\n") : "";
			if (detailStr) {
				sap.m.MessageBox.error(title, {
					details: detailStr
				});
			} else {
				sap.m.MessageBox.error(title);
			}
		} else {
			var vbox = new sap.ui.layout.VerticalLayout();

			for (var i = 0; i < details.length; i++) {
				var err = details[i];

				//now just use an TextArea, and smartly calculate the row/cols
				var textArea = new sap.ui.commons.TextArea({
					rows: 4,
					width: "750px",
					//value: err
				});
				textArea.setValue(err);
				textArea.addStyleClass('.MarginTop');

				vbox.addContent(textArea);
			}

			var dlg = this.buildDialog(title, vbox);
			dlg.open();
		}
	}
};