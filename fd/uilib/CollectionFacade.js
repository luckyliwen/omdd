jQuery.sap.declare('fd.uilib.CollectionFacade');

/**
 * Provide common control for the collection: list, table, tree
 * all the private function will start by _, so end user will not call it
 * @type {Object}
 */
sap.ui.core.Element.extend("fd.uilib.CollectionFacade", {
	metadata : {
		properties : {
			//the real control, if is 'string' then means the id
			'control'       : {type:"any", defaultValue: null, },

			//the move up button, if is 'string' then means the id
			'moveUpButton'       : {type:"any", defaultValue: null },
			
			//the move up button, if is 'string' then means the id
			'moveDownButton'       : {type:"any", defaultValue: null },

			//the move up button, if is 'string' then means the id
			'moveTopButton'       : {type:"any", defaultValue: null },

			//the move up button, if is 'string' then means the id
			'moveBottomButton'       : {type:"any", defaultValue: null },

			//4 or two button, need prvoide by order: top, up, down, bottom, if only two then means only up and down
			//for each item, if is string, then call the byId() to get real object
			'moveButtons'       : {type:"array", defaultValue: null },

			//the button for the add new row to table
			// 'addButton'         : {type:"any", defaultValue: null },
			'delButton'         : {type:"any", defaultValue: null },

			//the buttons need auto check the enable/disable status, can be array or single one
			'monitButtons'       : {type:"array", defaultValue: null },

			//??order matter
			//
			//the controller, use it to get the buttons by call .byId. Must be set before set the buttons
			'controller'       : {type:"any", defaultValue: null },
		},

		aggregations : {
			//the controller, use it to get the buttons by call .byId. Must be set before set the buttons
			// "controller" : {type : "sap.ui.core.mvc.Controller", multiple : false}
		},
		
		events: 
		{

		}
		
	},

	/**
	 * In some case, the button enable need two condition: first selected, then meet another conditio, such as for the 
	 * form template, must first create a group and has the group selected, then the prop row can be added
	 * in such case user can regist his own function. Normall event can't work as it will not return value 
	 * It only work for the monitsButton
	 * call back format:  
	 * 			xxChecker(oBtn, oListener) 
	 * @param {[type]} func      [description]
	 * @param {[type]} oListener [description]
	 */
	addMonitButtonsFurtherChecker : function( func, oContext ) {
	    this._oFurtherCheckerFunc = func;
	    this._oFurtherCheckerContext = oContext;
	},

	setController: function(controller) {
		this._oController = controller; 
		// this.setProperty()		
	},

	_getButton: function(idOrObject) {
		var btn = null;
		if (typeof idOrObject =='string') {
			if (this._oController)
				btn = this._oController.byId(idOrObject);
		} else {
			btn = idOrObject;
		}
		//for safety, check it have the setEnabled function
		if (btn && btn.setEnabled)
			return btn;
		else 
			return null;
	},

	//internal function for easy setting
	_setRealButtonByName: function(idOrObject, propName) {
		var btn = this._getButton(idOrObject);
		if (btn) {
			this.setProperty(propName, btn, true);
		}
	},

	setDelButton: function(idOrObject) {
		this._setRealButtonByName(idOrObject, 'delButton');

		//and auto register the press event for it 
		var btn = this.getDelButton();
		var  that = this;
		btn.attachPress(function( oEvent ) {
		    var control = that.getControl();
		    fd.util.collection.deleteSelection(control);
		});
	},

	setMoveTopButton: function(idOrObject) {
		this._setRealButtonByName(idOrObject, 'moveTopButton');
	},
	setMoveUpButton: function(idOrObject) {
		this._setRealButtonByName(idOrObject, 'moveUpButton');
	},
	setMoveDownButton: function(idOrObject) {
		this._setRealButtonByName(idOrObject, 'moveDownButton');
	},
	setMoveBottomButton: function(idOrObject) {
		this._setRealButtonByName(idOrObject, 'moveBottomButton');
	},

	setMonitButtons : function(buttons) {
		if (!jQuery.isArray(buttons)) {
			buttons = [buttons];
		}
		var aBtn = [];
		for (var i=0; i < buttons.length; i++) {
			var  btn = this._getButton(buttons[i]);
			if (btn)
				aBtn.push(btn);
		}
		this.setProperty("monitButtons", aBtn, true);
	},

	setMoveButtons :function(buttons) {
		if (buttons.length != 2 && buttons.length != 4)
			return;
		if (buttons.length == 2) {
			this.setMoveUpButton(buttons[0]);
			this.setMoveDownButton(buttons[1]);
		} else {
			this.setMoveTopButton(buttons[0]);
			this.setMoveUpButton(buttons[1]);
			this.setMoveDownButton(buttons[2]);
			this.setMoveBottomButton(buttons[3]);
		}
	},
	

	_onDefaultSelectionChanged: function(oEvent) {
		var aSelIndex = this._getSelectedIndices();
		var bEnabled = true;

		function isAllIndexContinued(aIndex) {
			var curr = aIndex[0];
			var i=1;
			while (i < aIndex.length) {
				if (aIndex[i] != curr+1)
					return false;
				//update the curr and continue check 
				curr++;
				i++;
			}
			return true;
		}

		if (aSelIndex.length==0) {
			bEnabled = false; 
			//all disable 
			this._setButtonEnabled(["moveTopButton", "moveUpButton", "moveDownButton", "moveBottomButton",
				"monitButtons",  'delButton'], false);
		} else {
			//have some item selected, need check the status one by one, as it need more logic
			this._setButtonEnabled("monitButtons", true, true);
			
			//if is multile selection, then only all the index are continue then can enable the move buttons
			if (isAllIndexContinued(aSelIndex)) {
				//then check one by one 
				var len = this._getLength();
				this._setButtonEnabled("moveTopButton", !!(aSelIndex[0]>0) );
				this._setButtonEnabled("moveUpButton", !!(aSelIndex[0]>0) );
				var lastSelIdx = aSelIndex[ aSelIndex.length-1];
				this._setButtonEnabled("moveDownButton", !!(lastSelIdx < len-1) );
				this._setButtonEnabled("moveBottomButton", !!(lastSelIdx < len-1) );
			} else {
				this._setButtonEnabled(["moveTopButton", "moveUpButton", "moveDownButton", "moveBottomButton"], false);
			}
		}
	},

	_setButtonEnabled: function(aNamesOrButtons, status, bForMonit) {
		if (! jQuery.isArray(aNamesOrButtons))
			aNamesOrButtons = [aNamesOrButtons];

		for (var i=0; i < aNamesOrButtons.length; i++) {
			var btn = aNamesOrButtons[i];
			if ( typeof btn =='string') {
				btn = this.getProperty(btn);
			}

			if (!btn)
				continue;

			var btnStatus = status;

			//btn may be an array also 
			if (jQuery.isArray(btn)) {
				for (var subIdx=0; subIdx < btn.length; subIdx++) {
					//for the monit butttons need speck check
					if (btnStatus && bForMonit) {
						if (this._oFurtherCheckerFunc) {
							btnStatus = this._oFurtherCheckerFunc.call(this._oFurtherCheckerContext, btn[subIdx]);
						}
					}
					btn[subIdx].setEnabled(btnStatus);
				}
			} else {
				if (btn) {
					if (btnStatus && bForMonit) {
						if (this._oFurtherCheckerFunc) {
							btnStatus = this._oFurtherCheckerFunc.call(this._oFurtherCheckerContext, btn);
						}
					}
					btn.setEnabled(btnStatus);
				}
			}
		}
	},

	//check the initial button status, need called after finish set all the button
	setInitialButtonStatus: function( ) {
	    this._onDefaultSelectionChanged();
	},
	
	//================some function for the selections, need overrite by subclass in order to not use the complex switch case
	/**
	 * Delete the selection, 
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	deleteSelection: function() {
	    return fd.util.collection.deleteSelection(this.getControl());
	},

	/**
	 * Get the selection data as an array
	 * @param  {[type]} bClone [description]
	 * @return {[type]}        [description]
	 */
	getSelection: function( bClone ) {
	     return fd.util.collection.getSelection(this.getControl(), bClone);
	},

	hasSelection: function( ) {
	    return this.getSelection().length > 0;
	},
	
	/**
	 * Insert(notrmally is append) some collection to the Table/list
	 * @param {[type]} aData :
	 * @param {[type]} pos, insert position (index), optional, if not set means append to end, 
	 */
	insertCollection: function(aData, pos ) {
	    return fd.util.collection.insertCollection(this.getControl(), aData, pos);
	},

	getFirstSelectionIndex: function( ) {
		return fd.util.collection.getFirstSelectionIndex(this.getControl());
	},

	/**
	 * [moveSelection description]
	 * @param  {[type]} moveDirection : Top, Up, Down, Bottom
	 * @return {[type]}               [description]
	 */
	moveSelection: function( moveDirection ) {
	    var aMoveItem;
	    var pos = -1;
	    var newPos=-1;
	    switch( moveDirection) {
	    	case "Top":
	    		aMoveItem = this.deleteSelection();
	    		newPos = 0;
	    		this.insertCollection(aMoveItem, newPos);
	    		break;
	    	case "Up":
	    		pos = this.getFirstSelectionIndex();
	    		aMoveItem = this.deleteSelection();
	    		newPos = pos -1;
	    		this.insertCollection(aMoveItem, newPos);
	    		break;
	    	case "Down":
	    		pos = this.getFirstSelectionIndex();
	    		aMoveItem = this.deleteSelection();
	    		newPos = pos + 1;
	    		this.insertCollection(aMoveItem, newPos);
	    		break;
	    	case "Bottom":
	    		aMoveItem = this.deleteSelection();
	    		this.insertCollection(aMoveItem);
	    		//from the total lenght, can get the positon of the selecttion
	    		var leafData = fd.util.collection.getLeafBindingData(this.getControl());
	    		newPos = leafData.length - aMoveItem.length;
	    		break;
	    }
	    
	    //after move, better to keep the selection, so end user can keep moving
		fd.util.collection.setSelection(this.getControl(),newPos, aMoveItem.length);

		//for table, it will triger the selection change event, but for list, need mamually do it 
		if (fd.util.collection.isList( this.getControl())) {
			this._onDefaultSelectionChanged();
		}

		return aMoveItem;
	},
	
	
	//=============following funcitons need be implemented by the sub class
	/**
	 * attach to the selection change event for the real control, and update the buttons if have
	 * @return {[type]} [description]
	 */
	attachDefaultSelectionChangeEvent: function() { },

	_getSelectedIndices : function() { return []; },

	_getLength: function() { return 0; },

});

