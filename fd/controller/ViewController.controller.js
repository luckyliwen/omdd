//??
var gvc = null;
sap.ui.controller("fd.controller.ViewController", {
    onInit: function() {
    },
    
        
    onAfterRendering: function() {
    	
    },
	
	/**
	 *  In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		//??
		gvc = this;
		this.view = this.getView();
		this.designController = this.view.getViewWorkset().getDesignController();
		this.sourceEditor  = this.byId('SourceEditor');
    
		this.byId('SaveToFile').attachPress(  this.onSaveToFilePressed,   this );
		this.byId('CopyToClipboard').attachPress(  this.onCopyToClipboardPressed,   this );
		
		this.byId('GenerateController').attachPress(  this.onGenerateControllerPressed, this );
		
		this.byId('Clear').attachPress(  this.onClearPressed,   this );
		
		this.controllerFileChoose = this.byId('ControllerFileChoose');
		this.controllerFileChoose.attachChange(this.onControllerFileChooseChanged,  this);
		this.controllerFileChoose.attachLoadOne(this.onLoadOneFileFinished, this);
	},
	
	onClearPressed: function() {
		this.sourceEditor.setValue("");
	},
	
	onSaveToFilePressed: function() {
		var strContent  = this.sourceEditor.getValue();
		var name = this.designController.getControllerName() + ".controller.js";
		
		fd.util.Export.saveToFile( strContent, name);
	},
	
	setControllerContent: function(  content ) {
	    this.sourceEditor.setValue(content);
	},
	
	getControllerContent: function() {
		return this.sourceEditor.getValue();
	},
			
	onCopyToClipboardPressed: function() {
		fd.model.Clipboard.copyText( this.getControllerContent());
	},
	
	
	onGenerateControllerPressed:function() {
		var controllerName =  this.designController.getControllerName();
		if ( !controllerName) {
			fd.uilib.Message.warning("Please first define the ControllerName in Designer View");
			return;
		}
		this.controllerName = controllerName;
		
		var settingCtrl = fd.getSettingController();
		if ( settingCtrl.checkODataAndWarning()) {
			var content = this.designController.getControllerSourceContent();
			this.sourceEditor.setValue(content);
		}
	},
	
	
	onControllerFileChooseChanged: function(evt) {
		if (! evt.getSource().hasFile() ) {
			return;
		}
		
		//??just start read file, if have content then ask whether overwrite 
		var oldContent = this.sourceEditor.getValue();
		if ( oldContent) {
			oldContent = oldContent.trim();
			if (oldContent.length > 1) {
				//??
				var ret = confirm("Old content will be replace by new content, continue?");
				if (!ret) {
					return;
				}
			}
		}
		
		this.controllerFileChoose.startRead();
	},
	
	onLoadOneFileFinished : function(evt) {
		var content = evt.getParameter("content");
		if (content instanceof Error) {
			var name  =  evt.getParameter("name");
			var err = "Read file " + name + " error: " + content;
			fd.uilib.Message.showErrors("Read file error", [err]);
			return;
		}
		
		//here just do check, if have unicode then it will report error
		fd.util.checkAsciiCode(content);

		//just replace content
		this.sourceEditor.setValue(content);	
		
	},
	
	/**
	 * Call back for the Tab being selected, need update and show the latest XMLview
	 */
	onTabSelected: function() {
	},
	
	
	//just some shortcut 
	view: null,
	designController:null,
	controllerName:  "",
	
	sourceEditor: null,
	controllerFileChoose: null,
});