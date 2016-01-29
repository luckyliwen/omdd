//==some view related event
var gshell;
sap.ui.jsview("fd.view.Main", {
	
	getControllerName: function() {
		return "fd.controller.Main";
	},	
	
	getShell: function( ) {
	    return this._oShell;
	},
	
	createContent: function(oController) {
		
		this._oShell = this.createShell(oController);
		this.createStaticViews(oController);
		
		//default is the project view
		this._oShell.setContent( this._projectView);
		
		return this._oShell;
	},
	
	/**
	 * Now the project and assist view is static, 
	 */
	createStaticViews: function() {
		//??Uncaught Error: failed to load"undefined.view" from ../../resources/undefined.view.js: 404 - error 
		//this._projectView = new fd.view.Project("ViewProject", {});
		//use folowing is ok, why?
		this._projectView = new fd.view.Project("ViewProject", {
			viewName :"fd.view.Project"
		});
		this._projectView.doInit();
		this._mView['NavItem_Project'] =  this._projectView;
		
		
		this._assistView = new fd.view.DevWorkset("ViewAssist", {
			viewName :"fd.view.DevWorkset"
		});
		this._assistView.doInit();
		this._mView['NavItem_Assist'] =  this._assistView;
	},
	
	/**
	 * As it is simple and only take care of switch between navigation items so put here
	 * @param oEvent
	 */
	onWorksetItemSelected: function(oEvent) {
		var id = oEvent.getParameter("id");
		var oShell = oEvent.oSource;
		
		var view = this._mView[ id];
		oShell.setContent( view ) ;
	},
	

	createShell : function(oControl) {
		 var oShell = new sap.ui.ux3.Shell("mainShell", {
			 //title
			appTitle: "SAP Fiori Fast Designer",
			appIcon: "images/SAPLogo.png",
			appIconTooltip: "SAP Fiori Fast Designer",
			
			headerType: sap.ui.ux3.ShellHeaderType.Standard,
			fullHeightContent: false,
			
			//left part
			showLogoutButton: false,
			showSearchTool: false,
			showInspectorTool: false,
			showFeederTool: false,
			
			worksetItems: [  new sap.ui.ux3.NavigationItem("NavItem_Project", 
								{key:"NavItem_Project",	text:"Main Workspace"}),
								
							new sap.ui.ux3.NavigationItem("NavItem_Assist", 
										{key:"NavItem_Assist",   text:"Development Assistant"}),
						    
			               ],
			
			                 
	         headerItems: [
						/*new sap.ui.commons.Button({
							text: "Logout",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							press: function(){
							}
						})*/
						new sap.ui.commons.Button({
							text: "Setting",
							//icon: "images/LeftNavi_Alert_Button.png",
							lite: true,
							icon: "sap-icon://settings",
							press: [oControl.onSettingPressed, oControl]
						}),
						
						new sap.ui.commons.Button({
							text: "Help",
							icon: "sap-icon://sys-help",
							lite: true,
							press: [oControl.onHelpPressed, oControl]
						}),
                    ]
		 });
		 gshell = oShell;
		 oShell.attachWorksetItemSelected( this.onWorksetItemSelected, this);
		 
		 return oShell;
	},
	
	//!!just by the name may have duplicate view name
	getWorksetViewByName: function( name ) {
	    return this._mViewByName[ name ];
	},
	

	/**
	 * viewInfo need contain: { ViewName: xx,  ControllerName: xx } 
	 * @param viewInfo
	 */
	createViewWorkset: function(viewInfo) {
		var view = new fd.view.ViewWorkset({
			viewName        :	'fd.view.ViewWorkset',  //??used to find out the view
			nameOfView      : 	  viewInfo.ViewName ,
			nameOfController:     viewInfo.ControllerName,
			viewCtrlNodeContent:  viewInfo.viewCtrlNodeContent,
			// controllerContent  : ,
			isFragment         :  viewInfo.bFragment
		});
		view.doInit();
		
		if ( viewInfo.controllerContent) {
			view.setControllerInitialContent( viewInfo.controllerContent );
		}
		

		//??need check if two view have same name,how to handle, now support as use different view id
		//later need find a way
		
		//for the fragment, now can only get by name, so store it in another way 
		this._mViewByName[ viewInfo.ViewName ] = view;
		
		//if view name like view.home, the the navigation item id is: ni_viewhom  
		var id = this.getNaviItemIdByViewName(viewInfo.ViewName);
		this._mView[id] = view;
		
		//also need create new sap.ui.ux3.NavigationItem
		//as when several file the name too long, so use short name
		// var text = viewInfo.bFragment ? "Fragment " : "View ";   
		text =  viewInfo.ViewName ;
		var navItem = new sap.ui.ux3.NavigationItem(id, 
				{
					key: id, 
					text: text
				});
		this._oShell.addWorksetItem(navItem);
		
		this._mNavItem[ id ] = navItem;

		//by the id can control view, so need return it
		return id;
	},
	

	createMetadataView: function(data) {
		var view = sap.ui.xmlview({
			viewName: "fd.view.MDDisplay"
		});
		var controller = view.getController();
		controller.setMetaData(data);

		var id = this.getNaviItemIdByViewName(data.name);
		this._mView[id] = view;

		var navItem = new sap.ui.ux3.NavigationItem(id, 
				{
					key: id, 
					text: data.name
				});
		this._oShell.addWorksetItem(navItem);

		return id;
	},

	activateView: function( id ) {
		//var id = this.getNaviItemIdByViewName(viewName);
		fd.view.Helper.simulateControlClicked(id);
		
		//Also notify that it just active, so it can do some thing such as put the initial focus to
		//??this._mView[id].onViewActivated();
	},
	
	getNaviItemIdByViewName_old: function(viewName) {
		//id can't contain special word, so need have one way to ensure it is valid
		if ( viewName in this._mViewName2Id) {
			return this._mViewName2Id [ viewName];
		} else {
			var viewId = viewName.replace(/\./g, "");
			viewId = viewName.replace(/\s/g, "");
			viewId = viewName.replace(/-/g, "");
			viewId = viewName.replace(/:/g, "");
			viewId = viewName.replace(/\\/g, "");
			
			var id  ="NavItem_" + viewId;
			this._mViewName2Id [ viewName] = id;
			return id;
		}
	},
	
	//As user may open two file with same name but different location, so just by name can't avoid duplication, then use the globlal index to avoid it
	getNaviItemIdByViewName: function(viewName) {
		this._gViewIdx ++;
		return "NavItem_View_" + this._gViewIdx;
	},

	//??
	_gViewIdx: 0,
	
	//_mViewName2Id: {},
	
	//==main data 
	_oShell: null,
	_projectView: null,
	_assistView: null,
	
	//contain all the workset views, id is the unique id as the name by duplicate
	_mViewByName : {},  //main used for fragment view, as can only get by name

	_mView: {},
	_mNavItem  :   {},

	//by the name store the view
	//_mViewByName: {},
	//
	

	
	
});
