"use strict";

class gsuiFxExample {
	constructor() {
		const root = gsuiFxExample.template.cloneNode( true ),
            beatsInput = root.querySelector( ".gsuiFxEcho-beats" ),
            echoConfigWrap = root.querySelector( ".gsuiFxEcho-echoWrap" ),
            dots = new gsuiDotline(),
            gain = new gsuiSlider(),
            dotGain = new gsuiSlider(),
            dotLowpass = new gsuiSlider(),
            blines = new gsuiBeatlines( dots.rootElement );

		this.rootElement = root;
        this._elGain = gain;
        this._elBeats = beatsInput;
        this._elDots = dots;
        this._elDotLowpass = dotLowpass;
        this._elDotGain = dotGain;
        this._elDotConfigWrap = echoConfigWrap;
		this.oninput =
		this.onchange = () => {};
		this.data = this._proxyCreate();
        this._blines = blines;
        this._blinesW = 0;
        Object.seal( this );

        root.querySelector( ".gsuiFxEcho-gainWrap" ).append( dotGain.rootElement );
        root.querySelector( ".gsuiFxEcho-lowpassWrap" ).append( dotLowpass.rootElement );
        root.querySelector( ".gsuiFxEcho-configWrap" ).append( gain.rootElement );
        this.rootElement.append( dots.rootElement );

        dots.options( { firstLinkedTo: 5, lastLinkedTo: 5, step: .001, maxX: 10, minX: 0, maxY: 1, minY: -1 } );
        gain.options( { type: "circular", min: 0, max: 1, step: 0.05, value: 1 } );
        dotGain.options( { type: "circular", min: 0, max: 1, step: 0.05, value: .5 } );
        dotLowpass.options( { type: "circular", min: 0, max: 2000, step: 20, value: 0 } );

        blines.render();

        dots.rootElement.addEventListener( "click", this._onClickDot.bind( this ));

        beatsInput.onchange = this._onchangeBeatsInput.bind( this );
        gain.oninput = this._oninputGainSlider.bind( this );
        gain.onchange = this._onchangeGainSlider.bind( this );
        dotGain.oninput = this._oninputEchoGainSlider.bind( this );
        dotGain.onchange = this._onchangeEchoGainSlider.bind( this );
        dotLowpass.oninput = this._oninputEchoLowpassSlider.bind( this );
        dotLowpass.onchange = this._onchangeEchoLowpassSlider.bind( this );
        dots.oninput = this._oninputDots.bind( this );
        dots.onchange = this._onchangeDots.bind( this );
	}

    attached() {
        this._elDots.attached();
        this._elDotGain.attached();
        this._elDotLowpass.attached();
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
                this._elDotGain.value = val;
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
    _onClickDot() {
        if (this._elDots.dotClicked && this._elDotConfigWrap.classList.contains( "hidden" ) ) {
            this._elDotConfigWrap.classList.remove( "hidden" );
        }
    }

    _oninputEchoGainSlider() {
        this._callOninput( "echoGain", +this._elDotGain.value );
    }
    _onchangeEchoGainSlider() {
        const dotClicked = this._elDots.dotClicked;
        const gain = +this._elDotGain.value;

        if ( dotClicked ) {
            const id = +dotClicked.dataset.dotsId.slice( -1 );
            const echo = this.data.echoes[id];

            if (gain !== echo.gain) {
                this._callOnchange( { echoes: { [id]: { gain } } } );
            }
        }
    }

    _oninputEchoLowpassSlider() {
        this._callOninput( "echoLowpass", +this._elDotLowpass.value );
    }
    _onchangeEchoLowpassSlider() {
        const dotClicked = this._elDots.dotClicked;
        const lowpass = +this._elDotLowpass.value;

        if ( dotClicked ) {
            const id = +dotClicked.dataset.dotsId.slice( -1 );
            const echo = this.data.echoes[id];

            if (lowpass !== echo.lowpass) {
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
    _onchangeDots( dotsStr ) {
        const obj = {};
        const echoes = this.data.echoes;
        const dots = dotsStr.split( "," );
        const oldCount = Object.keys( echoes ).length;
        const newCount = dots.length;

        if ( oldCount > newCount ) {
            for ( let i = newCount; i < oldCount; ++i ) {
                obj[ i ] = undefined;
                delete echoes[ i ];
            }
        } else if ( oldCount < newCount ) {
            for ( let i = oldCount; i < newCount; ++i ) {
                const dot = dots[ i ].split( " " );

                obj[ i ] =
                echoes[ i ] = {
                    gain: 1,
                    pan: +dot[ 1 ],
                    delay: +dot[ 0 ],
                };
            }
        }
        for ( let i = 0; i < oldCount; ++i ) {
            const dot = dots[ i ].split( " " );
            const oldEcho = echoes[ i ];
            const newEcho = {};
            const gain = 1;
            const pan = +dot[ 1 ];
            const delay = +dot[ 0 ];
            let diff;

            if ( pan !== oldEcho.pan ) { newEcho.pan = pan; diff = true; };
            if ( gain !== oldEcho.gain ) { newEcho.gain = gain; diff = true; };
            if ( delay !== oldEcho.delay ) { newEcho.delay = delay; diff = true; };
            if ( diff ) {
                obj[ i ] =
                echoes[ i ] = newEcho;
            }
        }
        this._callOnchange( lg({ echoes: obj }) );
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
        return true;
    }
    _proxyAddEcho( tar, id, obj ) {
        const set = this._proxyUpdateEcho.bind( this, +id ),
            data = Object.seal( {
                pan: 0,
                gain: 0,
                delay: 0,
                lowpass: 0,
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

gsuiFxExample.template = document.querySelector( "#gsuiFxExample" );
gsuiFxExample.template.remove();
gsuiFxExample.template.removeAttribute( "id" );
