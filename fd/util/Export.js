/**
 * One small export unit, like the xml/html node
 * @param name
 * @param ns
 * @param indentLevelOrStr: support number or real string
 * @returns {fd.ExportUnit}
 */
fd.ExportUnit = function(name, ns, indentLevelOrStr) {
	this.name = name;
	this.ns = ns;
	
	if (ns!="")
		this.longName = ns + ":" + name;
	else 
		this.longName = name;  //means the defualt ns
	
	this.aProp = [];
	
	//eay used later
	this.indentStr = "";
	if (typeof indentLevelOrStr == 'number') {
		if (indentLevelOrStr>0) {
			this.indentStr = fd.cfg.getIndent().sapRepeat( indentLevelOrStr);  
		}
	} else {
		this.indentStr = indentLevelOrStr;  
	}
};

fd.ExportUnit.prototype = {
	
	escapeValue: function(value) {
		//?now just change the " to &quot;
		if ( value == null || value == undefined) {
			console.error("not init the prop value");
		}
		//it may be not a string: true
		if ( typeof value =="string") {
			//Some case user may write the " , so nee first conver it to '
			
			value = value.replace(/\"/g, "'");
			
			//??now the attribute can't appear the &
			value = value.replace(/\&/g, "&amp;");
			value = value.replace(/\</g, "&lt;");
			//for the >, no no need convert as it is used so often, if convert then will make user confused
			//value = value.replace(/\>/g,"&gt;");
			
			/*"   &quot;
			'   &apos;
			<   &lt;
			>   &gt;
			&   &amp;
			*/
			
			return value;
		} else {
			return value;
		}
	},
	
	addProp : function(name, value) {
		//the value need escape if have "
		var escapedValue = this.escapeValue(value);
		//this.aProp.push( { name: name, value: escapedValue});
		var entry = {};
		entry[name] = escapedValue;
		this.aProp.push( entry);
	},

	addPropMap: function( mProp ) {
	    for (var key in mProp) {
	    	var val = mProp[key];
	    	this.addProp(key, val);
	    }
	},
	
	
	/**
	 * Add prop by an array, arr like [ {title:"my tile"} ]
	 * @param arr
	 */
	addPropArray: function( arr) {
		for ( var i = 0; i < arr.length; i++) {
			var m = arr[i];
			
			//only one key now, can support multiple also
			for ( var name in m) {
				var val = m[name];
			
				this.addProp(name, val);
			}
		}
	},
	
	
	getStartPart: function() {
		//??now only support the long mode as it is simple
		var str= this.indentStr + "<" +  this.longName;
		
		var attrIndent = this.indentStr + fd.cfg.getIndent();
		for ( var i = 0; i < this.aProp.length; i++) {
			var mProp = this.aProp[i];
			
			for ( var key in mProp) {
				var val = mProp[key];
				str += fd.crlf +  attrIndent + key + "=\"" + val + "\"";	
			}
			
		}
		
		str +=">";
		
		return str;
	},
	
	getEndPart: function() {
		var str=  this.indentStr + "</" +  this.longName + ">";
		return str;
	},
	
	/*export: function() {
		var start = this.getStartPart();
		var end = this.getEndPart();
	},*/
};

/**
 * 
 */

var saveAs =  saveAs||(function(h){"use strict";var r=h.document,l=function(){return h.URL||h.webkitURL||h;},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);return t.dispatchEvent(s);},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s;},0);},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s);}else{s.remove();}}b.length=0;},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t);}catch(u){m(u);}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F;},A=function(){q(v,"writestart progress write writeend".split(" "));},D=function(){if(E||!x){x=s(t);}w.location.href=x;v.readyState=v.DONE;A();},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments);}};},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download";}if(g){x=s(t);n.href=x;n.download=u;if(j(n)){v.readyState=v.DONE;A();return;}}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true;}if(o&&u!=="download"){u+=".download";}if(B===c||o){w=h;}else{w=h.open();}if(!p){D();return;}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K);};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D();}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K];});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE;};v.readyState=v.WRITING;}),D);}),D);};G.getFile(u,{create:false},z(function(I){I.remove();H();}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H();}else{D();}}));}),D);}),D);},d=f.prototype,a=function(s,t){return new f(s,t);};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort");};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a;}(self));
var BlobBuilder=BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||(function(j){"use strict";var c=function(v){return Object.prototype.toString.call(v).match(/^\[object\s(.*)\]$/)[1];},u=function(){this.data=[];},t=function(x,v,w){this.data=x;this.size=x.length;this.type=v;this.encoding=w;},k=u.prototype,s=t.prototype,n=j.FileReaderSync,a=function(v){this.code=this[this.name=v];},l=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),r=l.length,o=j.URL||j.webkitURL||j,p=o.createObjectURL,b=o.revokeObjectURL,e=o,i=j.btoa,f=j.atob,m=false,h=function(v){m=!v;},d=j.ArrayBuffer,g=j.Uint8Array;u.fake=s.fake=true;while(r--){a.prototype[l[r]]=r+1;}try{if(g){h.apply(0,new g(1));}}catch(q){}if(!o.createObjectURL){e=j.URL={};}e.createObjectURL=function(w){var x=w.type,v;if(x===null){x="application/octet-stream";}if(w instanceof t){v="data:"+x;if(w.encoding==="base64"){return v+";base64,"+w.data;}else{if(w.encoding==="URI"){return v+","+decodeURIComponent(w.data);}}if(i){return v+";base64,"+i(w.data);}else{return v+","+encodeURIComponent(w.data);}}else{if(real_create_object_url){return real_create_object_url.call(o,w);}}};e.revokeObjectURL=function(v){if(v.substring(0,5)!=="data:"&&real_revoke_object_url){real_revoke_object_url.call(o,v);}};k.append=function(z){var B=this.data;if(g&&z instanceof d){if(m){B.push(String.fromCharCode.apply(String,new g(z)));}else{var A="",w=new g(z),x=0,y=w.length;for(;x<y;x++){A+=String.fromCharCode(w[x]);}}}else{if(c(z)==="Blob"||c(z)==="File"){if(n){var v=new n;B.push(v.readAsBinaryString(z));}else{throw new a("NOT_READABLE_ERR");}}else{if(z instanceof t){if(z.encoding==="base64"&&f){B.push(f(z.data));}else{if(z.encoding==="URI"){B.push(decodeURIComponent(z.data));}else{if(z.encoding==="raw"){B.push(z.data);}}}}else{if(typeof z!=="string"){z+="";}B.push(unescape(encodeURIComponent(z)));}}}};k.getBlob=function(v){if(!arguments.length){v=null;}return new t(this.data.join(""),v,"raw");};k.toString=function(){return"[object BlobBuilder]";};s.slice=function(y,v,x){var w=arguments.length;if(w<3){x=null;}return new t(this.data.slice(y,w>1?v:this.data.length),x,this.encoding);};s.toString=function(){return"[object Blob]";};return u;}(self));

fd.util.Export = {
		
	saveToFile : function(str, fileName) {
			bb = new BlobBuilder();
			bb.append(str);
			saveAs(bb.getBlob("text/plain;charset=utf-8"),  fileName);
		},
	
	//used for the Metadata create view, here the logic is similar as the createXml, but more simple	
	createXmlFromControlInfo: function( controlInfo ) {
		this.prepareForExport();

	    //top is view or fragment, first get the sub node as now don't know which ns need add 
	    var aSubConent = [];
	    var aggr = controlInfo.getAggregationMap();
	    //for the top most, no aggr name
	    //
	    for (var key in aggr) {
	    	var topCtrlInfo = aggr[key];
	    	aSubConent.push( this.createXmlFromControlInfo_NoneRoot_Array( topCtrlInfo, "\t"));
	    }
	  

	    //then the top view for fragment + nodes + end part
	    var topName = controlInfo.getName();
	    var pureTopName = topName.sapLastPart(".");
	    var topPrefix = this.getNsByControlName( topName);

	    var topExportUnit = new fd.ExportUnit(pureTopName, topPrefix,"");
	    topExportUnit.addPropMap( controlInfo.getPropertyMap());  //like the controllerName

	    //add the needed ns 
	    for ( var prefix in this._mPrefixCnt) {
			var ns = "xmlns";
			var nsStr = this._mPrefixMap[prefix];
			if ( nsStr) {
				//for others will like xmlns:m
				ns = ns + ":" + nsStr;
			}
			topExportUnit.addProp( ns, prefix);
		}

		var topStartPart = topExportUnit.getStartPart();
		var topEndPart = fd.crlf + topExportUnit.getEndPart();

		return topStartPart + aSubConent.join(fd.crlf) +  topEndPart;
	},

	//just for one Control
	createXmlFromControlInfo_NoneRoot_One: function( ctrlInfo , indent)  {
    	var ctrlName = ctrlInfo.getName();
    	var prefix = this.getNsByControlName( ctrlName);
    	var pureName = ctrlName.sapLastPart(".");

    	var exportUnit = new fd.ExportUnit(pureName, prefix, indent);
    	exportUnit.addPropMap( ctrlInfo.getPropertyMap());

    	//the sub nodes , key is the aggr name
    	//
    	var aSubConent = [];
	    var subSubIndent = indent + "\t\t";
	    var aggrIndent = indent+"\t";

    	var aggr = ctrlInfo.getAggregationMap();
    	for (var aggrName in aggr) {
    		var detailChildren = aggr[aggrName];

			var subContent = this.createXmlFromControlInfo_NoneRoot_Array(detailChildren, subSubIndent);
			//then need add the aggr like <items>  </item>
			var aggrNs = "";
			if (prefix!= "") {
				aggrNs = prefix + ":";
			}
			var startAggr = "{0}<{1}{2}>".sapFormat(aggrIndent, aggrNs, aggrName);
			var endAggr = "{0}</{1}{2}>".sapFormat(aggrIndent, aggrNs, aggrName);

			aSubConent.push(
				fd.crlf + startAggr + subContent + fd.crlf + endAggr
				);
    	}
   
   		//result part
    	var startPart = fd.crlf + exportUnit.getStartPart();
    	var endPart = fd.crlf +exportUnit.getEndPart();

    	return startPart  + aSubConent.join(fd.crlf) + endPart;    	
	},

	createXmlFromControlInfo_NoneRoot_Array: function( ctrlInfo , indent)  {
		if ( !jQuery.isArray( ctrlInfo)) {
			return this.createXmlFromControlInfo_NoneRoot_One(ctrlInfo,indent);
		} 

		//for array, need one by one 
		var aContent = [];
		for (var i=0; i < ctrlInfo.length; i++) {
			aContent.push( 
					this.createXmlFromControlInfo_NoneRoot_One(ctrlInfo[i], indent)
				);
		}
		return aContent.join(fd.crlf);
	},
	
	/**
	 * 
	 * @param type
	 * @param treeNode
	 * 
	 * @return  the string of that node
	 */	
	exportView: function(type, topNode, level, mCfg) {
		//??move other
		this.prepareForExport();
		
		var result = "";

		//As we don't know how many xmlns it needed, so put the root start part at the last
			
		var nodes = topNode.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
		
			//nest the indent
			result += fd.crlf + this.exportView_NoneRoot(type, node, level+1, mCfg);
		}
	
		var startPart = this.getStartPart(type, topNode, level, mCfg);
	
		//first add the start part
		result = startPart + fd.crlf + result; 
		
		//and add the end part
		result += fd.crlf + this.getEndPart(type, topNode, level);
		
		return result;
	},
	
	
	//
	exportView_NoneRoot: function(type, topNode, level, mCfg) {
		if ( mCfg && mCfg.preview && topNode.isUi5FragmentNode()) {
			//!!later need add prompt to user 
			var fragmentName = topNode.getFragmentName();
			if (fragmentName) {
				var pureFragmentName = fragmentName.sapLastPart();

				var fragmentTreeNode = fd.getMainController().getTopTreeNodeByViewName(pureFragmentName);
				if (fragmentTreeNode) {
					//then just get it top children
					var topSubNodes = fragmentTreeNode.getNodes(); 
					var repaceResult = "";

					for ( var idx = 0; idx < topSubNodes.length; idx ++) {
						var subNode = topSubNodes[idx];
						//nest the indent
						repaceResult += this.exportView_NoneRoot(type, subNode, level, mCfg);
					}
					return repaceResult;
				} else {
					return "";
				}
			} else {
				//no fragment name, just use empty
				return "";
			}
		}

		//---normal flow 
		var result = "";
		var startPart = this.getStartPart(type, topNode, level, mCfg);
		//As we don't know how many xmlns it needed, so put the root start part at the last
		
		result += startPart;
		
		var nodes = topNode.getNodes();
		for ( var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			
			//for one class if can't found class then jus use placeholder replace it
			if ( mCfg) {
				if ( node.isUi5Node() && ! node.getFoundClass() ) {
					//just create a placeholder for it
					node = node.createFastModePlaceHolder();
					
					//??later decide when need create treeNode also
				}
			} 
			
			//nest the indent
			result += fd.crlf + this.exportView_NoneRoot(type, node, level+1, mCfg);
		}
		
		//and add the end part
		result += fd.crlf + this.getEndPart(type, topNode, level);
		
		return result;
	},
	
	/*
	<core:View controllerName="view.name" xmlns:core="sap.ui.core"
		xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.commons" xmlns:table="sap.ui.table"
			xmlns:html="http://www.w3.org/1999/xhtml">*/

	getStartPartForRoot: function(type, treeNode, level, mCfg) {
		//means the xmlns="sap.ui.commons"
		//'default': 	'sap.ui.commons',
		var nsCore = this.getNsCore();
		
		//save for later use
		treeNode.setXmlNodeNs(nsCore);
		if (treeNode.isFragment()) {
			treeNode.setXmlNodeName("FragmentDefinition");	
		} else {
			treeNode.setXmlNodeName("View");
		}
		
		var unit = new fd.ExportUnit( treeNode.getXmlNodeName(), nsCore, 0 );
		
		//unit.addProp("controllerName", treeNode.getControllerName());
		//also need parse other name, now still there are some
		if ( !mCfg || (! mCfg.fastMode) ) {
			var arr = treeNode.getPropArray();
			unit.addPropArray(arr);
		}
		//then the xmlns property
		/*var nsMap =  fd.cfg.getXmlnsMap();
		
		for ( var key in nsMap) {
			var val = nsMap[key].trim();
			
			var ns = "xmlns";
			if ( key !="default") {
				//for others will like xmlns:m
				ns = ns + ":" + key;
			}
			unit.addProp( ns, val);
		}
		*/
		
		for ( var prefix in this._mPrefixCnt) {
			
			var ns = "xmlns";
			
			var nsStr = this._mPrefixMap[prefix];
			if ( nsStr) {
				//for others will like xmlns:m
				ns = ns + ":" + nsStr;
			}
			unit.addProp( ns, prefix);
		}
		
		return unit.getStartPart();	
	},
	
	/**
	 * For the noneRoot is same, just first the name, then the attributes
	 * @param type
	 * @param treeNode
	 * @param level
	 * @returns
	 * 
	 		<table:template>
					<TextField value="{path:'gender', formatter:'.myGenderFormatter'} {firstName}, {lastName}"></TextField>
				</table:template>
	  
	  	<html:h2>
			<Label text="Hello &quot;Mr&quot;. {path:'/singleEntry/firstName', formatter:'.myFormatter'}, {/singleEntry/lastName}"></Label>
		</html:h2>
	
							<firstStatus>
							<ObjectStatus
								text="{
									path :"cart>Status",
									formatter :"util.Formatter.statusText"
								}"
								state="{
									path :"cart>Status",
									formatter :"util.Formatter.statusState"
								}" />
						</firstStatus>
	
	 */
	getStartPartForNoneRoot: function(type, treeNode, level, mCfg) {
		
		//means the xmlns="sap.ui.commons"
		//'default': 	'sap.ui.commons',
		
		var nodeName = treeNode.getNodeName();
		
		var ns = "";
		var name = nodeName;
		
		//for Aggr, need use the parent ns
		if ( treeNode.isAggrNode()) {
			ns = treeNode.getParent().getXmlNodeNs();
		} else {
			//for html, just get from mapping, others can by 
			if (treeNode.isHtmlNode()) {
				ns = this.getNsHtml();
			} else {
				name = nodeName.sapLastPart();
				ns = this.getNsByControlName(nodeName);
			}
		}
		
		//So later the end can reuse, or child can easily get that
		treeNode.setXmlNodeNs(ns);
		treeNode.setXmlNodeName(name);
		
		var exportUnit  = new fd.ExportUnit( name, ns, level );

		//add all property
		var arr = [] ;
		
		if (mCfg) {
			 if ( mCfg.fastMode) {
				 arr = treeNode.getPropArrayFastMode();
			 } else {
				 arr = treeNode.getPropArray( mCfg );
			 }
		} else {
			arr  = treeNode.getPropArray();
		}
		
		exportUnit.addPropArray(arr);
		
		return exportUnit.getStartPart();	
	},
	
	/**
	 * @returns:  array, first is the start, then second is the end, like
	 * ["<Button>","</Button"]
	 */
	getStartPart: function(type, node, level, mCfg) {
		fd.assert( type == fd.ViewType.Xml, "now only support xml type");
		var  ret ;
		
		switch (node.getNodeType()) {
			case fd.NodeType.Root:
				ret = this.getStartPartForRoot(type, node, level, mCfg);
				break;
			default: 
				ret = this.getStartPartForNoneRoot(type, node, level, mCfg);
				break;
		}
		
		return ret;
		
	},
	
	
	getEndPart: function(type, node, level) {
		var unit = new fd.ExportUnit(node.getXmlNodeName(), node.getXmlNodeNs(), level);
		return unit.getEndPart();
	},
	
	
	getXmlnsMap : function() {
		return this.mCfg.xmlns;
	},
	
	
	/**
	 * 
	 * @param type
	 * @param treeNode
	 */
	exportControl: function(type, treeNode) {
		
	},
	
	prepareForExport: function() {
		var xmlnsMap = fd.cfg.getXmlnsMap();
		
		//need init again, as user may change the configure in run time
		this._mPrefixMap = {};
		
		for ( var ns in xmlnsMap) {
			var longName = xmlnsMap[ns];
			
			if ( ns === "default" ) {
				ns = "";   //so can know it is defualt if is ""
			}
			this._mPrefixMap[longName] = ns;
		}
		
		this._mPrefixCnt = {};
	},

	/**
	 * Get the namespace name of control name by config
	 * For example: sap.m.Button, bu the package name sap.m,   and now the configure is m-->sap.m, so return is"m"
	 * 	if  sap.m  is the default namespace ( means xmlns='sap.m',  then return is "")
	 * @param name
	 */
	getNsByControlName: function(name) {
		var pos = name.lastIndexOf('.');
		var prefix = name.substr(0, pos);
		
		fd.assert( prefix in this._mPrefixMap, "not prepared ns for " + prefix);
		
		return this.getNsByPrefixName(prefix);
		
	},
	
	getNsByPrefixName: function(prefix) {
		//some times the prefix may not existed, if no need create one just use the last component, 
		//??here can't use the full name as if not include the ns, then it will use the default
		this._mPrefixCnt[prefix] = 1;
		
		if ( !(prefix in this._mPrefixMap)) {
			//alert('Prefix" + prefix + " not there');
			console.log('Prefix" + prefix + "not there, will try to add one by guess');
			this.tryAddOneNS(prefix);
		} 
		
		return this._mPrefixMap[prefix];	
	},
	
	
	/**
	 * dynamically add the prefix
	 * @param prefix
	 */
	tryAddOneNS : function( prefix) {
		//com.sap.kelley.dpt.controls
		//try step by step to check whether last componet is there
		var arr = prefix.split('.');
		arr.reverse();
		
		var ns = "";
		for (var i = 0;  i< arr.length; i++) {
			ns += arr[i];
			if ( ! (ns in this._mPrefixMap) ) {
				this._mPrefixMap[ prefix ] = ns; 
				break;
			}
		}
		
		//??still not should not possible
		if ( i == arr.length) {
			var suffix = Math.floor((Math.random()*1000)+1);
			
			ns = arr.join("") + suffix;
			
			this._mPrefixMap[ prefix ] = ns;
		}
	},
		
	getNsCore: function() {
		return this.getNsByPrefixName('sap.ui.core');
	},
	
	getNsHtml: function() {
		return this.getNsByPrefixName('http://www.w3.org/1999/xhtml');
	},
	
	/*
	 * 	  In cfg, it like
	 		'html'   :	'http://www.w3.org/1999/xhtml',  
			//The package name, like
			'm'  	:  "sap.m",
			"core"	:	"sap.ui.core",
			"form"	:	"sap.ui.commons.form",
			"mvc"	 : "sap.ui.core.mvc",
			"table"	:	"sap.ui.table",
			"layout" :	"sap.ui.commons.layout",
	 		but here as most of time need map from the sap.m to m, so need reverse it
	 */
	_mPrefixMap: null,

	_mPrefixCnt: null,  //
};

