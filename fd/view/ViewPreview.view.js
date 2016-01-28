"use strict";
jQuery.sap.declare("fd.view.ViewPreview");
jQuery.sap.require("sap.ui.core.mvc.JSView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

sap.ui.core.mvc.JSView.extend("fd.view.ViewPreview", {
			metadata : {
				properties : {
						viewWorkset :"object",
						previewContainerId:"string",
				}
			},

			getControllerName : function() {
				return "fd.controller.ViewPreview";
			},

			// Just reuse the JSView is enough
			renderer :"sap.ui.core.mvc.JSViewRenderer",

			createTopCommandbar : function( oController) {
				var modelLabel = new sap.ui.commons.Label({text:"Preview Mode "});
				var oCB = new sap.ui.commons.DropdownBox(this.createId('PreviewTypeChoice'),
						{displaySecondaryValues: true});
				
				var template =  new sap.ui.core.ListItem( 
						{
							text: "{name}",
							key:  "{key}",
						}
					);
			
				oCB.bindItems('/previewType', template);
				
				// top is a toolbar, use teh boarderLayout as we want to put it
				// at center
				// ??
				var previewBtn = new sap.ui.commons.Button(this.createId('PreviewBtn'), {
						text : "Preview Latest Content "
					});

				/*
				 * var copyBtn = new sap.ui.commons.Button(
				 * this.createId('CopyToClipboard'), { text: "Copy To ClipBoard"
				 * });
				 */
				/*var toolbar = new sap.ui.commons.Toolbar({
							items : [oCB, previewBtn]
						});
				return toolbar;
				*/
				//just h
				//
				
				var runableBtn = new  sap.ui.commons.Button( this.createId('SaveRunableHTMLToFile'), 
				{
					text: "Save Runable HTML To File",
					tooltip: fd.model.HelpMng.getTooltip("SaveRunableHtml")
				}).addStyleClass('MarginLeftRight');
				
				var oCheckBox= new sap.ui.commons.CheckBox(this.createId('PreviewFastMode'),
						{
							text: "Pseudo Data" ,
							tooltip: fd.model.HelpMng.getTooltip("PseudoData")
						});
				
				oCheckBox.addStyleClass('MarginLeftRight');
				
				var oCheckBoxOpenDlg = new sap.ui.commons.CheckBox(this.createId('OpenDialog'),
						{
							text: "Open dialog or popover" ,
							//checked: true
						}).addStyleClass('MarginLeftRight');

				var layout = new sap.ui.layout.HorizontalLayout(this.createId('PreviewToolBar'),
						{
							content: [modelLabel,oCB, oCheckBox, oCheckBoxOpenDlg, previewBtn, runableBtn]
						});
				layout.addStyleClass('FDHCenter');
				return layout;
				
			},
			
			createLeftPreviewContainerPart : function( oController) {
				  var idPreview = this.createId('PreviewShell');
				  var idPreviewContainer = this.createId('PreviewShell_Container');
				  
				  var shellContent = '<div id="{0}" class="PreviewShell_Container"> <div id="{1}" style="width:100%;height=100%"></div></div>';
				  var outShell = new sap.ui.core.HTML( {
		                content: shellContent.sapFormat( idPreviewContainer, idPreview )
		           });
				  this._oPeviewContainer = outShell;
				  
				  return outShell;
			},
			
			createRightPreviewNavigationPart : function( oController) {
				  //just create teh tree
				
				var tree = new sap.ui.commons.Tree(this.createId('NavigatonTree'), 
							{
								//??height:"100%", //??tmp  //if set when switch back it will report split -100% problem
								title: "Control Hierarchy",
								showHorizontalScrollbar: true,
							}
						);
				
				//then the table, 
				var table = fd.model.DebugCtrl.createPropTableForSingleCtrl(
						this.createId('PreviewDebugTable'),
						oController.onDebugPropChanged,
						oController.onDebugPropLiveChanged,
						oController.onApplyPropertyPressed,
						oController);

				
				this._oDebugTable = table;
				
				var oModel = new sap.ui.model.json.JSONModel();
				this._oDebugTable.setModel(oModel);
				
				
			/*	// var search = new sap.m.SearchField(this.createId("propSearch"), {
				var search = new sap.ui.commons.SearchField(this.createId("propSearch"), {
					// placeholder: "Search property",
					enableClear : true
				});*/

				var applyBackBtn = new  sap.ui.commons.Button( this.createId('ApplyAllChange'), 
				{
					text: "Apply Changes",
					tooltip:  fd.model.HelpMng.getTooltip("ApplyAllChange"),
					enabled: false,
					icon: "sap-icon://accept"
				});

				var discardBtn = new  sap.ui.commons.Button( this.createId('DiscardAllChange'), 
				{
					text: "Discard Changes",
					tooltip:  fd.model.HelpMng.getTooltip("DiscardAllChange"),
					enabled: false,
					icon: "sap-icon://sys-cancel"
				}).addStyleClass('FDMarginLeft');


				//set the table toolbar
				var dbgTableToolbar = new sap.ui.commons.Toolbar({
					items: [ applyBackBtn, discardBtn]
				}).addStyleClass("FDHCenter");
				table.setToolbar(dbgTableToolbar);

				//use another split layout 
				var oSplit = new sap.ui.commons.Splitter( this.createId("PreviewRightPartSplit"),
						 {
					 		splitterOrientation : sap.ui.commons.Orientation.Horizontal,
							splitterPosition	: "40%",
							
				 			minSizeFirstPane	: "20%",
				 			minSizeSecondPane	: "20%",
				 			
				 			firstPaneContent	: tree,
				 			secondPaneContent	: table,
				});
				return oSplit;
			},
			
			doInit : function( ) {
			  var oController = this.getController();
			  var cmdBar = this.createTopCommandbar(oController);
			  
			  var leftContainer = this.createLeftPreviewContainerPart(oController);
			  var rightNavi     = this.createRightPreviewNavigationPart(oController);
			  
			  //then left and right combine together
				//use a split 
			  var oSplit = new sap.ui.commons.Splitter( this.createId("PreviewSplitContainer"),
							 {
						 		splitterOrientation : sap.ui.commons.Orientation.Vertical,
								splitterPosition	: "70%",
								
					 			minSizeFirstPane	: "60%",
					 			minSizeSecondPane	: "10%",
					 			
					 			firstPaneContent	: leftContainer,
					 			secondPaneContent	: rightNavi,
				});
			  this._oMainSplit = oSplit;
			  
			  var vLayout = new sap.ui.commons.layout.VerticalLayout({
			  				class: "sapUiSizeCompact",
							width:"100%",
							content : [
							           cmdBar, 
							           new sap.ui.commons.HorizontalDivider(),
							           
							           oSplit,
									  ]
						});

				this._vLayout = vLayout;
				this.addContent(vLayout);

				// then manually call the controller init work
				this.getController().onAfterDoInit();
			},

			createContent : function(oController) {
				return null;
			},
			
			getVLayout:function() {
				return this._vLayout;
			},
			
			getPreviewContainer: function() {
				return this._oPeviewContainer;
			},
			
			_oPeviewContainer: null,
			_vLayout : null,
			_oSplit  : null,
			_oDebugTable: null,
		});