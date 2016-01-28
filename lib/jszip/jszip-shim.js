require.config({
	"shim" : {
		"sap/watt/lib/jszip/jszip" : {
			"exports" : "JSZip"
		},
		"sap/watt/lib/jszip/jszip-deflate" : {
			"deps" : [ "sap/watt/lib/jszip/jszip" ],
			"exports" : "JSZip"
		},
		"sap/watt/lib/jszip/jszip-inflate" : {
			"deps" : [ "sap/watt/lib/jszip/jszip-deflate" ],
			"exports" : "JSZip"
		},
		"sap/watt/lib/jszip/jszip-load" : {
			"deps" : [ "sap/watt/lib/jszip/jszip-inflate" ],
			"exports" : "JSZip"
		}
	}
});

define([ "sap/watt/lib/jszip/jszip-load" ], function(JSZip) {
	var fOrigLoad = JSZip.prototype.load;
	JSZip.prototype.load = function() {
		fOrigLoad.apply(this, arguments);
	    for (var file in this.files) {
	    	// correct dir if file name ends with "/"
	    	this.files[file].options.dir = this.files[file].options.dir || (file.indexOf("/", file.length - 1) !== -1);
	    }
	};

	return JSZip    ;

});