"use strict";

class gsuiFxExample {
	constructor() {
		const root = gsuiFxExample.template.cloneNode( true ),
			slider = root.querySelector( ".gsuiFxExample-slider" ),
            dots = new gsuiDotline();

		this.rootElement = root;
		this._elSlider = slider;
		this.oninput = () => {};
		this.onchange = () => {};
		this.data = this._proxyCreate();
        this._dots = dots;
        Object.seal( this );

        this.rootElement.append( dots.rootElement );
        dots.options( {
            step: .001,
            maxX: 10,
            maxY: 10,
            minX: 0,
            minY: 0,
        } );
        dots.setValue( "0.6 2,3.5 3.5,6 8,9 4" );

		slider.oninput = this._oninputSlider.bind( this );
		slider.onchange = this._onchangeSlider.bind( this );
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
            case "repetition":
                /*this._elSlider.value = val;*/
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
	_oninputSlider() {
		this._callOninput( "lowpass", +this._elSlider.value );
	}
	_onchangeSlider() {
		const lowpass = +this._elSlider.value;

		this.data.lowpass = lowpass;
		this._callOnchange( { lowpass } );
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
