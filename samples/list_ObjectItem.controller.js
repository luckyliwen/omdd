sap.ui.controller("list_ObjectItem", {
    // ========OnInit part, add local demo data by guess, please adjust by yourself ============
    // ====For some binding if not start by /, please don't forget add the bindContext() ===

    onInit : function () {

        var demoData = 
        {
            "data": [
              {
                    "title": "invoice",
                    "number": "1234",
                    "unit": "eur",
                    "intor": "customer prepay invoice",
                    "attrText": "130 days ago",
                    "objText": "due"
                },

                {
                    "title": "Payment",
                    "number": "4321",
                    "unit": "usd",
                    "intor": "customer invoice",
                    "attrText": "20 days ago",
                    "objText": "will due soon"
                },
                {
                    "title": "invoice",
                    "number": "45",
                    "unit": "usd",
                    "intor": "Vendor payment invoice",
                    "attrText": "3 days ago",
                    "objText": "due"
                }
            ]
        };
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData( demoData );
        this.getView().setModel( oModel ) ;
    },

    // ========formatter part ============
    formatStauts : function ( number ) {
         if ( number > 1000) 
              return "Error";
         else 
               return "Success";

    },

    // ========Event Handler part ============
    onSelect : function ( oEvent )  {
        console.warn("**Event happened for onSelect",  oEvent);
    },

    onDelete : function ( oEvent )  {
        console.warn("**Event happened for onDelete",  oEvent);
		alert("Really want to delete ?");
    },

});