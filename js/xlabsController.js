/**
 * @author Yikai Gong
 */

var xLabs= xLabs || {};
xLabs.isXlabReady = false;
xLabs.isCamOn = false;
xLabs.mode = 0;   //0:roll, 1:yaw, 2:positionX
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
    onApiState : function(state){
        if(!xLabs.isCamOn && state.kvRealtimeActive == 1){xLabs.isCamOn = true;}
        this.headX = state.kvHeadX;
        this.headY = state.kvHeadY;
        this.headZ = state.kvHeadZ;
        this.roll = state.kvHeadRoll;
        this.pitch = state.kvHeadPitch;
        this.yaw = state.kvHeadYaw;
        this.isFaceDetected = state.kvValidationErrors[0]=="F" ? false : true;
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
        if(!this.headX || !this.headY || !this.headZ) return;  //to avoid undefined value
//        console.log(this.pitch);
        var w = 0;
        if(xLabs.mode===0)
            w = mapTOW(this.roll, 0.17, 5);
        else if(xLabs.mode===1)
            w = mapTOW(this.yaw, 0.12, 6);
        else if(xLabs.mode===2)
            w = mapTOW(this.headX, 1.5, 1);

        var p = 0;
        p = mapTOP(this.pitch, 0.57, 0.80, 0.1);

        callback(w, p);
    }
}

function mapTOW(input, t, k){
    var result = 0;
    if(input > t)
        result = k * (input-t);
    else if ( input < -1*t)
        result = k * (input+t);
    return result;
}

function mapTOP(input, t1, t2, k){
    var result = 0;
    if(input < t1)
        result = k;
    else if(input>t2)
        result = -k;
    return result;
}