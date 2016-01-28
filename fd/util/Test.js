//just do some test to get information
fd.test = {
		
		
	getAllPropType: function() {
	
		
		var m = {};
		var aCtrl = fd.model.ModuleMng.getControls();
		
		/*
		//Some ctrl name is wrong, need filter it out
		var wrong=[];
		aCtrl.forEach( function(ctrl){
			var ret = eval(ctrl);
			if (! ret) {
				wrong.push(ctrl);
			}
		});

		console.error("Invalid names", wrong);
		return;
		*/
		aCtrl.forEach( function(ctrl){
			console.log("Now for " + ctrl);
			var meta = fd.model.Metadata.getMetadataForControl(ctrl);
			
			var mProp = meta.Prop;
			
			for ( var name in mProp) {
				var prop = mProp[name];
				
				if ( prop.type in m)
					m[ prop.type] = m[ prop.type] + 1;
				else
					m[ prop.type] = 1;
			}
			
		});
		
		console.error("All props", m);
	},
	/*only sap.m
	mType : { 
			"sap.m.BackgroundDesign" : 2,
			"sap.m.ButtonType" : 2,
			"sap.m.DateTimeInputType" : 1,
			"sap.m.DialogType" : 1,
			"sap.m.FlexAlignItems" : 3,
			"sap.m.FlexAlignSelf" : 1,
			"sap.m.FlexDirection" : 3,
			"sap.m.FlexJustifyContent" : 3,
			"sap.m.FlexRendertype" : 3,
			"sap.m.InputType" : 1,
			"sap.m.LabelDesign" : 1,
			"sap.m.ListHeaderDesign" : 2,
			"sap.m.ListMode" : 2,
			"sap.m.ListSeparators" : 2,
			"sap.m.ListType" : 10,
			"sap.m.PageBackgroundDesign" : 1,
			"sap.m.PlacementType" : 3,
			"sap.m.PopinDisplay" : 1,
			"sap.m.RatingIndicatorVisualMode" : 1,
			"sap.m.SplitAppMode" : 1,
			"sap.m.StandardTileType" : 1,
			"sap.m.SwipeDirection" : 2,
			"sap.m.SwitchType" : 1,
			"sap.ui.commons.form.GridElementCells" : 1,
			"sap.ui.commons.form.SimpleFormLayout" : 1,
			"sap.ui.core.BarColor" : 1,
			"sap.ui.core.CSSSize" : 50,
			"sap.ui.core.IconColor" : 1,
			"sap.ui.core.TextAlign" : 4,
			"sap.ui.core.TextDirection" : 6,
			"sap.ui.core.URI" : 29,
			"sap.ui.core.ValueState" : 8,
			"sap.ui.core.VerticalAlign" : 1,
			"sap.ui.core.Wrapping" : 1
	},
	*/
	/*
	 any: 2
	boolean: 177
	float: 10
	int: 27
	object: 2
	sap.ui.core.Control
	string
	string[]   //only labels of Slider string[]
	 */
	mType: {
		"sap.m.BackgroundDesign"  : 2,
		"sap.m.ButtonType"  : 2,
		"sap.m.DateTimeInputType"  : 1,
		"sap.m.DialogType"  : 1,
		"sap.m.FlexAlignItems"  : 3,
		"sap.m.FlexAlignSelf"  : 1,
		"sap.m.FlexDirection"  : 3,
		"sap.m.FlexJustifyContent"  : 3,
		"sap.m.FlexRendertype"  : 3,
		"sap.m.InputType"  : 1,
		"sap.m.LabelDesign"  : 1,
		"sap.m.ListHeaderDesign"  : 2,
		"sap.m.ListMode"  : 2,
		"sap.m.ListSeparators"  : 2,
		"sap.m.ListType"  : 10,
		"sap.m.PageBackgroundDesign"  : 1,
		"sap.m.PlacementType"  : 3,
		"sap.m.PopinDisplay"  : 1,
		"sap.m.RatingIndicatorVisualMode"  : 1,
		"sap.m.SplitAppMode"  : 1,
		"sap.m.StandardTileType"  : 1,
		"sap.m.SwipeDirection"  : 2,
		"sap.m.SwitchType"  : 1,
		"sap.ui.commons.ButtonStyle"  : 3,
		"sap.ui.commons.HorizontalDividerHeight"  : 1,
		"sap.ui.commons.HorizontalDividerType"  : 1,
		"sap.ui.commons.LabelDesign"  : 1,
		"sap.ui.commons.MenuBarDesign"  : 1,
		"sap.ui.commons.MessageType"  : 1,
		"sap.ui.commons.Orientation"  : 1,
		"sap.ui.commons.RatingIndicatorVisualMode"  : 1,
		"sap.ui.commons.RowRepeaterDesign"  : 1,
		"sap.ui.commons.SplitterSize"  : 2,
		"sap.ui.commons.TextViewColor"  : 1,
		"sap.ui.commons.TextViewDesign"  : 2,
		"sap.ui.commons.TitleLevel"  : 1,
		"sap.ui.commons.ToolbarDesign"  : 1,
		"sap.ui.commons.ToolbarSeparatorDesign"  : 1,
		"sap.ui.commons.TriStateCheckBoxState"  : 1,
		"sap.ui.commons.enums.AreaDesign"  : 2,
		"sap.ui.commons.enums.BorderDesign"  : 3,
		"sap.ui.commons.enums.Orientation"  : 1,
		"sap.ui.commons.form.GridElementCells"  : 1,
		"sap.ui.commons.form.SimpleFormLayout"  : 1,
		"sap.ui.core.AccessibleRole"  : 11,
		"sap.ui.core.BarColor"  : 2,
		"sap.ui.core.CSSSize"  : 112,
		"sap.ui.core.Collision"  : 3,
		"sap.ui.core.Design"  : 8,
		"sap.ui.core.Dock"  : 6,
		"sap.ui.core.IconColor"  : 1,
		"sap.ui.core.ImeMode"  : 8,
		"sap.ui.core.Percentage"  : 3,
		"sap.ui.core.Scrolling"  : 2,
		"sap.ui.core.TextAlign"  : 17,
		"sap.ui.core.TextDirection"  : 19,
		"sap.ui.core.URI"  : 57,
		"sap.ui.core.ValueState"  : 21,
		"sap.ui.core.VerticalAlign"  : 1,
		"sap.ui.core.Wrapping"  : 2
	},
	
	isEnumObj: function(obj) {
		for ( var key in obj) {
			var val = obj[key];
			if ( ! (typeof (val) =="string"))
				return false;
		}
		return true;
	},
	
	/**
	 * Now some property have factory function 
	getName: function () { return name; }
	isArrayType: function () { return false; }
	isValid: function
	 */
	checkCheckableType: function() {
		var aType = ["sap.ui.commons.SplitterSize", "sap.ui.commons.form.GridElementCells", "sap.ui.core.CSSSize", "sap.ui.core.Collision", 
		         	"sap.ui.core.Dock", "sap.ui.core.Percentage", "sap.ui.core.URI"];

		var ret = [];
		aType.forEach( function(name) {
			var obj = eval(name);
			
			if ( ! (  ('getName' in  obj)  &&
					  ('isArrayType' in  obj)  &&
					  ('isValid' in  obj)) ) {
				
				ret.push(name);
			}
		});
		
		console.error("Not checkable type", ret);
	},
	
	//For mObj: Not enum obj ["sap.ui.commons.form.GridElementCells", "sap.ui.core.CSSSize", "sap.ui.core.URI"] 
	 //for sap.m, commons, form:
	//["sap.ui.commons.SplitterSize", "sap.ui.commons.form.GridElementCells", "sap.ui.core.CSSSize", "sap.ui.core.Collision", 
	//"sap.ui.core.Dock", "sap.ui.core.Percentage", "sap.ui.core.URI"]
	
	checkPropTypes: function() {
		var aNotEnum = [];
		var aEnum = [];
		
		for ( var key in this.mType) {
			//var val = this.mType[key];
			var obj = eval(key);
			if ( this.isEnumObj(obj)) {
				aEnum.push(key);
			} else {
				aNotEnum.push(key);
			}
		}
		
		console.error("Enumable obj", aEnum);
		console.error("Not Enumable obj", aNotEnum);
	},
	
	
	showObj: function(obj) {
		for ( var key in obj) {
			var val = obj[key];
			console.log(key + " -> ", val );
		}
	}
	
	/*
	 *
	getName: function () { return name; }
	isArrayType: function () { return false; }
	isValid: function (vValue) {
	*/
	
/*any: 2
boolean: 177
float: 10
int: 27
object: 2
string: 104
*/
};
 

function  showLibraryInfo() {
	var results = "Librarys,controls,elements\r\n";
	var libs = sap.ui.getCore().getLoadedLibraries();
	for (var libName in libs) {
		if (libName.indexOf('sap.') === 0) {
			var lib = libs[libName];
			results += libName + "," + lib.controls.length + "," + lib.elements.length + "\r\n";
		}
	}
	console.error(results);
}
