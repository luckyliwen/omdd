sap.ui.core.Control.extend("fd.uilib.FileChoose", {
	metadata : {
		//so it can be treat like a normal button then put into the toolbar
		interfaces : [
		      		"sap.ui.commons.ToolbarItem"
		],
		      	
		publicMethods : ["getFileNames", "startRead"],
		
		properties : {
			//used to control whether ignore the wrapped control
			
			/**
			 * Here another choice is provide the text/icon, then create the sap.m.Button or sap.ui.commons.Button by default,but this
			 * way is not good:
			 * 1: no hint to use  sap.m.Button or sap.ui.commons.Button 
			 * 2: Bind too tightly
			 * 3: Need expose all the property of the sap.m.Button or sap.ui.commons.Button  sap.ui.core.Control
			 */
			'buttonControl' : {type:"any", defaultValue: null},
			
			'multiple'   : {type:"boolean",  defaultValue: false},
			
			/*if not set then by default will accept all the files,
			 * detail see http://www.w3schools.com/tags/att_input_accept.asp
			 * audio/*	All sound .fires are accepted
			   video/*	All video files are accepted
               image/*	All image files are accepted
               MIME_type	A valid MIME type, with no parameters.
			  * */
			"accept" : {type:"string", defaultValue: ""},
		},
		
	
		events: 
		{
			//following event is based on the FileReader,as it need support multiple files, 
			//so the progress and error event will not triggered 
			
			//chosed file has changed
			//parameter:
			//      names: the chosed file name array
			"change"    : {},
			
			//parameter: 
			//	contents: the content array, if read successful then the element is the file content, otherwise it is the Error
			//  origionalEvent : the original browser event
			//can get the detail reason by Error.message
			"loadAll"     : {},
			
			//optional:  if registered, then can implemented the read one file then process the content
			//parameter:
			//		success: true/false
			//      content: if successful then is the file content, otherwise is the Error
			//      name   : file name (part)
			
			//if the call back want to cancel the next read content, then return the false
			"loadOne"     : {},
			
			//
			//"progress" : {},
			//"error"    : {},
		}
	},
	
	init: function() {
		this._aFileName = [];
		this._aFileContent = [];
		//the dom <input file>
		this._oFileInput = null;
		this._bAttachedBtnPress = false;
	},
	
	//just some easy helper function help to set the accept
	addAcceptString:function(str) {
		var newAccept;
		var old = this.getAccept();

		if (old) {
			if (old.length>0) {
				newAccept = old +"," + str;
			} else {
				newAccept = str;
			}
		} else {
			this.setAccept(str);
		}
		
		this.setAccept(newAccept);
	},
	
	addAcceptXml: function() {
		this.addAcceptString('text/xml');
	},
	
	addAcceptHtml: function() {
		this.addAcceptString('text/html');
	},
	
	addAcceptXmlHtml:function() {
		this.addAcceptXml();
		this.addAcceptHtml();
	},
	
	hasFile: function() {
		return this._aFileName.length > 0;
	},
	
	getFileNames:function() {
		return this._aFileName; 
	},
	
	startRead: function() {
		this._aFileContent = [];
		this._readNextFile();
	},
	
	_readNextFile:function() {
		var idx = this._aFileContent.length;
		var file = this._oFileInput.files[idx];
		
		var reader = new FileReader();
	
		reader.readAsText( file ); 
  
		// Handle progress, success, and errors
		reader.onload = jQuery.proxy(this._onFileReaderLoad, this);	
		reader.onerror = jQuery.proxy(this._onFileReaderError, this);	
	},

	/**
	 * First version only support read all file one by one
	 * @param evt
	 */
	_onFileReaderLoad:function(evt) {
		var content = evt.target.result;

		//first the loadOne event
		var name = this._getCurrentFileName();
		var cbRet = this.fireLoadOne({'origionalEvent': evt, "content": content, "name": name, "success": true});

		this._aFileContent.push(content);

		if ( this._aFileContent.length == this._aFileName.length) {
			//all finished,just file event
			this.fireLoadAll({'origionalEvent': evt, "contents": this._aFileContent, "names": this._aFileName});
		} else {
			//read next
			if ( cbRet === false) {
				//return false means the caller don't want to read next file, so here use the === do judge explicit
			} else {
				this._readNextFile();	
			}
		}
	},
	
	_getCurrentFileName: function() {
		var idx = this._aFileContent.length;
		var file = this._oFileInput.files[idx];
		return file.name;
	},
	
	_onFileReaderError: function(evt) {
		//??
		var error = new Error("read file content error");

		//fire loadOne event
		var name = this._getCurrentFileName();
		
		var cbRet = this.fireLoadOne({'origionalEvent': evt, "content": error, "name": name, "success": false});

		this._aFileContent.push(error);
		
		if ( this._aFileContent.length == this._aFileName.length) {
			//all finished, just fire event
			this.fireLoadAll({'origionalEvent': evt, "contents": this._aFileContent, "names": this._aFileName});
		} else {
			if ( cbRet === false) {
				//return false means the caller don't want to read next file, so here use the === do judge explicit
			} else {
				//read next
				this._readNextFile();
			}
		}
	},
		
	_getFileInputHtmlString: function() {
		var str = "<input type='file' style='display:none' id='" + this.getId() + "-file-input' ";
		if (this.getMultiple()) {
			str +=" multiple ";
		}
		
		if (this.getAccept()) {
			str += ' accept="' + this.getAccept().trim() + '"'; 
		}
		
		str+="></input>";
		return str;
	},
	
	renderer : function(oRm, oControl) {
		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">");

		//first the button
		oRm.renderControl( oControl.getButtonControl());
		
		//then file input
		oRm.write( oControl._getFileInputHtmlString());
		
		oRm.write("</span>");
	},
});


fd.uilib.FileChoose.prototype.onChange = function(evt) {
	//get the file names
	//console.error( "call the FileChoose onChange" );
	
	this._aFileName = [];
	
	for ( var i = 0; i < this._oFileInput.files.length; i++) {
		var file = this._oFileInput.files[i];
		this._aFileName.push(file.name);
	}
	
	//console.error(" --$$onChange", new Date());
	
	//fire event
	this.fireChange({'origionalEvent': evt, "names": this._aFileName});
};


fd.uilib.FileChoose.prototype.onAfterRendering = function() {
	//console.error( "!!!call the FileChoose onAfterRendering" );
	
	this._oFileInput = jQuery.sap.domById(this.getId()+"-file-input");
	
	this._oFileInput.onchange = jQuery.proxy(this.onChange, this);
	
	var that = this;
	
	//then bind the button and the file input
	var btn = this.getButtonControl();
	
	//only need attach once, as each time after refresh the _oFileInput will get the new value
	if (! this._bAttachedBtnPress) {
		this._bAttachedBtnPress = true;
		
		btn.attachPress( function(){
			that._oFileInput.click();
		});
	}
};

