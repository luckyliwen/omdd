/**
 * tree  -->treeNode
 * node	 -->normal xml node
 */
fd.util.XmlViewReader = {
		doReset: function() {
			this._aWarnings = [];
		},
		
		getParseWarning: function() {
			return this._aWarnings;
		},
		
		pushWarning: function(warn) {
			this._aWarnings.push(warn);
		},
		
	parseView: function( xmlNode,  forConvert ) {
		
		
		var self = this;
		this.doReset();
		
		var tn = parseNode(undefined, xmlNode, forConvert);
		//for normal case, it is an view or fragment, if not then it is an fragment,  so need create an top node for it
		if ( ! tn.isRootNode()) {
			var rootTn = new fd.model.CtrlNode({
					nodeType: fd.NodeType.Root,
					nodeName: "",  //in doInit it will set 
					isFragment: true
				});
			rootTn.doInit();
			rootTn.addNode(tn);
			return rootTn;
		} else {
			return tn;	
		}
		
		function isFirstLetterUpperCase (str) {
			var c = str[0];
			return  c >="A"  && c <="Z";
		}
		
		function isNsAttr(name) {
			if ( name =="xmlns" || name.sapStartWith('xmlns:'))
				return true;
			else 
				return false;
		}
		
		function localName(xmlNode) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
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
		
		function findControlClass(sNamespaceURI, sLocalName) {
			try {
				var sClassName;
				var mLibraries = sap.ui.getCore().getLoadedLibraries();
				jQuery.each(mLibraries, function(sLibName, oLibrary) {
					if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
						sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
					}
				});
				// TODO guess library from sNamespaceURI and load corresponding lib!?
				sClassName = sClassName || sNamespaceURI + "." + sLocalName;
	
				// ensure that control and library are loaded
				jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists
	
				return jQuery.sap.getObject(sClassName);
			} catch (ex) {
				
				self.pushWarning( "Can't get class " + sNamespaceURI + sLocalName + " due to " + ex); 
						
				return null;
			}
		}

		/**
		 * 
		 */
		function parseNode(tree, node, forConvert) {
			
			var realTree = createTreeNode(tree, node);
			
			//parse the attributes
			parseAttributes(realTree, node, forConvert);
			
			//then add the children
			var jqNode = $(node);
			for ( var i = 0; i < jqNode.children().length; i++) {
				var subNode = jqNode.children()[i];
				
				parseNode(realTree, subNode, forConvert);
			}
			
			//for the value how to do??
			
			return realTree;
		}
		
		/**
		 * 
		 * @param node
		 * @param root
		 * @returns
		 */
		function createTreeNode(parentTreeNode, node) {
			var tn;
			var tnType ;
			var tnName= "";
			
			var ns = node.namespaceURI;
			var name = localName(node);
			// as in some case the name can like m:semantic.FullscreenPage, so we need get the last part to check whether it is a normal call or not
			var lastName = name.sapLastPart( ".");  

			var isFragment = false;
			if ( ! parentTreeNode ) {
				tnType = fd.NodeType.Root;
				isFragment = ( name === "FragmentDefinition");
				//!! current some view use sap.ui.core.View, some use sap.ui.core.mvc.View, so now not judge
				if ( name !== "View" && name !== "FragmentDefinition") {
					tnType = fd.NodeType.Ui5;
					tnName = node.namespaceURI + "." + name;
				}
				//?? later need support the top node is an normal ui5 node, in that case then need first create the FragmentDefinition
			} else {
				if ( ns === "http://www.w3.org/1999/xhtml" || ns === "http://www.w3.org/2000/svg" ) {
					tnName = name;
					tnType = fd.NodeType.Html;
					
				} else if (isFirstLetterUpperCase(lastName)){
					//??by first letter is Uppercase not good
					
					//for ui5, then need add .
					tnName = node.namespaceURI + "." + name;
					tnType = fd.NodeType.Ui5;
				} else {
					//aggregation
					tnName = name;
					tnType = fd.NodeType.Aggr;
				}
			}

			tn = new fd.model.CtrlNode({
					nodeType: tnType,
					nodeName: tnName,
					isFragment: isFragment
				});
			tn.doInit();
			
			if (parentTreeNode) {
				//??for the node which add to the default aggregation, need check whether need add the default aggregation
				if ( parentTreeNode.isAggrNode())
					parentTreeNode.addNode( tn );
				else {
					if ( tn.isAggrNode()) {
						//??also need add to the parent Aggr meta
						//directly add the aggr node, need update aggr prop also
						parentTreeNode.addAggrMetaDataByName( tn.getNodeName() );
						
						parentTreeNode.addNode( tn );
					} else {
						var md =  parentTreeNode.getUi5Metadata();
						if (md &&  md.getDefaultAggregationName() != "") {
							
							//??later need check whether 
							var existedNode = parentTreeNode.getSubNodeByName( md.getDefaultAggregationName());
							if (existedNode) {
								existedNode.addNode( tn );
							} else {
								//create a default node
								var newTn = new fd.model.CtrlNode({
									nodeType: fd.NodeType.Aggr,
									nodeName: md.getDefaultAggregationName()
								});
								newTn.doInit();
								
								parentTreeNode.addNode(newTn);
								newTn.addNode(tn);

								//Also need add the Aggr to the treeNode mData,other wise the left Tree show correct but the right part 
								//will not show correct
								parentTreeNode.addAggrMetaDataByName( md.getDefaultAggregationName() );
							}
						} else {
							//?? need report error:  no default aggr, but directly add control
							parentTreeNode.addNode( tn );
						}
					}
				}
			}
			
			return tn;
		}
		
		
		
		function parseAttributes(tree,node,forConvert) {
			//for root or html just add
			var rootOrHtml = tree.isRootOrHtmlNode();
			
			if (rootOrHtml  ||  tree.isAggrNode()) {
				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
					var sName = attr.name;
					
					//ignore the xmlns
					if (isNsAttr(sName))
							continue;
					
					var sValue = attr.value;
					tree.addMetaData( fd.MetaType.Prop, sName,"string", sValue, forConvert);
				}
			
				return ;
			}
			
			//??for the aggr node, how to deal the attr??
			
			//for the other, need get meta infor 
			var ns = node.namespaceURI;

  	        var oMetadata = null; 
			var mJSONKeys = null;
			
			var oClass = findControlClass(ns, localName(node));
			
			if ( oClass != null) {
				oMetadata = oClass.getMetadata();
				mJSONKeys = oMetadata.getJSONKeys();
				//need copy it out in order not change the ui5 metadata 
				mJSONKeys = $.extend({}, mJSONKeys);
				addIdAndClassToJSONKeys(mJSONKeys);
			}
			
			
			for (i = 0; i < node.attributes.length; i++) {
				attr = node.attributes[i];
				sName = attr.name;
				sValue = attr.value;
				
				//for those can't find the class, just add as pure prop
				if ( oClass == null) {
					tree.addMetaData( fd.MetaType.Prop, sName,  "string", sValue, forConvert);
					continue;
				}
				
				var oInfo = mJSONKeys[sName];
				
				//following refer the ui5 implemenation
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
					
				} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
					//it use , or  space to seperate muliple id, but for us it is same as the single Asso
					tree.addMetaData( fd.MetaType.Asso, sName,  oInfo.type, sValue, forConvert);
					
				} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
					//event without type
					tree.addMetaData( fd.MetaType.Event, sName,  "", sValue, forConvert);
				
				} else {
					//may be version diff, so can't find it
					if (fd.cfg.isKeepUnknownProp() ) {
						tree.addMetaData( fd.MetaType.Prop, sName, "string", sValue, forConvert);
					} else {
						jQuery.sap.log.warning("XMLView parser encountered and ignored unknown attribute '" + sName + "' (value: '" + sValue + "')");
					}
				}
				
			}
		}
		
	
		
	}
};

