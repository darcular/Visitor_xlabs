/**
 * @author Yikai Gong
 */

var xLabs= xLabs || {};
xLabs.isXlabReady = false;
xLabs.isCamOn = false;

xLabs.webCamController = function(){
    var self = this;
    this.thresholdRatio = 0.9;  // threshold / haedZ
    this.oldHeadX = 0;
    this.oldHeadY = 0;
    this.oldHeadZ = 0;
    this.headX = 0;
    this.headX = 0;
    this.headX = 0;
    this.dolly = 0;
    this.roll = 0;
    this.autoRotate = 0;
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

        callback(mapTOW(this.roll, 0.2, 4));
    }
}

//function smoother(currentValue, targetValue, alpha ){
//    var output;
//    var beta = 1.0 - alpha;
//    output = targetValue * beta + currentValue * alpha === undefined ? 0 : targetValue * beta + currentValue * alpha;
//    return output;
//}

function mapTOW(roll, t, k){
    var result = 0;
    if(roll > t)
        result = k * (roll-t);
    else if ( roll < -1*t){
        result = k * (roll+t);
    }
    return result;
}