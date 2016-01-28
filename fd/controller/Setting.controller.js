sap.ui.controller("fd.controller.Setting", {

    onInit : function () {
        fd.setSettingController(this);

       var bootstrap = 
            '<script id="sap-ui-bootstrap" '         + '\r\n'  + 
            '       src="{0}/resources/sap-ui-core.js"'        + '\r\n'  + 
            '       data-sap-ui-theme="sap_bluecrystal"'         + '\r\n'  + 
            '       data-sap-ui-xx-bindingSyntax="complex"'      + '\r\n'  + 
            '       data-sap-ui-libs="sap.m,sap.ui.commons,sap.ui.table,sap.ui.comp"'      + '\r\n'  + 
            '       >'       + '\r\n'  + 
            '</script>';

        this.mData = {
            UI5Bootstrap: {
            }
        };

        this.mData.UI5Bootstrap.SAPInternal = bootstrap.sapFormat("http://veui5infra.dhcp.wdf.sap.corp:8080/sapui5");
        this.mData.UI5Bootstrap.OpenUi5 = bootstrap.sapFormat("http://openui5.hana.ondemand.com");
        this.mData.UI5Bootstrap.Other = bootstrap.sapFormat("https://ldciccw.wdf.sap.corp:44300/sap/bc/ui5_ui5/sap/ZFDSAPUPLOAD");
        this.mData.UI5Bootstrap.Final = this.mData.UI5Bootstrap.SAPInternal;


        this.byId("bootstrapTextArea").setValue( this.mData.UI5Bootstrap.SAPInternal);
    },

    //return true means pass the check
    checkODataAndWarning: function( evt ) {
        var mData = this.getDataBinding();
        if (mData.bOData) {
            if (mData.odataUrl.length === 0 ) {
                fd.uilib.Message.warning("You choose OData but not configure the OData URL, please confiure it by perss SETTTING dialog");
                return false;
            }
        }
        return true;
    },
    
    setODataUrlIfEmpty: function( url) {
        if ( !this.byId("inputODataUrl").getValue())
            this.byId("inputODataUrl").setValue(url);
    },
    
    getUI5Bootstrap: function( evt ) {
        return this.mData.UI5Bootstrap.Final;
    },
    
    //??just return from value is enough
    getDataBinding: function( evt ) {
        var dataCount = 0, numberStart  = 1000;
        try {
            dataCount = parseInt( this.byId("inputDataCount").getValue() );    
            numberStart = parseInt( this.byId("inputNumberStart").getValue());    
        } catch ( ex) {
            dataCount = 3;
            numberStart  = 1000;
        }

        var mData = {
            bOData: this.byId("radioOData").getSelected(),
            odataUrl:  this.byId("inputODataUrl").getValue().trim(),
            bCreateDefaultData: this.byId("checkDefaultData").getSelected(),
            dataCount: dataCount,
            numberStart:   numberStart,   //need check later 
        };
        return mData;
    },

    isODataBinding: function(  ) {
        return this.getDataBinding().bOData;
    },
    
    

    // ========Event Handler part ============
    onUI5RadioGroupSelect : function ( oEvent )  {
        var selIdx = this.byId("UI5RadioGroup").getSelectedIndex();
        if (selIdx === 0) {
            this.byId("bootstrapTextArea").setValue( this.mData.UI5Bootstrap.SAPInternal);
            this.mData.UI5Bootstrap.Final = this.mData.UI5Bootstrap.SAPInternal;
        }
        else {
            this.byId("bootstrapTextArea").setValue( this.mData.UI5Bootstrap.OpenUi5);
            this.mData.UI5Bootstrap.Final = this.mData.UI5Bootstrap.OpenUi5;
        }
    },

    onBootstrapChanged: function() {
        this.mData.UI5Bootstrap.Final = this.byId("bootstrapTextArea").getValue();
    },
    
    setSelecttedKey: function( key ) {
        this.byId("iconTabBar").setSelecttedKey(key);
    },


    onClosePressed : function ( oEvent )  {
       this.byId("settingDialog").close();
    },

    open: function( evt ) {
        this.byId("settingDialog").open();
    },
    
});