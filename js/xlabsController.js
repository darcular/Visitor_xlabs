/**
 * @author Yikai Gong
 */

var xLabs= xLabs || {};
xLabs.isXlabReady = false;
xLabs.isCamOn = false;
xLabs.mode = 2;   //0:roll, 1:yaw, 2:positionX
xLabs.webCamController = function(){
    var self = this;
    this.headX = 0;
    this.headX = 0;
    this.headX = 0;
    this.roll = 0;
    this.pitch = 0;
    this.yaw  = 0;
    this.isFaceDetected = false;
    document.addEventListener( "xLabsApiReady", function(){self.onApiReady();});
    document.addEventListener( "xLabsApiState", function( event ){self.onApiState(event.detail);});
    $(window).bind("beforeunload", function() {
        self.close();
    })
}



xLabs.webCamController.prototype = {

	yawSmooth : 0,
	xSmooth : 0,
	ySmooth : 0,
	
	pitchEventTimeMsec : 0,
	deltaPitch : 0,

	pitchSignals : [],

    onApiState : function(state){
        if(!xLabs.isCamOn && state.kvRealtimeActive == 1){xLabs.isCamOn = true;}
        this.headX = state.kvHeadX;
        this.headY = state.kvHeadY;
        this.headZ = state.kvHeadZ;
        this.roll = state.kvHeadRoll;
        this.pitch = state.kvHeadPitch;
        this.yaw = state.kvHeadYaw;
        this.isFaceDetected = state.kvValidationErrors.indexOf("F") == -1 ? true : false;
    },
    onApiReady : function(){
        xLabs.isXlabReady = true;
        window.postMessage({target:"xLabs", payload:{overlayEnabled:0}}, "*" );
        window.postMessage({target:"xLabs", payload:{overlayMode:0}}, "*");
        window.postMessage({target:"xLabs", payload:{realtimeEnabled:1}}, "*");
        window.postMessage({target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
        window.postMessage({target:"xLabs", payload:{validationEnabled :1}}, "*" );
    },
    close : function(){
        if(xLabs.isCamOn){
            window.postMessage({target:"xLabs", payload:{realtimeEnabled:0}}, "*");
        }
    },
	
    update : function(callback){
		var walkSpeed = 0.00035;
		
//		console.log( "this.isFaceDetected: " + this.isFaceDetected );
//  	  console.log( "this.headZ: " + this.headZ );
      if( !this.isFaceDetected ) {
			walkSpeed = 0;			
			callback( 0, 0,  walkSpeed );
			return;
		}
//        console.log(this.pitch);
		// mode:
		// 0 -- roll
		// 0 -- yaw
		// 0 -- head x
        var w = 0;
        if(xLabs.mode===0) {
//            w = mapIntoW(this.roll, 0.17, 5);
		}
        else if(xLabs.mode===1) {
			var alpha = 0.9;
			this.yawSmooth = this.yawSmooth * alpha + (1-alpha) * this.yaw;
			var gain = 16;
			var yawMin = 0.04;
			var yawMax = 0.1;
			//console.log( "this.yawSmooth: " + this.yawSmooth );
            w = mapIntoW( this.yawSmooth, gain, yawMin, yawMax );
		}
        else if(xLabs.mode===2) {
			var alpha = 0.5;
			this.xSmooth = this.xSmooth * alpha + (1-alpha) * this.headX;
			var gain = 1.0*0.75;
			var xMin = 0.2*0.75;
			var xMax = 1.5*0.75;
			//console.log( "this.xSmooth: " + this.xSmooth );
            w = mapIntoW( this.xSmooth, gain, xMin, xMax );
		}
		
		// Control pitch
		{
			var alpha = 0.5;
			this.ySmooth = this.ySmooth * alpha + (1-alpha) * this.headY;
			
			// Maintain a buffer of pitch signals
			this.pitchSignals.push( this.ySmooth );
			if( this.pitchSignals.length > 50 ) {
				this.pitchSignals.shift();
			}
			
			// Get the median value as a reference
			var pitchRef  = median( this.pitchSignals );
			var pitchSig = this.ySmooth - pitchRef;
			var pitchThresh = 0.25;
//			console.log( "pitchSig: " + pitchSig );
			var nowMsec = new Date().getTime();
			if( nowMsec - this.pitchEventTimeMsec > 500 ) {
				if( pitchSig > pitchThresh ) {
					this.deltaPitch = -0.8;
					this.pitchEventTimeMsec = new Date().getTime();
				}
				else if( pitchSig < -pitchThresh ) {
					this.deltaPitch = 0.8;
					this.pitchEventTimeMsec = new Date().getTime();
				}
				else {
					this.deltaPitch = 0;
				}

			}
//			p = 10;
		}		

        callback(w, this.deltaPitch,  walkSpeed);
    }
}

function median( _values ) {
	// Make a shallow copy, which should be enough since
	// we don't modify the elements
	var values = _values.slice(0);
	
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}


function mapIntoW( _input, gain, inputMin, inputMax ) {
	var w = 0;
	var input = _input;

	if( input >  inputMax ) input =  inputMax;
	if( input < -inputMax ) input = -inputMax;
	
	if( input >  inputMin ) w = (input - inputMin) * gain;
	if( input < -inputMin ) w = (input + inputMin) * gain;
	
//	console.log( "w:" + w );
	return w;
}

function mapTOP(input, t1, t2, k){
    var result = 0;
    if(input < t1)
        result = k;
    else if(input>t2)
        result = -k;
    return result;
}