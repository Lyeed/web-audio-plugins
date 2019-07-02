"use strict";

class gsuiFxExample {
	constructor() {
		const root = gsuiFxExample.template.cloneNode( true ),
			slider = root.querySelector( ".gsuiFxExample-slider" ),
            gainSlider = root.querySelector( ".gsuiGain-slider" ),
            dots = new gsuiDotline();

		this.rootElement = root;
		this._elSlider = slider;
        this._gainSlider = gainSlider;
		this.oninput = () => {};
		this.onchange = () => {};
		this.data = this._proxyCreate();
        this._dots = dots;
        Object.seal( this );

        this.rootElement.append( dots.rootElement );
        dots.options( {
            firstLinkedTo: 5,
            lastLinkedTo: 5,
            step: .001,
            maxX: 10,
            maxY: 1,
            minX: 0,
            minY: -1,
        } );

		slider.oninput = this._oninputSlider.bind( this );
		slider.onchange = this._onchangeSlider.bind( this );
        gainSlider.oninput = this._oninputGainSlider.bind( this );
        gainSlider.onchange = this._onchangeGainSlider.bind( this );
        dots.oninput = this._oninputDots.bind( this );
        dots.onchange = this._onchangeDots.bind( this );
	}

    attached() {
        this._dots.attached();
    }

	// private:
	_updateParam( param, val ) {
		switch ( param ) {
			case "lowpass":
				this._elSlider.value = val;
				break;
            case "repetitions":
                this._dots.value = val;
                break;
            case "gain": {
                this._gainSlider.value = val;
                break;
            }
		}
	}
	_callOninput( param, val ) {
		this.oninput( param, val );
	}
	_callOnchange( obj ) {
		this.onchange( obj );
	}

	// events:
	_oninputSlider() {
		this._callOninput( "lowpass", +this._elSlider.value );
	}
	_onchangeSlider() {
		const lowpass = +this._elSlider.value;

		this.data.lowpass = lowpass;
		this._callOnchange( { lowpass } );
	}

    _oninputGainSlider() {
        this._callOninput( "gain", +this._gainSlider.value );
    }
    _onchangeGainSlider() {
        const gain = +this._gainSlider.value;

        this.data.gain = gain;
        this._callOnchange( { gain } );
    }

    _oninputDots(dots) {
        this._callOninput( "repetitions", dots );
    }
    _onchangeDots(dots) {
        this.data.dots = dots;
        this._callOnchange( { dots } );
    }

	// proxy:
	_proxyCreate() {
		return new Proxy( {}, { set: this._proxySetParam.bind( this ) } );
	}
	_proxySetParam( tar, prop, val ) {
		tar[ prop ] = val;
		this._updateParam( prop, val );
		return true;
	}
}

gsuiFxExample.template = document.querySelector( "#gsuiFxExample" );
gsuiFxExample.template.remove();
gsuiFxExample.template.removeAttribute( "id" );
