var gpv;

sap.ui.controller("fd.controller.ViewPreview", {

	onInit: function() {
    	
    },
    
	recreateContainer : function( previewType) {
			switch (previewType) {
				case fd.PreviewType.Desktop :
					//no need
					break;
					
				case fd.PreviewType.Phone :  //fall down, only size diff					
				case fd.PreviewType.FullApp :
						this.fullAppContainer = new sap.m.App({});
					break;
				case fd.PreviewType.Master :
						this.splitAppContainer = new sap.m.SplitApp({});
						
						this.emptyDetailPage  = new sap.ui.core.HTML({
			    		content: "<div class='SpecialNodeDescription'>Empty Master Page<br/><br/>Just show here for demo !</div>",
			    	});		
					break;
				case fd.PreviewType.Slave:
						this.splitAppContainer = new sap.m.SplitApp({});
						
						this.emptyMasterPage  = new sap.ui.core.HTML({
			    		content: "<div class='SpecialNodeDescription'>Empty Master Page<br/><br/>Just show here for demo !</div>", 
			    	});
					break;
			}		
		},
		
    onDebugPropChanged: function(evt) {
		//just change the ctrl value is enough
		var editor = evt.getSource();
		var context = editor.getBindingContext();
		var value = evt.getParameter('value');
		var type = evt.getParameter('type');
		
		//var ctrl = this.aSelectedCtrl [0];
		var ctrl = context.getProperty('/Ctrl');
		var name = context.getProperty('name');
		
		//as some control may has its own implement of setXX, for example the sap.m.Page have setTitle, 
		//so here must call the setXX 
		
		var cmd ="set" + name.sapCapital();

		//also here the value from SmartEditor is string, need change to different type according to the type
		value = fd.model.EnumMng.convertPropValueByType(type, value); 
			
		ctrl[cmd](value);
		
		//also save it to data mode
		var model = context.getModel();
		model.setProperty("value", value, context);

		//just set propert to show the change button
		model.setProperty("changed", true, context);

		this.byId("ApplyAllChange").setEnabled(true);
		this.byId("DiscardAllChange").setEnabled(true);
	},

	/**
	 * Call back for apply one prop
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	onApplyPropertyPressed: function(evt) {
		var btn = evt.getSource();
		var context = btn.getBindingContext();
		var model = context.getModel();
		model.setProperty("changed", false, context);

		var propEntry = model.getProperty("", context);

		//update the prop back
		var mappingNodePath = this.treeNode.getMappingNodePath();
		var mappingNode = this.view.getViewWorkset().getMappingTreeNode( mappingNodePath );
		mappingNode.mergePropMetaData( propEntry.name, propEntry.type, propEntry.value);

		//need inform design to do update for the table to show the latest value
		this.view.getViewWorkset().getDesignController().refreshMetaTable("Prop", mappingNode);

		var oData = model.getData();
		var count = oData.Prop.sapKeyValueCount("changed", true);

		this.byId("ApplyAllChange").setEnabled( count >0 );
		this.byId("DiscardAllChange").setEnabled( count >0 );
	},
	
	/**
	 * Live changed event, so no need update the property for model, otherwise will create dead loop
	 * ?? now duplicate code, chagne later
	 * @param evt
	 */
	onDebugPropLiveChanged: function(evt) {
			//just change the ctrl value is enough
			var editor = evt.getSource();
			var context = editor.getBindingContext();
			var value = evt.getParameter('value');
			var type = evt.getParameter('type');

			//for icon or source only when press enter will change
			//now the CSSSize can't set one by one, 
			if (type === 'sap.ui.core.URI' || type === "sap.ui.core.CSSSize" )
				return;

			//for color, also no meaning to change live
			var name = context.getProperty('name');
			if ( name.sapEndWith("Color"))
				return;

			//var ctrl = this.aSelectedCtrl [0];
			var ctrl = context.getProperty('/Ctrl');
			
			//as some control may has its own implement of setXX, for example the sap.m.Page have setTitle, 
			//so here must call the setXX 
			
			var cmd ="set" + name.sapCapital();

			//also here the value from SmartEditor is string, need change to different type according to the type
			value = fd.model.EnumMng.convertPropValueByType(type, value); 
				
			ctrl[cmd](value);

			//!!so for the live change no need update property as it will trigger the final change later
	 },

	/* onChangeIconPressed: function( evt ) {
	 	fd.model.ImageMng.openIconDialog( this.onIconChangedConfirmed, this, evt.getSource());
	 },*/
	 
	/**
	 * The call back function for choose an icon for an prop dynamic
	 * @param  {[type]} icon   [description]
	 * @param  {[type]} cbContext: passed when call the changeIcon
	 * @return {[type]}        [description]
	 */
	/*onIconChangedConfirmed: function( iconUrl) {
		//only when there is one row the icon button can be pressed
		var  selIdx = this._oDebugTable.getSelectedIndex();
		if ( selIdx === -1) {
			fd.assert("logic error, should have one row when press change icon");
			return ;
		}
		var context = this._oDebugTable.getContextByIndex(selIdx);
	    var ctrl = context.getProperty('/Ctrl');
		var name = context.getProperty('name');

		//as some control may has its own implement of setXX, for example the sap.m.Page have setTitle, 
		//so here must call the setXX 
		var cmd ="set" + name.sapCapital();
			
		ctrl[cmd](iconUrl);
		
		//also save it to data mode
		var model = context.getModel();
		model.setProperty("value", iconUrl, context);
	},*/

	onApplyAllChangePressed: function( evt ) {
		var mappingNodePath = this.treeNode.getMappingNodePath();
		var mappingNode = this.view.getViewWorkset().getMappingTreeNode(mappingNodePath);

		var oModel = this._oDebugTable.getModel(); 
		var oData = oModel.getData();

		//now binding to Prop
		if ( ! ("Prop" in oData) ) {
			fd.assert("onDiscardAllChangePressed, should in it");
			return;
		}
		var arr = oData.Prop;
		for (var i=0; i < arr.length; i++) {
			var node = arr[i];
			if ( node.changed) {
				//use setProperty in order to make the button invisible
				var path = "/Prop/{0}/changed".sapFormat(i);
				oModel.setProperty(path, false);

				//and apply the changes back
				mappingNode.mergePropMetaData( node.name, node.type, node.value);
			}
		}

		//need inform design to do update for the table to show the latest value
		this.view.getViewWorkset().getDesignController().refreshMetaTable("Prop", mappingNode);

		evt.getSource().setEnabled(false);
		this.byId("DiscardAllChange").setEnabled(false);
	},
	
	onDiscardAllChangePressed: function( evt ) {
		var oModel = this._oDebugTable.getModel(); 
		var oData = oModel.getData();

		//now binding to Prop
		if ( ! ("Prop" in oData) ) {
			fd.assert("onDiscardAllChangePressed, should in it");
			return;
		}
		var arr = oData.Prop;
		for (var i=0; i < arr.length; i++) {
			var node = arr[i];
			if ( node.changed) {
				//use setProperty in order to make the button invisible
				var path = "/Prop/{0}/changed".sapFormat(i);
				oModel.setProperty(path, false);
			}
		}
		evt.getSource().setEnabled(false);
		this.byId("ApplyAllChange").setEnabled(false);
	},


   getHtmlHead: function() {
	    	var htmlHead = 			'<!DOCTYPE html>'	+	'\r\n' +
						'<html><head>'	+	'\r\n' +
						'    <meta http-equiv=\'X-UA-Compatible\' content=\'IE=edge\' />'	+	'\r\n' +
						'    <title>Runable Code created by Fast Designer</title>'	+	'\r\n' +
						''	+	'\r\n' ;

			htmlHead += fd.getSettingController().getUI5Bootstrap();

	    	return htmlHead;
    },

	onSaveRunableHTMLToFile: function() {
		//!!now  only run to one file, later add support for multiple files
		
		//then the controllr part
		var controllerContent = "";
		var controllerName =  this.designController.getControllerName();
		if ( controllerName) {
			controllerContent = this.viewControllerController.getControllerContent();
			if ( controllerContent =="") {
				fd.uilib.Message.warning("Please first generate the Controller content in the \"Controller\" tab!");
				return;	
			}
		}

		//head
		var headPart = this.getHtmlHead();
		
		//xml view part
		//!! later need considerate the Desktop or phone mode
		var mCfg = { fastMode: this.byId('PreviewFastMode').getChecked() };
		var xmlViewContent = this.designController.exportToXml( mCfg);
		var  xmlPart = "\r\n<script id=\"myXmlContent\" type=\"text/xmldata\"> \r\n" +
				xmlViewContent + 
				"\r\n</script>";

		var scriptPart = "<script>\r\n";	
		if ( controllerContent) {
			scriptPart += controllerContent;
			scriptPart += "\r\n";
		}

		//now ony support 
		


		var bOpenDlg = this.byId("OpenDialog").getChecked();
		if (bOpenDlg) {
			var instanceStr =
				'//---As user may check the \'Open Dialog wrongly, so here add code to ensure it is dialog or Popover\'' + '\r\n' +
				'var viewContent = sap.ui.xmlview({ viewContent: jQuery(\'#myXmlContent\').html() });' + '\r\n' +
				'var dialog = viewContent.getContent()[0];' + '\r\n' +
				'if ( dialog.open || dialog.openBy) {' + '\r\n' +
				'	var openButton =  new sap.m.Button({text: "Click me to open Dialog or Popover, press \'ESCAPE\' to close",' + '\r\n' +
				'		press: function(evt) {' + '\r\n' +
				'			if (dialog.open)' + '\r\n' +
				'				dialog.open();' + '\r\n' +
				'			else ' + '\r\n' +
				'				dialog.openBy(evt.getSource());' + '\r\n' +
				'		}' + '\r\n' +
				'    });' + '\r\n' +
				'    openButton.placeAt("content");' + '\r\n' +
				'} else {' + '\r\n' +
				'    var viewContent = sap.ui.xmlview({ viewContent: jQuery("#myXmlContent").html() });'	 + '\r\n'  + 
				'    var myApp = new sap.m.App(\'myDemoApp\');'		 + '\r\n'  + 
				'    myApp.addPage(viewContent);'		 + '\r\n'  + 
				'    myApp.placeAt("content");'		 + '\r\n'  + 
				'}';
			scriptPart += instanceStr;
		} else {
			//=====later will support more mode 
			scriptPart += 
			    'var viewContent = sap.ui.xmlview({ viewContent: jQuery("#myXmlContent").html() });'	 + '\r\n'  + 
				'    var myApp = new sap.m.App(\'myDemoApp\');'		 + '\r\n'  + 
				'    myApp.addPage(viewContent);'		 + '\r\n'  + 
				'    myApp.placeAt("content");' ;
		}

		scriptPart += "\r\n</script>\r\n";

		//last part
		var lastPart = 	
					'</head>'	+	'\r\n'+
					'<body class=\'sapUiBody\'>'	+	'\r\n'+
					'	<div id=\'content\'></div>'	+	'\r\n'+
					'</body>'	+	'\r\n'+
					'</html>';
		
		//combine together
		var content = [ headPart, xmlPart, scriptPart,  lastPart].join("\r\n");
		
		var name = this.view.getViewWorkset().getNameOfView() + "-runable.html";
		
		fd.util.Export.saveToFile( content, name);
	},

/*
var viewContent = sap.ui.xmlview({ viewContent: jQuery('#myXmlContent').html() });
var dialog = viewContent.getContent()[0];
if ( dialog.open) {
	dialog.open();
} else if ( dialog.openBy() ){
	dialog.openBy();
} else {
	viewContent.placeAt('content');
}
*/
	
    getOutlineBorderCSS: function() {
    	return "2px red solid";
    },
    
    onAfterRendering: function() {
    	
	},
	
	restoreOldControlOutline: function(node){
		for ( var id in this.mPreviewOutline) {
			var border = this.mPreviewOutline[id];
			var $node = $( "#" + id);
			$node.css('border', border);
		}
		
		//so after restore, then the old can delete
		this.mPreviewOutline = {};
	},
	
	/**
	 * 
	 * @param node
	 */
	showControlOutline : function(node) {
		var i, clsName;
		if (node.isRootNode()) {
			return;
		}
		
		var aMatch = [];
		var shellId = "#" + this.getPreviewShellId();
		var $shell = $(shellId);
		if ( $shell.length != 1) {
			fd.assert(false, "preview shell wrong");
			return;
		}	
		
		//first try to get jQuery nodes by class or by aggr,  
		if (node.isAggrNode()) {
			//
			var parent = node.getParent();
			//need from parent's class, get the id, then from id get the ui5 control, by core().byId(), then get the ui5 control, 
			//then get the children
			clsName =  parent.getPreviewClassName();
			if ( ! clsName ) {
				//??
				fd.assert(false, "normal node why no previewClass?");
				return;
			}
			
			var ui5Ctrl = null; 
			
			clsName = "." + clsName;
			aMatch = $shell.find(clsName);
			if ( aMatch && aMatch.length ==1) {
				var id = aMatch[0].getAttribute('id');
			    ui5Ctrl = sap.ui.getCore().byId(id);
			    if (!ui5Ctrl) {
			    	return;
			    }
			} else {
				fd.assert(false, "Why null or >1");
				return;
			}
			
			//the first letter need change to upper case
			var nodeName = node.getNodeName();
			
			nodeName = nodeName.substr(0, 1).toUpperCase() +  nodeName.substr(1);
			
			var cmd ="ui5Ctrl.get" + nodeName + "();";
			var ret = null;
			
			try {
				 ret = eval(cmd);
			} catch( ex) {
				return;
			}
			
			//ret may be single or []
			var arr = null;
			if ( ! ( ret instanceof Array ) ) {
				arr = [ ret ];
			} else {
				arr = ret;
			}
			
			//one by one get the id
			for (i=0; i< arr.length; i++) {
				var ctrl = arr[i]; 
				if ( ctrl ) {
					id = ctrl.getId();
					
					//then save older and change to new
					var $ele = jQuery("#" + id);
					var border = $ele.css('border');
					
					//save first
					this.mPreviewOutline[id] = border;
					$ele.css('border',  this.getOutlineBorderCSS());
				}
			}
			
		} else {
			clsName =  node.getPreviewClassName();
			if ( ! clsName ) {
				//??
				fd.assert(false, "normal node why no previewClass?");
				return;
			}
			
			clsName = "." + clsName;
			aMatch = $shell.find(clsName);
			
			//then save older and change to new
			if (aMatch.length) {
				//save older
				for (  i = 0; i < aMatch.length; i++) {
					
					var ele = aMatch[i];
					var jEle = jQuery(ele);
					border = jEle.css('border');
					
					//save first
					id = aMatch[i].getAttribute('id');
					this.mPreviewOutline[id] = border;
					
					jEle.css('border',  this.getOutlineBorderCSS());
				}
			} 
		}
		
	},
	
	updateDebugTable: function() {
		//when switch to new node, always disable the apply/discard
		this.byId("ApplyAllChange").setEnabled(false);
		this.byId("DiscardAllChange").setEnabled(false);

		//for the root/aggrNode, no need show debug
		if (this.treeNode.isRootNode() || this.treeNode.isAggrNode()) {
			this._oDebugTable.setVisible(false);
			return;
		} else {
			this._oDebugTable.setVisible(true);
		}
		
		//the id in here
		var aId = [];
		for (var id in this.mPreviewOutline) {
			aId.push(id);
		}
		
		//first only support one
		if ( aId.length ==1) {
			var ctrl = sap.ui.getCore().byId(id);
			this.aSelectedCtrl =[ctrl];
			
			var debugData = this.treeNode.getDebugData();
			if (!debugData) {
				
				debugData = fd.model.DebugCtrl.buildDebugData(ctrl);
				this.treeNode.setDebugData( debugData );
			}
			
			//set model data and rebind
			this._oDebugTable.getModel().setData(debugData);
			this._oDebugTable.bindRows( "/Prop");
		}
	},
	
	onNaviTreeNodeSelectChanged: function(oEvent) {
		var node = oEvent.getParameter('node');
		fd.assert( node);
		
		//now even retap it, it will fire this event, so need check only when the node diff
		if (node == this.treeNode)
			return;
		
		//first try to restore the old
		this.restoreOldControlOutline(this.treeNode);
		
		this.treeNode = node;
		this.showControlOutline(node);
		
		//??later update the prop part
		this.updateDebugTable();
	},

	onPropSearchPressed: function( evt ) {
	    var val = this.byId("propSearch").getValue();
	    var binding = this._oDebugTable.getBinding("rows");
	    var filter = new sap.ui.model.Filter("name", "Contains", val);
	    binding.filter( filter);
	},
	

	//now only need support for the Change Icon
	/*onDebugTableRowSelectionChange: function( evt ) {
	    var  table = evt.getSource();
    	var idxs = table.getSelectedIndices();
    	if (idxs.length !== 1) {
    		this.byId("ChangeIcon").setEnabled(false);
    	} else {
    		var context = table.getContextByIndex(idxs[0]);
    		var type = context.getProperty("type");
    		if ( type === "sap.ui.core.URI") {
    			this.byId("ChangeIcon").setEnabled(true);
    		} else {
    			this.byId("ChangeIcon").setEnabled(false);
    		}
    	}
	},
	*/

	/**
	 *  In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		this.view = this.getView();
		this.designController = this.view.getViewWorkset().getDesignController();
		this.viewControllerController = this.view.getViewWorkset().getViewControllerController();
		
		
		this.choiceModel = new sap.ui.model.json.JSONModel(
				);
		this.choiceModel.setData(this.choiceData);
		
		this.naviTree = this.byId('NavigatonTree');
		this.treeNode = null;
		this.naviTree.attachSelect(this.onNaviTreeNodeSelectChanged, this);
		
		//in order to avoid model confict, just bind to the control
		this.previewTypeChoice = this.byId("PreviewTypeChoice");
		this.previewTypeChoice.setModel( this.choiceModel );
		this.previewTypeChoice.setSelectedKey('FullApp');
		this.previewTypeChoice.setWidth('200px');
		
		//this.previewTypeChoice.attachChange( this.onPreviewTypeChoiceChanged, this);
		//??later need depend on the view type to select 
		this.previewTypeChoice.setSelectedKey('sel');
		
		this.byId('PreviewBtn').attachPress(  this.onPreviewPressed,   this );
	    this.byId('SaveRunableHTMLToFile').attachPress(  this.onSaveRunableHTMLToFile,   this );
	    // this.byId("propSearch").attachSearch(this.onPropSearchPressed, this);
	    // this.byId("propSearch").attachLiveChange(this.onPropSearchPressed, this);
	    this.byId("ApplyAllChange").attachPress(this.onApplyAllChangePressed, this);
	    this.byId("DiscardAllChange").attachPress(this.onDiscardAllChangePressed, this);

		//this.byId('PreviewBtn').setEnabled(false);
    	
		this._oDebugTable = this.byId('PreviewDebugTable');
		// this._oDebugTable.attachRowSelectionChange( this.onDebugTableRowSelectionChange, this );
    
    gpv = this;
	},
	
	/**
	 * As now if the view is Page it can't show directly, so need add some container
	 */
	createContainerForPreview: function( kernalCtrl) {
		var previewType = this.previewTypeChoice.getSelectedKey();

		//Only create necessary container
		this.recreateContainer(previewType);

		var ret;
		switch (previewType) {
			case fd.PreviewType.Desktop :
					ret = kernalCtrl;
				break;
				
			case fd.PreviewType.Phone   : //fall down, only size diff	
			case fd.PreviewType.FullApp :
				this.fullAppContainer.removeAllPages();
				this.fullAppContainer.setInitialPage(kernalCtrl);
				this.fullAppContainer.addPage(kernalCtrl);
				
				ret = this.fullAppContainer;
				break;
				
			case fd.PreviewType.Master :
				this.splitAppContainer.removeAllMasterPages();
				this.splitAppContainer.removeAllDetailPages();
				
				this.splitAppContainer.addMasterPage(kernalCtrl);
				this.splitAppContainer.addDetailPage( this.emptyDetailPage);
				
				this.splitAppContainer.setInitialMaster(kernalCtrl);
				this.splitAppContainer.setInitialDetail(this.emptyDetailPage);
				
				ret = this.splitAppContainer;
				//?? can't show the bottom, later need add different size
				/*var outShell = new sap.ui.core.HTML( {
					content: '<div style="width:1024px;height:768;"></div>'
				});
				
				this.splitAppContainer.placeAt( outShell );
				ret = outShell;
				*/
				break;

			case fd.PreviewType.Slave :
				this.splitAppContainer.removeAllMasterPages();
				this.splitAppContainer.removeAllDetailPages();
				
				this.splitAppContainer.addMasterPage(  this.emptyMasterPage );
				this.splitAppContainer.addDetailPage(kernalCtrl);
				
				this.splitAppContainer.setInitialMaster(this.emptyMasterPage);
				this.splitAppContainer.setInitialDetail(kernalCtrl );
				
				ret = this.splitAppContainer;
				break;
	
			default :
				break;
		}
		return ret;
	},
	
	onPreviewTypeChoiceChanged : function(oEvent) {
		var sel = oEvent.getSource().getSelectedKey();
		if (sel != "" && sel != "sel") {
			this.byId('PreviewBtn').setEnabled(true);
		}
	},
	
	updatePreviewContainerOutline: function() {
		//by the type choose width/height
		var id = "#" + this.createId('PreviewShell_Container');
		var $container = $(id);

		var width='1024px', height = "768px";

		var previewType = this.previewTypeChoice.getSelectedKey();
		if ( previewType == fd.PreviewType.Phone) {
			width  ="320px" ;
			height = "480px";
		} else if ( previewType == fd.PreviewType.Desktop ) {
			width  ="1280px" ;
			height = "800px";
		}
		
		$container.css('width', width);
		$container.css('height', height);
	},
	
	getPreviewShellId : function() {
		return this.createId('PreviewShell');	
	},
	
	onPreviewPressed: function(evt) {
			var mCfg = { preview: true};
			var bFastMode = this.byId('PreviewFastMode').getChecked();
			var bOpenDlg = this.byId("OpenDialog").getChecked();
			mCfg.fastMode = bFastMode;

			var controllerContent = "";
			var controllerName;
			
			if (!bFastMode) {
				//if have controller name, but without the controller content, then ask user 
				controllerName =  this.designController.getControllerName();
				if ( controllerName) {
					controllerContent = this.viewControllerController.getControllerContent();
					if ( controllerContent == "") {
						fd.uilib.Message.warning("Please first generate the Controller content in the \"Controller\" tab!");
						return;	
					}
				}
			}
			
			this.xmlViewContent = this.designController.exportToXml( mCfg);
			
			//create the controller
			var previewShellId = this.getPreviewShellId();
			
			try {
				// //add hints first
				// // var hints = new sap.ui.core.HTML({
				// // 	content: "Loading, please wait ....."
				// // }); 
				// var hints = new sap.m.Label({
				// 	text: "Loading, please wait ....."
				// });
				// hints.addStyleClass('PreviewLoadingHints');
				// hints.placeAt(previewShellId, "only");
				// hints.placeAt(previewShellId, "only");

				// var label = new sap.m.Label({text: "Loading, please wait ....." });
				// label.placeAt(previewShellId, "only");
				// console.error("------now loading");
				


				// var status = new sap.m.ObjectStatus({text: "failed", state: "Error"});
				// status.addStyleClass('PreviewLoadingHints_Failed');
				// status.placeAt(previewShellId, "only");
				
				//create the controller part if needed
				if (!bFastMode  && controllerName) {
					//for the controller just eval is enough
					eval( controllerContent );
				}
					
				var previewCtrl = sap.ui.xmlview({viewContent:this.xmlViewContent});
				var dlgContents = previewCtrl.getContent(); 
				if (bOpenDlg) {
					if (dlgContents.length === 1) {
						var dlgContent = dlgContents[0];
						if (!(dlgContent.open || dlgContent.openBy)) {
							fd.uilib.Message.warning("It don't have open or openBy method, please ensure it is a Dialog or Popover. So will display as normal view");
							bOpenDlg = false;
						} else {
							
							if (dlgContent.open) {
								dlgContent.open();
							} else {
								dlgContent.openBy(evt.getSource());
							}
							//here need delay some time otherwise user can't see it
							fd.uilib.Message.showToast("Press \"ESCAPE\" to close the dialog (!!sometimes need press several times) or click to close the popover");
							return;
						}
					} else {
						 
						fd.uilib.Message.warning("It contain more than one sub control, can't show like Dialog or Popover. So will display as normal view");
						bOpenDlg = false;
					}
				}

				var container = this.createContainerForPreview(previewCtrl);
				this.updatePreviewContainerOutline();
				
				container.placeAt(previewShellId, "only");
				
				//also add the left navigation part
				var naviTreeNode = this.view.getViewWorkset().getTreeNodeForNavigation();
				this.rootTreeNode =  naviTreeNode;
				
				//first remove all old node
				this.naviTree.removeAllNodes();
				this.naviTree.addNode(naviTreeNode);
				//and put the root node as selcted
				this.naviTree.setSelection(naviTreeNode);
				
				this.mPreviewOutline = {};
				
			} catch ( ex ) {
				//console.error("Preview failded due to:" + ex,  ex);
				//alert('Loading Preview content error ' + ex);
				
				
				// hints = new sap.m.Label({
				// 	text: detail
				// });
				var failReason = "";
				if (ex.message)
					failReason = ex.message;
				else if (ex.toString) {
					failReason = ex.toString();
				} else {
					failReason = ex;
				}

				var hints = new sap.m.ObjectStatus({
					title: "Preview failed due to error: " + failReason,
					state: "Error"
				});
				if (ex.stack) {
					hints.setText( "\r\n\r\n Call stack: " + ex.stack );
				}

				// hints.addStyleClass('PreviewLoadingHints_Failed');
				// hints.addStyleClass("FDVCenter");
				hints.placeAt(previewShellId, "only");
				
				//tree to remove the treeNode if any
				this.treeNode = null;
				this.rootTreeNode =  null;
			}
	},
	
	/**
	 * 
	 * @param ctrl
	 */
	addPreviewContent: function(ctrl) {
	//remove the last part if previous addit
		var vLayout = this.view.getVLayout();
		if (vLayout.getContent().length ==3) {
			//remove the last one
				var last = vLayout.getContent()[ vLayout.getContent().length -1];
				vLayout.removeContent(last);
		}
		
		vLayout.addContent(ctrl);
	},
	
	onCopyToClipboardPressed: function() {
		
	},
	
	
	//just some shortcut 
	view: null,
	designController:null,
	viewControllerController : null, 
		
	xmlViewContent: null,
	controllerContent: null,
	
	emptyMasterPage: null,
	emptyDetailPage: null,
	
	splitAppContainer: null,
	fullAppContainer: null,
	desktopContainer: null,
	
	previewTypeChoice: null,
	
	
	naviTree: null,
	treeNode : null,  //current selected tree node
	rootTreeNode: null,
	//current saved id/border information
	mPreviewOutline: { },
	
	choiceModel: null,
	
	//as it may be one or several ctrl, so use one array
	aSelectedCtrl:[],

	choiceData: {
			previewType: [
			               //{name:"Select Preview Type", 			  key:"sel"},
			               {name:"Desktop Application", 			  key:"Desktop"},
			               {name:"iPhone Full Screen ",              key:"Phone"},
			               {name:"iPad Full Screen ",                key:"FullApp"}, 
			               {name:"iPad Split App -- Master",		  key:"Master"}, 
			               {name:"iPad Split App -- Slave", 		  key:"Slave"},
			              ]
	},
	 
	
});