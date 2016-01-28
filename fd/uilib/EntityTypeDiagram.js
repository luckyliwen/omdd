jQuery.sap.declare("fd.uilib.EntityTypeDiagram");

/**
 * 
 */
sap.ui.core.Control.extend("fd.uilib.EntityTypeDiagram", {
	metadata : {
		properties : {
			"visible" : {type : "boolean", group : "", defaultValue : true},

			"width" : {type : "int", defaultValue : 1024},
			"height" : {type : "int", defaultValue : 800},

			//the entity type name, used to watch binding value changed
			"name"   : {type : "string", defaultValue : ""},
		},
		
	},

	/*fd.XLayout: {
		Center: 'Center', //only center
		LeftCenter: 'LeftCenter',  //has from 
		CenterRight: 'CenterRight', //has to 
		LeftCenterRight: 'LeftCenterRight'
	};

fd.YLayout: {
		Center: 'Center',
		CenterDown: 'CenterDown'  //has the from +to with same name
	};*/

	setName:function( value) {
		
		if (!value)
			return;

		console.error('###change name', value);
	    this.setProperty('name', value);
		// this.createDiagram();
	},

	calcDiagramSize: function( mArg, etRelation, iSeq ) {
	    // var size = {width: 200};
	    var cnt = mArg.aKey.length + mArg.aNavi.length;

	    /*switch (etRelation) {
	    	case 'Self':
	    		break;
	    	case 'From':
	    		break;
	    	case 'To':
	    		break;
	    	case 'FromTo':
	    		break;
	    }*/
	    var height ;
	    if (cnt < 8) {
	    	height = 150;
	    } else {
	    	height = 150 + (cnt-8) * 12;
	    }
	    return {width: this.diagramWidth, height: height };
	},


	calcDigramPosition: function(etRelation, iSeq, size ) {
		var pos = {};
		var offset =0;

		//other diagram will depend on the xLayout, but the FromTo only depend on actually FromTo order
		if (etRelation == 'FromTo') {
			//down part need depend on the xLayout also 
			var remainSpace = 0;
			if (this.xLayout == 'Center' || this.xLayout == 'LeftCenterRight') {
				//center it
				remainSpace = this.totalWidth - ( this.downCount * (this.diagramWidth + this.xMargin)) + this.xMargin;
				pos.x = remainSpace / 2 + iSeq * (this.diagramWidth + this.xMargin);
			} else if (this.xLayout == "LeftCenter") {
				//align to right part
				remainSpace = this.totalWidth / 2 - ( this.downCount * (this.diagramWidth + this.xMargin)) + this.xMargin;
				pos.x = this.totalWidth / 2 + remainSpace / 2 + iSeq * (this.diagramWidth + this.xMargin);
			} else {
				//aligh to left part
				remainSpace = this.totalWidth / 2 - ( this.downCount * (this.diagramWidth + this.xMargin)) + this.xMargin;
				pos.x =  remainSpace / 2 + iSeq * (this.diagramWidth + this.xMargin);
			}
		} else {
		    switch (this.xLayout) {
		    	case 'LeftCenter':
		    		if (etRelation == 'Self') {
		    			pos.x = this.totalWidth / 4 * 3 - size.width /2;
		    		} else {
		    			offset =  (((this.leftCount - 1) / 2) - Math.abs(iSeq - (this.leftCount - 1) / 2)) * this.xMargin;
		    			pos.x = this.totalWidth / 4  - size.width /2 - offset;
		    		}
		    		break;
		    	case 'Center': 
		    		pos.x = this.totalWidth / 2 - size.width /2;
		    		break;
		    	case 'CenterRight':
		    		if (etRelation == 'Self') {
		    			pos.x = this.totalWidth / 4  - size.width /2;
		    		} else {
		    			offset =  (((this.rightCount - 1) / 2) - Math.abs(iSeq - (this.rightCount - 1) / 2)) * this.xMargin;
		    			pos.x = this.totalWidth / 4 * 3 - size.width /2 + offset;
		    		}
		    		break;
		    	case 'LeftCenterRight':
		    		if (etRelation == 'Self') {
		    			pos.x = this.totalWidth / 2 - size.width /2;
		    		} else if (etRelation == 'From') {
		    			offset =  (((this.leftCount - 1) / 2) - Math.abs(iSeq - (this.leftCount - 1) / 2)) * this.xMargin;
		    			pos.x = 100 - offset;
		    		} else {
		    			offset =  (((this.rightCount - 1) / 2) - Math.abs(iSeq - (this.rightCount - 1) / 2)) * this.xMargin;
		    			pos.x = this.totalWidth - 100 - size.width + offset;
		    		}
		    		break;
		    }
		}

	    
		if (etRelation == 'Self') {
			if (this.yLayout =='Center') {
				pos.y = this.totalHeight / 2 - size.height / 2 ;
			} else {
				var selfHeight = this.mDiagram['Self'].attributes.size.height;
				var maxDownHeightDia = _.max( this.mDiagram['FromTo'], function( dia ) {
				    return dia.attributes.size.height;
				} );
				pos.y = (this.totalHeight - selfHeight - maxDownHeightDia.attributes.size.height - this.diagramVerticalOffset) /2;
			}
		} else if (etRelation == 'From' || etRelation == 'To') {

			//for the first diagram, need get all height, then can center it, 
			//for the next diagram, just = previous + height + yMargin, and set the value
			var that = this;
			if (iSeq ==0) {
				var sum = _.sum( this.mDiagram[etRelation], function( dia) {
				    return dia.attributes.size.height + that.yMargin;
				} );
				sum -= this.yMargin; //only between them need margin
				pos.y = (this.totalHeight - sum) / 2;
				this.mYPosition[etRelation].push( pos.y);
			} else {
				pos.y = this.mYPosition[etRelation][ iSeq - 1] + 
					this.mDiagram[etRelation][iSeq-1].attributes.size.height + this.yMargin;
				this.mYPosition[etRelation].push( pos.y);
			}
		} else {
			var selfDiagram = this.mDiagram.Self;
			pos.y = selfDiagram.attributes.position.y + selfDiagram.attributes.size.height + this.diagramVerticalOffset;
		}

	    return pos;
	},
	
    createEntityTypeDiagram: function (mArg, etRelation, iSeq) {
        var attr;
        if( etRelation == "Self") {
            attr = {
                '.uml-class-name-rect': {
                    fill: '#feb662',
                    stroke: '#ffffff',
                    'stroke-width': 2
                },
                '.uml-class-attrs-rect': {
                    fill: '#fdc886',
                    stroke: '#fff',
                    'stroke-width': 1
                },
                '.uml-class-methods-rect': {
                    fill: '#fdc886',
                    stroke: '#fff',
                    'stroke-width': 1
                },

                '.uml-class-attrs-text': {
                    ref: '.uml-class-attrs-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle'
                },
                '.uml-class-methods-text': {
                    ref: '.uml-class-methods-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle'
                }
            };
        } else {
            attr = {
                '.uml-class-name-rect': {
                    fill: '#68ddd5',
                    stroke: '#ffffff',
                    'stroke-width': 2
                },
                '.uml-class-attrs-rect, .uml-class-methods-rect': {
                    fill: '#9687fe',
                    stroke: '#fff',
                    'stroke-width': 1
                },
                '.uml-class-methods-text, .uml-class-attrs-text': {
                    fill: '#fff'
                }
            };
        }

        var size = this.calcDiagramSize(mArg, etRelation, iSeq ); 
        // var position = this.getDigramPosition(etRelation, iSeq,size);
        var diagram =  new joint.shapes.uml.Class({
            size:  size,
            // position: position,
            name:  mArg.name,
            attributes: mArg.aKey,
            methods: mArg.aNavi,
            attrs: attr 
        });
        
        return diagram;
    },

    

    createLinkAndLabel: function(etRelation, sourceDiagram, targetDiagram, aMultiplicity, graph) {
    	var attrs =  {
            '.connection': { stroke: '#7c68fc', 'stroke-width': 3 }
        };
        var startEndPoint = { fill: '#4b4a67', stroke: 'green', d: 'M 10 0 L 0 5 L 10 10 z' };
        var endEndPoint = { fill: '#4b4a67', stroke: 'green', d: 'M 10 0 L 0 5 L 10 10 z' };

        if (etRelation == 'From' || etRelation == 'To') {
        	attrs['.marker-target'] = endEndPoint;
        } else {
        	attrs['.marker-source'] = startEndPoint;
        	attrs['.marker-target'] = endEndPoint;

        	attrs =  {
            	'.connection': { stroke: 'green', 'stroke-width': 4 }
        	};
        }

        var myLink = new joint.dia.Link({
            source: { id: sourceDiagram.id },
            target: { id: targetDiagram.id },
    		connector: {name: "smooth"},
            attrs: attrs 
        });
        var labels = this.createLabel(aMultiplicity);
        myLink.set(labels);
        return myLink.addTo(graph);
    },

    createLabel: function (aText) {
        return {
            labels: [
                {
                    position: 20,
                    attrs: {
                        text: {text: aText[0]},
                    }
                },
                {
                    position: -20,
                    attrs: {
                        text: {text: aText[1]},
                    }
                }
            ]
        };
    },

    calculateOverallLayout: function( et ) {
        var leftCount = et.aFrom ? et.aFrom.length : 0;
        var rightCount = 0;
        var downCount = 0;

        _.forEach( et.aNavigation, function( navi) {
            if (navi.bBidirection) {
            	downCount ++;
            } else {
            	rightCount ++;
            }
        });

        if (leftCount ==0 && rightCount ==0) {
        	this.xLayout = fd.XLayout.Center;
        } else if (leftCount !=0) {
        	if (rightCount==0) {
        		this.xLayout = fd.XLayout.LeftCenter;
        	} else {
        		this.xLayout = fd.XLayout.LeftCenterRight;
        	}
        } else {
        	this.xLayout = fd.XLayout.CenterRight;
        }

        if (downCount ==0) {
        	this.yLayout = fd.YLayout.Center;
        } else {
        	this.yLayout = fd.YLayout.CenterDown;
        }

        
        this.leftCount = leftCount;
        this.rightCount = rightCount;
        this.downCount = downCount;
    },

	setDiagramPosition : function(etRelation, diagram, iSeq) {
		var size = diagram.attributes.size;
		var pos = this.calcDigramPosition(etRelation, iSeq, size);
	    diagram.attributes.position = pos;
	},
		
	createEntityTypeAndLink: function(graph, et, globalData) {
		this.calculateOverallLayout(et);

		//first for the node itself 
		var i;
		var aNavi = _.map(et.aNavigation, 'name');

		var mData = {
			name: et.name,
			aKey:  et.aKey,
			aNavi: aNavi,
		};	  
		var masterDiagram = this.createEntityTypeDiagram(mData, fd.ETRelation.Self, 0);

		this.mDiagram = {};
		this.mDiagram['Self'] = masterDiagram;

		//then create the to 
		var iRight = 0;
		var iDown = 0;
		this.mDiagram['FromTo'] = [];
		this.mDiagram['To'] = [];
		this.mDiagram['From'] = [];

		for ( i=0; i < et.aNavigation.length; i++) {
			var navi  = et.aNavigation[i];
			var etName = et.aNavigation[i].entityType;
			var toEt =  _.find(globalData.aEntityType, {name: etName} );
			if (!toEt)
				continue;

			mData = {
				name: etName,
				aKey: toEt.aKey,
				aNavi: []
			};
			if (navi.bBidirection) {
				this.mDiagram['FromTo'][iDown]  = this.createEntityTypeDiagram(mData, fd.ETRelation.FromTo, iDown);
				this.mDiagram['FromTo'][iDown].set('aMultiplicity', navi.aMultiplicity);
				iDown++;
			} else {
				this.mDiagram['To'][iRight] =this.createEntityTypeDiagram(mData, fd.ETRelation.To, iRight);
				this.mDiagram['To'][iRight].set('aMultiplicity', navi.aMultiplicity);
				iRight ++;
			}
		}

		//then the from
		if (et.aFrom && et.aFrom.length>0) {
			for ( i=0; i < et.aFrom.length; i++) {
				var from = et.aFrom[i];
				etName = from.entityType;
				var fromEt =  _.find(globalData.aEntityType, {name: etName});
				if (!fromEt)
					continue;

				var fromNaviArr = _.map( fromEt.aNavigation, 'name');
				mData = {
					name: etName,
					aKey: fromEt.aKey,
					aNavi: fromNaviArr,
				};
				this.mDiagram['From'][i] = this.createEntityTypeDiagram(mData, fd.ETRelation.From, i);
				this.mDiagram['From'][i].set('aMultiplicity',from.aMultiplicity);
			}
		}

		//now has got all diagram's size, so can set the position
		this.mYPosition = {};
		this.mYPosition['FromTo'] = [];
		this.mYPosition['To'] = [];
		this.mYPosition['From'] = [];

		this.setDiagramPosition('Self', masterDiagram, 0);
		graph.addCell(masterDiagram);

		var that = this;
		_.each(this.mDiagram['FromTo'], function( dia, idx ) {
		    that.setDiagramPosition('FromTo', dia, idx);
		    graph.addCell(dia);
		    that.createLinkAndLabel('FromTo', masterDiagram, dia, dia.get('aMultiplicity'), graph);
		});
		_.each(this.mDiagram['To'], function( dia, idx ) {
		    that.setDiagramPosition('To', dia, idx);
		    graph.addCell(dia);
		    that.createLinkAndLabel('To', masterDiagram, dia, dia.get('aMultiplicity'), graph);
		});
		_.each(this.mDiagram['From'], function( dia, idx ) {
		    that.setDiagramPosition('From', dia, idx);
		    graph.addCell(dia);
		    that.createLinkAndLabel('From', dia, masterDiagram, dia.get('aMultiplicity'), graph);
		});
	},
	
	onAfterRendering: function() {

	},

	createDiagram: function() {
	    var id  = this.getId();
	    var dom = $("#" + id);
	    if (!dom || dom.length==0) {
	    	jQuery.sap.delayedCall(200, this, this.createDiagram);
	    } else {
	    	this.createDiagramImplementation(id, dom);
	    }
	},

	createDiagramImplementation: function( id, jDom ) {
		//binding not change, like switch between table and chart, so no need redraw ??
		/*if ( this.lastName == this.getName())
			return;*/

		this.totalWidth = jDom.width();
		this.totalHeight = jDom.height();
		if (this.totalHeight ==0)
			this.totalHeight = 800; //??later need get height by css

	    var graph = new joint.dia.Graph();
	    var paper = new joint.dia.Paper({
	        el: $('#' + id ),
	        width: this.totalWidth,
	        height: this.totalHeight,
	        model: graph,
	        gridSize: 1
	    });
	    var model = this.getModel();
	    var context = this.getBindingContext();
	    var et = model.getProperty( context.getPath());
	    var globalData = model.getData();
	    this.createEntityTypeAndLink(graph, et,globalData);

	    this.lastName = this.getName();
	},
	
	
	renderer : function(oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}

		oRm.write("<div style='height:100%' ");
		oRm.writeControlData(oControl);
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.write(">");

		jQuery.sap.delayedCall(100, oControl, oControl.createDiagram);
	},
	
	xMargin :  20 , //the space betwen horizontial
 	yMargin : 20,
 	diagramWidth : 200,
 	diagramVerticalOffset : 200  //height between center and heigh,

	/** global variables: 
	 xLayout, yLayout:  define the layout of overall diagram
	 mDiagram: {
		From: []
		To: [],
		FromTo: []
		Self: {}
	 },

	 mYPosition: {
		From: []
		To: [],
		FromTo: []
		Self: {}
	 }

	 totalHeight:  //total area for diagram
	 totalWidth:

	leftCount :  //how many diagrams for left,right,down part
	rightCount :
	downCount :  

	 */

});