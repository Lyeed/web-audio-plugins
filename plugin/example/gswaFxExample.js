"use strict";

class gswaFxExample {
    constructor() {
        this.ctx =
        this.input =
        this.output =
        this.data = this._proxyCreate();
        this._bps = 0;
        this._repetitions = [];
        /*Object.seal( this );*/
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
    liveChange( param, val ) {
        this._updateParam( param, val );
    }

    // private:
    _updateParam( param, val ) {
        const echoId = +val;
        if ( !isNaN( echoes ) ) {
            if ( val ) {



                const delay = this.ctx.createDelay( 50 );
                const gain = this.ctx.createGain();
                const pan = this.ctx.createStereoPanner();

                delay.delayTime.setValueAtTime( val.delay / this._bps, this.ctx.currentTime );
                gain.gain.setValueAtTime( val.gain, this.ctx.currentTime );
                pan.pan.setValueAtTime( val.pan, this.ctx.currentTime);
                this.input.connect( delay );
                delay.connect( gain );
                gain.connect( pan );
                pan.connect(this.output);
                this._repetitions.push( delay );
            } else {

            }
        } else {
            switch ( param ) {
                case "echoes":
                    this._repetitions.forEach(delay => delay.disconnect( this.input ));
                    this._repetitions = [];
                    Object.values( val ).forEach(echo => {
                        const delay = this.ctx.createDelay( 50 );
                        const gain = this.ctx.createGain();
                        const pan = this.ctx.createStereoPanner();

                        delay.delayTime.setValueAtTime( echo.delay / this._bps, this.ctx.currentTime );
                        gain.gain.setValueAtTime( echo.gain || 1, this.ctx.currentTime );
                        pan.pan.setValueAtTime( echo.pan, this.ctx.currentTime);
                        this.input.connect( delay );
                        delay.connect( gain );
                        gain.connect( pan );
                        pan.connect(this.output);
                        this._repetitions.push( delay );
                    });
                    break;
                case "gain":

                    break;
                case "pan":
                    break;
                case "delay":
                    break;
            }
        }
    }
    _addEcho( id ) {
        lg( "waFxAddEcho", id );
    }
    _removeEcho( id ) {
        lg( "waFxRemoveEcho", id );
    }
    _updateEcho( id, param, val ) {
        lg( "waFxUpdateEcho", id, param, val );
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
