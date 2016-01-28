jQuery.sap.declare("fd.view.DevFormatConvert");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.DevFormatConvert", {
	metadata : {
		properties : {

		}
	},

	getControllerName : function() {
		return "fd.controller.DevFormatConvert";
	},

	// Just reuse the JSView is enough
	renderer :"sap.ui.core.mvc.JSViewRenderer",

	onSourceFileNamesChanged : function(evt) {
		var sourceArea = this.byId('SourceFilesTextArea');
		var names = evt.getParameter('names');
		var strNames = names.join('\r\n');

		sourceArea.setValue(strNames);
		
		this.byId('ConvertBtn').setEnabled(true);
	},

	createTopCmdBar : function(oController) {
		var rbg = new sap.ui.commons.RadioButtonGroup(this
				.createId('FormatChoice'), {
			columns : 2,
			items : [ new sap.ui.core.Item({
				text : "XML View"
			}), new sap.ui.core.Item({
				text : "HTML View"
			}) ]
		});
		rbg.setSelectedIndex(0);

		var fileChooseBtn = new sap.ui.commons.Button(this
				.createId('SourceFileBtn'), {
			text :"Choose HTML Files"
		});

		var fileChoose = new fd.uilib.FileChoose(this.createId('SourceFileChoose'), {
			buttonControl : fileChooseBtn,
			change : [ this.onSourceFileNamesChanged, this ],
			accept :"text/html",
			multiple: true,
		});

		// top is a toolbar, use teh boarderLayout as we want to put it
		// at center
		// ??
		var convertBtn = new sap.ui.commons.Button(this.createId('ConvertBtn'),
				{
					text : "Convert",
					enabled: false,
				});
		convertBtn.addStyleClass('MarginLeftRight');

		var clearBtn = new sap.ui.commons.Button(this.createId('ClearBtn'), {
			text : "Clear"
		});

		var bar = new sap.ui.layout.HorizontalLayout({
			content : [ rbg, fileChoose, convertBtn, clearBtn
			//new sap.ui.commons.Toolbar({
			//items: [convertBtn, clearBtn]
			//})
			]
		});
		bar.addStyleClass('FDHCenter');
		return bar;
	},

	doInit : function(oController) {
		var cmdBar = this.createTopCmdBar(oController);
		var sourceArea = new sap.ui.commons.TextArea(this.createId('SourceFilesTextArea'), {
			rows : 15,
			width : "80%",
			editable : true,
		});

		var labelFiles = new sap.ui.commons.Label({
			//text: "Full path of view files (such as c:\\temp\\main.view.xml), one file one line",
			text : "Source Files",
			design : sap.ui.commons.LabelDesign.Bold,
		});

		var resultArea = new sap.ui.commons.TextArea(this.createId('ResultTextArea'), {
			rows : 10,
			width : "80%"
		});

		var labelResult = new sap.ui.commons.Label({
			text : "Converting status",
			labelFor : resultArea,
			design : sap.ui.commons.LabelDesign.Bold,
		});

		var vLayout = new sap.ui.commons.layout.VerticalLayout({
			width :"100%",
			content : [ cmdBar, 
			         new sap.ui.commons.HorizontalDivider(),
					labelFiles, sourceArea,
					labelResult, resultArea, ]
		});

		this.addContent(vLayout);

		// then manually call the controller init work
		this.getController().onAfterDoInit();
	},

	createContent : function(oController) {
		return null;
	},

});