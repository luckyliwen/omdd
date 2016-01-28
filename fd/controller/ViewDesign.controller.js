"use strict";
var gMeta ; //??
var gc;  //the controller of design
var gt = null;
var gcb = null;

jQuery.sap.require("fd.view.CreateBatch");
jQuery.sap.require("fd.view.PropEdit");

sap.ui.controller("fd.controller.ViewDesign", {

	//All the formatter here
	formatter : {
			propType: function(name) {
				if (name)
					return this.readOnlyMetaOfCtrl.Prop[name].type;
				else
					return null;
			},
			propGroup: function(name) {
				if (name)
					return this.readOnlyMetaOfCtrl.Prop[name].group;
				else 
					return null;
			},
			
			aggrType: function(v) {
				
			},
	},
	
	updateTreeButtonStatus: function() {
		for ( var key in this.mTreeBtn) {
			var func = this.mTreeBtn[key];
			
			var status = func.call(this);
			
			var btn = this.byId(key);
			btn.setEnabled(status);
		}
	},
	
	onClipboardChanged: function(channel, event, oData) {
		if (event == "copy") {
			this.updateTreeButtonStatus();
		} else if ( event == "copyProp" ) {
			//??
		}
	},
	

	onCheckXmlPressed: function( evt ) {
		if (this.bHasCheckError ) {
			this.rootTreeNode.clearCheckHistory();
		}

		var ret = this.rootTreeNode.checkSemantic();
		if ( !ret.errorCount ) {
			fd.uilib.Message.information("Congratulations, no any error!");
		} else {
			fd.uilib.Message.warning("Total " + ret.errorCount + " errors. You can get detail by node with mark.");
			this.bHasCheckError = true;
		}

		this.mMeta["Prop"].table.invalidate();
		if ( ret.errorCount) {
			//try to focous the first node with error
			this.tree.setSelection(ret.aNode[0]);			
		}
	},

	//this function will be used for multiple check
	doSyntaxCheck: function(  ) {
		if (this.bHasCheckError ) {
			this.rootTreeNode.clearCheckHistory();
		}

		var ret = this.rootTreeNode.checkSemantic();
		
		this.mMeta["Prop"].table.invalidate();
		if ( ret.errorCount) {
			//try to focous the first node with error
			this.tree.setSelection(ret.aNode[0]);			
		}
		return ret;
	},

	
	onPropValueChanged: function(evt) {
		var idx = evt.getParameter('index');
		var val = evt.getParameter('value');
		this.treeNode.changeMetaData( fd.MetaType.Prop, idx, "value", val);
	},
	
	/**
	 * 
	 */
	canNodeAddMoreChild: function(node) {
		return true;
	},
	

	hasTreeNodeSelcted: function() {
		//return this.tree.getSelection() != null;
		var sel = this.tree.getSelection();
		return sel != null;
	},

	isMultiTreeNodeSelected: function( ) {
	    var nodes = this.tree.fdGetSelections();
	    return nodes.length > 1;
	},

	isJustSelectOneNode: function( ) {
	    var nodes = this.tree.fdGetSelections();
	    return nodes.length === 1;
	},
	
	
	/**
	 * Following is the function used to check the enable/disable status for the Tree Toolbar button
	 */
	calcAddChildNodeStatus : function() {
		//??return this.hasTreeNodeSelcted() && this.canNodeAddMoreChild();
		//Now have some problem, as event select the root node, still before the view show it can't get selection
		return this.isJustSelectOneNode();
		//return true;
	},
	
	calcDelNodeStatus:function() {
		var ret = false;
		if ( this.hasTreeNodeSelcted() ) {
			if ( !this.treeNode.isRootNode()) {
				ret = true;
			}
		}
		
		return ret;
	},

	calcCreateBatchNodeStatus: function() {
		//??need check more strictly
		var ret = false;
		if ( this.hasTreeNodeSelcted() ) {
			if ( !this.treeNode.isRootNode()) {
				ret = true;
			}
		}
		
		return ret;
	},
	
	calcCopyNodeStatus: function() {
		var ret = false;
		if ( this.hasTreeNodeSelcted() ) {
			if ( ! this.treeNode.isRootNode()) {
				ret = true;
			}
		}
		return ret;
	},

	calcCutNodeStatus: function() {
		var ret = false;
		if ( this.hasTreeNodeSelcted() ) {
			if ( ! this.treeNode.isRootNode()) {
				ret = true;
			}
		}
		return ret;
	},
		
	//
	calcPasteChildNodeStatus: function() {
		var ret = false;
		if (fd.model.Clipboard.hasCopyContent()) {
			// if ( this.hasTreeNodeSelcted() ) {
			if ( this.isJustSelectOneNode() ) {
				ret = true;
			}
		}
		return ret;
	},
	
	calcPasteBeforeNodeStatus: function() {
		var ret = false;
		if (fd.model.Clipboard.hasCopyContent()) {
			// if ( this.hasTreeNodeSelcted() ) {
			if ( this.isJustSelectOneNode() ) {
				if ( ! this.treeNode.isRootNode()) {
					ret = true;
				}
			}
		}
		return ret;
	},
	
	calcPasteAfterNodeStatus: function() {
		var ret = false;
		if (fd.model.Clipboard.hasCopyContent()) {
			// if ( this.hasTreeNodeSelcted() ) {
			if ( this.isJustSelectOneNode() ) {
				if ( ! this.treeNode.isRootNode()) {
					ret = true;
				}
			}
		}
		return ret;
	},

	
	onAddChildNodePressed:  function(oEvent) {
		fd.view.Helper.getInput( 
			fd.InputType.AllControl,
			this.onGetResultForAddChildNode,
			this);
	},
	
	onAddChildNodeFromTemplatePressed:  function(oEvent) {
		/*fd.view.Helper.getInput( 
			fd.InputType.AllControl,
			this.onGetResultForAddChildNode,
			this);*/
	},

	onCreateBatchPressed: function ( evt) {
		var aSelNode = this.tree.fdGetSelections();
		if ( !this.tree.fdIsSelectionSameParent( aSelNode)) {
			fd.uilib.Message.warningById("BatchCreateNeedSameParent");
			return;
		}
			
			
/*		var node = this.getSelectedTreeNode();
		if ( !node.canApplyTemplate()) {
			fd.uilib.Message.warning("Sorry, the node contain more than one OData property, so can't used as template for batch create");
			return;
		}
*/	
		if ( !this.oCreateBatchController) {
			var view =  new fd.view.CreateBatch( this.getView().getId() + "ViewCreateBatch", {
				viewName :"fd.view.CreateBatch"
			});
			this.oCreateBatchController = view.getController();
		}
		this.oCreateBatchController.openCreateBatchDialog(this.onCreateBatchConfirmed, this);

	},

	/**
	 * Call back function for user pressed 'OK' for the prop edit 
	 * @param  {[type]} mData : iPropIndex :  the index of prop  
	 *                          parts  formatter type  formatOption  constraint
	 *                        	
	 * @return {[type]}       [description]
	 */
	onEditPropConfirmed: function(mData){

	// "iPropIndex" : this.iPropIndex,
	//     	"parts": this.byId("PartsProp").getValue(),
	//     	"formatter": this.byId("FormatterProp").getValue(),
	//     	"type": this.byId("FormatterProp").getValue(),
	//     	"formatOption": this.byId("FormatOptionProp").getValue(),
	//     	"constraint": this.byId("ConstraintProp").getValue(),
	    //??need check how to do change is better 
	    this.treeNode.changeMetaData( "Prop", mData.iPropIndex, "value", "");

    	this.treeNode.changeMetaData( "Prop", mData.iPropIndex, "paths", mData.paths);
    	this.treeNode.changeMetaData( "Prop", mData.iPropIndex, "formatter", mData.formatter);

    	// this.mMeta["Prop"].table.bindRows("/Prop");
    	this.mMeta["Prop"].table.invalidate();
	},

	/**
	 * As now it can change prop from the preview screen, so when it did some changes then need inform the view to do update
	 * @param  {[type]} meta [description]
	 * @param  {[type]} node:  which treeNode it update the property
	 * @return {[type]}      [description]
	 */
	refreshMetaTable: function( meta , treeNode) {
		if (!meta) 
			meta = "Prop";

	    // this.mMeta[meta].table.invalidate();
	    // if just change value, then invalidate can work, but if add or delte, then need rebind to get the row changes
	    if (this.isRightPartForUi5Node()) {
	    	//only when the node is same as the current node, then need update 
	    	if ( treeNode == this.treeNode) {
			    var path = "/" + meta;
				this.mMeta[meta].table.unbindRows();
			    this.mMeta[meta].table.bindRows(path);
			
				//Also need update the buttons status and the list for the Prop choose
				this.createChoiceDataForMeta(meta);

				this.getView().rebindOneMetaChose(meta);
			}
		}
	},

	refreshAllMetaTable: function( ) {
	    this.refreshMetaTable("Prop", this.treeNode);
	    this.refreshMetaTable("Event", this.treeNode);
	    this.refreshMetaTable("Asso", this.treeNode);
	},
	
	/**
	 * Call back function for user pressed 'OK' for the Batch create. 
	 * @param  {[type]} mData : templateProperty,
	 *                          entityName,  
	 *                        	aProp
	 * @return {[type]}       [description]
	 */
	onCreateBatchConfirmed: function(mData){
		var aNode = this.tree.fdGetSelections();
		var parent = aNode[0].getParent();

		for (var iProp =0; iProp < mData.aProp.length; iProp++) {
			var  prop = mData.aProp[iProp];

			for (var i=0; i < aNode.length; i++) {
				var node = aNode[i];
				var newNode = node.cloneAndApplyTemplate( mData.templateProperty, prop);
				parent.addNode(newNode);
			}
		}

		this.updateTreeButtonStatus();
	},

	onAggrAddNodeBtnPressed: function(oEvent) {
		var selCls = this.byId('AggrAddNodeComobBox').getSelectedKey();
		if (selCls) {
			var aInfo = [selCls, true];
			this.onGetResultForAddChildNode(aInfo);
		}
	},
	

	/**
	 * call back for the add child node: 
	 * @param  {[type]} aInfo : array, 0 is the class name, 1 is insert default or not
	 * @return {[type]}       [description]
	 */
	onGetResultForAddChildNode: function(aInfo, extraDatas) {
		var node = this.createCtrlNode( {
			nodeName: aInfo[0],
		},   aInfo[1]);
		
		//also add some extra property, such as the fragment name
		if (extraDatas) {
			//!!now just support one prop name
			for (var i=0; i < extraDatas.length; i++) {
				var  prop = extraDatas[i];
				node.addMetaData( prop.meta, prop.name, prop.type, prop.value);
			}
		}

		var parent = this.getSelectedTreeNode();
		parent.addNode(node);
		
		//update the view 
		this.tree.setSelection(node);
		
		//then manually select it, so it will trigger the right part update
		return node;
	},
	
	onDelNodePressed_old:  function(oEvent) {
		var node = this.getSelectedTreeNode();
		fd.assert( ! node.isRootNode(), "root node can't delete");
		
		//??later when delete just move up, now go to parent
		var parent = node.getParent();
		var focusNode = null;
		
		//if it is aggr node, then need delete it from the CtrlNode also
		if (node.isAggrNode()) {
			//get the index, then 
			var idx = parent.indexOfNode(node);
			parent.delMetaData(fd.MetaType.Aggr, [idx]);
		}
		
		if (parent.getNodes().length ==1) {
			focusNode = parent;
			parent.removeAllNodes();
		}  else {
			//get the position, then move up
			var pos = parent.indexOfNode(node);
			parent.removeNode(node);
			
			var remainNodes = parent.getNodes();
			if ( pos < remainNodes.length) {
				focusNode = remainNodes[pos];	
			} else {
				//just the last one, then choose the previous one
				focusNode = remainNodes[pos-1];	
			}
		}
		
		//reset the selection so will trigger update of right part
		this.tree.setSelection(focusNode);
		
		this.updateTreeButtonStatus();
	},
	
	/**
	 * [getTreeSelectionAndCheck description]
	 * @return {[type]} false: if not pass the check,and warning
	 *                  [selNodes] : if passed check 
	 */
	getTreeSelectionsAndCheck : function( ) {
	    var aNode = this.tree.fdGetSelections();
	    if (this.tree.fdIsSelectionNotOverlap( aNode )) {
	    	return aNode;
	    } else {
	    	fd.uilib.Message.warningById( "TreeNodeOverlap");
	    	return false;
	    }
	},
	 

	//!! need check in this case how to set the focus node
	onDelNodePressed:  function(oEvent) {
		var aSelNode = this.getTreeSelectionsAndCheck();
		if ( ! aSelNode)
			return;

		var focusNode = null;
		for (var i=0; i < aSelNode.length; i++) {
			var  node = aSelNode[i];

			//??later when delete just move up, now go to parent
			var parent = node.getParent();
			
			//if it is aggr node, then need delete it from the CtrlNode also
			if (node.isAggrNode()) {
				//get the index, then 
				var idx = parent.indexOfNode(node);
				parent.delMetaData(fd.MetaType.Aggr, [idx]);
			}
			
			//!! here update the focus, just for the last one 
			
			if (parent.getNodes().length === 1) {
				focusNode = parent;
				parent.removeAllNodes();
			}  else {
				//get the position, then move up
				var pos = parent.indexOfNode(node);
				parent.removeNode(node);
		
				if ( i === aSelNode.length-1) {		
					var remainNodes = parent.getNodes();
					if ( pos < remainNodes.length) {
						focusNode = remainNodes[pos];	
					} else {
						//just the last one, then choose the previous one
						focusNode = remainNodes[pos-1];	
					}
				}
			}
		}

		//reset the selection so will trigger update of right part
		if ( focusNode)
			this.tree.setSelection(focusNode);
		
		this.updateTreeButtonStatus();
	},

	/**
	 * Equal copy + del
	 */
	onCutNodePressed:  function(oEvent) {
		this.onCopyNodePressed();
		this.onDelNodePressed();
	},
	
	onCopyNodePressed:  function(oEvent) {
		var aSelNode = this.getTreeSelectionsAndCheck();
		if ( ! aSelNode)
			return;
		
		fd.model.Clipboard.copy( aSelNode , this.getView().getId());
	},
	
	onPasteChildNodePressed:  function(oEvent) {
		var content = fd.model.Clipboard.getCopyContent();
		
		//just add to last
		var node = this.getSelectedTreeNode();
		
		//??later check why if not call cloneNode() then it will create problem
		node.addNodes(content);
		
		this.updateTreeButtonStatus();
	},
	
	onPasteBeforeNodePressed:  function(oEvent) {
		var node = this.getSelectedTreeNode();
		var parent = node.getParent();
		var pos = parent.indexOfNode(node);
		
		var content = fd.model.Clipboard.getCopyContent();
		//then insert before it
		parent.insertNodes(content, pos);
		
		this.updateTreeButtonStatus();
	},
	
	onPasteAfterNodePressed:  function(oEvent) {
		var node = this.getSelectedTreeNode();
		var parent = node.getParent();
		var pos = parent.indexOfNode(node);
		
		var content = fd.model.Clipboard.getCopyContent();
		//then insert before it
		parent.insertNodes(content, pos+1);
		
		this.updateTreeButtonStatus();
	},

	onMoreActionPressed: function(evt) {
		if (!this._oActionSheet) {
			this._oActionSheet = sap.ui.xmlfragment(this.getView().getId(), "fd.view.fragments.MoreAction", this);
		}

		//first try to update the status
		var bOnlyOne = this.isJustSelectOneNode();

		this.byId("AddExtension").setEnabled( bOnlyOne && this.treeNode.canAddExtension());
		this.byId("AddFragment").setEnabled( bOnlyOne && this.treeNode.canAddFragment());
		this.byId("ConverToFragment").setEnabled( bOnlyOne && this.treeNode.isUi5Node());
		this.byId("DelSubNodes").setEnabled( bOnlyOne && this.treeNode.getNodes().length >0 );
		this.byId("BatchEdit").setEnabled( bOnlyOne && this.treeNode.getNodes().length >0 );
		this.byId("DelOnlyRemainFirst").setEnabled( bOnlyOne && (this.treeNode.getNodes().length >1 ) );

		this.byId("CollapseSelfSubs").setEnabled( bOnlyOne && this.treeNode.getExpanded() && this.treeNode.getNodes().length >0);
		this.byId("ExpandSelfSubs").setEnabled( bOnlyOne && !this.treeNode.getExpanded() && this.treeNode.getNodes().length >0 );
		this._oActionSheet.openBy(evt.getSource());
	},

	     
	onCollapseSelfSubsPressed:function( evt ) {
	    this.treeNode.collapse(true);
	},

	onExpandSelfSubsPressed:function( evt ) {
	    this.treeNode.expand(true);
	},


	onAddExtensionPressed : function( evt ) {
	   this.onGetResultForAddChildNode( [ fd.StrExtPoint, true]);
	   //auto set focus ?
	},

	onBatchEditPressed: function( evt ) {
		//now one control share one instance, later considerate all share one
	    if ( !this._oBatchEditController) {
            var  view = sap.ui.xmlview(this.getView().getId() + "BatchEdit", {
                viewName: "fd.view.BatchEdit"
            });
            this._oBatchEditController = view.getController();
        }
        this._oBatchEditController.openCreateBatchDialog( this.treeNode, this.onCreateBatchConfirmed, this);
	}, 
	
	onQuickFixAllPressed: function( evt ) {
	    var count = this.rootTreeNode.doQuickFixForAll();
	    var text = "Total fix {0} errors for you!".sapFormat(count);
	    fd.uilib.Message.information(text);
	},
	

	onAddFragmentPressed: function( evt ) {
		fd.view.Helper.getInput( 
				fd.InputType.Fragment,
				this.onAddFragment_Confirmed,
				this);
	},

	//means user pressed ok button
	onAddFragment_Confirmed: function( names ) {
		var fragmentName = {
			meta: "Prop",    name: "fragmentName",
			type:  "string",  value: names[0]
		};
		//so not add default as need set the fragment name 
	    var newNode = this.onGetResultForAddChildNode( [ fd.StrFragment, false], [ fragmentName ] );

	    //then use the Project function to add the fragment view
	    var prjController = fd.getProjectController();

	    //for easy, directly call the fuction 
	    prjController.onGetInputResultForNewFragment( names );
	},
	

	onConvertToFragmentPressed: function( evt ) {
		fd.view.Helper.getInput( 
				fd.InputType.Fragment,
				this.onConvertFragment_Confirmed,
				this);
		
	},

	onConvertFragment_Confirmed: function( names ) {
	    //first remember the position 
	    var parent = this.treeNode.getParent();
	    var pos = parent.indexOfNode(this.treeNode);

	    //then remove
	    var oldNode = this.treeNode;
	    parent.removeNode(this.treeNode);

	    //create the new node and set name 
		var newNode = this.createCtrlNode( {
			nodeName: fd.StrFragment,
		},   false);

		var prop = {
			meta: "Prop",    name: "fragmentName",
			type:  "string",  value: names[0]
		};
		newNode.addMetaData( prop.meta, prop.name, prop.type, prop.value);
		
		//add to same position
		parent.insertNode(newNode, pos);

		//focus put to the same 
		//update the view 
		this.tree.setSelection(newNode);

	    //then create a Fragment node and add the node as child
		var rootNode = this.createCtrlNode(
					{
						nodeType: fd.NodeType.Root,
						controllerName: "",
						isFragment  :  true, 
					}
		);
		rootNode.addNode( oldNode);

		//then use the Project function to add the fragment view
	    var prjController = fd.getProjectController();

	    //for easy, directly call the fuction 
	    prjController.onGetInputResultForNewFragment( [ names[0],  rootNode ] );
	},
	

	onDelExceptFirstNodePressed: function( evt ) {
	    fd.assert(this.treeNode.getNodes().length >1);

	    var aNode = this.treeNode.getNodes();
	    for (var i = aNode.length -1 ; i > 0; i--) {
	    	this.treeNode.removeNode( aNode[i]);
	    }

	    //focus not change
	},

	onDelSubNodesPressed: function(  ) {
		this.treeNode.removeAllNodes();
		//focus not change
	},

	
	/**
	 * Call back when meta data ( prop, aggr, event, asso) changed
	 * @param oEvent
	 * @param info: like {"name":"paths", meta:"Prop"} 
	 */
	onMetaValueChanged: function(oEvent, info) {
		//console.error("onPropValueChanged new value", oEvent.oSource.getValue());
		var tf = oEvent.getSource();
		
		//path like /Prop/0
		var context = tf.getBindingContext(); 
		var path = context.getPath();
		
		//if  call the  setProperty then it will trigger the update again
		//this.tableModel.setProperty( info.name, tf.getValue(), context);
		
		//so just change it direclty for performance issue
		var value = tf.getValue();
		var idx = parseInt(path.sapLastPart("/"));
		this.treeNode.changeMetaData( info.meta, idx, info.name, value);
	},
	
	/**
	 * Update the toolbar buttons status for all meta
	 */
	updateAllMetaButtonsStatus : function() {
		for ( var key in fd.MetaType) {
			var val = fd.MetaType[key];
			
			this.updateMetaButtonsStatus(val);
		}
		
	},
	
	/**
	 * Update the toolbar buttons status for one meta
	 * @param meta
	 */
	updateMetaButtonsStatus: function(meta) {
		var aBtnInfo = this.mMeta[meta].aButton;
		
		for ( var i = 0; i < aBtnInfo.length; i++) {
			var btnInfo = aBtnInfo[i];
			
			var func = btnInfo['statusFunc'];
			var status = func.call(this, meta);
			
			btnInfo["button"].setEnabled( status);
		}
	},
	
	
	/**
	 * Call back for the tree select changed
	 * @param oEvent
	 */
	onTreeNodeSelectChanged: function(oEvent) {
		//??1: Adjust the button enable/disable
		//as the tree have bug for the mSelectNode, so use the delay call 
		var node = oEvent.getParameter('node');
		jQuery.sap.delayedCall(5, this, this.onTreeNodeSelectChangedDelayCall, [node] ) ;
	},
	
	onTreeNodeSelectChangedDelayCall: function( node ) {
	    // var node = oEvent.getParameter('node');
		
		fd.assert( node);

		//now even retap it, it will fire this event, so need check only when the node diff
		if (node == this.treeNode)
			return;

		this.treeNode = node;

		//2: change the right part also
		this.updateRightPart(node);
		
		this.updateTreeButtonStatus();
	},
	
	
	onMetaTableRowSelectionChanged: function(oEvent, meta) {
		//just call the corresponding meta
		this.updateMetaButtonsStatus(meta);
	},
	
	/**
	 * Calculate the enable/disable status for the Add button
	 * @param meta
	 */
	calcAddMetaStatus: function(meta) {
		//We just relay the choice data list,
		var cnt = this.mChoice[meta].length;
		
		//and must select one entry
		return ((cnt >0)  && this.mMeta[meta].choice.getSelectedKey() != "");
	},
	
	/**
	 * Calculate the enable/disable status for the Add All button
	 * @param meta
	 */
	calcAddAllMetaStatus: function(meta) {
		//We just relay the choice data list,
		var cnt = this.mChoice[meta].length;
		return (cnt >0);
	},
	
	/**
	 * Calculate the enable/disable status for the Del button
	 * @param meta
	 */
	calcDelMetaStatus: function(meta) {
		var table = this.mMeta[meta].table;

		var idxs = table.getSelectedIndices(); 

		//Sometimes choose one empty row, but the treeNode don't have any data!
		var realEntryCnt = this.treeNode.mData[meta].length;
		
		return (idxs.length >0) && realEntryCnt > 0;
	},
	
	/**
	 * Calculate the enable/disable status for the Del All button
	 * @param meta
	 */
	calcDelAllMetaStatus: function(meta) {
		var cnt = this.treeNode.mData[meta].length;
		return cnt >0;
	},


	calcEditPropStatus: function( meta) {
	    var table = this.mMeta["Prop"].table;
		var idxs = table.getSelectedIndices(); 
		return (idxs.length === 1);
	},

	calcCopyPropStatus: function( meta) {
	    var table = this.mMeta["Prop"].table;
		var idxs = table.getSelectedIndices(); 
		return (idxs.length >= 1);
	},

	calcPastePropStatus: function( meta) {
		return fd.model.Clipboard.hasPropContent();
	},

	calcClearPropStatus: function( meta) {
	    var table = this.mMeta["Prop"].table;
		var idxs = table.getSelectedIndices(); 
		return (idxs.length >= 1);
	},
	
	onAddMetaPressed : function(oEvent, meta) {
		//first get the name from combox
		var ctrlInfo = this.mMeta[meta];
		
		var name = ctrlInfo.choice.getSelectedKey();
		if (name == "")
			return;
		
		//also it is convenient here get the type
		var type = "";
		if ("type" in this.readOnlyMetaOfCtrl[meta][name])
			type = this.readOnlyMetaOfCtrl[meta][name].type;
	
		if ( meta == fd.MetaType.Aggr) {
			this.treeNode.addAggrMetaData(name, type, this.readOnlyMetaOfCtrl[meta][name].altTypesStr, 
					this.readOnlyMetaOfCtrl[meta][name].multiple); 
		} else 	{
			this.treeNode.addMetaData(meta, name, type);
		}
		
		//then update data so it will show
		this.tableModel.setData( this.treeNode.mData );
		
		//last need remove that choice from the combox and also set the default selected
		this.mChoice[meta].sapRemove("name", name);
		
		this.updateChoiceDataAndKey(meta);
		

		//for the Aggr need add the node also
		if (meta == fd.MetaType.Aggr) {
			//remove the restriction, so it will look consistent
			//??if (this.readOnlyMetaOfCtrl[meta][name].altTypesStr == "") {
				//only for the aggr which alernate typs not string
				var node = this.createCtrlNode( {
					nodeName: name,
					nodeType: fd.NodeType.Aggr
				});
				this.treeNode.addNode(node);
			//??}
		}
		
		//After done need update the enable/disable status
		this.updateMetaButtonsStatus(meta);
	},
	
	
	/**
	 * 
	 * @param oEvent
	 * @param meta
	 */
	onAddAllMetaPressed: function(oEvent, meta) {
		var aName = this.mChoice[meta];
		
		for ( var i = 0; i < aName.length; i++) {
			var name = aName[i].name;
			
			if ( name == "")
				continue;  //the first one ignore
			
			//also it is convenient here get the type
			var type = this.readOnlyMetaOfCtrl[meta][name].type;
		
			
			//first add the aggr prop
			if (meta == fd.MetaType.Aggr) {
				this.treeNode.addAggrMetaData(name, type, this.readOnlyMetaOfCtrl[meta][name].altTypesStr,
						this.readOnlyMetaOfCtrl[meta][name].multiple);
			
				//also for the subNode
				if (this.readOnlyMetaOfCtrl[meta][name].altTypesStr =="") {
					var node = this.createCtrlNode( {
						nodeName: name,
						nodeType: fd.NodeType.Aggr
					});
					this.treeNode.addNode(node);
				}	
			} else {
				this.treeNode.addMetaData(meta, name, type);
			}
			
		}
		
		//then update data so it will show
		this.tableModel.setData( this.treeNode.mData );
		
		//??after add all, then hte choice is a empty array, so later can push again
		//??this.mChoice[meta] = { name:""};
		this.mChoice[meta] = []; 
		
		this.updateChoiceDataAndKey(meta);
		
		//also update the toolbar buttons
		this.updateMetaButtonsStatus(meta);
	},
	
	/**
	 * Just get the selcted item and remove it
	 * @param oEvent
	 * @param meta
	 */
	onDelMetaPressed : function(oEvent, meta) {
		var table = this.mMeta[meta].table;

		var idxs = fd.util.getDataIndexFromSelection(table);
		
		var delNames = this.treeNode.delMetaData(meta, idxs);
		
		//data need update
		this.tableModel.setData( this.treeNode.mData );
		
		//update the choice part
		var i;
		for ( i = 0; i < delNames.length; i++) {
			var name = delNames[i];
			this.mChoice[meta].push({'name': name});
		}
		
		this.updateChoiceDataAndKey(meta);
		
		//for the Aggr need all the seleted node 
		if (meta == fd.MetaType.Aggr) {
			var nodes = this.treeNode.getNodes();
			
			//need reverse order as when delete the order will change
			for ( i=nodes.length-1; i>=0; i--) {
				var node = nodes[i];
				
				if (node.isAggrNode()) {
					var nodeName = node.getNodeName();
					if ( delNames.indexOf(nodeName) != -1) {
						this.treeNode.removeNode(node);
					}
				}
			}
		}
		
		//also update the toolbar buttons
		this.updateMetaButtonsStatus(meta);
	},
	
	onDelAllMetaPressed : function(oEvent, meta) {
		this.treeNode.delAllMetaData(meta);
		
		//data need update
		this.tableModel.setData( this.treeNode.mData );
		
		//update the choice part
		//just readd all from system metapart
		this.createChoiceDataForMeta(meta);
		
		this.updateChoiceDataAndKey(meta);

		//for the Aggr need delete all the node 
		if (meta == fd.MetaType.Aggr) {
			this.treeNode.removeAllNodes();
		}
		
		//also update the toolbar buttons
		this.updateMetaButtonsStatus(meta);
	},

	/**
	 * Copy the selected properties into clipboard
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	onCopyPropPressed: function( evt ) {
		var table = this.mMeta["Prop"].table;
		var idxs = fd.util.getDataIndexFromSelection(table);
		var aNodeProp = this.treeNode.mData.Prop;
		var aCopy=[];

		for (var i=0; i < idxs.length; i++) {
			var  idx = idxs[i];
			//here need clone it so it will not change as later change
			var cloneProp = $.extend(true, {}, aNodeProp[idx]);
			aCopy.push( cloneProp );
		}
		
		fd.model.Clipboard.copyProp(aCopy, this.getView().getId());
	},

	onPastePropPressed: function( evt ) {
		var arr = fd.model.Clipboard.getPropContent();
		this.treeNode.pastePropMetaData( arr );

		//then need update the Prop table
		this.refreshMetaTable("Prop", this.treeNode);
	},


	onClearPropPressed: function( evt ) {
		var table = this.mMeta["Prop"].table;
		var idxs = fd.util.getDataIndexFromSelection(table);
		var aNodeProp = this.treeNode.mData.Prop;

		for (var i=0; i < idxs.length; i++) {
			var idx = idxs[i];
			aNodeProp[idx].value = "";
			aNodeProp[idx].paths = "";
			aNodeProp[idx].formatter = "";
			aNodeProp[idx].extraStr ="";
		}
		
		//just invalid the table 
		 this.mMeta["Prop"].table.invalidate();
	},


	onEditPropPressed: function( evt ) {

		var table = this.mMeta["Prop"].table;
		var idxs = fd.util.getDataIndexFromSelection(table);
		fd.assert( idxs.length === 1, "For edit prop only one row can select");

		if ( !this.oPropEditController) {
			var view =  new fd.view.PropEdit( this.createId("ViewPropEdit"), {
				viewName :"fd.view.PropEdit"
			});
			this.oPropEditController = view.getController();
		}
		
		var index = idxs[0];
		var mProp = this.treeNode.mData.Prop[index];
		this.oPropEditController.openEditPropDialog(index, mProp, this.onEditPropConfirmed, this);
	},

	
	
	/*
	var clsHtml = new sap.ui.core.HTML(this.createId('ClsDoc_ClassName'));
	var clsApi =  new sap.ui.commons.Link( this.createId('ClsDoc_Api'),
			{text:"API"});
	var clsTest =  new sap.ui.commons.Link( this.createId('ClsDoc_TestSuite'),
			{text:"TestSuite"});
	*/
	onClsApiLinkPressed : function() {
		var url = fd.cfg.getDocumentBaseUrl();
		
		//like /#docs/api/symbols/sap.ui.commons.Area.html
		var name = this.treeNode.getClassName();
		
		url += "#docs/api/symbols/" + name + ".html";
		window.open(url);
	},
	
	onClsTestSuiteLinkPressed : function() {
		var url = fd.cfg.getDocumentBaseUrl();
		
		//like #test-resources/sap/m/ObjectIdentifier.html
		var name = this.treeNode.getClassName();
		name = name.replace(/\./g, "/");
		
		url += "#test-resources/" + name + ".html";
		window.open(url);
	},
	

	updateClassDocumentPart: function() {
		var clsName = this.treeNode.getClassName();
		
		var html;
		if ( this.treeNode.isHtmlNode()) {
			this.byId('ClsDoc_Api').setVisible(false);
			this.byId('ClsDoc_TestSuite').setVisible(false);
			
			html = "<strong style='color:blue;margin-right:2em;'>"  + clsName +  "</strong>";
			
		} else {
			this.byId('ClsDoc_Api').setVisible(true);
			this.byId('ClsDoc_TestSuite').setVisible(true);

			html="<div style='margin-right:2em;color:blue;font-size:2;'>Class <strong>"  + clsName +  
				"</strong>.      Reference documents: (may not existed)</div>";	
		}
		
		
		
		var htmlCtrl = this.byId('ClsDoc_ClassName');
		htmlCtrl.setContent(html);
	},
	
	/**
	 * ??later can select according user's prefer
	 */
	updateChoiceDataAndKey: function(meta) {
		// this.choiceModel.setData( this.mChoice);
		
		if ( this.mChoice[meta].length >0)
			this.mMeta[meta].choice.setSelectedKey( this.mChoice[meta][0].name);
		else
			this.mMeta[meta].choice.setSelectedKey( "");
	},
	
	/**
	 * 
	 * @param meta fd.MetaType, here just use Prop as example to illustrate how to do
	 */
	createChoiceDataForMeta: function (meta) {
		//create the choice data for comboBox
		//Readonly data: readOnly = fd.model.Metadata.getMetadataForControl('sap.m.Page')
		//readOnly.names.Prop  -  
		
		//big one
		var allNames =      this.readOnlyMetaOfCtrl.names[ meta];
		
		//small one, user has set
		var userSetNames =  this.treeNode.mData[meta].sapSubArray("name");
		
		//get diff
		var nameDiff = allNames.sapDiff( userSetNames);
		
		//from diff create array like [ {name:"title"} ]
		var nameArr = [];
		nameDiff.forEach( function( name) {
			nameArr.push( {'name': name});
		});
		this.mChoice [ meta] = nameArr;
	},
	
	updateRightPartForMultiNodes: function() {
		var html = "<h2 class=\"FDVCenter  FDHCenter\"> You select multiple nodes. Select just one node to show normal page.</h2>";
		this.view.switchToSpecialRightPart(html, true);
	},
	
	/*createSpecialDescipton: function(node) {
		var html="";
		if ( node.isRootNode()) {
			html="<div class='SpecialNodeDescription'>Root of the <strong>sap.ui.core.View</strong><br>";
			html += "Add children by press <strong>Add Child</strong> button or by <strong>Copy/Paste</strong>.<div>";
		} else if ( node.isAggrNode() ) {
			var parent = node.getParent();
				
			html="<div class='SpecialNodeDescription'>Aggregation <strong>" + node.getNodeName() + "</strong> of <strong> " + parent.getNodeName() + "</strong><br>";
			html += "Add children by press <strong>Add Child</strong> button or by <strong>Copy/Paste</strong>.<div>";
		} else {
			fd.assert(false, "wrong logic  for _createSpecialDescipton");
		}
		
		return html;
	},*/
	
	updateRightPartForAggrNode: function(node) {
		var parentClass = node.getParent().getNodeName();
		var aggrName = node.getNodeName();
		var aggrInfor = fd.model.Metadata.getClassAggrInfor(parentClass, aggrName);
		if (!aggrInfor)
			return;
		/*look like altTypesStr: ""
		bindable: ""
		multiple: true
		name: "contentLeft"
		singularName: "contentLeft"
		type: "sap.ui.core.Control"*/
				
		//create header
		//first type
		var html = "<div class='SpecialNodeDescription'>Aggregation <strong>" + aggrName + "</strong> of <strong> " 
				   + parentClass + "</strong><br></div>";

		html += "<br/>";
		html += "<strong>Type:    </strong>" + fd.util.createAPIHyperLink(aggrInfor.type); 
		html += "<strong>    Multiple:    </strong>: " +  aggrInfor.multiple;
		html += "<br/><br/>";
		
		//then the candidate list
		html += "<strong>Candidates: </strong>";
		
		//if it is Control, then too much library, in this case, no need list all,as it will too much spaces
		var aCandidate= [];
		var aLinks = [];
		var path = fd.model.Metadata.getCandidatePath(aggrInfor.type, aCandidate);
		//for the Element or Control, there are too much candidates, so will not display, just tell hte number
		if ( aCandidate.length > 80) {
			html += "  Total " + aCandidate.length + " candidates can be chose. Please press 'Add Child' then press "
			      + "'Restriect by library' to limit the selection range";
		} else {
			aCandidate.forEach( function(candidate) {
				aLinks.push(fd.util.createAPIHyperLink(candidate));
			});
			html += aLinks.join("<span>, </span>");
		}

		html += "<br/><hr/><br/><br/>";
		
		//console.error("$$ html is", html);
		//this.byId('AggrAddNodeHeader').setContent(html);
		
		//then need check whether enable or disable the ComobBox and add button
		var enable = true;
		if ( aggrInfor.multiple) {
			//even have the child then still can enable it
		} else {
			//have child
			if (node.getNodes().length>=1) {
				enable = false;
			}
		}
		
		//enable/disable it explicit, as may change status after add/delete
		var addBtn = this.byId('AggrAddNodeBtn');
		var comboBox  = this.byId('AggrAddNodeComobBox');
		
		comboBox.setEnabled(enable);
		addBtn.setEnabled(enable); //only after select one ??
		//always update the bindpath, and set the initial key
		comboBox.bindItems(path, this.view.getAggrChildListItemTempalte());
		comboBox.setSelectedKey( aCandidate[0] );
		
		//set path for the choice list
		this.view.switchToSpecialRightPart(html);
	},
	
	/**
	 * Check whether the current right part is for UI5 node, so can avoid fresh when change prop back
	 * @param  {[type]}  evt [description]
	 * @return {Boolean}     [description]
	 */
	isRightPartForUi5Node: function( ) {
	    if ( this.isMultiTreeNodeSelected()) {
	    	return false;
	    } else if ( this.treeNode.isAggrNode()) {
	    	return false;
	    } else {
	    	return true;
	    }
	},
	

	/**
	 * when user select different tree node, the right part need show corresponding metadata
	 */
	updateRightPart: function(node) {
		if (!node) {
			fd.assert(false, "###logic error");
			return;
		}
		
		if ( this.isMultiTreeNodeSelected()) {
			this.updateRightPartForMultiNodes();
			return;
		}

		if ( node.isAggrNode() ) {
			this.updateRightPartForAggrNode(node);
			return;
		} 
		
		//first switch back
		this.view.switchToNormalRightPart();
		
		
		this.updateClassDocumentPart();
		
		//Four meta is similar, so just call then one by one 
		//1: get the read only meta
		this.readOnlyMetaOfCtrl = fd.model.Metadata.getMetadataForControl( node.getNodeName());
		
		//As the choice data diff, so first init it
		this.mChoice = {
				Prop: {},
				Aggr: {},
				Event: {}, 
				Asso: {},
		}; 
		this.choiceModel.setData( this.mChoice);
		
		//table data also changed
		this.tableModel.setData( this.treeNode.mData );
		for (var meta in fd.MetaType) {
			this.createChoiceDataForMeta(meta);
		
			//reset the mode??
			// this.mMeta[meta].table.setModel( null);
			
			//rebind the table
			//??he control manages the rows aggregation. The method "destroyRows" cannot be used programmatically!
			//??this.mMeta[meta].table.unbindRows();
			var row = "/" + meta;
			this.mMeta[meta].table.setModel( this.tableModel);
			this.mMeta[meta].table.bindRows(row);
		}
		// 
		//then bind the choice again, it just call the view and view contain the template 
		this.choiceModel.setData( this.mChoice);
		
		this.view.rebindAllChoice();
		
		//also set the initial keys
		for ( meta in fd.MetaType) {
			this.updateChoiceDataAndKey(meta);
		}
		
		//also update the toolbar buttons for all meta
		this.updateAllMetaButtonsStatus();
	},
	
	
	
	//help funciton for create CtrlNode
	createCtrlNode: function(mSetting, insertDft) {
		var node = new fd.model.CtrlNode(mSetting);
		node.doInit();
		
		if (insertDft) {
			node.addDefaultInformations();
		}
		
		return node;
	},
	
	
	/** 
	 * now know the view name and control name, so need create the root node, if new then just create the root node, 
	 * otherwise get from file content
	 */
	addInitalRootNode: function() {
		var rootNode ;
		
		rootNode = this.view.getViewWorkset().getViewCtrlNodeContent();
		
		if (rootNode == null) {
			rootNode = this.createCtrlNode(
					{
						nodeType: fd.NodeType.Root,
						controllerName: this.view.getViewWorkset().getNameOfController(),
						isFragment  :  this.getView().getIsFragment()
					}
				);
		} else {
			//save it back, so later can easily get it 
			this.view.getViewWorkset().setViewCtrlNodeContent( rootNode );
		}
		
		this.rootTreeNode = rootNode;
		
		this.tree.addNode( rootNode);
		
		//??also set the inital section
		this.tree.setSelection(rootNode);
	},
	
	/**
	 * As difference controller need have it's own data structure, so here must recreate it again
	 */
	recreateMainStructure: function() {
		this.mChoice = {
				Prop: {},
				Aggr: {},
				Event: {}, 
				Asso: {},
		};
		
		this.mMeta =  {
				"Prop": {		},
				
				"Aggr": {		},
				
				"Event" : {		},
				
				"Asso": {		},
		};
	},
	
	/**
	 * In order for view easy get parameter from new xx, change from onInit to onAfterDoInit
	 */
	onAfterDoInit: function() {
		this.recreateMainStructure();
		
		//tree related event register
		this.view = this.getView();
		this.tree = this.byId('NodeTree');
		this.tree.attachSelect(this.onTreeNodeSelectChanged, this);
		
		
		this.byId('AddChildNode').attachPress(  this.onAddChildNodePressed,   this );
		this.byId('AddChildNodeFromTemplate').attachPress(  this.onAddChildNodeFromTemplatePressed,   this );
		
		this.byId('CreateBatch').attachPress(this.onCreateBatchPressed, this );
		
		this.byId('DelNode').attachPress(  this.onDelNodePressed,   this );
		this.byId('CopyNode').attachPress(  this.onCopyNodePressed,   this );
		this.byId('CutNode').attachPress(  this.onCutNodePressed,   this );
		this.byId('PasteChildNode').attachPress(  this.onPasteChildNodePressed,   this );
		this.byId('PasteBeforeNode').attachPress(  this.onPasteBeforeNodePressed,   this );
		this.byId('PasteAfterNode').attachPress(  this.onPasteAfterNodePressed,   this );
		this.byId('MoreAction').attachPress(  this.onMoreActionPressed,   this );
		
		this.byId("CheckXml").attachPress(this.onCheckXmlPressed, this);

		this.byId('AggrAddNodeBtn').attachPress(  this.onAggrAddNodeBtnPressed,   this );
		
		this.byId('ClsDoc_Api').attachPress( this.onClsApiLinkPressed, this);
		this.byId('ClsDoc_TestSuite').attachPress( this.onClsTestSuiteLinkPressed, this);
		
		 
		//As later need build the complex logic for the Tree Button enable/disable, so better each one one function
		this.mTreeBtn = {
			'AddChildNode': 	this.calcAddChildNodeStatus,
			"CreateBatch" :     this.calcCreateBatchNodeStatus,
			'DelNode': 			this.calcDelNodeStatus,
			'CopyNode': 		this.calcCopyNodeStatus,
			'CutNode': 			this.calcCutNodeStatus,
			'PasteChildNode': 	this.calcPasteChildNodeStatus,
			'PasteBeforeNode': 	this.calcPasteBeforeNodeStatus,
			'PasteAfterNode': 	this.calcPasteAfterNodeStatus,
		};
		
		
		//create model
		this.tableModel = new sap.ui.model.json.JSONModel();
		this.choiceModel = new sap.ui.model.json.JSONModel();
		
		//For metadata the event handle is similar, so can use type to make it different
		var mCallBackFunc = {
			'Add': this.onAddMetaPressed,
			'AddAll': this.onAddAllMetaPressed,
			'Del': this.onDelMetaPressed,
			'DelAll': this.onDelAllMetaPressed,
			"Edit": this.onEditPropPressed,
			"Copy": this.onCopyPropPressed,
			"Paste": this.onPastePropPressed,
			"Clear": this.onClearPropPressed
		};

		var mStatusFunc = {
			'Add': this.calcAddMetaStatus,
			'AddAll': this.calcAddAllMetaStatus,
			'Del': this.calcDelMetaStatus,
			'DelAll': this.calcDelAllMetaStatus,
			"Edit": this.calcEditPropStatus,
			"Copy": this.calcCopyPropStatus,
			"Paste": this.calcPastePropStatus,
			"Clear": this.calcClearPropStatus,
		};
		//now there are"Add","Del","DelAll" three items
		for ( var meta in fd.MetaType) {
			var aPrefix = ["Add", "AddAll", "Del", "DelAll"];
			if (meta ===  "Prop") {
				aPrefix.push("Edit");
				aPrefix.push("Copy");
				aPrefix.push("Paste");
				aPrefix.push("Clear");
			}
			
			var m = {};
			
			m.aButton = [];
			
			//getTable 
			m.table =  this.byId( meta +"Table");
			//set the width here 
			m.table.setWidth('100%');
			
			m.table.setModel(this.tableModel);

			m.table.attachRowSelectionChange( meta, this.onMetaTableRowSelectionChanged, this);
			
			m.choice =   this.byId( meta +"Choice");
			m.choice.setModel( this.choiceModel);

			//get button reference
			for ( var i = 0; i < aPrefix.length; i++) {
				var prefix = aPrefix[i];
				
				var btn = this.byId( prefix + meta);
				//m ["btn" + prefix ] = btn;
				btn.attachPress(meta, mCallBackFunc[prefix],  this);
				
				var entry = {};
				entry['button'] = btn;
				//here just add the function for all meta for easy, actually can just store it at one place
				entry['statusFunc'] = mStatusFunc[prefix];
				
				m.aButton.push(entry);
			}
			
			this.mMeta [meta] = m;
		}
		
		//??
		gMeta = this.mMeta;
		
		
		this.addInitalRootNode();
		
		//??just for dbg
		gc =  this;
		gt = this.mMeta.Prop.table;
		gcb = this.mMeta.Prop.choice;
		
		//register the clipboard event
		fd.bus.subscribe('clipboard', "copy", this.onClipboardChanged, this);
		fd.bus.subscribe('clipboard', "copyProp", this.onClipboardChanged, this);
		fd.bus.subscribe('template', "createBatch", this.onCreateBatchConfirmed, this);
	},	
	
	/**
	 * Call back for the TapStrip switch to this
	 */
	onTabSelected: function() {
		//??no need do anything
	},
	
	//??
	onViewActivated: function() {
		
	},
	
	
	getSelectedTreeNode: function() {
		var node = this.tree.getSelection();
		//
		fd.assert( node, "Should not null");
		return node;
	},
	
	/**
	 * Export it to XML format as string
	 */
	exportToXml: function( mCfg) {
		var xml = fd.util.Export.exportView( fd.ViewType.Xml, this.rootTreeNode, 0, mCfg);
		return xml;
	},
	
	
	getControllerSourceContent: function() {
		var ctrlInfo = new fd.model.ControllerInfo( this.getControllerName() );
		this.rootTreeNode.getControllerInfo(ctrlInfo);
		return ctrlInfo.generateContent();
	},
	
	getTreeNodeForNavigation : function() {
		var tn =  this.rootTreeNode.cloneForNavigation();
		return tn;
	},
	
	/**
	 * From the mapping node path such as the 0,1 -- which means the second child of the first child
	 * @param  {[type]} mappingNodePath [description]
	 * @return {[type]}                 [description]
	 */
	getMappingTreeNode: function( mappingNodePath ) {
	    var tn = this.rootTreeNode.getMappingTreeNode(mappingNodePath);
	    return tn;
	},
	
	
	getControllerName: function() {
		return this.rootTreeNode.getControllerName();
	},
	
	//!! now the context will reflect the current row position, need check it later 
	onQuickFixPressed: function(oEvent, context) {
		//context:  sPath: "/Prop/1"}
		//action: "del"name: "lableFor"
		// action: "add"metaType: "Prop" name: "lableFor" value: "payingcompanyCode"
		this.treeNode.doQuickFix(context);
		this.refreshAllMetaTable(); 
	},
	
	//!!As used so often, so not start by _
	tableModel: null,
	choiceModel: null,
	
	//the data for choice, as it need change often, so put outside
	mChoice: {
		Prop: {},
		Aggo: {},
		Event: {}, 
		Asso: {},
	},
	
	
	//it contain the reference of some control for easy use
	mMeta: {
		"Prop": {
			/*
			 table: xx,
			 btnAdd: 
			 btnDel,
			 btnDelAll,  so later easy adjust the enable/disable
			 */
		},
		
		"Aggr": {
			
		},
		
		"Event" : {
			
		},
		
		"Asso": {
			
		},
	},
	
	tree: null,
	treeNode: null,  //need update each time when select another treeNode
	
	//Readonly meta data for one control fd.model.Metadata.getMetadataForControl('sap.m.Page')
	readOnlyMetaOfCtrl: null,
	
	view: null,   //just shortcut
	rootTreeNode: null, 

	oCreateBatchController: null,
});
