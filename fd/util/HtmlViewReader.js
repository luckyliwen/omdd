/**
 * tree  -->treeNode
 * node	 -->normal xml node
 * $node:  jQuery  node
 */
fd.util.HtmlViewReader = {

	doReset: function() {
		this._aWarnings = [];
	},
	
	getParseWarning: function() {
		return this._aWarnings;
	},
	
	pushWarning: function(warn) {
		this._aWarnings.push(warn);
	},
	
	parseView: function( htmlContent,  forConvert ) {
		var self = this;
		this.doReset();
		
		var divObj  = document.createElement("div");
		divObj.innerHTML = htmlContent;
			
		var $divObj = jQuery(divObj);
		
		var firstNode = $divObj.children()[0];
		
		//??just tmp fix,
		// This is a fix for browsers that support web components
		if (firstNode.content && firstNode.children.length==0) {
			firstNode.appendChild(firstNode.content);
		}
		
		var $firstNode = jQuery($divObj.children()[0]);
		var tn = parseNode(undefined, firstNode, $firstNode, forConvert);
		return tn;

		//return null;
		
		function isFirstLetterUpperCase (str) {
			var c = str[0];
			return  c >="A"  && c <="Z";
		}
		
		function isSpecialAttr( name ) {
			var aSpecialAttr = [
					"data-sap-ui-type",
					"data-sap-ui-aggregation",
					"data-sap-ui-default-aggregation",
					"data-tooltip",
	                  ];
			return aSpecialAttr.indexOf(name) != -1;
		}
		

		//	//data-visible-row-count
		function normalizeAttrName( name ) {
			name = name.trim();
			
			//name not start by data then not need change,
			var pos = name.indexOf('data-');
			if (pos != 0) {
				return name;
			}
			
			//start by data-,   special name just ignore as it has been handled
			if (isSpecialAttr(name))
				return "";
			
			//others first remove the data-,  then all the letter after - need convert upper case
			name = name.substr("data-".length );
			
			if ( name.indexOf('-') != -1) {
				var normal = name.replace(/-([a-z])/g, function(match, number) {
					//now match contain the word, space and : 
					var word = match;
					//remove the last :
					word = word.substr(1);
					word = word.toUpperCase();
					return word;
				});
				
				return normal;
			} else {
				return name;
			}
		}
		
		
		function localName(node) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return node.localName || node.baseName || node.nodeName;
		}
		
		function getUi5SpecialAttrs( $node) {
			var m= {
				uiType: "",
				uiAggr: "",
				uiDftAggr: ""
			};
			
			m.uiType = $node.attr("data-sap-ui-type");
			m.uiAggr = $node.attr("data-sap-ui-aggregation");
			m.uiDftAggr = $node.attr("data-sap-ui-aggregatio");
			
			return m;
		}
		
		
		/**
		 * just add id and class so it can easy to put it to prop part
		 * @param map
		 */
		function addIdAndClassToJSONKeys(map) {
			//??directly modity
			map['id'] = {
					_iKind: 0 ,
					name: "id" ,
					type: "string"
			};
			
			map['class'] = {
					_iKind: 0 ,
					name: "class" ,
					type: "string"
			};
		}
		
		function findControlClass(clsName) {
			try {
				//?? as the view may refer other views, then we can't get the class, so can only add as the default prop 
				
				// ensure that control and library are loaded
				jQuery.sap.require(clsName); // make sure oClass.getMetadata() exists
	
				return jQuery.sap.getObject(clsName);
			} catch (ex) {
				
				self.pushWarning( "Can't get class " + clsName + " due to " + ex); 
						
				return null;
			}
		}

		/**
		 * 
		 */
		function parseNode(tree, node, $node, forConvert) {
			var realTree = createTreeNode(tree, node, $node);
			
			
			//parse the attributes
			parseAttributes(realTree, node, $node, forConvert);
			
			//then add the children
			for ( var i = 0; i < $node.children().length; i++) {
				
				var subNode = $node.children()[i];
				var $subNode = jQuery( subNode);
				
				parseNode(realTree, subNode,  $subNode , forConvert);
			}
			
			//for the value how to do??
			
			return realTree;
		}
		

		//if only data-sap-ui-aggregation then is Aggregation, 
		//if only data-sap-ui-type then need add to the parent's aggr
		//othewise, pure html node
		
        /*<div data-sap-ui-aggregation="layout"
             data-single-column="false"
             data-sap-ui-type="sap.ui.commons.form.GridLayout">
		</div>
        */
			
		function getParentNodeDftAggr(parentTreeNode, parentNodeName) {
			if (parentNodeName)
				return parentNodeName;
			else {
				var md =  parentTreeNode.getUi5Metadata();
				
				if (md &&  md.getDefaultAggregationName()) {
					return md.getDefaultAggregationName();
				} else {
					return "";
				}
			}
		}
		
		/**
		 * 
		 * @param node
		 * @param root
		 * @returns
		 */
		function createTreeNode(parentTreeNode, node, $node) {
			var tn;
			var tnType ;
			var tnName= "";
			
			var mAttr = {};
			//
			var parentNodeName = "";
			
			if ( ! parentTreeNode ) {
				tnType = fd.NodeType.Root;
			} else {

				var name = localName(node);
				
				mAttr = getUi5SpecialAttrs($node);
				
				if ( mAttr.uiAggr  && mAttr.uiType) {
					//both, first create content node, then the sub node
					//aggregation
					tnName = mAttr.uiType;
					tnType = fd.NodeType.Ui5;
					
					parentNodeName =   mAttr.uiAggr;
					
				} else if ( mAttr.uiAggr) {
					//only aggr,
					tnName = mAttr.uiAggr;
					tnType = fd.NodeType.Aggr;
					
				} else if ( mAttr.uiType) {
					//pure node
					tnName = mAttr.uiType;
					tnType = fd.NodeType.Ui5;
				} else {
					//html node
					tnName = name;
					tnType = fd.NodeType.Html;
				}
			}		
			
			tn = new fd.model.CtrlNode({
					nodeType: tnType,
					nodeName: tnName
			});
			tn.doInit();
			
			if ( tn.isUi5Node()) {
				//for non-root node, need save the customized dft aggr for later use
				if (mAttr.uiDftAggr) {
					//only for ui5 node is valid
					tn.setCustomizeDftAggr( mAttr.uiDftAggr);
				}
			} 
			
			if (parentTreeNode) {
				//??for the node which add to the default aggregation, need check whether need add the default aggregation
				if ( parentTreeNode.isAggrNode() || parentTreeNode.isRootNode() || parentTreeNode.isHtmlNode() ) {
					parentTreeNode.addNode( tn );
				} else {
					if ( tn.isAggrNode()) {
						//directly add the aggr node, need update aggr prop also
						parentTreeNode.addAggrMetaDataByName( tn.getNodeName() );
						
						parentTreeNode.addNode( tn );
					} else {
						var  realParentNodeName =  getParentNodeDftAggr( parentTreeNode, parentNodeName);
						if (realParentNodeName) {
							var existedNode = parentTreeNode.getSubNodeByName( realParentNodeName);
							if (existedNode) {
								existedNode.addNode( tn );
							} else {
								//create a default node
								newTn = new fd.model.CtrlNode({
									nodeType: fd.NodeType.Aggr,
									nodeName: realParentNodeName,
								});
								newTn.doInit();
								
								parentTreeNode.addNode(newTn);
								
								//also need add the default Aggr to the prop, otherwise later  it will create problem.
								parentTreeNode.addAggrMetaDataByName(realParentNodeName);
								
								newTn.addNode(tn);
							}
						} else {
							//
							fd.assert(false,"For node" + node + "can't find where to insert");
							//??
							parentTreeNode.addNode(tn);
						} 
					} // end of else -->if ( tn.isAggrNode()) {
				} // end of else ->if ( parentTreeNode.isAggrNode()) {
			} //end of if (parentTreeNode) {
			
			return tn;
		}
		
		
		function parseAttributes(tree,node,  $node, forConvert) {
			//for root or html just add
			var rootOrHtml = tree.isRootOrHtmlNode();
			
			if (rootOrHtml  ||  tree.isAggrNode()) {
				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
					var sName = normalizeAttrName(attr.name);
					
					var sValue = attr.value;
					if ( sName == "")
						continue;
					
					tree.addMetaData( fd.MetaType.Prop, sName,"string", sValue, forConvert);
				}
			
				return ;
			}
			
						
			//for the other, need get meta infor 
			var oMetadata = null; 
			var mJSONKeys = null;
			
			var oClass = findControlClass( tree.getNodeName());
			if ( oClass != null) {
				oMetadata = oClass.getMetadata();
				mJSONKeys = oMetadata.getJSONKeys();
				//here can't directly modity it as it will be used by kernal!!
				mJSONKeys = $.extend({}, mJSONKeys);
				addIdAndClassToJSONKeys(mJSONKeys);
			}
			
			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes[i];
				var sName = normalizeAttrName(attr.name);
				if (sName == "")
					continue;
				
				var sValue = attr.value;
				
				//for those can't find the class, just add as pure prop
				if ( oClass == null) {
					tree.addMetaData( fd.MetaType.Prop, sName,  "string", sValue, forConvert);
					continue;
				}
				
				var oInfo = mJSONKeys[sName];
				
				if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
			
					tree.addMetaData( fd.MetaType.Prop, sName,  oInfo.type, sValue, forConvert);
					
				} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
					
					//also need the altTypes
					tree.addAggrMetaData( sName,  oInfo.type, oInfo.altTypes.toString(), oInfo.multiple, sValue, forConvert);
					
				} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
					var altTypesStr = "";
					if (oInfo.altTypes)
						altTypesStr = oInfo.altTypes.toString();
						
					tree.addAggrMetaData( sName,  oInfo.type, altTypesStr, oInfo.multiple, sValue, forConvert);
					
				} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {

					tree.addMetaData( fd.MetaType.Asso, sName,  oInfo.type, sValue, forConvert);
					
				} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
					//event without type
					tree.addMetaData( fd.MetaType.Event, sName,  "", sValue, forConvert);
				
				} else {
					//may be version diff, so can't find it
					if (fd.cfg.isKeepUnknownProp() ) {
						tree.addMetaData( fd.MetaType.Prop, sName, "string", sValue, forConvert);
					} else {
						jQuery.sap.log.warning("HTMlView parser encountered and ignored unknown attribute '" + sName + "' (value: '" + sValue + "')");
					}
				}
				
			}
		}
		
	}
};