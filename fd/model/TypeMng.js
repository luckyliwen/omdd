fd.model.TypeMng = {
		
	init: function() {
		this._oModel = new sap.ui.model.json.JSONModel();
		this._oModel.setData(this._mData);
		this._oModel.setSizeLimit(1000);

		for (var key in this._mData) {
			if (key === "types")
				continue;

			var options = this._mData[key].formatOptions;
			var name = options.length ? "---Choose one option below---" : "--## No Options ##--";
			options.unshift( {name: name});

			var constraints = this._mData[key].constraints;

			//for the  "minimum"  and  "maximum" if not set type, then set default to int 
			for (var i=0; i < constraints.length; i++) {
				var  item = constraints[i];
				if ( ! item.type ) {
					item.type = "int";
				}
			}
			
			name = constraints.length ? "---Choose one or several constraints below---" : "--## No Constraint ##--";
			constraints.unshift({name: name});
		}
	},

	getModel: function( ) {
	    return this._oModel;
	},

	getTypePath:function( evt ) {
	    return "/types";
	},

	getFormatOptionPath: function(type) {
		fd.assert(  type in this._mData);
		return "/" + type + "/formatOptions";
	},

	getConstraintPath: function(type) {
		fd.assert(  type in this._mData);
		return "/" + type + "/constraints";
	},
	
	_mData : {
		types: [
			{ name: "---Choose one type below---" , 		key: "" },
			{ name: "sap.ui.model.type.Boolean" , 		key: "sap.ui.model.type.Boolean" },
			{ name: "sap.ui.model.type.Currency" , 		key: "sap.ui.model.type.Currency" },
			{ name: "sap.ui.model.type.Date" , 		    key: "sap.ui.model.type.Date" },
			{ name: "sap.ui.model.type.Datetime" , 		key: "sap.ui.model.type.Datetime" },
			{ name: "sap.ui.model.type.FileSize" , 		key: "sap.ui.model.type.FileSize" },
			{ name: "sap.ui.model.type.Float" , 		key: "sap.ui.model.type.Float" },
			{ name: "sap.ui.model.type.Integer" , 		key: "sap.ui.model.type.Integer" },
			{ name: "sap.ui.model.type.String" , 		key: "sap.ui.model.type.String" },
			{ name: "sap.ui.model.type.Time",		    key :"sap.ui.model.type.Time" }
		],

		"sap.ui.model.type.Boolean": {
			formatOptions: [ ],
			constraints : [ ]
		},
		"sap.ui.model.type.Currency": {
			formatOptions: [
                {name: "style", type: "string",    explain: ":: short, long, standard"},
			    {name: "source", type: "",    explain: "additional set of format options to be used if the property in the model is not of type string and needs formatting as well."},
				{name: "minIntegerDigits", type: "int",    explain: "minimal number of non-decimal digits"},
				{name: "maxIntegerDigits", type: "int",    explain: "maximum number of non-decimal digits"},
				{name: "minFractionDigits", type: "int",    explain: "minimal number of decimal digits"},
				{name: "maxFractionDigits", type: "int",    explain: "maximum number of decimal digits"},
				{name: "decimals",      type: "int",    explain: "the number of decimal digits"},
				{name: "shortDecimals", type: "int",    explain: "defines the number of decimal in the shortified format string. If this isn't specified, the 'decimals' options is used"},
				{name: "pattern",         type: "string",    explain: "CLDR number pattern which is used to format the number"},
				{name: "groupingEnabled",   type: "",    explain: "whether grouping is enabled (show the grouping separators)"},
				{name: "groupingSeparator", type: "",    explain: " the used grouping separator"},
				{name: "decimalSeparator",  type: "",    explain: "the used decimal separator"},
				{name: "plusSign",          type: "string",    explain: "used plus symbol"},
				{name: "minusSign",          type: "string",    explain: "used minus symbol"},
				{name: "parseAsString", type: "boolean",    explain: "since 1.28.2 defines whether to output string from parse function in order to keep the precision for big numbers"},
				{name: "roundingMode", type: "sap.ui.core.format.NumberFormat.RoundingMode",    
					explain: "specifies a rounding behavior for discarding the digits after the maximum fraction digits defined by maxFractionDigits. Rounding will only be applied, if the passed value if of type number. This can be assigned by value in RoundingMode or a function which will be used for rounding the number. The function is called with two parameters: the number and how many decimal digits should be reserved."},
				{name: "showMeasure", type: "boolean",    explain: "whether the measure according to the format is shown"},
				{name: "currencyCode", type: "boolean",    explain: "whether the currency is shown as code in currency format"},
				{name: "currencyContext", type: "string",    explain: "It can be set either with 'standard' (the default value) or with 'accounting' for an accounting specific currency display"}
			 ],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},

		"sap.ui.model.type.Date": {
			formatOptions: [ 
			  {name: "source", type: "string",        explain: "additional set of options used to create a second DateFormat object for conversions between string values in the data source (e.g. model) and Date"},
			  {name:  "pattern", type: "string",   explain: "a data pattern in LDML format. It is not verified whether the pattern represents only a date."},
			  {name: "style", type: "fd.formatStyle", explain: ":: short, medium, long"},
			  {name: "strictParsing", type: "boolean",  explain: "if true, by parsing it is checked if the value is a valid date"}, 
			  {name: "relative",      type: "boolean",  explain: "if true, the date is formatted relatively to todays date if it is within the given day range, e.g. 'today', 'yesterday', 'in 5 days'"},
			  {name: "UTC",           type: "boolean",  explain: "if true, the date is formatted and parsed as UTC instead of the local timezone"} ,
			  {name: "calendarType",  type: "sap.ui.core.CalendarType", explain: "The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale."},
			  {name: "relativeRange", type: "int[]",    explain: "the day range used for relative formatting (default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively"}, 
			],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},
		
		"sap.ui.model.type.DateTime": {
			formatOptions: [ 
			  {name:  "pattern", type: "string",   explain: "a data pattern in LDML format. It is not verified whether the pattern represents only a date."},			
			  {name: "style", type: "fd.formatStyle", explain: ":: short, medium, long"},
			  {name: "strictParsing", type: "boolean",  explain: "if true, by parsing it is checked if the value is a valid date"}, 
			  {name: "UTC",           type: "boolean",  explain: "if true, the date is formatted and parsed as UTC instead of the local timezone"} ,
			  {name: "calendarType",  type: "sap.ui.core.CalendarType", explain: "The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale."},
			],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},	
		//?? sap.ui.core.format.NumberFormat.getIntegerInstance can't find the options
		"sap.ui.model.type.FileSize": {
			formatOptions: [ 
			  {name: "source", type: "object", explain: "additional set of options used to create a second FileSizeFormat object for conversions between string values in the data source (e.g. model) and a numeric byte representation. This second format object is used to convert from a model string to numeric bytes before converting to string with the primary format object. Vice versa, this 'source' format is also used to format an already parsed external value (e.g. user input) into the string format expected by the data source"},
			],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},	

		"sap.ui.model.type.Float": {
			formatOptions: [ 
			  {name: "source", type: "object", explain: "additional set of format options to be used if the property in the model is not of type string and needs formatting as well. In case an empty object is given, the default is disabled grouping and a dot as decimal separator."},
			],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},	

		"sap.ui.model.type.Integer": {
			formatOptions: [ 
			  {name: "source", type: "object", explain: "additional set of format options to be used if the property in the model is not of type string and needs formatting as well. In case an empty object is given, the default is disabled grouping and a dot as decimal separator."},
			],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		},	


		"sap.ui.model.type.String": {
			formatOptions: [ {name: "source"}, {name: ""} ],
			constraints : [
				{name: "minLength",  type:"int"},
				{name: "maxLength",  type:"int"}, 
				{name: "startsWith",  type:"string"},
				{name: "startsWithIgnoreCase",  type:"string" }, 
				{name: "endsWith",  type:"string"},
				{name: "endsWithIgnoreCase",  type:"string"},
				{name: "contains",  type:"string"},
				{name: "equals",  type:"string"},
				{name: "search",  type:"RegExp"}
			]
		},

		"sap.ui.model.type.Time": {
			formatOptions: [ 
			  {name:  "pattern", type: "string",   explain: "a data pattern in LDML format. It is not verified whether the pattern represents only a date."},			
			  {name: "style", type: "fd.formatStyle", explain: ":: short, medium, long"},
			  {name: "strictParsing", type: "boolean",  explain: "if true, by parsing it is checked if the value is a valid date"}, 
			  {name: "UTC",           type: "boolean",  explain: "if true, the date is formatted and parsed as UTC instead of the local timezone"} ,
			  {name: "calendarType",  type: "sap.ui.core.CalendarType", explain: "The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale."}
			  ],
			constraints : [{name: "minimum"},{name: "maximum"} ]
		}
	}
};

