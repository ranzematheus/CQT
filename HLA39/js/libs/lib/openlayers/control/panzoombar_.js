/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/PanZoom.js
 */

/**
 * Class: OpenLayers.Control.PanZoomBar
 * The PanZoomBar is a visible control composed of a
 * <OpenLayers.Control.PanPanel> and a <OpenLayers.Control.ZoomBar>. 
 * By default it is displayed in the upper left corner of the map as 4
 * directional arrows above a vertical slider.
 *
 * Inherits from:
 *  - <OpenLayers.Control.PanZoom>
 */
 OpenLayers.Control.PanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoom, {



    /** 
     * APIProperty: zoomStopWidth
     */
    zoomStopWidth: 27,

    /** 
     * APIProperty: zoomStopHeight
     */
    zoomStopHeight: 23,

    /** 
     * Property: slider
     */
    slider: null,

    /** 
     * Property: sliderEvents
     * {<OpenLayers.Events>}
     */
    sliderEvents: null,

    /** 
     * Property: zoombarDiv1
     * {DOMElement}
     */
    zoombarDiv: null,

    /** 
     * APIProperty: zoomWorldIcon
     * {Boolean}
     */
    zoomWorldIcon: false,

    /**
     * APIProperty: panIcons
     * {Boolean} Set this property to false not to display the pan icons. If
     * false the zoom world icon is placed under the zoom bar. Defaults to
     * true.
     */
    panIcons: true,

    /**
     * APIProperty: forceFixedZoomLevel
     * {Boolean} Force a fixed zoom level even though the map has 
     *     fractionalZoom
     */
    forceFixedZoomLevel: false,

    /**
     * Property: mouseDragStart
     * {<OpenLayers.Pixel>}
     */
    mouseDragStart: null,

    /**
     * Property: deltaY
     * {Number} The cumulative vertical pixel offset during a zoom bar drag.
     */
    deltaX: null,

    /**
     * Property: zoomStart
     * {<OpenLayers.Pixel>}
     */
    zoomStart: null,
	/**
     * Property: zoomBarInverted
     * {Boolean} Se a barra de zoom deve ser invertida.
     */
    zoomBarInverted: true,

    /**
     * Constructor: OpenLayers.Control.PanZoomBar
     */ 

    /**
     * APIMethod: destroy
     */
    destroy: function() {
	

        this._removeZoomBar();

        this.map.events.un({
            "changebaselayer": this.redraw,
            scope: this
        });

        OpenLayers.Control.PanZoom.prototype.destroy.apply(this, arguments);

        delete this.mouseDragStart;
        delete this.zoomStart;
    },
    
    /**
     * Method: setMap
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.PanZoom.prototype.setMap.apply(this, arguments);
        this.map.events.register("changebaselayer", this, this.redraw);
    },

    /** 
     * Method: redraw
     * clear the div and start over.
     */
    redraw: function() {
        if (this.div != null) {
            this.removeButtons();
            this._removeZoomBar();
        }  
        this.draw();
    },
    
    /**
    * Method: draw 
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} 
    */
	
   draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
		
        px = this.position.clone();
		
		
		//....  -> x = 4 e y = 4;
		
		
        // place the controls
        this.buttons = [];
        var sz = {w: 31, h: 26};  /* Tamanho dos botoes */
	
        if (!this.panIcons) {
			var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);
            var wposition = sz.w;
			
            this._addButton("zoomin", "btMais.png", centered.add(sz.w*3+5,0), sz);
            centered = this._addZoomBar(centered.add(sz.w * 4 + 5,0));
            this._addButton("zoomout", "btMenos.png", centered, sz);
			
			
        }
        else {
			alert(px +" "+ sz)
			alert(centered +" ")
            this._addButton("zoomout", "btMais.png", px, sz);
			this._addZoomBar(px.add(sz.w,0));
	        this._addButton("zoomin", "btMenos.png", sz.w, sz);

        }
        return this.div;
    },

    /** 
    * Method: _addZoomBar
    * 
    * Parameters:
    * centered - {<OpenLayers.Pixel>} where zoombar drawing is to start.
    */

     _addZoomBar:function(centered) {
        var imgLocation = OpenLayers.Util.getImageLocation("hand.png");
        var id = this.id + "_" + this.map.id;
        var zoomsToEnd = this.map.getNumZoomLevels() - 1 - this.map.getZoom();
		
        var slider = OpenLayers.Util.createAlphaImageDiv(id,
                       centered.add(zoomsToEnd * this.zoomStopWidth,1), 
                       {w: 25, h: 25},  /* tamanho do drag */
                       imgLocation,
                       "absolute");

        slider.style.cursor = "move";
        this.slider = slider;
        
        this.sliderEvents = new OpenLayers.Events(this, slider, null, true,
                                            {includeXY: true});
        this.sliderEvents.on({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp
        });
        
        var sz = {
            w: this.zoomStopWidth * this.map.getNumZoomLevels(),
            h: this.zoomStopHeight 
        };
		
		/*  Area de Scroll da barra   */
		
			var imgLocation = OpenLayers.Util.getImageLocation("slide2.png");
			var div = null;
			
			div = OpenLayers.Util.createDiv(
							'OpenLayers_Control_PanZoomBar_Zoombar',
							centered,
							sz,
							imgLocation); 
							
			div.className = "olButton";
			this.zoombarDiv = div;
			
			this.div.appendChild(div);

			this.startLeft = parseInt(div.style.left);
			
			this.div.appendChild(slider);

			this.map.events.register("zoomend", this, this.moveZoomBar);
			
			centered = centered.add(this.zoomStopWidth * this.map.getNumZoomLevels(),
				0);
		},
	
	/*  Area de Scroll da barra   */
    
    /**
     * Method: _removeZoomBar
     */
	 
    _removeZoomBar: function() {
        this.sliderEvents.un({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp
        });
        this.sliderEvents.destroy();
        
        this.div.removeChild(this.zoombarDiv);
        this.zoombarDiv = null;
        this.div.removeChild(this.slider);
        this.slider = null;
        
        this.map.events.unregister("zoomend", this, this.moveZoomBar);
    },
    
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
	 
    onButtonClick: function(evt) {
        OpenLayers.Control.PanZoom.prototype.onButtonClick.apply(this, arguments);
        if (evt.buttonElement === this.zoombarDiv) {
            var levels = evt.buttonXY.x / this.zoomStopWidth;
            if(this.forceFixedZoomLevel || !this.map.fractionalZoom) {
                levels = Math.floor(levels);
            }    
			
            var zoom = (this.map.getNumZoomLevels() - 1) - levels; 
            zoom = Math.min(Math.max(zoom, 0), this.map.getNumZoomLevels() - 1);

			if (this.zoomBarInverted) {
				zoom = ((this.map.getNumZoomLevels() - 1) - zoom);
			} 

            this.map.zoomTo(zoom);
        }
    },
    
    /**
     * Method: passEventToSlider
     * This function is used to pass events that happen on the div, or the map,
     * through to the slider, which then does its moving thing.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     */
    passEventToSlider:function(evt) {
        this.sliderEvents.handleBrowserEvent(evt);
    },
    
    /*
     * Method: zoomBarDown
     * event listener for clicks on the slider
     *
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     */
	 
    zoomBarDown:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && !OpenLayers.Event.isSingleTouch(evt)) {
            return;
        }
        this.map.events.on({
            "touchmove": this.passEventToSlider,
            "mousemove": this.passEventToSlider,
            "mouseup": this.passEventToSlider,
            scope: this
        });
        this.mouseDragStart = evt.xy.clone();
        this.zoomStart = evt.xy.clone();
        this.div.style.cursor = "move";
        // reset the div offsets just in case the div moved
        this.zoombarDiv.offsets = null; 
        OpenLayers.Event.stop(evt);
    },
    
    /*
     * Method: zoomBarDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.  Here we must ensure that the slider doesn't go beyond the
     * bottom/top of the zoombar div, as well as moving the slider to its new
     * visual location
     *
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     */
	 
    zoomBarDrag:function(evt) {
        if (this.mouseDragStart != null) {
		
            var deltaX = this.mouseDragStart.x - evt.xy.x;
			
            var offsets = OpenLayers.Util.pagePosition(this.zoombarDiv);
			
//			if (evt.xy.x > (-(parseInt(this.zoombarDiv.style.width))/5)  &&  evt.xy.x < ((parseInt(this.zoombarDiv.style.width))/2)) {
				var newLeft = parseInt(this.slider.style.left) - deltaX;
				
				if (newLeft > (parseInt(this.zoombarDiv.style.width) - parseInt(this.slider.style.width) + parseInt(this.zoombarDiv.style.left))) {
					newLeft = parseInt(this.zoombarDiv.style.width) - parseInt(this.slider.style.width) + parseInt(this.zoombarDiv.style.left);
				} else if (newLeft < parseInt(this.zoombarDiv.style.left)) {
					newLeft = parseInt(this.zoombarDiv.style.left);
				}
				
				this.slider.style.left = newLeft+"px";
				this.mouseDragStart = evt.xy.clone();
            //}
			
            // set cumulative displacement
            this.deltaX = this.zoomStart.x - evt.xy.x;
            OpenLayers.Event.stop(evt);
        }
    },
    
    /*
     * Method: zoomBarUp
     * Perform cleanup when a mouseup event is received -- discover new zoom
     * level and switch to it.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>} 
     */
	 
     zoomBarUp:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && evt.type !== "touchend") {
            return;
        }
        if (this.mouseDragStart) {
            this.div.style.cursor="";
            this.map.events.un({
                "touchmove": this.passEventToSlider,
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            var zoomLevel = this.map.zoom;
			
			zoomLevel = ((parseInt(this.zoombarDiv.style.width) - parseInt(this.slider.style.left) 
				+ parseInt(this.zoombarDiv.style.left) + parseInt(this.slider.style.width)/2) / this.zoomStopWidth) - 1;

            if (!this.forceFixedZoomLevel && this.map.fractionalZoom) {
			
                //zoomLevel += this.deltaX/this.zoomStopWidth;
                zoomLevel = Math.min(Math.max(zoomLevel, 0), 
                                     this.map.getNumZoomLevels() - 1);
									 
            } else {
                //zoomLevel += this.deltaX/this.zoomStopWidth;
                zoomLevel = Math.max(Math.round(zoomLevel), -1);  
				
            }

			if (this.zoomBarInverted) {
				zoomLevel = ((this.map.getNumZoomLevels() - 1) - zoomLevel);
			} 
			
            this.map.zoomTo(zoomLevel);
			this.moveZoomBar();
            this.mouseDragStart = null;
            this.zoomStart = null;
            this.deltaX = 0;
            OpenLayers.Event.stop(evt);
        }
    },
    
    /*
    * Method: moveZoomBar
    * Change the location of the slider to match the current zoom level.
    */
   moveZoomBar:function() {
		var newLeft = 0;
		if (this.zoomBarInverted) {
			newLeft = this.map.getZoom() * this.zoomStopWidth + this.startLeft + 1;
		} else {
			newLeft = ((this.map.getNumZoomLevels()-1) - this.map.getZoom()) * 
				this.zoomStopWidth + this.startLeft + 1;
		}
		
        this.slider.style.left = newLeft + "px";
		// alert(this.slider.style.left);
    },     

    CLASS_NAME: "OpenLayers.Control.PanZoomBar"
	
});