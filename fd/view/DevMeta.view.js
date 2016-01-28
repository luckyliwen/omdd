jQuery.sap.declare("fd.view.DevMeta");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.DevMeta", {
		metadata : {
			properties : {
			}
		},

		getControllerName : function() {
			return "fd.controller.DevMeta";
		},

		// Just reuse the JSView is enough
		renderer :"sap.ui.core.mvc.JSViewRenderer",
		
		createTopCmdBar : function ( oController ) {
			var generateBtn = new sap.ui.commons.Button(this.createId('GenerateBtn'),
				{
					text : "Generate Content",
				});
			generateBtn.addStyleClass('MarginLeftRight');

			var bar = new sap.ui.layout.HorizontalLayout({
				content : [ generateBtn]
			});
			bar.addStyleClass('FDHCenter');
			return bar;
		},

		createGridLayout: function ( oController ) {
			var i, entry,cb, rd;
			var grid = new sap.ui.layout.Grid( {
				'defaultSpan':	'L2 M2 S2',
			});

			//add file format
			var lblFile = new sap.ui.commons.Label({
				text: "Files:",
				textAlign:"End",
				design:"Bold",
				layoutData: new sap.ui.layout.GridData({
						span:"L2 M4 S4",
						linebreak: true,
					}),
			});
			grid.addContent(lblFile);

			for ( i = 0; i < this.aFileInfo.length; i++) {
				entry = this.aFileInfo[i];
				rd = new sap.ui.commons.RadioButton({
					text: entry.text,
					selected: entry.selected
				});

				this.aFileRadioButton.push(rd);
				grid.addContent(rd);
			}

			grid.addContent(
				new sap.ui.commons.HorizontalDivider({
					height:"Ruleheight", 
					layoutData: new sap.ui.layout.GridData({
						span:"L12 M12 S12",
					}),
				})
			);

			//add content infor
			var lblContent = new sap.ui.commons.Label({
				text: "Content:",
				textAlign:"End",
				design:"Bold",				
				layoutData: new sap.ui.layout.GridData({
						span:"L2 M4 S4",
						linebreak: true,
					}),
			});
			grid.addContent(lblContent);

			for (i = 0; i < this.aContentInfo.length; i++) {
				entry = this.aContentInfo[i];
				cb = new sap.ui.commons.CheckBox({
					text: entry.text,
					checked: entry.checked
				});

				this.aContentCheckBox.push(cb);
				grid.addContent(cb);
			}
			grid.addContent(
				new sap.ui.commons.HorizontalDivider({
					height:"Ruleheight", 
					layoutData: new sap.ui.layout.GridData({
						span:"L12 M12 S12",
					}),
				})
			);
			
			//add libs 
			var lblLib = new sap.ui.commons.Label({
				text: "Library:",
				textAlign:"End",
				design:"Bold",				
				layoutData: new sap.ui.layout.GridData({
						span:"L2 M4 S4",
						linebreak: true,
					}),
			});
			grid.addContent(lblLib);

			for (i = 0; i < this.aLibInfo.length; i++) {
				entry = this.aLibInfo[i];

				cb = new sap.ui.commons.CheckBox({
					text: entry.text,
					checked: entry.checked
				});

				//as it may over two line, so for the second line need add the indent 
				if (i >0 && ((i%5)==0)) {
					cb.setLayoutData(new sap.ui.layout.GridData({
							indent:"L2 M4 S4",
							linebreak: true,
						})
					);
				}

				this.aLibCheckBox.push(cb);
				grid.addContent(cb);
			}

			return grid;
		},

		createAllContent: function ( oController ) {
			var topBar = this.createTopCmdBar(oController);
			var grid = this.createGridLayout(oController);

			var vBox = new sap.ui.layout.VerticalLayout({
				width:"100%",
				content : [ topBar, 
						new sap.ui.commons.HorizontalDivider({
							height:"Large", 
						}),
						grid ]
				});
			return vBox;
		},

		doInit : function(oController) {
			var libs = fd.model.ModuleMng._aAllLib;
			for (var i = 0; i < libs.length; i++) {
				var lib = libs[ i ] ; 
				var entry = {checked: true, text: lib};
				this.aLibInfo.push(entry);
			}

			var content = this.createAllContent(oController);
			this.addContent(content);

			// then manually call the controller init work
			this.getController().onAfterDoInit();
		},

		createContent : function(oController) {
			return null;
		},

		aFileInfo : [
				{text:"One library one file",   id:"FilePerFile", selected: true},
				{text:"All libraries one file", id:"FileOneFile", selected: false},
		],

		aContentInfo : [
				{text:"Controls", name:"ContentControl", checked: true},
				{text:"Elements", name:"ContentControl", checked: true},
				{text:"Types",    name:"ContentControl", checked: true},
		],

		aLibInfo: [
		],

		aFileRadioButton:[],
		aLibCheckBox: [],
		aContentCheckBox:[],
});		