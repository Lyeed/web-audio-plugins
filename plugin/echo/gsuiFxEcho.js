"use strict";

class gsuiFxEcho {
	constructor() {
		const root = gsuiFxEcho.template.cloneNode( true ),
            beatsInput = root.querySelector( ".gsuiFxEcho-beats" ),
            echoConfigWrap = root.querySelector( ".gsuiFxEcho-echoSliders" ),
            dotsLink = root.querySelector( ".gsuiFxEcho-dotsLink" ),
            dots = new gsuiDotline(),
            gain = new gsuiSlider(),
            dotGain = new gsuiSlider(),
            dotLowpass = new gsuiSlider(),
            dotHighpass = new gsuiSlider(),
            blines = new gsuiBeatlines( dots.rootElement );

		this.rootElement = root;
        this._elGain = gain;
        this._elBeats = beatsInput;
        this._elDots = dots;
        this._elDotLowpass = dotLowpass;
        this._elDotGain = dotGain;
        this._elDotHighpass = dotHighpass;
        this._elDotConfigWrap = echoConfigWrap;
        this._currentDot = null;
		this.oninput =
		this.onchange = () => {};
		this.data = this._proxyCreate();
        this._blines = blines;
        this._blinesW = 0;
        Object.seal( this );

        root.querySelector( ".gsuiFxEcho-gainWrap" ).append( dotGain.rootElement );
        root.querySelector( ".gsuiFxEcho-lowpassWrap" ).append( dotLowpass.rootElement );
        root.querySelector( ".gsuiFxEcho-highpassWrap" ).append( dotHighpass.rootElement );
        root.querySelector( ".gsuiFxEcho-configWrap" ).append( gain.rootElement );
        root.querySelector( ".gsuiFxEcho-dotsWrap" ).append( dots.rootElement );

        dots.options( { step: .001, maxX: 10, minX: 0, maxY: 1, minY: -1 } );
        dots.dotsMoveMode( "free" );
        gain.options( { type: "circular", min: 0, max: 1, step: 0.05, value: 1 } );
        dotGain.options( { type: "circular", min: 0, max: 1, step: 0.01, value: 1 } );
        dotLowpass.options( { type: "circular", min: 0, max: 1, step: 0.01, value: 1 } );
        dotHighpass.options( { type: "circular", min: 0, max: 1, step: 0.01, value: 1 } );

        blines.render();

        dots.onselect = this._onClickDot.bind( this );
        dotsLink.onchange = this._onchangeDotsLinkInput.bind( this );
        beatsInput.onchange = this._onchangeBeatsInput.bind( this );
        gain.oninput = this._oninputGainSlider.bind( this );
        gain.onchange = this._onchangeGainSlider.bind( this );
        dotGain.oninput = this._oninputEchoGainSlider.bind( this );
        dotGain.onchange = this._onchangeEchoGainSlider.bind( this );
        dotLowpass.oninput = this._oninputEchoLowpassSlider.bind( this );
        dotLowpass.onchange = this._onchangeEchoLowpassSlider.bind( this );
        dotHighpass.oninput = this._oninputEchoHighpassSlider.bind( this );
        dotHighpass.onchange = this._onchangeEchoHighpassSlider.bind( this );
        dots.oninput = this._oninputDots.bind( this );
        dots.onchange = this._onchangeDots.bind( this );
	}

    attached() {
        this._elDots.attached();
        this._elDotGain.attached();
        this._elDotLowpass.attached();
        this._elDotHighpass.attached();
        this._elGain.attached();
        this.resized();
    }
    resized() {
        this._blinesW = this._blines.rootElement.getBoundingClientRect().width;
    }
    timeSignature( a, b ) {
        this._blines.timeSignature( a, b );
    }

	// private:
	_updateParam( param, val ) {
		switch ( param ) {
            case "echoGain":
                this._elDotGain.value = val;
                break;
            case "echoLowpass":
                this._elDotLowpass.value = val;
                break;
            case "echoHighpass":
                this._elDotHighpass.value = val;
                break;
            case "echoes":
                this._elDots.value = val;
                break;
            case "gain":
                this._elGain.value = val;
                break;
            case "beats":
                this._elBeats.value = val;
                this._blines.pxPerBeat( this._blinesW / val );
                this._blines.render();
                this._elDots.options( { maxX: val } );
                break;
		}
	}
	_callOninput( param, val ) {
		this.oninput( param, val );
	}
	_callOnchange( obj ) {
		this.onchange( obj );
	}

	// events:
    _onchangeDotsLinkInput( e ) {
        this._elDots.dotsMoveMode( e.target.checked ? "linked" : "free" );
    }

    _onClickDot(dot) {
        this._currentDot = dot;
        if (dot) {
            const id = +dot.dataset.id;
            const echo = this.data.echoes[id];
            if (echo) {
                this._elDotGain.setValue(echo.gain);
                this._elDotLowpass.setValue(echo.lowpass);
                this._elDotHighpass.setValue(echo.highpass);
                if ( this._elDotConfigWrap.classList.contains( "hidden" ) ) {
                    this._elDotConfigWrap.classList.remove( "hidden" );
                }
            } else if ( !this._elDotConfigWrap.classList.contains( "hidden" ) ) {
                this._elDotConfigWrap.classList.add( "hidden" );
            }
        } else if ( !this._elDotConfigWrap.classList.contains( "hidden" ) ) {
            this._elDotConfigWrap.classList.add( "hidden" );
        }
    }

    _oninputEchoHighpassSlider() {
        this._callOninput( "echoHighpass", +this._elDotHighpass.value );
    }
    _onchangeEchoHighpassSlider() {
        const highpass = +this._elDotHighpass.value;

        if ( this._currentDot ) {
            const id = +this._currentDot.dataset.id;
            const echo = this.data.echoes[id];

            if (highpass !== echo.highpass) {
                this.data.echoes[id].highpass = highpass;
                this._callOnchange( { echoes: { [id]: { highpass } } } );
            }
        }
    }

    _oninputEchoGainSlider() {
        this._callOninput( "echoGain", +this._elDotGain.value );
    }
    _onchangeEchoGainSlider() {
        const gain = +this._elDotGain.value;

        if ( this._currentDot ) {
            const id = +this._currentDot.dataset.id;
            const echo = this.data.echoes[id];

            if (gain !== echo.gain) {
                this.data.echoes[id].gain = gain;
                this._callOnchange( { echoes: { [id]: { gain } } } );
            }
        }
    }

    _oninputEchoLowpassSlider() {
        this._callOninput( "echoLowpass", +this._elDotLowpass.value );
    }
    _onchangeEchoLowpassSlider() {
        const lowpass = +this._elDotLowpass.value;

        if ( this._currentDot ) {
            const id = +this._currentDot.dataset.id;
            const echo = this.data.echoes[id];

            if (lowpass !== echo.lowpass) {
                this.data.echoes[id].lowpass = lowpass;
                this._callOnchange( { echoes: { [id]: { lowpass } } } );
            }
        }
    }

    _onchangeBeatsInput() {
        const beats = +this._elBeats.value;

        this.data.beats = beats;
        this._callOnchange( { beats } );
    }

    _oninputGainSlider() {
        const gain = +this._elGain.value;

        this._callOninput( "gain", gain );
    }
    _onchangeGainSlider() {
        const gain = +this._elGain.value;

        this.data.gain = gain;
        this._callOnchange( { gain } );
    }

    _oninputDots( echoes ) {
        this._callOninput( "echoes", echoes );
    }
    _onchangeDots( dots ) {
        const echoes = {};

        Object.keys( dots ).forEach( key => {
            const dot = dots[ key ];
            if (!dot) {
                echoes[ key ] = undefined;
            } else {
                const x = dot.x;
                const y = dot.y;

                echoes[ key ] = {};
                if (!this.data.echoes[ key ]) {
                    this.data.echoes[ key ] = {};
                }
                if ( x !== undefined ) { echoes[ key ].delay = x; this.data.echoes[ key ].delay = x; }
                if ( y !== undefined ) { echoes[ key ].pan = y; this.data.echoes[ key ].pan = y; }
            }
        });

        this._callOnchange( { echoes } );
    }

    _addEcho( id ) {
        lg( "uiFxAddEcho", id );
    }
    _removeEcho( id ) {
        lg( "uiFxRemoveEcho", id );
    }
    _updateEcho( id, param, val ) {
        lg( "uiFxUpdateEcho", id, param, val );
    }

	// proxy:
    _proxyCreate() {
        return Object.seal( new Proxy( {
            beats: 0,
            gain: 1,
            echoes: new Proxy( {}, {
                set: this._proxyAddEcho.bind( this ),
                deleteProperty: this._proxyRemoveEcho.bind( this ),
            } ),
        }, {
           set: this._proxyUpdate.bind( this ),
        } ));
    }
    _proxyUpdate( tar, id, obj ) {
        tar [ id ] = obj;
        this._updateParam( id, obj );
        return true;
    }
    _proxyAddEcho( tar, id, obj ) {
        const set = this._proxyUpdateEcho.bind( this, +id ),
            data = Object.seal( {
                pan: 0,
                gain: 1,
                delay: 0,
                lowpass: 1,
                highpass: 1,
            } ),
            prox = new Proxy( data, { set } );

        tar[ id ] = prox;
        this._addEcho( +id );
        Object.assign( prox, obj );
        return true;
    }
    _proxyRemoveEcho( tar, id ) {
        delete tar[ id ];
        this._removeEcho( +id );
        return true;
    }
    _proxyUpdateEcho( id, tar, prop, val ) {
        tar[ prop ] = val;
        this._updateEcho( id, prop, val );
        return true;
    }
}

gsuiFxEcho.template = document.querySelector( "#gsuiFxEcho" );
gsuiFxEcho.template.remove();
gsuiFxEcho.template.removeAttribute( "id" );
