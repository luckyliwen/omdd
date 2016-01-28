/**
 * Extend some method of the Tree so can make code more simple
 */
sap.ui.commons.Tree.extend("fd.uilib.Tree", {
    metadata : {
        properties : {
        },

        events : {}
    },

    doInit:function ( evt ) {
    },

    renderer : 'sap.ui.commons.TreeRenderer',

    //----all name add fd to avoid name confilct with future version Tree
    
    /**
     * Return an array of the current selection nodes
     * @return {[type]} [description]
     */
    fdGetSelections: function() {
        if ( this.mSelectedNodes) {
            var ret = [];
            var aName = [];
            for (var key in this.mSelectedNodes) {
                var val = this.mSelectedNodes[key];
                aName.push(  val.getNodeName());
                ret.push(val);
            }
            return ret;
        } else {
            //then just use the old 
            if (this.bFirstTimeWarning) {
                fd.uilib.Message.warning("Sorry, your SAPUI5 version is too old to support Tree multiple selection!");
                this.bFirstTimeWarning = true;
            }
            var node = this.getSelection();
            if (node)
                return [ node ];
            else 
                return [];
        }
    },

    fdIsSelectionNotOverlap: function( aNode) {
        //need check one by by that the parent node of one node is not inside the selection
        var flagOk  = true;
        for (var i=0; i < aNode.length; i++) {
            var node = aNode[i];

            //one check till reach to the Tree
            var parent = node.getParent();
            while (true) {
                if ( parent instanceof sap.ui.commons.Tree ) {
                    break;
                } else {
                    if ( aNode.indexOf( parent) !== -1) {
                        flagOk = false;
                        break;
                    }
                }
                parent = parent.getParent();   
            }
            
            if ( !flagOk)
                break;
        }

        return flagOk;
    },

    fdIsSelectionSameParent: function( aNode) {
        if (aNode.length === 0)
            return true;

        var parent = aNode[0].getParent();
        for (var i=1; i < aNode.length; i++) {
            var node = aNode[i];

            //one check till reach to the Tree
            if ( parent != node.getParent()) {
                return false;
            }
        }
        return true;
    }
    
});