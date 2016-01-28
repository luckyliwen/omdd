fd.util.io = {
	readViewFromFile: function(fileName, viewType, forConvert) {
		
		//fileName = fd.util.convertFileNameToUrl(fileName);
		
		if ( ! viewType ) {
			//try to detect from extension
			if ( fileName.sapEndWith('.xml')) {
				viewType =  fd.ViewType.Xml;
			} else if ( fileName.sapEndWith('.html') ) {
				viewType =  fd.ViewType.Html;
			} else {
				throw new Error('Unknow view type from file' + fileName);
			}
		}
		
		var content = this.loadFileContent(fileName, viewType);
		
		var ret; 
		
		//first try to get the file content
		if (viewType == fd.ViewType.Xml) {
			ret = fd.util.XmlViewReader.parseView(content, forConvert);
		} else {
			ret = fd.util.HtmlViewReader.parseView(content, forConvert);
		}
		return ret;
	},
	
	readViewFromStringContent: function(viewType, str) {
		
		var ret; 
		
		//first try to get the file content
		if (viewType == fd.ViewType.Xml) {
			content = $.parseXML( str);
			
			ret = fd.util.XmlViewReader.parseView(content.documentElement, false);
		} else {
			content = str;
			ret = fd.util.HtmlViewReader.parseView(content, false);
		}
		
		return ret;
	},
	
	readControllerFromFile: function(fileName) {
		
	},
	
	loadFileContent: function(url, dataType) {
		var result = null;
		try {
			if (dataType) {
				result = jQuery.sap.sjax({
					url: url,
					dataType: dataType,
					complexResult: true,
				});
			} else {
				result = jQuery.sap.sjax({
					url: url,
					dataType: dataType,
					complexResult: true,
				});
			}
		} catch (ex) {
			//Most of case is parse xml error, so just throw what it 
			throw ex;
		}
		
		/*var _xContent = response.data;
		if (!_xContent) {
			throw new Error("Read xml file " + url + " error. Check for XML errors or"file not found" errors.");
		}
		return _xContent.documentElement; // response.data is the document node
		*/
		//
		//oResult = { success : true, data : data, status : textStatus, statusCode : xhr&&xhr.status };
		//oResult = { success : false, data : undefined, status : textStatus, error : error, statusCode : xhr.status };

		//need detail reason why failed
		
		if ( result.success) {
			if ( dataType == fd.ViewType.Xml)
				return result.data.documentElement;
			else
				return result.data;
		} else {
			var shortError = result.error.message.substr(0, 60) + " ...";
			
			//now error too long, just get first line is enough
			if ( dataType == fd.ViewType.Xml)
				throw new Error("Read xml file " + url + " error. [status]: " + result.status + "\\r\n[error]: " + shortError +
					"\r\n[statusCode]: " + result.statusCode );
			else
				throw new Error("Read html file " + url + " error. [status]: " + result.status + "\r\n[error]: " + shortError +
						"\\r\n[statusCode]: " + result.statusCode );
		}
	},

	doTest: function() {
		//var fn ="C:\\temp\\name.view.xml";
		var fn ="file:///C:/temp/name.view.xml";
		var ret = this.readViewFromFile(fn, fd.ViewType.Xml);
		return ret;
	}
};


/**
 * 
 * @param fn
 * @returns
 */
function parseXml(fn) {
	var base ="file:///C:/Users/I068108/Downloads/";
	
	var fullFn = base + fn.trim() +".view.xml";
	
	var ret = fd.util.io.loadFileContent(fullFn);
	return ret;
}
