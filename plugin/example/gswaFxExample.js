"use strict";

class gswaFxExample {
	constructor() {
		this.ctx =
		this.input =
		this.output =
		this._lowpass = null;
		this.data = this._proxyCreate();
		Object.seal( this );
	}

	setContext( ctx ) {
		this.ctx = ctx;
		this.input = ctx.createGain();
		this.output = ctx.createGain();
		this._lowpass = ctx.createBiquadFilter();
		this._lowpass.type = "lowpass";
		this._lowpass.Q.setValueAtTime( 5, ctx.currentTime );
		this.input.connect( this._lowpass );
		this._lowpass.connect( this.output );
	}
	liveChange( param, val ) {
		this._updateParam( param, val );
	}

	// private:
	_updateParam( param, val ) {
		switch ( param ) {
			case "lowpass":
				this._lowpass.frequency.setValueAtTime( val, this.ctx.currentTime );
				break;
		}
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
