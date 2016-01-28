sap.ui.controller("fd.controller.DevFormatConvert", {

		
    onInit: function() {
    },
    
   
    
    onAfterRendering: function() {
    	
    },
	
	/**
	 *  In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		this.view = this.getView();
       
		this.byId('ConvertBtn').attachPress(  this.onConvertBtnPressed,   this );
		this.byId('ClearBtn').attachPress(  this.onClearBtnPressed,   this );
		
		this.byId('FormatChoice').setEnabled(false);
		
		this._oSourceFileChoose = this.byId('SourceFileChoose');
		this._oSourceFileChoose.attachLoadAll( this.onLoadAllFile, this);
		this._oSourceFileChoose.attachLoadOne( this.onLoadOneFile, this);
	},
	
	onClearBtnPressed: function() {
		this.byId('SourceFilesTextArea').setValue("");
		this.byId('ResultTextArea').setValue("");
		
		this.byId('ConvertBtn').setEnabled(false);
	},
	
	pushResult: function(str) {
		var oldStr = this.byId('ResultTextArea').getValue();
		var newStr = oldStr + str;
		
		this.byId('ResultTextArea').setValue(newStr);
	},
	
	onLoadOneFile : function(evt) {
		var name = evt.getParameter('name');
		var success = evt.getParameter('success');
		if (!success) {
			this.pushResult( "Read " + name + " error!");
			return ;
		}

		var treeNode=null;
		try {
			treeNode = fd.util.io.readViewFromStringContent( fd.ViewType.Html, evt.getParameter('content'));
		} catch (ex){
			this.pushResult( "Parse file " + name + " error: " + ex );
			return;
		}

		var content = fd.util.Export.exportView( fd.ViewType.Xml, treeNode, 0);

		var destName = name.replace("html",'xml');

		//just same as the last part
		fd.util.Export.saveToFile( content, destName);		
		
		this.pushResult( "Convert " + name + " successful!");
	},
	
	onLoadAllFile:function(evt) {
		this.byId('ConvertBtn').setEnabled(true);
	},
		
	onConvertBtnPressed: function() {
		
		var fmtChoice = this.byId('FormatChoice').getSelectedIndex();
		var viewType = (fmtChoice ==0) ? fd.ViewType.Xml :  fd.ViewType.Html;
		
		this.byId('ResultTextArea').setValue("");
		
		//start read then wait the call back
		this._oSourceFileChoose.startRead();
		
		this.byId('ConvertBtn').setEnabled(false);
	},
	
	onConvertBtnPressed_old: function() {
		
		var fmtChoice = this.byId('FormatChoice').getSelectedIndex();
		
		var viewType = (fmtChoice ==0) ? fd.ViewType.Xml :  fd.ViewType.Html;
		
		var fnStr = this.byId('FilesTextArea').getValue().trim();
		var arr = fnStr.split('\n');
		
		this.byId('ResultTextArea').setValue("");
		
		var fn;
		for ( var i = 0; i < arr.length; i++) {
			fn = arr[i].trim();
			if (fn == "")
				continue;
			
			try {
				var name = fn.sapLastPart("\\");
				
				this.pushResult( "Processing " + name);

				//???? check treeNode
				var treeNode = fd.util.io.readViewFromFile(fn, "", true);
				
				var content = fd.util.Export.exportView( viewType, treeNode, 0);
				
				//now name like xx.view.htm,  then need replace the last part to xml or html
				var pos = name.lastIndexOf('.');
				name = name.substr(0, pos+1);
				name += viewType; 
					
				//just same as the last part
				fd.util.Export.saveToFile( content, name);		
				
				this.pushResult("\t\t done!\r\n");
			} catch (ex) {
				//alert('Read file ' + fn + " error due to " + ex);
				this.pushResult(" failed. Due to " + ex + "\r\n");
				//this.pushResult(fn + "\r\n");
			}
		}
	},
	
	
	/**
	 * Call back for the Tab being selected, need update and show the latest XMLview
	 */
	onTabSelected: function() {
		
	},
	
	
	//just some shortcut 
	view: null,
	
	_oSourceFileChoose : null,
	
});