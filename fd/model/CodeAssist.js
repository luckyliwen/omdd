/**
 * This class use the HandleBars to genereate code help for ui5 programming
 * @type {Object}
 */
fd.model.CodeAssist = {
	buildClassTemplate: function() {
		Handlebars.registerHelper('formatInterface', function(options) {
			var ret = "";
			for (var i = 0; i < this.aInterface.length; i++) {
				ret  += '"' + this.aInterface[ i ] + '"';
				if (i<this.aInterface.length-1)
					ret +=", ";
			}
			return new Handlebars.SafeString(ret);
	 	});

		//=================format of prop
	 	Handlebars.registerHelper('formatTypeCandidate', function(options) {
			//only when type is complex then check it
			if ( fd.model.EnumMng.isEnumableProp(this.type)) {
				var out = "  // " + fd.model.EnumMng.getAllValueForEnumObj(this.type);
				return new Handlebars.SafeString(out);
			} else {
				return "";
			}
	 	});

		Handlebars.registerHelper('formatPropName', function(options){
			var out = '"' + this.name + '"'  ;
			var diff = fd.model.CodeAssist.maxPropLen - this.name.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

		Handlebars.registerHelper('formatPropType', function(options){
			var out = '"' + this.type + '"'  ;
			var diff = fd.model.CodeAssist.maxPropTypeLen - this.type.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

		Handlebars.registerHelper('formatPropDefaultValue', function(options){
			// var out = String(this.defaultValue);
			//the defaultValue may be a array, so need add the [] if so
			// if (typeof this.defaultValue =="string" )
			// 	out = '"' + out + '"';
			var out = JSON.stringify(this.defaultValue);
			var diff = fd.model.CodeAssist.maxPropDftValueLen - fd.model.CodeAssist.getDefaultValueLength(this.defaultValue);
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});


		//=================format of Aggr
		Handlebars.registerHelper('formatAggrName', function(options){
			var out = '"' + this.name + '"'  ;
			var diff = fd.model.CodeAssist.maxAggrLen - this.name.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

		Handlebars.registerHelper('formatAggrType', function(options){
			var out = '"' + this.type + '"'  ;
			var diff = fd.model.CodeAssist.maxAggrTypeLen - this.type.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

		Handlebars.registerHelper('formatAggrSinglarName', function(options){
			var out = '"' + this.singularName + '"'  ;
			var diff = fd.model.CodeAssist.maxAggrSingularNameLen - this.singularName.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			}
			return new Handlebars.SafeString(out);
		});


	//=================format of Event
		Handlebars.registerHelper('formatEventName', function(options){
			var out = '"' + this.name + '"'  ;
			var diff = fd.model.CodeAssist.maxEventLen - this.name.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

	//=================format of Asso
		Handlebars.registerHelper('formatAssoName', function(options){
			var out = '"' + this.name + '"'  ;
			var diff = fd.model.CodeAssist.maxAssoLen - this.name.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});

		Handlebars.registerHelper('formatAssoType', function(options){
			var out = '"' + this.type + '"'  ;
			var diff = fd.model.CodeAssist.maxAssoTypeLen - this.type.length;
			if (diff) {
				var pad = " ".sapRepeat(diff);
				out += pad;
			} 
			return new Handlebars.SafeString(out);
		});


		var crlf = "\r\n";
		var crlf2 = "\r\n\r\n";
		var source = 
		'    var metadata = { ' + crlf + 

		//==interface
		'{{#if aInterface.length}}' +
		'        interfaces : [ {{formatInterface aInterface}} ],\r\n' +  
		'{{/if}} ' + 

		//==prop
		'		properties : {' + crlf +
		'{{#each Prop}}'   +
		'        	{{formatPropName name}} : { type: {{formatPropType type}}, defaultValue: {{formatPropDefaultValue defaultValue}} }, {{formatTypeCandidate type}}' + crlf + 
		"{{/each}}" + 
		'        }, ' + crlf2 +

		//==aggr
		'{{#if aggrDftName}}' + 
		'        defaultAggregation : "{{aggrDftName}}",\r\n' +
		'{{/if}}' +  
		'{{#if aggrCnt}}' + 
		'		aggregations : {' + crlf +
		'{{#each Aggr}}'   +
		'            {{formatAggrName name}} : { type: {{formatAggrType type}}, multiple: {{#if multiple}}true , {{else}}false, {{/if}}{{#if singularName}}singularName: {{formatAggrSinglarName singularName}}, {{/if}} {{#if altTypesStr}} altTypes: "{{altTypesStr}}" {{/if}} },' + crlf + 
		"{{/each}}" + 
		'        },' + crlf2 +
		'{{/if}}' + 

		//===asso
		'{{#if assoCnt}}' + 
		'		associations : {' + crlf +
		'{{#each Asso}}'   +
		'            {{formatAssoName name}} : { type: {{formatAssoType type}} },' + crlf + 
		"{{/each}}" + 
		'        },' + crlf2 +
		'{{/if}}' + 

		//==event
		'{{#if eventCnt}}' + 
		'		events: {' + crlf +
		'{{#each Event}}'   +
		'            {{formatEventName name}} : {},' + crlf + 
		"{{/each}}" +
		'        }' + crlf +
		'{{/if}}' +
		'\r\n    };'; 		

		var template = Handlebars.compile(source);
		return template;
	},

	/**
	 * build the type information,
	 	sap.m.ButtonType = {
		    Default : "Default",
		},

	 * @param  {[type]} type [description]
	 * @return {[type]}      [description]
	 */
	buildOneType : function(type) {
		if ( ! fd.model.EnumMng.isEnumableProp(type))
			return "";

		//??
		var idx = this.aAllType.indexOf(type);
		if (idx != -1) {
			console.error('Type', type, "already generated");
		}
		this.aAllType.push(type);

		var arr = fd.model.EnumMng.getArrayForEnumObj(type);

		//align them so need first get the max value
		var maxLen = 0;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].name.length >maxLen) 
				maxLen = arr[i].name.length;
		}

		var ret  = type +" = {\r\n";
		for (var i = 0; i < arr.length; i++) {
			ret +="	" + arr[i].name;
			if ( maxLen > arr[i].name.length) {
				ret +=" ".sapRepeat( maxLen - arr[i].name.length);
			}
			ret += " : \"" + arr[i].value + "\",\r\n";
		}
		ret +="};\r\n\r\n";
		return ret;
	},	

	/**
	 * Build the code for one class
	 * @param  {[type]} meta [description]
	 * @return {[type]}      [description]
	 */
	buildOneClass: function(name, meta) {
		if (name =="sap.ui.core.Control")
			return "";

		//first get the format information, 
		this.buildFormatInformation(meta);

		//then build it by class template
		//??need filter the id, now no good solutions so just del first then add it back
		// m.Prop['id'] =    {name: "id",    bindable: "", 	defaultValue: null, group: "Mis",	type: "string"};
		delete meta.Prop['id'];
		var out = this.clsTemplate( meta);

		meta.Prop['id'] =   {name: "id",    bindable: "", 	defaultValue: null, group: "Mis",	type: "string"};

		//and add the head the tail
		var hierInfo = "";
		if (meta.aParent && meta.aParent.length>0) {
			hierInfo = "//extends from: " + meta.aParent.join(" ->") + "\r\n";
		}

		if (meta.aDirectChild && meta.aDirectChild.length > 0) {
			hierInfo += "//known direct subclasses: " + meta.aDirectChild.join(",") + "\r\n";
		}

		var head = hierInfo + name +" = function() {\r\n";
		return head + out + "\r\n};\r\n\r\n" ;
	}, 


	/*
	aControls: Array[70]
controls: Array[70]
dependencies: Array[1]
elements: Array[8]
interfaces: Array[1]
name: "sap.m"
sName: "sap.m"
types: Array[29]
	 */
	buildOneLib: function(lib, bControl, bElement, bType) {
		var libs = fd.core.getLoadedLibraries();
		var ret = "";
		// console.log('***' + lib);
		if (lib in libs) {
			var m = libs[ lib];

			//--controls
			if (bControl) {
				var head ="/**** library {0} : controls ({1}) ****/\r\n".sapFormat(lib, m.controls.length);
				ret += head;
				for (var i = 0; i < m.controls.length; i++) {
					var name = m.controls[ i ]; 
					if ( name in fd.model.Metadata._mMeta) {
						// console.log('*control ' + name);
						var meta = fd.model.Metadata._mMeta[name];
						ret += this.buildOneClass(name, meta);
					}
				}
			}

			//--element
			if (bElement) {
				var head ="/**** library {0} : elements ({1}) ****/\r\n".sapFormat(lib, m.elements.length);
				ret += head;
				for (var i = 0; i < m.elements.length; i++) {
					var name = m.elements[ i ]; 
					// console.log('*element ' + name);
					if ( name in fd.model.Metadata._mMeta) {
						var meta = fd.model.Metadata._mMeta[name];
						ret += this.buildOneClass(name, meta);
					}
				}
			}

			//--types
			if (bType) {
				var head ="/**** library {0} : types ****/\r\n".sapFormat(lib);
				ret += head;
				for (var i = 0; i < m.types.length; i++) {
					var name = m.types[ i ]; 
					// console.log('*type ' + name);
					ret += this.buildOneType(name);
				}
			}
		}
		return ret;
	},

	buildFormatInformation: function(meta) {
		this.maxPropLen = this.getMaxLenOfKey( meta.Prop);
		this.maxPropTypeLen = this.getMaxLenOfPropByKey(meta.Prop, "type");
		//then the type and default value
		this.maxPropDftValueLen = 0;
		for (var prop in meta.Prop) {
			var type = meta.Prop[ prop].type;

			var len = this.getDefaultValueLength( meta.Prop[ prop].defaultValue );			
			if (len > this.maxPropDftValueLen)
				this.maxPropDftValueLen = len;
		}

		this.maxAggrLen = this.getMaxLenOfKey( meta.Aggr);
		this.maxAggrTypeLen = this.getMaxLenOfPropByKey( meta.Aggr, "type");
		this.maxAggrSingularNameLen = this.getMaxLenOfPropByKey( meta.Aggr, "singularName");

		this.maxAssoLen = this.getMaxLenOfKey( meta.Asso);
		this.maxAssoTypeLen = this.getMaxLenOfPropByKey( meta.Asso, "type"); 

		this.maxEventLen = this.getMaxLenOfKey( meta.Event);
	},

	getDefaultValueLength: function(value) {
		var str = String(value);
		var len = str.length;
		if ( (typeof value) =="string") 
			len += 2;
		return len;
	},

	//get the max length of the key
	getMaxLenOfKey: function( map ) {
		var len = 0;
		for (var key in map) {
			if ( key.length > len)
				len = key.length;
		}
		return len;
	},

	getMaxLenOfPropByKey: function( map, byKey ) {
		var len = 0;
		for (var key in map) {
			var prop = map[key];
			if ( prop[byKey].length > len)
				len = prop[byKey].length;
		}
		return len;
	},

	init: function() {
		this.clsTemplate = this.buildClassTemplate();
	},

	buildAllLibs: function() {
		for (var i = 0; i < fd.model.ModuleMng._aAllLib.length; i++) {
			var lib = fd.model.ModuleMng._aAllLib[ i ] ; 

			var out = this.buildOneLib(lib);
			var fn = lib +".js";
			fd.util.Export.saveToFile(out, fn);
		}
	},

	/**
	 * 
	 * @param  {[type]} aLib     Lib array
	 * @param  {[type]} bPerLib  true: one lib one file
	 * @param  {[type]} bControl [description]
	 * @param  {[type]} bElement [description]
	 * @param  {[type]} bType    [description]
	 * @return {[type]}          [description]
	 */
	buildLibByName: function(aLib, bPerLib, bControl, bElement, bType) {
		this.aAllType  = [];

		if (bPerLib) {
			for (var i = 0; i < aLib.length; i++) {
				var lib = aLib[i];
				var out = this.buildOneLib(lib, bControl, bElement, bType);
				var fn = lib +".js";
				fd.util.Export.saveToFile(out, fn);
			}
		} else {
			var ret = "";
			for (var i = 0; i < aLib.length; i++) {
				var lib = aLib[ i ] ; 
				var out = this.buildOneLib(lib, bControl, bElement, bType);
				ret += out;
			}
			fd.util.Export.saveToFile(ret, "sapui5_meta.js");
		}
	},

	doTestClass: function(name) {
		var out = this.buildOneClass(name, fd.model.Metadata._mMeta[ name]);
		return out;		
	},

	clsTemplate: null,
	aAllType: [],
};

function  gTest() {
	try {
		var out = fd.model.CodeAssist.buildAllLibs();
	} catch(ex) {
		console.error(ex, ex.stack);
	}
}

function exportOneLib(lib) {
	var out = fd.model.CodeAssist.buildOneLib(lib);
	var fn = lib +".js";
	fd.util.Export.saveToFile(out, fn);
}