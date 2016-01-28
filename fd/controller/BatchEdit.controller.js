var gbe;
sap.ui.controller("fd.view.BatchEdit", {
    onInit : function () {
        this._oModel = new sap.ui.model.json.JSONModel();
        this._oPropList = this.byId("PropList"); 
        this._oTreeTable = this.byId("TreeTable");
        gbe = this;
   },

   getPropListTemplate: function( evt ) {
       if (!this._oPropListTemplate) {
            this._oPropListTemplate = new sap.ui.core.ListItem({
                key: "{key}",
                text: "{key}"
            });
       }
       return this._oPropListTemplate;
   },
   

    onClosePressed: function( evt ) {
        this.byId("BatchEditDialog").close();
    },
    
    onTreeRowSelectionChanged : function( oEvent )  {

    },

    onControlListChanged : function( oEvent )  {
        var source = oEvent.getSource();
        if (source.getSelectedKey() === "") {
            this._oPropList.bindItems("/mControlProp/empty", this.getPropListTemplate());
            this.byId("applyPropChange").setEnabled(false);
        } else {
            // selectedKey is the control name
            var path = "/mControlProp/" + source.getSelectedKey();
            this._sControlName = source.getSelectedKey();
            this._oPropList.bindItems(path, this.getPropListTemplate());

            //
            this.byId("applyPropChange").setEnabled(true);
        }
    },

    onPropListChanged : function( oEvent )  {
        if (this._oPropList.getSelectedKey()!== "") {
            this.byId("applyPropChange").setEnabled(true);
        } else {
            this.byId("applyPropChange").setEnabled(false);
        }
    },

    onApplPropChangePressed : function( oEvent )  {
        //by the prop name, try to get the new properties for the treeTable 
        var prop = this._oPropList.getSelectedKey();

        this._sPropName = prop;
        this._sPropType = fd.model.Metadata.getPropTypeByName( this._sControlName, prop );

        this.tryGetPropDataForTreeTable( this._mData.mTree, prop);

        //as not add/delete row, so invalidate is enough
        // this._oTreeTable.invalidate();
        this.byId("TreeTable").unbindRows();
        this.byId("TreeTable").setModel(this._oModel);
        this.byId("TreeTable").bindRows("/mTree");
    },

    //== as all the row just show the sname prop name and type, so use formatter for performance
    getPropType: function( val ) {
        return this._sPropType;
    },

    getPropName: function( val ) {
        return this._sPropName;
    },
    
    tryGetPropDataForTreeTable: function( topTreeTableNode, prop ) {
        if (topTreeTableNode instanceof Array) {
            //the top node, then try to get the sub nodes 
            for (var i=0; i < topTreeTableNode.length; i++) {
                var  subNode = topTreeTableNode[i];
                this.tryGetPropDataForTreeTable( subNode, prop);
            }
            
        } else {
            //first get itself, then the sub nodes if any
            var mappingNode = this._oSelectedTreeNode.getMappingTreeNode( topTreeTableNode.mappingNodePath);
            var entry = mappingNode.getPropEntryByName( prop);
            if (entry) {
                topTreeTableNode.value = entry.value;
                topTreeTableNode.paths = entry.paths;
                topTreeTableNode.formatter = entry.formatter;
                topTreeTableNode.existed = true;
            } else {
                //not existed, no need add , but as it it not the first time do prop update, so need delete to ensure it will show emtpy
                topTreeTableNode.existed = false;
                delete topTreeTableNode.value;
                delete topTreeTableNode.paths;
                delete topTreeTableNode.formatter;
            }

            //continue the children
            if ( "children" in topTreeTableNode) {
                for ( i=0; i < topTreeTableNode.children.length; i++) {
                    subNode = topTreeTableNode.children[i];
                    this.tryGetPropDataForTreeTable( subNode, prop);
                }
            }
        }
    },
    

    onAddAllMissedPressed : function( oEvent )  {

    },

    onDelSelectPropPressed : function( oEvent )  {

    },

    open: function( selTreeNode ) {
        var mData = selTreeNode.createTreeTable();
        //the mData like { mTree, aControl, mControlProp
        this._mData = mData;
        this._oModel.setData( mData);
        this._oSelectedTreeNode = selTreeNode;

        this.byId("BatchEditDialog").setModel( this._oModel);
        // this.byId("TreeTable").bindRows("/mTree");
        this.byId("BatchEditDialog").open();
    },
    
    _oModel : null,
    _mData : null,
    _oSelectedTreeNode : null,
    _sControlName:   null ,  //current selected valid control 
    _sPropName: "",  //as all share one, so put it as global var
    _sPropType: "", 
});