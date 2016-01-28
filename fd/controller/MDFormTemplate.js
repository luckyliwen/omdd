jQuery.sap.declare('fd.controller.MDFormTemplate');
jQuery.sap.require("fd.controller.MDTemplate");

fd.controller.MDTemplate.extend("fd.controller.MDFormTemplate", {

	_createConcreteControl: function(){ 
		var retForm;
		switch (this._mSetting.formType) {
			case fd.Template.FormType.SmartForm  :
				retForm = new sap.ui.comp.smartform.SmartForm();
				this._groupAggrName = "groups";
				this._itemAggrName = "groupElements";
				this._realForm = retForm;
				break;
			case fd.Template.FormType.SimpleForm  :
				retForm = new sap.ui.layout.form.SimpleForm();
				this._groupAggrName = "formContainers";
				this._itemAggrName = "formElements";
				this._realForm = null; // need set later
				break;
			case fd.Template.FormType.Form  :
				retForm = new sap.ui.layout.form.Form();
				//for the form, need set the layout also 
				retForm.setLayout( new sap.ui.layout.form.ResponsiveGridLayout());
				this._realForm = retForm;
				this._groupAggrName = "formContainers";
				this._itemAggrName = "formElements";
				break;
		}
		this._concreteForm = retForm;

		this.setConcreteControl(retForm);
		return [retForm];
	},

	_createConcreteControl_ControlInfo: function(){ 
		 switch (this._mSetting.formType) {
			case fd.Template.FormType.SmartForm  :
				return this._createConcreteControl_ControlInfo_SmartForm();
			case fd.Template.FormType.SimpleForm :
				return this._createConcreteControl_ControlInfo_SimpleForm();
			case fd.Template.FormType.Form  :
				return this._createConcreteControl_ControlInfo_Form();
		}
	},

	_createConcreteControl_ControlInfo_SimpleForm: function( evt ) {
		var aContent = [];
		var that = this;
		var viewData = this._mViewData;

		_.each(viewData.aGroup,  function(group){
			var title = new fd.uilib.ControlInfo({
				name: 'sap.ui.core.Title',
				propertyMap: {
					text: group.label
				}
			});
			aContent.push(title);

			var aItem = viewData.mFormItem[ group.groupPath];
			_.each( aItem, function( item ) {
			    aContent.push( that.getCommonControlInfoFromControl(  item._ui5Control[0]));
			    aContent.push( that.getCommonControlInfoFromControl(  item._ui5Control[1]));
			});
		});

	    var formInfo = new fd.uilib.ControlInfo({
	    		name: "sap.ui.layout.form.SimpleForm",
	    		aggregationMap: {
	    			content: aContent
	    		}
	    });
	    return [formInfo];
	},
	
	_createConcreteControl_ControlInfo_SmartForm: function(  ) {
		var aGroupInfo = [];
		var that = this;
		var viewData = this._mViewData;

		_.each(viewData.aGroup,  function(group) {
			var aElementInfo = [];

			var aItem = viewData.mFormItem[ group.groupPath];
			_.each( aItem, function( item ) {
				var elementInfo = new fd.uilib.ControlInfo({
					name: 'sap.ui.comp.smartform.GroupElement',
					aggregationMap: {
						label: that.getCommonControlInfoFromControl(item._ui5Control[0]),
						elements: that.getCommonControlInfoFromControl(item._ui5Control[1]),
					}
				});

				aElementInfo.push( elementInfo ); 
			});

			var groupInfo = new fd.uilib.ControlInfo({
					name: 'sap.ui.comp.smartform.Group',
					aggregationMap: {
						groupElements: aElementInfo
					}
				});

			aGroupInfo.push(groupInfo);
		});

	    var formInfo = new fd.uilib.ControlInfo({
	    		name: "sap.ui.comp.smartform.SmartForm",
	    		aggregationMap: {
	    			groups: aGroupInfo
	    		}
	    });
	    return [formInfo];
	},

	

	_createConcreteControl_ControlInfo_Form: function(  ) {
		var aGroupInfo = [];
		var that = this;
		var viewData = this._mViewData;

		_.each(viewData.aGroup,  function(group) {
			var aElementInfo = [];

			var aItem = viewData.mFormItem[ group.groupPath];
			_.each( aItem, function( item ) {
				var elementInfo = new fd.uilib.ControlInfo({
					name: 'sap.ui.layout.form.FormElement',
					aggregationMap: {
						label: that.getCommonControlInfoFromControl(item._ui5Control[0]),
						fields: that.getCommonControlInfoFromControl(item._ui5Control[1]),
					}
				});

				aElementInfo.push( elementInfo ); 
			});

			var groupInfo = new fd.uilib.ControlInfo({
					name: 'sap.ui.layout.form.FormContainer',
					aggregationMap: {
						formElements: aElementInfo
					}
				});

			aGroupInfo.push(groupInfo);
		});

		var layout = this.getControlInfoFromControl( this._realForm.getLayout());
	    var formInfo = new fd.uilib.ControlInfo({
	    		name: "sap.ui.layout.form.Form",
	    		aggregationMap: {
	    			formContainers: aGroupInfo,
	    			layout:  layout
	    		}
	    });
	    return [formInfo];
	},

	highLightItmes: function( aItem,  bSelect ) {
	    switch (this._mSetting.formType) {
				case fd.Template.FormType.SmartForm  :
					break;
				case fd.Template.FormType.SimpleForm  :
					break;
				case fd.Template.FormType.Form  :
					break;
		}
	},

	changeItem: function( item, changeItemType, newValue) {
		var label = item._ui5Control[0];
		label.setText(newValue);
	},

	addItems: function( aItem ) {
	    // need be implemented by subclass
	    for (var i=0; i < aItem.length; i++) {
	    	var  item = aItem[i];
	    	var label = this.createLabel(item);
	    	var template = this.createTemplate(item);

			switch (this._mSetting.formType) {
				case fd.Template.FormType.SmartForm :
					var groupElement  = new sap.ui.comp.smartform.GroupElement();
					groupElement.setLabel(label);
					groupElement.addElement(template);
					this._currentGroup.addGroupElement(groupElement);
					break;
				case fd.Template.FormType.SimpleForm  :
					this._concreteForm.addContent( label);
					this._concreteForm.addContent( template);
					break;
				case fd.Template.FormType.Form :
					var formElement = new sap.ui.layout.form.FormElement();
					formElement.setLabel(label);
					formElement.addField(template);
					this._currentGroup.addFormElement(formElement);
					break;
			}
			//save both, so later can easily change proprty
	    	item._ui5Control = [label,template];
	    }
	},



	delItems: function( aItem ) {
	    // need be implemented by subclass
	   	for (var i=0; i < aItem.length; i++) {
	   		var  item = aItem[i];
	   		if ( item._ui5Control.length) {
	   			var label = item._ui5Control[0];
	   			var template = item._ui5Control[1];

				if ( this._mSetting.formType == fd.Template.FormType.SimpleForm ) {
					this._concreteForm.removeContent(label);
					this._concreteForm.removeContent(template);
				} else {
					var parent = template.getParent();
					this._currentGroup.removeAggregation( this._itemAggrName, parent);
				}
	   		}
	   	}
	   	
	},

			/*case "Top":
		    		//first remove all, then reverse add 
		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control);
		    		}

		    		for (i=aItem.length-1; i>=0; i--) {
		    			this._concreteTable.insertColumn(aItem[i]._ui5Control, 0);
		    		}
		    		break;
		    	case "Up": 
	    			//it is same move the one before the first item to the end of the aItem
	    			var firstPos = this._concreteTable.indexOfColumn(aItem[0]._ui5Control);
	    			fd.assert(firstPos != -1);
	    			var prevPos = firstPos -1;
	    			var prevColumn = this._concreteTable.getColumns()[ prevPos];
	    			this._concreteTable.removeColumn( prevColumn);
	    			//need move over the whole array
	    			prevPos += aItem.length;
	    			this._concreteTable.insertColumn( prevColumn, prevPos);
		    		break;

		    	case "Down":
		    		//it is same move the one next the last item to the before of the aItem
		    		var lastItem = aItem[  aItem.length -1]._ui5Control;
	    			var lastPos = this._concreteTable.indexOfColumn(lastItem);
	    			fd.assert(lastPos != -1);
	    			var nextPos = lastPos + 1;
	    			var nextColumn = this._concreteTable.getColumns()[ nextPos];
	    			this._concreteTable.removeColumn( nextColumn);
	    			//need move over the whole array
	    			nextPos -= aItem.length;
	    			this._concreteTable.insertColumn( nextColumn, nextPos);
		    		break;
		    	case "Bottom":
		    		//first delete all, the add to end one by one
	    			for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.removeColumn( aItem[i]._ui5Control);
		    		}

		    		for (i=0; i < aItem.length; i++) {
		    			this._concreteTable.addColumn( aItem[i]._ui5Control);
		    		}
		    		break;
		    }*/

	moveItems: function( aItem, moveDirection ) {
		var i, item, template, parent, oldPos;

	    switch ( moveDirection) {
	    	case "Top":
	    		for (i=aItem.length-1; i >=0; i--) {
	    			item = aItem[i];
	    			template = item._ui5Control[1];
					parent = template.getParent();
					this._currentGroup.removeAggregation( this._itemAggrName, parent);
					//insert to top
					this._currentGroup.insertAggregation(this._itemAggrName, parent, 0);
	    		}
	    		break;
	    	case "Up": 
				//it is same move the one before the first item to the end of the aItem
				var firstTemplate = aItem[0]._ui5Control[1];
				var firstParent = firstTemplate.getParent();
    			var firstPos = this._currentGroup.indexOfAggregation( this._itemAggrName, firstParent);
    			fd.assert(firstPos != -1);
    			var prevPos = firstPos -1;

    			var prevElement  = this._currentGroup.getAggregation(this._itemAggrName)[ prevPos];
    			this._currentGroup.removeAggregation( this._itemAggrName, prevElement);
    			//need move over the whole array
    			prevPos += aItem.length;
    			this._currentGroup.insertAggregation(this._itemAggrName, prevElement, prevPos);
	    		break;
	    	case "Down":
	    		//it is same move the one next the last item to the before of the aItem
	    		var lastTemplate = aItem[ aItem.length-1 ]._ui5Control[1];
				var lastParent = lastTemplate.getParent();
    			var lastPos = this._currentGroup.indexOfAggregation( this._itemAggrName, lastParent);
    			fd.assert(firstPos != -1);
    			var nextPos = lastPos + 1;

    			var nextElement  = this._currentGroup.getAggregation(this._itemAggrName)[ nextPos];
    			this._currentGroup.removeAggregation( this._itemAggrName, nextElement);
    			//need move over the whole array
    			nextPos -= aItem.length;
    			this._currentGroup.insertAggregation(this._itemAggrName, nextElement, nextPos);
	    		break;
	    	case "Bottom": 
	    		for (i=0; i< aItem.length; i++ ) {
	    			item = aItem[i];
	    			template = item._ui5Control[1];
					parent = template.getParent();
					this._currentGroup.removeAggregation( this._itemAggrName, parent);
					//append to bottom
					this._currentGroup.addAggregation(this._itemAggrName, parent);
	    		}
	    		break;
	    	}
	},

	/*
	mData var entry = {
			label: "",
			groupPath : this.getNextGroupPath()
		};
	 */
	addGroup: function( mData) {
		var currGroup;
	    switch (this._mSetting.formType) {
			case fd.Template.FormType.SmartForm  :
				currGroup = new sap.ui.comp.smartform.Group();
				currGroup.setTitle( mData.label);
				this._concreteForm.addGroup(currGroup);
				break;
			case fd.Template.FormType.SimpleForm  :
				var title = new sap.ui.core.Title({text: mData.label});
				this._concreteForm.addContent(title);
				this._realForm = this._concreteForm.getAggregation('form');
				currGroup = this.getLastAggregation(this._realForm,"formContainers");
				break;
			case fd.Template.FormType.Form  :
				currGroup = new sap.ui.layout.form.FormContainer();
				currGroup.setTitle( mData.label);
				this._concreteForm.addFormContainer(currGroup);
				break;
		}

		mData._ui5Control = currGroup;
		this._currentGroup = currGroup;
	},

	delGroup: function( mData) {
		mData._ui5Control.removeAllAggregation( this._itemAggrName);

		this._realForm.removeAggregation( this._groupAggrName, mData._ui5Control);
	   /* switch (this._mSetting.formType) {
			case fd.Template.FormType.SmartForm  :
				this._concreteForm.removeGroup(mData._ui5Control);
				break;
			case fd.Template.FormType.SimpleForm  :
				var realForm = this._concreteForm.getAggregation('form');
				realForm.removeFormContainer(mData._ui5Control);
				break;
			case fd.Template.FormType.Form  :
				this._concreteForm.removeFormContainer(mData._ui5Control);
				break;
		}*/
	},

	moveGroup: function( mData, moveDirection) {
		var oldPos = this._realForm.indexOfAggregation( this._groupAggrName, mData._ui5Control);
		this._realForm.removeAggregation( this._groupAggrName, mData._ui5Control);

	    switch ( moveDirection) {
	    	case "Top":
	    		this._realForm.insertAggregation(this._groupAggrName, mData._ui5Control, 0);
	    		break;
	    	case "Up": 
	    		this._realForm.insertAggregation(this._groupAggrName, mData._ui5Control, oldPos-1);
	    		break;
	    	case "Down":
	    		this._realForm.insertAggregation(this._groupAggrName, mData._ui5Control, oldPos+1);
	    		break;
	    	case "Bottom":
	    		this._realForm.addAggregation(this._groupAggrName, mData._ui5Control); 
	    		break;
	    	}
	},

	changeGroupLabel: function( mData, newLabel ) {
	    var group = mData._ui5Control;
	    var title = group.getTitle();
	    if ( !title || typeof title == 'string')
	    	group.setTitle( newLabel);
	    else 
	    	title.setText(newLabel);
	},

	//
	changeGroupSelection: function( mData ) {
	    this._currentGroup = mData._ui5Control;
	},
	

	getLastAggregation: function( ctrl, aggrName ) {
	    var aAggr = ctrl.getAggregation(aggrName);
	    if (aAggr && aAggr.length) {
	    	return aAggr[ aAggr.length -1];
	    } else {
	    	return null;
	    }
	},
	

	//globla variables
	//_concreteForm
	//-- the form which do the real operation, for the simple form it is the 'form' aggr,for the others, it is the _concreteForm itself
	//_realForm:   
	//_currentGroup
	// _groupAggrName,  _itemAggrName
});