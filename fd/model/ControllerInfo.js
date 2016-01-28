/**
 * Class for the controller related information
 */
fd.model.ControllerInfo = function(controllerName) {
	
	this.controllerName = controllerName;
	
	this.mEventHandler = {};
	
	//means the local formaterer
	this.mLocalFormatter = {};
	
	this.mExternalFormatter = {};
	
	this.mBinding = {};
	this.mDefaultBinding = {};  //As it will have the binding with model name, so here contain all of this
	
	
	this.aMissBinding = [];
	
	//some static information
	/*
	  
	 mEventHandler: {}, 
	*/
	this.indent = "    ";
	this.indent2 = "        ";
	this.indent4 = "                ";

	//by this to control wheher use OData or Json, for json wheher use default binding or normal
	this.mDataBindingSetting = fd.getSettingController().getDataBinding();
};

fd.model.ControllerInfo.prototype = {
	addMissBinding: function(path) {
		this.aMissBinding.push(path);
	},
	
	//now the param look like parent/child,b,c, so for the real param need like child, b,c
	simplifyParam: function( param ) {
	    var arr = param.split(",");
	    var retArr = [];
	    for (var i=0; i < arr.length; i++) {
	    	var name = arr[i].trim();
	    	if (!name)
	    		continue;
	    	retArr.push(name.sapLastPart("/"));
	    }
	    return retArr.join(",");
	},
	

	//now the param may like data/text,so only get the last part
	addLocalFormatter: function(name, param) {
		var entry = {"name":name,  "param": this.simplifyParam(param)};
		this.mLocalFormatter[ name ] = entry; 
	},
	
	addExternalFormatter: function(name, param) {
		var entry = {"name":name,  "param": this.simplifyParam(param)};
		this.mExternalFormatter[ name ] = entry; 
	},
	
	addEventHandler: function(name) {
		var entry = {"name": name};
		this.mEventHandler[ name ] = entry; 
	},
	
	/**
	 * aName, maybe an array, like birthday/day,birthday/month,birthday/year   or single  lastName
	 * bindInfo  : When it was the child of one aggregation, and the aggregation set the binding path
	 *             may be two part: 	{modelName: "", path: ""};
	 * propType:    from it can guess the default value
	 */
	addDataBinding: function( aName, bindInfo, propType) {
		for (var i=0; i<aName.length; i++) {
			var name = aName[i];
			
			//whether have the >
			var pos = name.indexOf('>');
			var modelName = "";
			if ( pos != -1) {
				modelName = name.substring(0, pos).trim();
				name = name.substring(pos+1).trim();
			} 
			
			//push also
			var m;
			if (modelName == "") {
				m = this.mDefaultBinding;
			} else {
				if ( ! (modelName in this.mBinding)) {
					this.mBinding[ modelName] = {};
				}
				m = this.mBinding[ modelName];
			}
			
			//just add an new entry
			var entry = {};
			//entry ["name" ] = name;
			//??only when the itself modelName same as the parent bindInfo then will add the parent, otherwise just like the 
			//cart xml, parent binding path :"cart>/totalPrice",, then type="{cfg>/listItemType}" will not belong to it
			if ( modelName == bindInfo.modelName)
				entry ["parentPath" ] = bindInfo.path;
			else
				entry ["parentPath" ] = "";
			
			entry ["propType"] = propType;
			
			m [ name ] = entry;
		}
	},
	
	/**
	 * mcfg: {
	 * 			multipleCnt: 3  //multiple data binding entry counting,
	 *          externalFormatter:  false //generate the external formatter also
	 *       }
	 * @param mCfg
	 * @returns
	 */
	generateContent: function(mCfg) {
		
		var str = "";
		
		if (mCfg && mCfg.externalFormatter) {
			str += this.generateExternalFormatterPart();
		}
		
		str += this.generateHeaderPart();
		
		str +=  this.generateOnInitPart(mCfg);
		
		str += this.generateLocalFormatterPart();
		
		
		
		str += this.generateEventHanderPart();
		
		str += this.generateTailPart();
		
		return str;
	},
	
	generateHeaderPart: function() {
		var header = 'sap.ui.controller("{0}", {' + fd.crlf;
		return header.sapFormat(this.controllerName);
	},
	
	
	_createDemoDataModelFor_i18n :function() {
		//??how to set from string??
		return "";	
	},
	
	/**
	 * modelName: like cfg
	 * entry: like {
	 * 			"birthday/day" ==> { parentPath: "",  propType:"Number"}
	 *          "birthday/month" ==> { parentPath: "",  propType:"Number"}
	 * */
_createDemoDataModelFor_normal :function(modelName, entry, mCfg) {
		//the  name need first add to the parent name to create long name,  then the propType
		var  map = {};
		var str = "";
		//only for json need create data locally
		var jsonString = "";
		if ( ! this.mDataBindingSetting.bOData) {
			for (var name in entry) {
				//try to add the parent path and local path, even the parent path start by //, we add // also
				var ele = entry[name];
				
				var path = "";
				if ( ele.parentPath) {
					if (ele.parentPath[0] != "/")
						path = "/";
				
					path += ele.parentPath;
					
					//ensure last not end by /
					if (path.slice(-1) == "/") {
						path = path.substr(0, path.length-1);
					}
					
					//if have parent path, then it must be a array, so just add  [] then later it can know after meet the[], then add the array
					//??later change how to add multiple entry for array
					path +="[0]";
					
				}
				
				//ensure the name start by /, if not add /
				if ( name[0] != "/") {
					path = path + "/" + name;
				} else {
					path += name;
				}
				
				map[path] = ele.propType;
				
				//??add multiple
			}
			
			//----now support create default data and multiple data
			var demoData  = {};
			for (  name in map) {
				var oldName = name;
				var propType = map[name];
				
				
				var bCreateArray = false;
				var dataCount = 1;
				if ( name.indexOf("[0]") !== -1) {
					bCreateArray = true;
					dataCount = this.mDataBindingSetting.dataCount;
				}

				for ( var idx =0; idx <dataCount; idx++) {
					var val = "";
					if ( this.mDataBindingSetting.bCreateDefaultData) {
						val = name.sapLastPart("/");  //just use the name
						if ( propType == fd.PropType.Number) {
							val = this.mDefaultBinding.numberStart + idx;
						} else if ( propType == fd.PropType.Boolean) {
							val = idx % 2 ? true : false ;
						} else if ( propType == fd.PropType.Enumable) {
							//??later need add the actually type
						} else {
							if ( bCreateArray) {
								val = val + " " + idx;
							}
						}
					} else {
						if ( propType == fd.PropType.Number) {
							val = this.mDefaultBinding.numberStart ;
						} else if ( propType == fd.PropType.Boolean) {
							val = idx % 2 ? true : false ;
						} else if ( propType == fd.PropType.Enumable) {
							//??later need add the actually type
						} 
					}
					
					//we need ensure the path parent is there
					if (bCreateArray) {
						//from the [0]  change to [i]
						var newPos = "[" + idx + "]";
						name = oldName.replace("[0]", newPos);
					}
					fd.util.addJsonValueSafely(demoData, name, val);
				}
			}


			jsonString = fd.util.jsonPrettyStringify(demoData, this.indent2);
		}

		//now the demo data is reay, then create the source for it.
    	
		var _modelName = "";
		if ( modelName ) 
			_modelName = "_" +  modelName;
		
		if ( !this.mDataBindingSetting.bOData) {
			str =  this.indent2 + "var demoData{0} = \r\n".sapFormat(_modelName);
			str +=  jsonString + ";" + fd.crlf;
			
			var strModel = "var oModel{0} = new sap.ui.model.json.JSONModel();".sapFormat(_modelName) + fd.crlf;
			var strSetData = "oModel{0}.setData( demoData{0} );".sapFormat(_modelName);
			
			str += this.indent2 + strModel;
			str += this.indent2 + strSetData + fd.crlf;
		} else {
			var strUrl = "var url = \"" + this.mDataBindingSetting.odataUrl + "\";" + fd.crlf;
			var strOModel = "var oModel{0} = new sap.ui.model.odata.ODataModel(url, true);".sapFormat(_modelName) + fd.crlf;
			
			str = this.indent2 + strUrl;
			str += this.indent2 + strOModel + fd.crlf;
		}	
		
		//then the set model   this.getView().setModel( xx , name);
		var strSetModel ="this.getView().setModel( oModel{0}".sapFormat(_modelName);
		if ( modelName) 
			strSetModel += ", '" + modelName + "'";
		
		strSetModel += " ) ;" + fd.crlf;
		
		str += this.indent2 + strSetModel;
		return str;
	},
	
	
	generateOnInitPart: function(mCfg) {
		/*onInit : function () {
		},*/
		
		var str = this.indent + "// ========OnInit part, add local demo data by guess, please adjust by yourself ============" + fd.crlf;
		str += this.indent + "// ====For some binding if not start by /, please don't forget add the bindContext() ===" + fd.crlf2;
		
		str += this.indent +"onInit : function () {" + fd.crlf2;
		
		//then the real init part, mainly is the model binding
		for (var name in this.mBinding) {
			//
			var entry = this.mBinding[name];
			if (name =="i18n") {
				str += this._createDemoDataModelFor_i18n(name, entry, mCfg);
			} else {
				str += this._createDemoDataModelFor_normal(name, entry, mCfg);
			}
			str += fd.crlf;
		}
		
		//then the default binding
		str += this._createDemoDataModelFor_normal("", this.mDefaultBinding, mCfg);
		str += fd.crlf;
		
		str += this.indent + "}," + fd.crlf2;
		return str;
	},
	
	//depend on the param, it like a,b  so just return all of them
	_createFormatterReturnPart: function(param) {
			var strReturn = "return ";
			var pos = param.indexOf(',');
			
			//single param
			if (pos == -1) {
				strReturn += param + ";" ;
			} else {
				var arr = param.split(',');
			
				for (var i=0; i<arr.length; i++) {
					var p = arr[i].trim();
					if (p != "") {
						strReturn += p;
						if ( i != arr.length -1) {
							strReturn += '+ " " + '; 						
						} else {
							strReturn +=";" ;
						}
					}
				}
			}
		return strReturn;
	},
	
	//as the format may like .format.formatA,  then need split it into two part, one is the normal part, another is the comple part
	generateLocalFormatterPart: function() {
		var ret = "";
		var topParts = [];
		var mDeepPart  = {};
		var that = this;

		function createFormatFunction(indent, name,param) {
			var str = indent + name +" : function( " + param + " ) {" + fd.crlf;
			//              add extra this.indent for format
			str += indent + that.indent + that._createFormatterReturnPart(param) + fd.crlf;
			str += indent + "},";
			return str;
		}

		for (var name in this.mLocalFormatter) {
			var entry = this.mLocalFormatter[name];
			var pos = name.indexOf(".");
			if ( pos !== -1) {
				//!!not only support one level
				var arr = name.split(".");
				var parent = arr[0],  funcName = arr[1];
				var funcContent = createFormatFunction(this.indent2, funcName, entry.param);
				if ( parent in mDeepPart) {
					//just push 
					mDeepPart[ parent ].push( funcContent);
				} else {
					mDeepPart[parent] = [ funcContent ];	
				}
			} else {
				funcContent = createFormatFunction(this.indent, name, entry.param);
				topParts.push( funcContent);
			}
		}
		
		ret = this.indent + "// ========formatter part ============" + fd.crlf;
		//normal part 
		ret += topParts.join(fd.crlf);
		
		//deep part, like format: {  },
		for (var key in mDeepPart) {
			var val = mDeepPart[key];

			ret += fd.crlf2 +  
				this.indent + key + ":{" + fd.crlf + 
				 	val.join(fd.crlf) + fd.crlf + 
			    this.indent + "}," + fd.crlf;
		}

		return ret;
	},
	
	generateEventHanderPart: function() {
		
		var title = fd.crlf + this.indent + "// ========Event Handler part ============" + fd.crlf;
		
		var str = "";
		for (var name in this.mEventHandler) {
			var entry = this.mEventHandler[name];
			
			str += this.indent + name +" : function( oEvent )  {" + fd.crlf;
			
			// str += this.indent2 + 'console.log("**Event happened for" + name + "",  oEvent);' + fd.crlf;
			str += this.indent2 + 'console.debug("**Event happened for {0} ",  oEvent.getParameters());'.sapFormat(name)  + fd.crlf;

			str += this.indent + "}," + fd.crlf2;
		}
		
		if (str!="") {
			str = title + str;
		}
		
		return str;
	},
	
	generateTailPart: function() {
		return "});";
	}
	
};