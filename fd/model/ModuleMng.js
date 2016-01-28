/**
  * Manage load the required modules */

fd.model.ModuleMng = {
		
	init: function() {
		//!!now for the core, the sap.ui.core.Title not include in the controls, so add manually
		//and for the sap.m,  some controls is not included in the controls ( need report a bug to ui5)
		var mExtraControls = {
			"sap.ui.core": [
				"sap.ui.core.Title", "sap.ui.core.Fragment", "sap.ui.core.ExtensionPoint"
			],
			"sap.m" : [
				"sap.m.semantic.SemanticButton", "sap.m.semantic.SemanticControl", "sap.m.semantic.SemanticPage", 
				"sap.m.semantic.SemanticSelect", "sap.m.semantic.ShareMenuPage"
			]
		};

		var fioriLibs = [];
		if ( fd.cfg.isFiori()) {
			fioriLibs = fd.cfg.getFioriLibs();
		}

		var libs = sap.ui.getCore().getLoadedLibraries();
		for (var lib in libs) {
			var bNeedThisLib = false;
			if (fd.cfg.needSupportCustomerControl())
				bNeedThisLib = true;
			else
				bNeedThisLib = lib.sapStartWith('sap.');

			if (!bNeedThisLib)
				continue;


			//now only one control sap.ui.core.mvc.XMLAfterRenderingNotifier no need 
			if (lib == "sap.ui.core.mvc")
				continue;

			if (fd.cfg.isFiori()) {
				var pos = fioriLibs.indexOf(lib);
				if (pos === -1) {
					continue;
				}
			}

			//initial all libs are choosed
			//as some custom lib no any controls or elements, so need ignore them
			if ( libs[lib].controls.length === 0 &&  libs[lib].elements.length === 0)
				continue;

			this._aAllLib.push(lib);
			this._aChoseLib.push(lib);

			this._aControl = this._aControl.concat(libs[lib].controls);

			//add extra missed controls
			if (lib in mExtraControls) {
				var arr = mExtraControls[lib];
				for (var i = 0; i < arr.length; i++) {
					var control = arr[i];
					if (libs[lib].controls.indexOf(control) === -1) {
						this._aControl.push(control);
					}
				}
			}

			this._aElement = this._aElement.concat(libs[lib].elements);

			this._aInterface = this._aInterface.concat(libs[lib].interfaces);

		}
		
		
		//this.buildD3AllHierStructure();
		//
		//try to build the controls and element metadata
		fd.model.Metadata.buildMetadata(this._aControl, fd.ClassType.Control);
		fd.model.Metadata.buildMetadata(this._aElement, fd.ClassType.Element);
		
		fd.model.Metadata.postBuildMedata();

		//!!
	},	

	/*loadAllModule: function() {
		var arr = this.getModuleAsArray();
		arr.forEach( function(module) {
			jQuery.sap.require(module);
		});
	},*/
	
	
	buildD3AllHierStructure: function() {
		var arr = this.getControls();

		for ( var i = 0; i < arr.length; i++) {
			var cls = arr[i];
			
			this.buildD3OneHierStructure(cls);
		}		
	},

	
	buildD3OneHierStructure : function( clsName ) {
		var arr = this.getClassPathArrayToTopmost(clsName);
		
		var node = this.mHier;
		
		for ( var i = 0; i < arr.length; i++) {
			var cls = arr[i];
			
			//if there then directly use, otherwise create it
			if ( cls in node) {
				var subNode = node[cls];
				
				//last time as the leaf, then now found sub-child
				if (subNode == "") {
					if ( i != arr.length-1) {
						node[cls] = {};
						subNode = node[cls];
					} else {
						//??
						fd.assert(false, "last is empty, but also the last one??");
					}
				}	
				
				//move down
				node  = subNode;
			} else {
				//for the last, just add as "" for temp
				if ( i == arr.length-1)
					node[cls] = "";
				else
					node[cls] = {};
				
				//move down
				node = node[cls];
			}
						
		}		
	},
	
	/**
	 * Get the hier class as an array, so for sap.m.Button then it will like
	 * sap.ui.core.Element,  sap.ui.core.Control sap.m.Button
	 * @param clsName
	 */
	getClassPathArrayToTopmost : function(clsName) {
		var arr = [clsName];

		var meta;
		try {
			jQuery.sap.require(clsName);
			var cmd = clsName +".getMetadata()";
			meta = eval(cmd);
		} catch (ex){
			fd.error(" getMetadata error", clsName, ex);
			return [] ;
		}
	
		//??
		
		var parent = meta.getParent();
		if ( !parent) {
			fd.error('!! prent is null ', clsName);
		}
		
		while ( parent) {
			arr.push( parent.getName());
			if ( parent.getName() == this.topClassName) {
				break;
			} else {
				parent = parent.getParent();
			}
		}
		
		return arr.reverse();
	},
	
	/**
	 * 
	 * @param clsName
	 */
	getSubclassAsArray: function( clsName) {
		var arr = this.getClassPathArrayToTopmost(clsName);
		
		//then get that object by path
		var node = this.mHier;
		for ( var i = 0; i < arr.length; i++) {
			var cls = arr[i];
			
			//if there then directly use, otherwise create it
			if ( cls in node) {
				node = node[cls];
			} else {
				fd.assert('cls not in structure', cls);
				break;
			}
		}		
		
		//map to array
		return fd.util.map2ArrayDeep(node);
	},
	
	getAllLib : function() {
		return this._aAllLib; 
	},

	getChoseLib : function() {
		return this._aChoseLib; 
	},

	/**
	 * 
	 * @returns an array
	 */
	getControls: function() {
		return this._aControl;
	},
	
	/**
	 * 
	 * @returns an array
	 */
	getElements: function() {
		return this._aElement;
	},

	/**
	 * 
	 * @returns an array
	 */
	getInterfaces: function() {
		return this._aInterface;
	},
	
	/**
	 * know whether is control, element or interface, now rely on the ui5 
	 * @param clsName
	 */
	getClassType: function(clsName) {
		var idx = this._aInterface.indexOf(clsName);
		if (idx != -1) {
			return fd.ClassType.Interface;
		} else {
			idx = this._aElement.indexOf(clsName);
			if (idx != -1) {
				return fd.ClassType.Element;
			} else {
				idx = this._aControl.indexOf(clsName);
				if (idx != -1) {
					return fd.ClassType.Control;
				} 
			}	
		}
		//As now the ui5 library have error: in the lib information not all the control/element has listed, so 
		//some element like sap.m.semantic.SendEmailAction may can't find in the available list, in such case, need check it 
		//manually 
		// fd.error("[getClassType] class ", clsName, "seems wrong");
		try {
			var cmd = "new {0}();".sapFormat(clsName);
			var newInstance = eval(cmd);
			if (newInstance instanceof sap.ui.core.Control) {
				this._aControl.push(clsName);
				return fd.ClassType.Control;
			} else if ( newInstance instanceof sap.ui.core.Element) {
				this._aElement.push(clsName);
				return fd.ClassType.Element;
			}
		} catch(ex) {
			return fd.ClassType.Unknown;
		}
	},
	
	/**
	 * 
	 * @param evt
	 * @param flag:  true means check, 
	 */
	selectOrUnselectAllLib: function(evt, flag) {
		var items = this._oLibListControl.getItems();
		items.forEach(function(item){
			item.setSelected(flag);
		});
	},
	
	/**
	 * if return true means user has selection and the selection is different with previous state, then call the call back, 
	 * otherwise don't call it
	 */
	showLibSelectionDialog: function(callback, context) {
		var that = this;
		if (! this._oLibSelectDialog) {
			this._oLibListControl = fd.view.Helper.createSimpleList( this._aAllLib, "MultiSelect", this._aAllLib);
			
			var okBtn = new sap.m.Button( { text:"Ok", 
				press: function() {
					//check at least select one lib
					var items = that._oLibListControl.getSelectedItems();
					if (items.length ==0) {
						alert("At least choose one lib!");
					} else {
						//first close dialog
						that._oLibSelectDialog.close();
						
						//check whether selection is different with previous, if so then call the call back
						var selLibs = [];
						items.forEach( function(item) {
							selLibs.push(item.getTitle());
						});
						
						if ( ! that._aChoseLib.sapEqual( selLibs) ) {
							that._aChoseLib = selLibs;
							callback.call( context);
						}
					}
				}
			});
			var cancelBtn = new sap.m.Button( { text:"Cancel", 
				press: function() {
					that._oLibSelectDialog.close();
				}
			});
		
			
			var selAllBtn = new sap.m.Button( { text:"Select All",
					press: [true, this.selectOrUnselectAllLib, this]
			});
			
			var unselAllBtn = new sap.m.Button( { text:"UnSelect All",
				press: [false, this.selectOrUnselectAllLib, this]
			});
			
			var bar= new sap.m.Bar( {
						contentLeft: selAllBtn,
						contentMiddle: new sap.m.Label({text:'Choose library', design:'Bold'}),
						contentRight: unselAllBtn
					});	
			
			this._oLibSelectDialog = new sap.m.Dialog( {
				title: 		 "Choose library",
				content: 	 this._oLibListControl,
				'beginButton': okBtn,
				'endButton'	: cancelBtn,
				customHeader: bar
			});
		}
		
		this._oLibSelectDialog.open();
	},
	
	/*_mModule : {
			"sap.m": 
				[
				"sap.m.ActionListItem",
				]
	},*/
	
	_oLibListControl : null,
	_oLibSelectDialog: null,
	
	_aControl: [],
	_aElement: [],
	_aInterface: [],
	
	/*the lib name, such as sap.m, sap.me*/
	_aAllLib: [],  
	
	//user chose lib, used for restict the selection
	_aChoseLib: [],
	
	topClassName:"sap.ui.core.Element",
	
	//the hierarchy structure, 
  mHier: {
  	
  },
	
	doUnitTest: function() {
		var d3Ele = fd.util.buildD3Tree(this.mHier['sap.ui.core.Element'], "sap.ui.core.Element");
		var str = JSON.stringify(d3Ele);
		fd.util.Export.saveToFile(str, "ui5-element.json");
	}
	
	
};