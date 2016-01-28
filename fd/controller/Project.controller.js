var gprj ;

sap.ui.controller("fd.controller.Project", {

	onNewProjectPressed:  function(oEvent) {
		var str = "New a project by define the location and name.\r\n\tComing soon!";
		alert(str);
		return;
		
		//??
	/*	var name = prompt("What the Project Name?");
		if (name != "") {
			fd.bus.publish("view", "CloseAll");
			
			this._mProj.name  = name;
			
			this._viewTable.setTitle("View for Project: " + name);
		}
		
		//delete the old views in table
		this._mProj.aView = [];
		this._viewTable.unbindRows();*/
	},
	
	onOpenProjectPressed:  function(oEvent) {
		var str = "Open all the views and controls for the project.\r\n\tComing soon!";
		alert(str);
	},
	
	onSaveProjectPressed:  function(oEvent) {
		var str = "Save all the views and controls for the project.\r\n\tComing soon!";
		alert(str);
		
	},
	
	onPreviewProjectPressed:  function(oEvent) {
		var str = "Preview all the views for the project.\r\n\tComing soon!";
		alert(str);
		
	},
	
	onGetInputResultForNewView: function( names) {
		var mName = { ViewName: names[0],  ControllerName: names[1], 
				viewCtrlNodeContent: null};
		
		//add new entry into it and publish event
		fd.bus.publish("view", "NewView", mName);
		
	},

	onGetInputResultForNewFragment: function( names) {
		var mName = { ViewName: names[0],
				bFragment : true,
				//for user click the 'New Fragment it is empty, for call the from 'More ...' then it add the content 
				viewCtrlNodeContent: names.length == 2 ? names[1]  : null
			};
		
		//add new entry into it and publish event
		fd.bus.publish("view", "NewView", mName);
		
	},
	

	onGetInputResultForOpenViewFromFile: function( names) {
		//first try to parse the xml file
		var treeNode;
		
		var url = names[0];
		
		try {
			treeNode = fd.util.io.readViewFromFile( url );
		} catch (ex){
			fd.uilib.Message.showErrors("Read view file error.", ex );
			return;
		}
		
		var mName = { 
				ViewName: fd.util.getViewNameFromUrl( url ),  
				ControllerName: fd.util.getControllerNameFromUrl(names[1]),
				//also the content
				viewCtrlNodeContent: treeNode,
				id:  "",   //so it will get later
		};
		
		
		//add new entry into it and publish event
		fd.bus.publish("view", "NewView", mName);
	},
	
	/**
	 * 
	 * @param aInfor:  [ view type,  view nama, view content]
	 */
	onGetInputResultForOpenViewFromFileContent: function( aInfor) {
		var treeNode;

		try {
			treeNode = fd.util.io.readViewFromStringContent( aInfor[0], aInfor[2]);
		} catch (ex){
			fd.uilib.Message.showErrors("Parse view content error.", ex );
			return;
		}
		
		var mName = { 
				ViewName: aInfor[1],  
				//also the content
				viewCtrlNodeContent: treeNode,
		};

		//add new entry into it and publish event
		fd.bus.publish("view", "NewView", mName);

	},
	
	onNewViewPressed:  function(oEvent) {
		//get the view name and controller name
		
		var dbg = 0;
		if (!dbg) {
			fd.view.Helper.getInput( 
					fd.InputType.ViewController,
					this.onGetInputResultForNewView,
					this);
		} else {
			//??avoid type , just tmp call
			this.onGetInputResultForNewView(["MyView", "MyController"] );
		}
	},
	
	onNewFragmentPressed:  function(oEvent) {
		//get the view name and controller name
		fd.view.Helper.getInput( 
				fd.InputType.Fragment,
				this.onGetInputResultForNewFragment,
				this);
	},

	onOpenSamplesPressed:  function(oEvent) {
		if (!this._oSampleDlg) {
			this._oSampleDlg = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.SampleDialog", this);
			this.byId("sampleTable").setModel( fd.model.SampleMng.getModel());
		}

		this._oSampleDlg.open();
	},

	onLoadSampleCanclePressed: function( evt ) {
	    this._oSampleDlg.close();
	},

	onCheckPressed : function( evt ) {
	    var mainController = fd.getMainController();
	    var aId =   fd.view.Helper.getPropFromTableSelection( this._viewTable, "id");
	    var totalError = 0;
	    var errorViews = 0;

	    for (var i=0; i < aId.length; i++) {
	    	var id = aId[i];
	    	var designController = mainController.getDesignControllerById( id );
	    	var checkRet = designController.doSyntaxCheck();
	    	if (checkRet.errorCount) {
	    		errorViews ++;
	    		totalError += checkRet.errorCount;

	    		//also change the view name, 
	    		var navItem = mainController.getNavItemById(id);
	    		var text = navItem.getText();
	    		if ( !text.sapStartWith("!!")) {
	    			navItem.setText("!!" + text);
	    		}
	    	}
	    }

	    //give report 
	    if (errorViews) {
	    	var error = "Total {0} errors for {1} views, please get detail information by click the view marked with !!".sapFormat(
	    		totalError,  errorViews
	    	);
			fd.uilib.Message.warning(error);
	    } else {
	    	fd.uilib.Message.information("Congratulations, no any error!");
	    }
	},

	onMorePressed: function( evt ) {
	    if (!this._oActionSheet) {
			this._oActionSheet = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.ViewMoreAction", this);
		}

		//first try to update the status
		var bOneOrMoreRow =  this._viewTable.getSelectedIndices().length > 0; 

		this.byId("OpenView").setEnabled( bOneOrMoreRow);
		this.byId("CloseView").setEnabled( bOneOrMoreRow);
		this.byId("RemoveView").setEnabled( bOneOrMoreRow);
	
		this._oActionSheet.openBy(evt.getSource());
	},
	
	onRemoveViewPressed: function( evt ) {
	   this.handleWorksetView("removeWorksetView");

	    //!!also remove the rows
	},
	
	onOpenViewPressed : function( evt ) {
	     this.handleWorksetView("openWorksetView");
	},
	
	onCloseViewPressed: function( evt ) {
	    this.handleWorksetView("closeWorksetView");
	},

	handleWorksetView: function( fn ) {
	    var mainController = fd.getMainController();
	    var aId =   fd.view.Helper.getPropFromTableSelection( this._viewTable, "id");
	    for (var i=0; i < aId.length; i++) {
	    	var id = aId[i];
	    	mainController[fn](id);
	    }
	},

	onLoadSampleOkPressed: function( evt ) {
		var table = this.byId("sampleTable");
		var items = table.getItems();
		var selItem;
		for (var i=0; i < items.length; i++) {
		 	var item = items[i];
		 	if (item.getSelected() ) {
		 		selItem = item;
		 		break;
		 	}
		}
		if (selItem) {
			var context = selItem.getBindingContext();
			var mData = {
				viewUrl: context.getProperty("viewUrl"),
				controllerUrl:  context.getProperty("controllerUrl")
			};
			this.onLoadSampleConfirmed("sample", "load", mData);
		}

	    this._oSampleDlg.close();
	},

	/**
	 * [onNewViewCreated description]
	 * @param  {[type]} channel [description]
	 * @param  {[type]} envent  [description]
	 * @param  {[type]} mData   : nameOfView  nameOfController  id
	 * @return {[type]}         [description]
	 */
	onNewViewCreated: function(channel, envent, mData) {
   		this._mProj.aView.push( mData);
		this.notifyTableDataChanged();
	},
	
	/**
	 * [onLoadSampleConfirmed description]
	 * @param  {[type]} channel [description]
	 * @param  {[type]} envent  [description]
	 * @param  {[type]} mData   { viewUrl:  [controllerUrl]: }
	 * @return {[type]}         [description]
	 */
	onLoadSampleConfirmed: function(channel, envent, mData) {
	    try {
			var treeNode = null;
			treeNode = fd.util.io.readViewFromFile( mData.viewUrl, fd.ViewType.Xml);

			var controllerContent = "";

			//?? also load controller
			if ( mData.controllerUrl) {
				controllerContent = fd.util.io.loadFileContent( mData.controllerUrl);
			}

			var mName = { 
					ViewName: fd.util.getDisplayViewName(mData.viewUrl),  
					//also the content
					viewCtrlNodeContent: treeNode,
					bFragment:    treeNode.isFragment(),
					controllerContent: controllerContent
			};

			//add new entry into it and publish event
			fd.bus.publish("view", "NewView", mName);

		} catch (ex) {
			if (!treeNode)
				fd.uilib.Message.showErrors("Fail to load sample xml view" + mData.viewUrl, ex);
			else 
				fd.uilib.Message.showErrors("Fail to load sample controller " + mData.controllerUrl, ex);
		}
	},
	
	onOpenViewFromFilePressed:  function(oEvent) {
		var dbg = 0;
		if (!dbg) {
			fd.view.Helper.getInput( 
					fd.InputType.ViewControllerFromFile,
					this.onGetInputResultForOpenViewFromFile,
					this);
		} else {
			
			var fn = "C:\\temp\\html\\dptDetails.view.html";
			this.onGetInputResultForOpenViewFromFile([fn, ""] );
		}
	},
	
	onOpenFromFileChanged: function() {
		//the file changed, just start open
		this._oOpenFileChoose.startRead();
		//for simple, just use the loadAll event
	},
	
	showProgressDialog: function( evt ) {
   		if (!this._oProgressDlg) {
			this._oProgressDlg = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.ProgressDialog", this);
		} else {
			this.byId("ProgressIndicator").setPercentValue(0);
			this.byId("DetailInfor").setValue("");
		}
		this._oProgressDlg.open();
	},
	
	updateProgress: function(percentValue, displayValue, detailInfor) {
		this.byId("ProgressIndicator").setPercentValue(percentValue);
		if (displayValue) {
			this.byId("ProgressIndicator").setDisplayValue(displayValue);
		}
		var oldValue = this.byId("DetailInfor").getValue();
		this.byId("DetailInfor").setValue(oldValue + detailInfor);
	},

	/**
	 * If there are error happens, then show the close button so user can copy the error out
	 * @param  {[type]} bDirectlyClose [description]
	 * @return {[type]}                [description]
	 */
	closeProgressDialog : function(bDirectlyClose) {
		if (bDirectlyClose)
	    	this._oProgressDlg.close();
	},
	

	/**
	 * Call back for open all the file content
	 * @param evt
	 */
	onOpenFromFileLoadAll: function(evt) {
		var aName = evt.getParameter("names");
		var aContent = evt.getParameter("contents");
		
		var aError = [];
		//now even there are so many file, but the dialog still not show in time, so just disable it 
		var bNeedProgress = aContent.length > 100;
		if (bNeedProgress) {
			this.showProgressDialog();
		}

		for (var i = 0; i < aContent.length; i++) {
			var content = aContent[i];
			var name = aName[i];
			
			if (!fd.util.checkAsciiCode(content)) {
				continue;
			}

			// var percentValue = ( i ) / aContent.length;
			// var showValue = "Total {0} now finished {1}".sapFormat(aContent.length, i);
			// var detailInfo =  (i === 0) ? name : "\r\n" + name;
			// if (bNeedProgress) {
			// 	this.updateProgress(percentValue, showValue, detailInfo + "...");
			// }

			if ( content instanceof Error) {
				// if (bNeedProgress) {
				// 	percentValue = ( i + 1) / aContent.length;
				// 	showValue = "Total {0} now finished {1}".sapFormat(aContent.length, i+1);
				// 	this.updateProgress(percentValue, showValue, "read error");
				// }
				//read error
				var err = "Read file [" + name  + "] error";
				aError.push(err);
				continue;
			} 
			
			//parse the content
			var viewType = fd.util.getViewTypeByName(name);
			var treeNode;
			
			try {
				treeNode = fd.util.io.readViewFromStringContent( viewType, content);
			} catch (ex){
				aError.push("Parse file [" + name + "] error: " + ex );
				// if (bNeedProgress) {
				// 	percentValue = ( i + 1) / aContent.length;
				// 	showValue = "Total {0} now finished {1}".sapFormat(aContent.length, i+1);
				// 	this.updateProgress(percentValue, showValue, "parse error: " + ex.getMessage());
				// }
				continue;
			}
				
			var mName = { 
					ViewName: fd.util.getDisplayViewName(name),  
					//also the content
					viewCtrlNodeContent: treeNode,
					bFragment:    treeNode.isFragment(),

			};

			//only the last need activate 
			if ( i !==  aContent.length-1) {
				mName.bNotActiveView = true	;
			}
			

			// if (bNeedProgress) {
			// 	mName.bNotActiveView = true	;
			// }
			

			//add new entry into it and publish event
			fd.bus.publish("view", "NewView", mName);
			// if (bNeedProgress) {
			// 	percentValue = ( i + 1) / aContent.length;
			// 	showValue = "Total {0} now finished {1}".sapFormat(aContent.length, i+1);
			// 	this.updateProgress(percentValue, showValue, "Done.");
			// }
		}

		//just notify table
		// this.notifyTableDataChanged();

		//if all successful then just use toast message to notify
		//if have error then use the explicit method
		// if (bNeedProgress) {
		// 	this.closeProgressDialog(true);
		// }
		
		if (aError.length>0) {
			//var str = aError.join("\r\n");
			//alert( str );
			fd.uilib.Message.showErrors("Open files error", aError);
		} 
	},
	
	onOpenViewFromFileContentPressed:  function(oEvent) {
		fd.view.Helper.getInput( 
			fd.InputType.ViewContent,
			this.onGetInputResultForOpenViewFromFileContent,
			this);
	},
	
	onLoadODataMetadataPressed:     function ( ) {
	    fd.model.ODataMng.openODataLoadDialog();
	},


	
	onPreviewViewPressed:  function(oEvent) {
		
	},
	
	notifyTableDataChanged: function() {
		this._viewModel.setData( this._mProj.aView );
	},

	onViewTableRowSelectionChanged: function( evt ) {
	    var idxs = evt.getSource().getSelectedIndices(); 
	    this.byId("CheckSyntax").setEnabled( idxs.length > 0);
	},
	
	
	/**
	 * In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		/*
		this.byId("NewProject").attachPress(  this.onNewProjectPressed,   this );
		this.byId("OpenProject").attachPress( this.onOpenProjectPressed,   this );
		this.byId("SaveProject").attachPress( this.onSaveProjectPressed,   this );
		this.byId("PreviewProject").attachPress( this.onPreviewProjectPressed,   this );
		*/
		this._oOpenFileChoose = this.byId("ProjectFileChoose");
		
		this.byId("NewProject").attachPress(this.onNewProjectPressed, this).setEnabled(false);
		this.byId("OpenProject").attachPress(this.onOpenProjectPressed, this).setEnabled(false);

		this.byId("SaveProject").attachPress(this.onSaveProjectPressed, this).setEnabled(false);
		this.byId("PreviewProject").attachPress(this.onPreviewProjectPressed, this).setEnabled(false);


		this.byId("NewView").attachPress(this.onNewViewPressed, this);
		this.byId("NewFragment").attachPress(this.onNewFragmentPressed, this);
		
		this.byId("OpenSamples").attachPress(this.onOpenSamplesPressed, this);

		//this.byId("OpenFromFileView").attachPress( 	  this.onOpenViewFromFilePressed,   this );
		this._oOpenFileChoose.attachChange(this.onOpenFromFileChanged, this);
		this._oOpenFileChoose.attachLoadAll(this.onOpenFromFileLoadAll, this);

		this.byId("OpenFromFileContent").attachPress(this.onOpenViewFromFileContentPressed, this);
		this.byId("LoadODataMetadata").attachPress(this.onLoadODataMetadataPressed, this);
		this.byId("CheckSyntax").attachPress(this.onCheckPressed, this);
		this.byId("MoreAction").attachPress(this.onMorePressed, this);

		this._viewTable = this.byId("ViewTable");

		this._viewModel = new sap.ui.model.json.JSONModel();
		this._viewModel.setData(this._mProj.aView);

		this._viewTable.setModel(this._viewModel);
		this._viewTable.bindRows("/");
	
		this._viewTable.attachRowSelectionChange( this.onViewTableRowSelectionChanged, this);

		fd.bus.subscribe("sample", "load", this.onLoadSampleConfirmed, this);
		fd.bus.subscribe("view", "NewViewCreated", this.onNewViewCreated, this);
		

		gprj = this;

   		//register itselt fo main, so others easy find him
		fd.setProjectController( this );	
	},

   
   _viewModel: null,
   _viewTable: null,

   //All the content of the project, so later is easy export/import
   _mProj: {
	   name:"", 
	   aView: [],   //one view like:  { ViewName: xx,  ControllerName: xx ,id:}  
   },

   _oOpenFileChoose:null,
});
