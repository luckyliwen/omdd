
/*
*
*  resource model example
* 
var oControl = new sap.ui.commons.Button( {
    id : "myButton",
    text : "{i18n>MY_BUTTON_TEXT}"
});
*
* add MY_BUTTON_TEXT to locale/i18*.properties 
* 
*/

fd.model.TextMng = {

	getText: function(key) {
		return this._oTextModel.getProperty( key );
	},
	/**
	 * 
	 *  init localization text resource model. 
	 * 
	 * @param sLocale :  language locale.   	
	 */
	init : function(sLocale) {
		//to support call init multiple times
		if (this._oTextModel == null) {
			this._createResourceModel(sLocale);
		}
	},

	/**
	 * 
	 *  get current language locale. 
	 * 
	 * @param sLocale :  language locale.   	
	 */	
	getCurrentLocale:function(){
		return this._sLocale;
	},

	
	/**
	 * 
	 *  switch to new locale. 
	 * 
	 * @param newLocale :  new language locale.   	
	 */	
	changeLocale:function(newLocale){
		if(newLocale){
			this._createResourceModel(newLocale);
		}
	},

	
	/**
	 *  private function
	 *  
	 *  create text resource model and bind it to core framework. 
	 * 
	 * @param sLocale :  language locale.   	
	 */
	_createResourceModel: function(sLocale){
		this._sLocale = sLocale || this._getDefaultLocale();
		this._oTextModel  = new sap.ui.model.resource.ResourceModel({bundleUrl:this._localeUrl, bundleLocale:this._sLocale});
		sap.ui.getCore().setModel(this._oTextModel, "i18n");
	},
	
	/**
	 *  private function
	 *  
	 * get current language used by browser. 
	 * 
	 */
	_getDefaultLocale:function() {
		var sLocale;
		if(window.sap && sap.ui && sap.ui.getCore){
			sLocale = sap.ui.getCore().getConfiguration().getLanguage();
		}
		return sLocale || "en";
		//return "zh-cn";
	},
	
	
	/**
	 *  private data
	 *  
	 *  language locale  
	 * 
	 */
	_sLocale :'en',

	/**
	 *  private data
	 *  
	 * locale resource url. 
	 * 
	 */	
	_localeUrl: "fd/locale/i18n.properties",
		
	//used for later easy access
	_oTextModel: null,
};

//!!In order to easy get the text, here add a shorthand function 
fd.getText = function(key) {
	return fd.model.TextMng.getText(key);
};
