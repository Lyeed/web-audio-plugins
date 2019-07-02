"use strict";

class gswaFxExample {
	constructor() {
		this.ctx =
		this.input =
		this.output =
        this._delay =
        this._feedback =
		this._lowpass = null;
		this.data = this._proxyCreate();
        this._repetitions = [];
		/*Object.seal( this );*/
	}

	setContext( ctx ) {
		this.ctx = ctx;
		this.input = ctx.createGain();
		this.output = ctx.createGain();
        this._delay = ctx.createDelay();
        this._feedback = ctx.createGain();
		this._lowpass = ctx.createBiquadFilter();
		this._lowpass.type = "lowpass";
		this._lowpass.Q.setValueAtTime( 5, ctx.currentTime );
		this.input.connect( this._lowpass );
        this.input.connect( this._delay );
		this._lowpass.connect( this.output );
        this._delay.connect( this.output );
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
            case "gain":
                this.output.gain.setValueAtTime( val, this.ctx.currentTime );
                break;
            case "repetitions":
                if (val === "") {
                    this._delay.delayTime.setValueAtTime( 0, ctx.currentTime );
                    this._feedback.gain.setValueAtTime( 0, ctx.currentTime );
                } else {
                    const feedbacks = val.split(',');
/*                    feedbacks.forEach(() => {
                        const delay = ctx.createDelay();

                        this.input.connect( delay );
                        delay.connect( this.output );
                    });
*/                    const fb1 = feedbacks[0].split(' ');

                    this._delay.delayTime.setValueAtTime( +fb1[1], ctx.currentTime );
                    this._feedback.gain.setValueAtTime( +fb1[0], ctx.currentTime );
                }
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
