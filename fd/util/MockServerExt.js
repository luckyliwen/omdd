jQuery.sap.declare("fd.util.MockServerExt");
jQuery.sap.require("sap.ui.core.util.MockServer");

/**
 * As we load $metadata from local file system, so we need extend the MoskServer to local simulate
 * !!it is heavily depend on the internal implementation of the sap.ui.core.util.MockServer
 */
sap.ui.core.util.MockServer.extend("fd.util.MockServerExt",{
	// metadata: {
	// 	properties: {

	// 	}
});

fd.util.MockServerExt.prototype.setMetadaConent = function(xmlContent) {
	var metadata = jQuery.parseXML(xmlContent);
	this._oMetadata  = metadata;
};

fd.util.MockServerExt.prototype.startSimulate = function(  ) {
	this.simulate("", {bGenerateMissingMockData: true});
    this.start();
};

fd.util.MockServerExt.prototype._loadMetadata = function(sMetadataUrl) {
	return this._oMetadata;
};
