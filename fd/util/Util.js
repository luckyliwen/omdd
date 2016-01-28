// Here set some common used shortcut
fd.bus = sap.ui.getCore().getEventBus();
fd.core = sap.ui.getCore();
fd.byId = function(id) {
	return sap.ui.getCore().byId(id);
};

String.prototype.sapFormat = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] !="undefined"
						? args[number]
						: match;
			});
};

String.prototype.sapStartWith = function(str) {
	if (!this)
		console.error("call sapStartwith error");

	if (str.length > this.length)
		return false;

	var left = this.substr(0, str.length);

	return str == left;
};

String.prototype.sapEndWith = function(str) {
	var pos = this.length - str.length;
	if (pos < 0)
		return false;

	var right = this.substr(pos);

	return str == right;
};

/**
 * Get the last part of one string, for sap.m.Button, then it will get Button
 */
String.prototype.sapLastPart = function(sep) {
	if (sep == undefined)
		sep = ".";

	var pos = this.lastIndexOf(sep);
	if (pos == -1)
		return this;
	else {
		return this.substr(pos + 1);
	}
};

/**
 * Check whether it contain the sub string ignore the case
 */
String.prototype.sapContainNoCase = function(sub) {
	var lowCase = this.toLowerCase();

	var pos = lowCase.lastIndexOf(sub);
	return pos !== -1;
};


/**
 * Repeart one string multiple times
 * 
 * @param cnt
 * @returns
 */
String.prototype.sapRepeat = function(cnt) {
	var ret = this;
	for (var i = 1; i < cnt; i++) {
		ret += this;
	}
	return ret;
};


/**
 * Remove one string last part by length or string
 * s = "name.xml.view'
 * s.sapRemoveLast(5)  = name.xml
 * s.sapRemoveLast('view')  = name.xml. 
 * @param lenOrStr
 */
String.prototype.sapRemoveLast = function( lenOrStr) {
	if (typeof lenOrStr =="number") {
		return this.substr(0,   this.length - lenOrStr);
	} else {
		//if not end by it then no remove
		fd.assert( this.sapEndWith(lenOrStr));
		return this.substr(0,   this.length - lenOrStr.length);
	}
};


/**
 * Get the pure name, means if it enclosed in ' or " in both side, then just get the name, if not there then directly return 
 */
String.prototype.sapPureName = function() {
	if (this[0] =="'" || this[0] =='"') {
		//??just ensure it is a pair
		fd.assert( this.slice(-1) =="'" || this.slice(-1) =='"', "Not paired correctly");
		return this.substr(1, this.length-2);
	} else {
		return this;
	}
};

/**
 * Get the pure name, means if it enclosed in ' or " in both side, then just get the name, if not there then directly return 
 */
String.prototype.sapCapital = function() {
	return this[0].toUpperCase() + this.slice(1);
};

/**
 * Remove the corresponding element from the array (which sub-element is a map)
 * by match the key with value For example arr = [ { name:"title"} { name:
 *"text"} ]
 * 
 * then call arr.sapRemove("name","title") arr will be: arr = [ { name:"text"} ] *
 * 
 * @param key
 * @param value
 */
Array.prototype.sapRemove = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		var ele = this[i];
		if (key in ele) {
			if (ele[key] == value) {
				this.splice(i, 1);

				// here still return the original array so can used in chain
				return this;
			}
		}
	}

	return this;
};

/**
 * Push a new entry key=value into the array
 * 
 * @param key
 * @param value
 * @returns {Array}
 */
Array.prototype.sapPush = function(key, value) {
	var m = {};
	m[key] = value;
	this.push(m);
	return this;
};

/**
 * Return an array which equal big array substract the small array
 * 
 * @param arr
 */
Array.prototype.sapDiff = function(subArr) {
	var ret = [];
	this.forEach(function(e) {
				if (subArr.indexOf(e) == -1)
					ret.push(e);
			});
	return ret;
};

/**
 * Check whether two array all content is same
 * @param arr
 */
Array.prototype.sapEqual = function( arr) {
	if ( this.length != arr.length)
		return false;
	
	for ( var i = 0; i < this.length; i++) {
		var ele = this[i];
		if (arr.indexOf(ele) == -1)
			return false;
	}
	return true;
};

/*
 * Get the array from it's children value by key For example: 
 * arr = [ {name: "sap.m.Page"}, {name: "sap.m.Button"}, ] 
 * then arr.sapSubArray() = ["sap.m.Page", "sap.m.Button"]
 */
Array.prototype.sapSubArray = function(key) {
	var ret = [];
	this.forEach(function(obj) {
				ret.push(obj[key]);
			});
	return ret;
};


/*
 * For an object array, get the index of the entry with the defined key->value
 * key:"name",
 * value:"id"  
 * normal case: the prop of xml can't repeat, then when add the prop it will check whether name already existed or not  
 */
Array.prototype.sapIndexOf = function(key, value) {
	for (var i=0; i< this.length; i++ ) {
		var e = this[i];
		if (  key in e) {
			if (e[key] == value)
				return i;
		}
	}
	
	return -1;
};

/*
 * For an object array, get the index of the entry with the 2 defined key->value  key2->value2
 * key:"name",
 * value:"id"  
 * normal case: the prop of xml can't repeat, then when add the prop it will check whether name already existed or not  
 */
Array.prototype.sapIndexOfEx = function(key, value, key2, value2) {
	for (var i=0; i< this.length; i++ ) {
		var e = this[i];
		if (  (key in e) && (key2 in e) ) {
			if ( (e[key] == value) && ( e[key2] == value2))
				return i;
		}
	}
	
	return -1;
};


/*
 * For an object array, check each node whether have the same value by the key, get the total count
 * key:"changed",
 * value:"true"  
 * arr = [
 * 		{ changed: false},
 * 		{changed:  true}
 * ]
 * return:  1
 */
Array.prototype.sapKeyValueCount = function(key, value) {
	var count = 0;
	for (var i=0; i< this.length; i++ ) {
		var e = this[i];
		if (  key in e) {
			if (e[key] == value)
				count ++;
		}
	}
	
	return count;
};


/**
 * Complex means have it's owen property
 */
fd.util.isComplexObject = function(obj) {
	return !fd.util.isEmptyObject(obj); 
};

fd.util.isEmptyObject = function(obj) {
	if (typeof obj =="string")
		return true;
	
	for (var k in obj ) {
		return false;
	}
	return true;
};

fd.util.buildD3Tree_internal = function( tree, map, name) {
	
};

fd.util.isValidId = function( id ) {
    var regexp = /^([A-Za-z_][-A-Za-z0-9_.:]*)$/;
    return regexp.test(id);
};

fd.util.isValidCssClass = function( cssClass ) {
    var regexp = /^([_a-zA-Z]+[_a-zA-Z0-9-]*\s*)+$/;
    return regexp.test(cssClass);
};

fd.util.isValidFunction = function( funcName ) {
    var regexp = /^\.?[a-zA-Z_][\w_\.]*$/;
    return regexp.test(funcName);
};

fd.util.isValidBindingPath = function( path ) {
	var regexp = /([\w_\/>]+\,?)+/;
	return regexp.test(path);	
};

/**
 * map like
 * name like"sap.ui.core.Element"
 */
fd.util.buildD3Tree = function(map, name, parentTree) {
	var tree = parentTree;
	if (tree == undefined)
		tree = {};
		
	
	tree["name"] = name;
	
	if ( typeof map =="object") {
		tree["children"] = [];
	}
	
	var entry;
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				entry = { name: key};
				tree["children"].push( entry);
				break;

			case "object" :
				var node = {};
				tree["children"].push(node);
				fd.util.buildD3Tree(obj, key, node);
				break;
			default :
				break;
		}
	}

	return tree;
};
 

/**
 * Convert a map to an array recursevely
 */
fd.util.map2ArrayDeep = function(map) {
	var arr = [];
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				arr.push(key);
				break;

			case "object" :
				//first add the key, then recursively
				arr.push(key);
				
				//??only Object, no need support Array
				if (obj instanceof Object) {
					//then deeply
					if (fd.util.isComplexObject(obj)) {
						var subArr = fd.util.map2ArrayDeep(obj);
						arr.push(subArr);
					}
				}
				break;
			default :
				break;
		}
	}

	return arr;
};


/**
 * Convert a map to an array
 */
fd.util.map2Array = function(map) {
	var arr = [];
	for (var key in map) {
		var obj = map[key];

		switch (typeof obj) {
			case "string" :
				arr.push(obj);
				break;

			case "object" :
				// most if is array, then push all
				if (obj instanceof Array) {
					obj.forEach(function(e) {
								arr.push(e);
							});
				} 

				break;
			default :
				break;
		}

	}

	return arr;
};


/**
 * Convert  the key from a map to an array
 * @param  {[type]} map [description]
 * @return {[type]}     [description]
 */
fd.util.mapKeyName2Array = function(map) {
	var arr = [];
	for (var key in map) {
		if (map.hasOwnProperty(key))
			arr.push(key);
	}
	return arr;
};

/**
 * From an Enum Object to an array, for example, the type
 * sap.ui.table.SelectionMode is All: "Multi" Multi: "Multi" MultiToggle:
 "Multi" None: "None" Single: "Single" 
 * 	Then the return array like [ {name:
 *"All", value:"Multi"}, {name:"Multi", vlaue:"Multi"} ]
 */

/**
 * addEmpty: flag whether to add the empty ""-->"" value
 */
fd.util.getArrayFromEnumObj = function(type, addEmpty) {
	var obj = eval(type);
	var arr = [];

	// ??first add
	if (addEmpty == undefined)
		addEmpty = true;

	if (addEmpty) {
		arr.push({
					name : "",
					value : ""
				});
	}

	for (var k in obj) {
		var v = obj[k];

		// here use name as the ComoboBox value is named"key"
		arr.push({
					name : k,
					value : v
				});
	}

	return arr;
};


/*fd.util.getArrayFromMapByKey = function(map, key) {
	var ret = [];
	for (var subKey in map) {
		var val = map[key];
		ret.push( val );
	}
	return ret;
};*/

fd.util.getArrayFromArrayByKey = function(arr, key) {
	var ret = [];
	for (var i = 0; i < arr.length; i++) {
		var ele = arr[i];
		ret.push( ele[key]);
	}
	return ret;
};

/*
 * Get longest string length from array
 */
fd.util.getLongestLength = function(arr) {
	var max = 0;
	arr.forEach(function(str) {
				if (str.length > max)
					max = str.length;
			});
	return max;
};

/**
 * Fill the string with filled char until it reach the required length
 */
fd.util.fillString = function(str, len, fill) {
	if (fill == undefined)
		fill = " ";
	fd.assert(fill.length == 1, "Now not support long char as filled");

	var missCnt = len - str.length;
	if (missCnt > 0) {
		var fillStr = fill.sapRepeat(missCnt);

		return str + fillStr;
	} else {
		return str;
	}
};

fd.util.getNodeTypeByName = function(name) {
	// if (name.sapStartWith('sap.'))
	// 	return fd.NodeType.Ui5;
	// else {

		//from the fd.model.MetaMng can know whether is a Control or elemnet
		if ( fd.model.Metadata.isControlOrElement(name)){
			return fd.NodeType.Ui5;
		} else {
			// ??how to know html or agr
			return fd.NodeType.Aggr;
		}
	// }
};

/**
 * Get how many key for an map
 */
fd.util.getKeyCount = function(map) {
	var ret = 0;
	for (var key in map) {
		ret++;
	}
	return ret;

};

/**
 * Get the data binding data index from the table selections
 */
fd.util.getDataIndexFromSelection = function(table) {
	var ret = [];
	var idxs = table.getSelectedIndices();

	idxs.forEach(function(idx) {
				var context = table.getContextByIndex(idx);
				if (context) {
					var path = context.getPath();

					// path like /Prop/0, need get last part
					var num = path.sapLastPart("/");
					ret.push(parseInt(num));
				}
			});

	return ret;
};

// ??as there are several fommatter,so put together
fd.format = {

	/*
	 * In order for user easy get wanted name from the comboBox, the name just
	 * show the last part at the left, then the full part to the right,
	 * otherwise, use need type long name: sap.m. name: long name, such as
	 * sap.m.Button
	 * 
	 * //formated string like Button -- sap.m.Button ColumnListItem --
	 * sap.m.ColumnListItem
	 */
	controlName : function(name, leftLen) {
		if (leftLen == undefined)
			leftLen = 40;

		var left = fd.util.fillStr(name.sapLastPart(), leftLen);
		return left + "-- " + name;
	}
};

/**
 * For example conent = "<xml>\r\n</xml>", name ="xml", then it will like xml ="<xml>" +
 *"\r\n" +"</xml>"
 * 
 * @param content
 * @param name
 */
fd.util.convertStringToJSRunableString = function(name, content) {
	var str = "var " + name + " = ";

	var arr = content.trim().split('\r\n');

	for (var i = 0; i < arr.length; i++) {
		var line = arr[i];

		// if line have the ' then need escape
		if (line.indexOf("'") != -1) {
			line = line.replace(/\'/g, "\\\'");
		}

		str += "\t\t\t'" + line + "'";
		if (i != (arr.length - 1))
			str += "\t+\t'\\r\\n'" + " + \r\n";
		else
			str += ";";
	}

	return str;

};

//??may diff
fd.util.getViewNameFromUrl = function(url) {
	//now may file name or file:///, so need for save
	url = url.replace(/\\/g, "/");
	var fn = url.sapLastPart('/');
	
	var ret;
	//it like
	//name.view.xml
	if (fn.sapEndWith('.view.xml')) {
		ret =  fn.sapRemoveLast('.view.xml');
	} else if (fn.sapEndWith('.view.html')) {
		ret =  fn.sapRemoveLast('.view.html');
	} else {
		ret =  fn;
	} 

	return ret;
};


fd.util.getViewTypeByName =  function(name) {
	var str = name.toLowerCase();
	if (str.sapEndWith('xml')) {
		return fd.ViewType.Xml;
	} else if (str.sapEndWith('html')) {
		return fd.ViewType.Html;
	} else if (str.sapEndWith('js')) {
		return fd.ViewType.Js;
	} else {
		return fd.ViewType.Unknown;
	}
};

/**
 * Return the simple name, so a.view.xml will have a
 */
fd.util.getDisplayViewName =  function(name) {
	var str = name.toLowerCase();

	var arr = [ ".view.xml", ".fragment.xml", ".view.html", ".xml", ".html"];
	for (var i=0; i < arr.length; i++) {
		var  suffix = arr[i];
		
		if ( str.sapEndWith( suffix))
			return name.sapRemoveLast(suffix);
	}
	return name;
};

fd.util.getControllerNameFromUrl = function(url) {
	return url.sapLastPart('/');
};


/**
 *??  
 */
fd.util.convertFileNameToUrl = function(fn) {
	
	//if (! fn.sapStartWith('file:///')) {
	//http://10.58.67.2:8080/htmlview/Calendar.view.html
	//alway stand url
	var pos = fn.indexOf("://");
	if (pos == -1) {	
		//  \ to / first
		return "file:///" + fn.replace(/\\/g, "/");
	} else {
		return fn;
	}
};


/**
 * if one key in json string don't have the"" then add it 
 *   //?? later need check by the : to get the key, now just use replace for simple
 */
fd.util.normalizdKeyForJsonString = function(str, key) {
	
};


/*
	'formatter' :"sap.ca.common.uilib.Formatter.validateImageURL"}
	1:  type="{cfg>/listItemType}"
	2:  icon="{
			path :"cart>PictureUrl",
			formatter:"util.Formatter.pictureUrl"
			}"
	3:  parts: 		
		data-title="{parts:[{path :"AccountDescription"}, {path :"AccountNumber"}], formatter :"sap.ca.common.uilib.Formatter.commonIDFormatter"}">
		
	4:	data-text="{
                    parts:['/detailsNode/Variance','/detailsNode/VariancePercentage','/detailsNode/Total'],
                    formatter:'.formatVariance'
*/


fd.util.test_parseBindingInfor = function() {
	var arr = [
	        "abc",   
	        "{cfg>/listItemType}", 
	        "{path :'cart>PictureUrl', formatter:'util.Formatter.pictureUrl'}", 
	        "{parts:[{path :'AccountDescription'}, {path :'AccountNumber'}], formatter :'sap.ca.common.uilib.Formatter.commonIDFormatter'}", 
	       
	        "{ parts:['/detailsNode/Variance','/detailsNode/VariancePercentage','/detailsNode/Total'], formatter:'.formatVariance'}"
	];
	
	for ( var i = 0; i < arr.length; i++) {
		var str = arr[i];
		
		var obj = fd.util.parseBindingInfor(str);
		
		//console.error( str, "==>", obj);
	}
};




/**
 * Stringify a json object to ui5 binding style string,  
  s = {a:"a",  b:"b"}
	JSON.stringify(s) =  "{"a":"a","b":"b"}"

 */
fd.util.jsonStringify = function(obj) {
	//easy way first do JSON.stringify, then use regexp to change
	var str = JSON.stringify(obj);
	
	
	var normal = str.replace(/\"(\w+)\":/mg, function(match, number) {
		//now match contain the word, space and : 
		var word = match.trim();
		//remove the last :
		
		return   word.substr(1, word.length-3) +":";
	});
	
	//then " change to '
	normal = normal.replace(/\"/g, "'");
	return normal;
};

/*
s = "{  path:'tea>receipt_amount',   type:'sap.ui.model.type.Float',formatOptions:{groupingEnabled:true}}" ;
n = s.replace(/(\w+)(\s*):/mg, function(match, number) {
				//now match contain the word, space and : 
				var word = match.trim();
				//remove the last :
			
				return '"' + word.substr(0, word.length-1) + '" : ';
			});
n = n.replace( /\'/g, '"');			
var obj = JSON.parse(n);
*/

/**
 * "{        path :"cart>PictureUrl"
 * str like {  path:'tea>receipt_amount',   type:'sap.ui.model.type.Float',formatOptions:{groupingEnabled:true}},
 * return: json object
 */
fd.util.parseComplexObjectFromString = function(str) {
	
	var normal = str.replace(/(\w+)(\s*):/mg, function(match, number) {
		
		//now match contain the word, space and : 
		var word = match.trim();
		
		//first remove the extra space if any
		word = word.replace( /\s/g, "");
		
		//console.error('word is <' + word +">");
		return '"' + word.substr(0, word.length-1) + '" : ';
	});
	
	//
	normal = normal.replace( /\'/g, '"');			
	
	var o = null;
	try {
		//obj = JSON.parse(normal);
		o = $.parseJSON(normal);
	} catch (ex) {
		fd.assert("Normal string error", "reason " + ex +" str is " + str );
		//return null;
	}
	
	//console.error("Obj is ", o);
	return o;
};

/**
 * From the complex string get the binding information, 
 * @return:  one map,  
 */
fd.util.parseBindingInfor = function(str) {
	//if don't have {} then is the pure string
	var m = {value: "", paths: "", formatter:"", tooComplex: false, extraStr: ""};
	if (str == undefined)
		return m;
	
	var startPos = str.indexOf('{');
	var endPos = str.lastIndexOf('}');
	
	if ( startPos == -1 &&  endPos == -1) {
		//pure value
		m.value = str;
		return m;
	} 
	
	//If like footerText="{ path :"cart>/totalPrice", 	formatter :"util.Formatter.totalPrice" } EUR"   then just set the flag no need parse it
	if ( (startPos != 0)  || (endPos != (str.length -1)) ) {
		m.value = str;
		m.tooComplex = true;
		return m;
	}
	
	
	//2: pure path, without the formatter
	var pathPos = str.indexOf('path');
	var formatterPos = str.indexOf('formatter');
	if ( pathPos == -1 && formatterPos == -1) {
		//remove the {
		str = str.substr(1);
		m.paths = str.sapRemoveLast(1);
		
		//even without the path, formatter, it still may have multiple {}, 
		//just like {/currencySymbol} {dpt_i18n>SPENT_TEXT}
		//??later need check good way, now just use string replace 
		if ( m.paths.indexOf('}') != -1) {
			m.paths = m.paths.replace( /\}/g,  "");
			m.paths = m.paths.replace( /\{/g,  ",");
			m.paths = m.paths.replace( /\s/g,  "");
		}
		
		return m;
	}
	
	var obj = fd.util.parseComplexObjectFromString(str);
	
	if (obj == null) {
		m.value = str;
		m.tooComplex = true;
		return m;
	}
	
	//Also there are other options, so need one unify way to do so
	/*
	//not care the parts, path or formater, just normalize it then get the parsed value
	//as some pay 
	str = str.replace( /path/g,  "'path'");
	str = str.replace( /formatter/g,  "'formatter'");
	str = str.replace( /parts/g,  "'parts'");
	
	//as now JSON.parse only know ", so need change all ' to ""
	str = str.replace( /'/g, '"');
	*/
		
		if ('formatter' in obj ) {
			m.formatter = obj.formatter;
			delete obj.formatter;
		}
		
		//have parts, then must no path
		if ("parts" in obj) {
			var arr = [];
			var parts = obj.parts;
			fd.assert( parts instanceof Array);
			
			for ( var i = 0; i < parts.length; i++) {
				var entry = parts[i];
				//may be pure string or {"path"}
				
				if (typeof entry =="string") {
					arr.push( entry);
				} else if (typeof entry =="object") {
					//then the path must in it
					
					if ("path" in entry) {
						arr.push( entry.path);
					} else {
						fd.assert( false, "meet parts one object, but path not there, obj is " + obj +" whole str is " + str);	
					}
				}
			}
			m.paths = arr.join(',');
			
			delete obj.parts;
			
		} else {
			//only path
			if ("path" in obj) {
				m.paths  = obj.path;
				
				delete obj.path;
			} else {
				fd.assert( false, "NO parts but also no path, obj is " + obj +" whole str is " + str);	
			}
		}
		
		//still may remain some, just have the extraStr and extraObj, so later easy handle
		var cnt = fd.util.getKeyCount(obj);
		if (cnt) {
			//m.extraObj = obj;
			m.extraStr = fd.util.jsonStringify(obj);
			//also remove the {}
			m.extraStr = m.extraStr.substr(  1, m.extraStr.length-2);
		}
		
	
	return m;
};

/**
 * return like {name: pure name, index: -1 means no index, other the index
 */
fd.util.splitComplexName = function(name) {
	var entry = {name:"", index: -1};
	var pos = name.indexOf('['); 
	if ( pos == -1) {
		entry.name = name;
	} else {
		entry.name = name.substr(0, pos);
		
		var num = name.substr(pos +1);
		//?? not not support too complex
		num = num.substr(0, num.length-1);
		entry.index  = parseInt(num);
	}
	return entry;
};

//just from the top most check one by one, if not there then add it
fd.util.addJsonValueSafely = function(map, path, value) {
	var arr = path.split('/');
	var obj = map;
	for ( var i = 0; i < arr.length; i++) {
		var name = arr[i];
		
		if (name =="")
			continue;
		
		//the last, directly add, otherwise just loop
		if (i == arr.length-1) {
			//??last name like name[0] also
			
			var mNameIdx = fd.util.splitComplexName(name);
			
			if ( mNameIdx.index == -1) {
				obj [name] = value;
			} else {
				//like name[1], so maybe existed already, like first name[0], then name[1]
				if (  name in obj) {
					//if there just overwirte, other just push
					if (obj[name].length > mNameIdx.index) {
						obj[name][ mNameIdx.index] = value;
					}  else {
						obj[name].push(value);
					}
				} else {
					//??
					obj[name].push( value);	
				}
			}
		} else {
			//need check whether the name like table[0], if so then need split into two part
		   mNameIdx = fd.util.splitComplexName(name);
			
			if ( mNameIdx.index == -1) {
				//just name
				if (name in obj) {
					obj = obj[name];
				} else {
					obj[name] = {};
					obj = obj[name];
				}
			} else {
				//like name[0]
				if (mNameIdx.name in obj) {
					obj = obj[mNameIdx.name];
					
					//the index may not there, 
					if ( obj.length> mNameIdx.index) {
						obj  = obj [ mNameIdx.index ];	
					} else {
						//??sub still array, too comple now
						while(true) {
							obj.push( {});
							if ( obj.length> mNameIdx.index) {
								obj  = obj [ mNameIdx.index ];
								break;
							}
						}
					}
				} else {
					obj[mNameIdx.name] = [];
					obj[mNameIdx.name].push( {});
					
					obj = obj[mNameIdx.name];
					obj  = obj [ mNameIdx.index ];
				}
			}
		}
	}
	
};


fd.util.jsonPrettyStringify = function(json, indent) {
	var str = JSON.stringify(json, undefined, 4);
	var arr = str.split("\n");
	var sep = "\r\n" + indent;
	return indent + arr.join(sep);
};


/**
 * 
 */
fd.util.getTreeNodeSubNode = function( treeNode, subNodeName) {
	var nodes = treeNode.getNodes();
	for ( var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		if (node.getText() == subNodeName)
			return node;
	}
	
	return null;
};


/**
 * 
 */
fd.util.getTreeNodeChildNames = function( node) {
	fd.assert( node, "[fd.util.getTreeNodeChildNames] node is null");
	var arr = [];
	var nodes = node.getNodes();
	
	//first get all direct child,  
	for ( var i = 0; i < nodes.length; i++) {
		var subNode = nodes[i];
		arr.push(subNode.getText()); 
	}
	
	//then iterate the child
	for ( i = 0; i < nodes.length; i++) {
		subNode = nodes[i];
		var subArr = fd.util.getTreeNodeChildNames(subNode);

		subArr.forEach( function(name) {
			arr.push(name);
		});
	}
	
	return arr;
};

fd.util.getTreeNodeDirectChildNames = function( node) {
	var arr = [];
	var nodes = node.getNodes();
	
	//first get all direct child,  
	for ( var i = 0; i < nodes.length; i++) {
		var subNode = nodes[i];
		arr.push(subNode.getText()); 
	}
	
	return arr;
};


fd.util.createAPIHyperLink = function(cls) {
	var url = fd.cfg.getDocumentBaseUrl();
	url += "#docs/api/symbols/" + cls + ".html";
	
	var html = '<a target="_blank" href="{0}">{1}</a>';
	
	return html.sapFormat(url, cls);
};

fd.util.setFirstItemForList = function( list ) {
    var items = list.getItems();
    if ( items.length) {
    	list.setSelectedItemId( items[0].getId());
    }
};

/**
 * some useful function for the tree selection
 * @type {Object}
 */
fd.util.tree = {
	bFirstTimeWarning : true, 
	getSelectionNodes: function( tree ) {
	    if ( tree.mSelectedNodes) {
	    	var ret = [];
	    	for (var key in tree.mSelectedNodes) {
	    		var val = tree.mSelectedNodes[key];
	    		ret.push(val);
	    	}
	    	return ret;
	    } else {
	    	//then just use the old 
	    	if (this.bFirstTimeWarning) {
	    		fd.uilib.Message.warning("Sorry, your SAPUI5 version is too old to support Tree multiple selection!");
	    		this.bFirstTimeWarning = true;
	    	}
	    	return [ tree.getSelection() ];
	    }
	},
	
};


fd.util.formatHintToHtml = function(str) {
	var index = 0;
	var ret = str.replace(/([\"])/g, function(match, number) {
		index++;
		if ( index % 2)
			return  "<span class='FDSyntaxHint'>";
		else 
			return "</span>";
	});
	return "<div>" + ret + "</div>";
};


fd.util.checkAsciiCode  = function(content) {
	var bValidAscii = true;
	for (var idx =0; idx <content.length; idx++) {
		if ( content.charCodeAt(idx) >=128) {
			bValidAscii = false;
			break;
		}
	}
	if (!bValidAscii) {
		fd.uilib.Message.showErrors("Your file have the none-asciii code, please fixed it as it will cause error for Notes");
	}
	return bValidAscii;
};



/***** SAVE TO TEXT FILE help functions******************/
/****doesn't work in IE and safai*****/
var saveAs = saveAs||(function(h){"use strict";var r=h.document,l=function(){return h.URL||h.webkitURL||h;},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);return t.dispatchEvent(s);},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s;},0);},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s);}else{s.remove();}}b.length=0;},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t);}catch(u){m(u);}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F;},A=function(){q(v,"writestart progress write writeend".split(" "));},D=function(){if(E||!x){x=s(t);}w.location.href=x;v.readyState=v.DONE;A();},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments);}};},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download";}if(g){x=s(t);n.href=x;n.download=u;if(j(n)){v.readyState=v.DONE;A();return;}}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true;}if(o&&u!=="download"){u+=".download";}if(B===c||o){w=h;}else{w=h.open();}if(!p){D();return;}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K);};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D();}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K];});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE;};v.readyState=v.WRITING;}),D);}),D);};G.getFile(u,{create:false},z(function(I){I.remove();H();}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H();}else{D();}}));}),D);}),D);},d=f.prototype,a=function(s,t){return new f(s,t);};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort");};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a;}(self));

//for IE
var saveInIE = function(data, fileName) {
	if (document.execCommand) {
        var oWin = window.open("about:blank", "_blank");
        oWin.document.write(data);
        oWin.document.close();
        var success = oWin.document.execCommand('SaveAs', true, fileName);
        oWin.close();
        if (!success)
            alert("Sorry, your browser does not support this feature");
    } else {
    	alert("Sorry, your browser does not support save as command");
    }
};

//for Safari, the problem is fileName doesn't work
var saveInSafari = function(data, fileName) {
	//text/plain
	//application/octet-stream
	var uriContent = "data:application/octet-stream;filename=" + fileName + "," + encodeURIComponent(data);
	window.open(uriContent, fileName);
	//alert(newWindow);
};

/*! @source https://github.com/eligrey/Blob.js */
var BlobBuilder=BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||(function(j){"use strict";var c=function(v){return Object.prototype.toString.call(v).match(/^\[object\s(.*)\]$/)[1];},u=function(){this.data=[];},t=function(x,v,w){this.data=x;this.size=x.length;this.type=v;this.encoding=w;},k=u.prototype,s=t.prototype,n=j.FileReaderSync,a=function(v){this.code=this[this.name=v];},l=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),r=l.length,o=j.URL||j.webkitURL||j,p=o.createObjectURL,b=o.revokeObjectURL,e=o,i=j.btoa,f=j.atob,m=false,h=function(v){m=!v;},d=j.ArrayBuffer,g=j.Uint8Array;u.fake=s.fake=true;while(r--){a.prototype[l[r]]=r+1;}try{if(g){h.apply(0,new g(1));}}catch(q){}if(!o.createObjectURL){e=j.URL={};}e.createObjectURL=function(w){var x=w.type,v;if(x===null){x="application/octet-stream";}if(w instanceof t){v="data:"+x;if(w.encoding==="base64"){return v+";base64,"+w.data;}else{if(w.encoding==="URI"){return v+","+decodeURIComponent(w.data);}}if(i){return v+";base64,"+i(w.data);}else{return v+","+encodeURIComponent(w.data);}}else{if(real_create_object_url){return real_create_object_url.call(o,w);}}};e.revokeObjectURL=function(v){if(v.substring(0,5)!=="data:"&&real_revoke_object_url){real_revoke_object_url.call(o,v);}};k.append=function(z){var B=this.data;if(g&&z instanceof d){if(m){B.push(String.fromCharCode.apply(String,new g(z)));}else{var A="",w=new g(z),x=0,y=w.length;for(;x<y;x++){A+=String.fromCharCode(w[x]);}}}else{if(c(z)==="Blob"||c(z)==="File"){if(n){var v=new n;B.push(v.readAsBinaryString(z));}else{throw new a("NOT_READABLE_ERR");}}else{if(z instanceof t){if(z.encoding==="base64"&&f){B.push(f(z.data));}else{if(z.encoding==="URI"){B.push(decodeURIComponent(z.data));}else{if(z.encoding==="raw"){B.push(z.data);}}}}else{if(typeof z!=="string"){z+="";}B.push(unescape(encodeURIComponent(z)));}}}};k.getBlob=function(v){if(!arguments.length){v=null;}return new t(this.data.join(""),v,"raw");};k.toString=function(){return"[object BlobBuilder]";};s.slice=function(y,v,x){var w=arguments.length;if(w<3){x=null;}return new t(this.data.slice(y,w>1?v:this.data.length),x,this.encoding);};s.toString=function(){return"[object Blob]";};return u;}(self));

fd.util.saveTable2CSV = function(table, indent, csvFileName) {
	var vIndent = indent || "    ";
	var targetTable = table;
	//build text
	var csv = "";
	var fileName = csvFileName ? csvFileName : targetTable.getId() + ".csv";
	
	var bindingPath = targetTable.mBindingInfos.rows.path;
	if(bindingPath == null || bindingPath == "") {
		//do nothing without binding path
		return;
	}
	
	//get table data from model using binding path
	var tableData = targetTable.getModel().getData();
	$.each(bindingPath.split("/"), function(i, path) {
		//ignore empty string, split will return empty string if the Regx is the first or last char
		if(path != "") {
			tableData = tableData[path];
		}
	});
	
	
	//check columns from table
	var colBindingInfo = [];
	$.each(targetTable.getColumns(), function(i, col) {
		var bindingInfo = {};
		//only handle TextView
		bindingInfo.label = col.getLabel() instanceof sap.ui.commons.Label ? col.getLabel().getText() : col.getLabel().toString();
		var template = col.getTemplate();
		
		
		if(template instanceof sap.ui.commons.TextView ){
			//Normal TextView
			bindingInfo.path = template.mBindingInfos.text.parts[0].path;
			bindingInfo.formatter = template.mBindingInfos.text.formatter;
			bindingInfo.context = template;
			
		} /*else if (template instanceof rs.uilib.AttachmentNumber  || template instanceof rs.uilib.NoteNumber) {
			//For the NoteNumber and AttachmentNumber also need support
			bindingInfo.path = template.mBindingInfos.count.path;
			bindingInfo.formatter = template.mBindingInfos.count.formatter;
			bindingInfo.context = template;
			
		} */ else if(typeof template.getContent == "function") {
			//assume this is an container controller, like layout, then try to call getContent() to handle the first TextView
			var subControls = template.getContent();
			for(var j = 0; j < subControls.length; j++) {
				if(subControls[j] instanceof sap.ui.commons.TextView ) {
					bindingInfo.path = subControls[j].mBindingInfos.text.path;
					bindingInfo.formatter = subControls[j].mBindingInfos.text.formatter;
					bindingInfo.context = subControls[j];
					break;
				}
			}
		} else {
			//can't handle now
		}
		
		colBindingInfo[i] = bindingInfo;
	});
	
	//record column label
	for(var i = 0; i < colBindingInfo.length; i++) {
		var bf = colBindingInfo[i];
		if(i != 0) {
			//append an comma if this is not the first column
			csv += ","; 
		}
		csv += bf.label;
	}
	csv += "\n";
	
	/**
	 * Get the correct value by path: if the path is "" then it means the data object itself, otherwise use the path as key
	 */
	function getValueByPath(data, path) {
		if (path == "")
			return data;
		else {
			return data[path];
		}
	}

	function getRowOneByOne(aData) {
		for (var i=0; i < aData.length; i++) {
			var  data = aData[i];

			for(var idx = 0; idx < colBindingInfo.length; idx++) {
				var bf = colBindingInfo[idx];
				if(bf.formatter == null) {
					value = getValueByPath(data, bf.path);
					//here need use the === to check with "", otherwise the correct value 0 will == ""
					csv += ( value == null || value === "") ? "NA" : value;
				} else {
					//use context to call the formatter
					value = getValueByPath(data, bf.path);
					var raw_v = bf.formatter.call(bf.context, value);
					csv += (raw_v == null || raw_v === "") ?  "NA" : raw_v;
				}
				if (idx !== colBindingInfo.length-1) {
					csv += ",";
				}
			}

			csv += "\n";
		}
	}
	
	//scan tableData and get corresponding value
	function scanValue(level, data) {
		//for level 0 row, still try to save it's properties, this may result in a empty line in scv.
		//if need to skip level 0 row, it depends, can support this on demand.
		
		//start in a new line
		csv += "\n";
		
		//retrieve values according to column binding info
		for(var i = 0; i < colBindingInfo.length; i++) {
			var bf = colBindingInfo[i];
			if(i == 0) {
				//column value will be put in a pair of quotes
				csv += "\""; 
				//put preceeding space to indicate level
				for(var k = 0; k < level; k++) {csv += vIndent;}
			} else {
				//append an comma if this is not the first column
				csv += ",\""; 
			}
			var value;
			if(bf.formatter == null) {
				value = getValueByPath(data, bf.path);
				//here need use the === to check with "", otherwise the correct value 0 will == ""
				csv += ( value == null || value === "") ? "NA" : value;
			} else {
				//use context to call the formatter
				value = getValueByPath(data, bf.path);
				var raw_v = bf.formatter.call(bf.context, value);
				csv += (raw_v == null || raw_v === "") ?  "NA" : raw_v;
			}
			csv += "\"";
		}
		
		//handle sub rows
		for(var key in data) {
			//consider objects as sub rows
			//currently, doesn't handle the sequence according to key, IE, if key is numberic, then should sort by it. 
			//Will support it on demand
			if((typeof data[key]) == "object") {
				scanValue(level + 1, data[key]);
			}
		}
		
	}
	
	//scanValue(1, tableData);
	getRowOneByOne(tableData);

	if($.browser.msie) {
		saveInIE(csv, fileName+".csv");
	} else if($.browser.safari) {
		//there is a length limitation in URL
		saveInSafari(csv, fileName+".csv");
	} else {
		//try to save to text file
		var bb = new BlobBuilder();
		bb.append(csv);
		saveAs(bb.getBlob("text/plain;charset=utf-8"), fileName + ".csv");
	}
	
};

/**
 * when create the normal element/control, order is no important, but for some case it must first  set some property,
 * then the remain propery can call this way to set on batch
 * @param  {[type]} element [description]
 * @param  {[type]} mProp   [description]
 * @return {[type]}         [description]
 */
fd.util.setPropMapToElement = function( element, mProp ) {
    for (var key in mProp) {
    	var val = mProp[key];
    	var func = "set" + key.sapCapital();
    	element[func].call(element, val);
    }
};
 