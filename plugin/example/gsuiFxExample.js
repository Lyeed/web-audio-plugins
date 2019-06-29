"use strict";

class gsuiFxExample {
	constructor() {
		const root = gsuiFxExample.template.cloneNode( true ),
			slider = root.querySelector( ".gsuiFxExample-slider" );

		this.rootElement = root;
		this._elSlider = slider;
		this.oninput = () => {};
		this.onchange = () => {};
		this.data = this._proxyCreate();
		Object.seal( this );

		slider.oninput = this._oninputSlider.bind( this );
		slider.onchange = this._onchangeSlider.bind( this );
	}

	// private:
	_updateParam( param, val ) {
		switch ( param ) {
			case "lowpass":
				this._elSlider.value = val;
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
