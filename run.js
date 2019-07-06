"use strict";

import objectDeepAssign from './utils/objectDeepAssign.js';

const ctx = new AudioContext();
const audioIn = ctx.createGain();
const audioInSplit = ctx.createChannelSplitter( 2 );
const audioOutSplit = ctx.createChannelSplitter( 2 );
const audioBuffers = new Map();
const audioBSN = [];
let launched = false;

const fftSize = 512;
const audioInAnalyser = ctx.createAnalyser();
const audioInAnalyserL = ctx.createAnalyser();
const audioInAnalyserR = ctx.createAnalyser();
const audioOutAnalyser = ctx.createAnalyser();
const audioOutAnalyserL = ctx.createAnalyser();
const audioOutAnalyserR = ctx.createAnalyser();
const audioInData = new Uint8Array( fftSize / 2 );
const audioInDataL = new Uint8Array( fftSize / 2 );
const audioInDataR = new Uint8Array( fftSize / 2 );
const audioOutData = new Uint8Array( fftSize / 2 );
const audioOutDataL = new Uint8Array( fftSize / 2 );
const audioOutDataR = new Uint8Array( fftSize / 2 );

const spectrumIn = new gsuiSpectrum();
const spectrumOut = new gsuiSpectrum();
const analyserIn = new gsuiAnalyser();
const analyserOut = new gsuiAnalyser();
const fx = new gswaFxEcho();
const pluginWrap = document.querySelector( "#pluginWrap" );

Promise.all( [
	fetch( "plugin/echo/gsuiFxEcho.html" ).then( res => res.text() ),
	fetch( "plugin/echo/gsuiFxEcho.js" ).then( res => res.text() )
] ).then( arr => {
	const div = document.createElement( "div" );
	const script = document.createElement( "script" );

	div.innerHTML = arr[ 0 ];
	script.textContent = arr[ 1 ];
	document.body.append( div.firstElementChild, script );
	setup();
	document.querySelector( "#bufferBtns" ).onclick = onclickButtons;
    // pluginWrap.onmouseup = e => {
    //     lg(e.target, 564)
    // };
    window.uiFx.data.beats = 4;
} );

function setup() {
	const uiFx = new gsuiFxEcho();

    window.uiFx = uiFx;
	fx.setContext( ctx );
    fx.setBPM( 120 );
	pluginWrap.append( uiFx.rootElement );
    uiFx.attached();
	uiFx.oninput = ( param, val ) => {
		lg( "gsuiFxEcho.oninput", param, val );
        if ( param === "gain" ) {
            audioIn.gain.setValueAtTime( val, ctx.currentTime );
        }
	};
	uiFx.onchange = obj => {
		lg( "gsuiFxEcho.onchange", obj );
        objectDeepAssign(fx.data, obj);
	};

	audioInAnalyser.fftSize =
	audioInAnalyserL.fftSize =
	audioInAnalyserR.fftSize =
	audioOutAnalyser.fftSize =
	audioOutAnalyserL.fftSize =
	audioOutAnalyserR.fftSize = fftSize;
	audioInAnalyser.smoothingTimeConstant =
	audioInAnalyserL.smoothingTimeConstant =
	audioInAnalyserR.smoothingTimeConstant =
	audioOutAnalyser.smoothingTimeConstant =
	audioOutAnalyserL.smoothingTimeConstant =
	audioOutAnalyserR.smoothingTimeConstant = 0;
	audioInSplit.connect( audioInAnalyserL, 0 );
	audioInSplit.connect( audioInAnalyserR, 1 );
	audioOutSplit.connect( audioOutAnalyserL, 0 );
	audioOutSplit.connect( audioOutAnalyserR, 1 );

	audioIn.connect( audioInAnalyser );
	audioIn.connect( audioInSplit );
	audioIn.connect( fx.input );
	fx.output.connect( ctx.destination );
	fx.output.connect( audioOutAnalyser );
	fx.output.connect( audioOutSplit );

	spectrumIn.setCanvas( document.querySelector( "#spectrumIn" ) );
	spectrumOut.setCanvas( document.querySelector( "#spectrumOut" ) );
	analyserIn.setCanvas( document.querySelector( "#analyserIn" ) );
	analyserOut.setCanvas( document.querySelector( "#analyserOut" ) );
}

function startFrame() {
	launched = true;
	frame();
}

function frame() {
	audioInAnalyser.getByteFrequencyData( audioInData );
	audioInAnalyserL.getByteFrequencyData( audioInDataL );
	audioInAnalyserR.getByteFrequencyData( audioInDataR );
	audioOutAnalyser.getByteFrequencyData( audioOutData );
	audioOutAnalyserL.getByteFrequencyData( audioOutDataL );
	audioOutAnalyserR.getByteFrequencyData( audioOutDataR );
	spectrumIn.draw( audioInData );
	spectrumOut.draw( audioOutData );
	analyserIn.draw( audioInDataL, audioInDataR );
	analyserOut.draw( audioOutDataL, audioOutDataR );
	requestAnimationFrame( frame );
}

function stopAllBuffers() {
	audioBSN.forEach( absn => absn.stop() );
}

function loadPlaySample( smp ) {
	const buf = audioBuffers.get( smp );

	if ( buf ) {
		playBuffer( buf );
	} else {
		fetch( smp )
			.then( res => res.arrayBuffer() )
			.then( arr => ctx.decodeAudioData( arr ) )
			.then( buf => {
				audioBuffers.set( smp, buf );
				playBuffer( buf );
			} );
	}
}

function playBuffer( buf ) {
	const absn = ctx.createBufferSource();

	absn.buffer = buf;
	absn.connect( audioIn );
	absn.start();
	audioBSN.push( absn );
}

function onclickButtons( e ) {
	const name = e.target.dataset.name;

	if ( e.target.nodeName === "BUTTON" ) {
		stopAllBuffers();
		if ( name ) {
			if ( launched ) {
				loadPlaySample( name );
			} else {
				ctx.resume().then( () => {
					startFrame();
					loadPlaySample( name );
				} );
			}
		}
	}
}
