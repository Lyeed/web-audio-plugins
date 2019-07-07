"use strict";

class gswaFxEcho {
    constructor() {
        this.ctx =
        this.input =
        this.output =
        this.data = this._proxyCreate();
        this._bps = 0;
        this._repetitions = {};
        Object.seal( this );
    }

    setContext( ctx ) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();
        this.input.connect(this.output);
    }
    setBPM( bpm ) {
        this._bps = bpm / 60;
    }

    // private:
    _addEcho( id ) {
        lg( "waFxAddEcho", id );
        const delay = this.ctx.createDelay( 50 );
        const gain = this.ctx.createGain();
        const pan = this.ctx.createStereoPanner();
        const lowpass = this.ctx.createBiquadFilter();
        const highpass = this.ctx.createBiquadFilter();

        this.input.connect( delay );
        delay.connect( lowpass );
        lowpass.connect( highpass );
        lowpass.type = "lowpass";
        lowpass.frequency.value = 24000;
        highpass.connect( gain );
        highpass.type = "highpass";
        highpass.frequency.value = 40;
        gain.connect( pan );
        pan.connect( this.output );
        this._repetitions[ id ] = { delay, gain, pan, lowpass, highpass };
    }
    _removeEcho( id ) {
        lg( "waFxRemoveEcho", id );
        this.input.disconnect( this._repetitions[ id ].delay );
        delete this._repetitions[ id ];
    }
    _updateEcho( id, param, val ) {
        lg( "waFxUpdateEcho", id, param, val );
        switch (param) {
            case "pan":
                this._repetitions[ id ].pan.pan.setValueAtTime( val, this.ctx.currentTime);
                break;
            case "gain":
                this._repetitions[ id ].gain.gain.setValueAtTime( val, this.ctx.currentTime);
                break;
            case "delay":
                this._repetitions[ id ].delay.delayTime.setValueAtTime( val, this.ctx.currentTime);
                break;
            case "lowpass":
                // Clamp the frequency between the minimum value (40 Hz) and half of the
                // sampling rate.
                const minValue = 40;
                const maxValue = this.ctx.sampleRate / 2;
                // Logarithm (base 2) to compute how many octaves fall in the range.
                const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
                // Compute a multiplier from 0 to 1 based on an exponential scale.
                const multiplier = Math.pow(2, numberOfOctaves * (val - 1.0));
                // Get back to the frequency value between min and max.
                console.log(maxValue * multiplier);
                this._repetitions[ id ].lowpass.frequency.setValueAtTime( maxValue * multiplier, this.ctx.currentTime );
                break;
            case "highpass":
                this._repetitions[ id ].highpass.frequency.setValueAtTime( Math.max( 10000 * ( 1 - val ), 40 ), this.ctx.currentTime );
                break;
        }
    }

    // proxy:
    _proxyCreate() {
        return Object.freeze( {
            echoes: new Proxy( {}, {
                set: this._proxyAddEcho.bind( this ),
                deleteProperty: this._proxyRemoveEcho.bind( this ),
            } ),
        } );
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
