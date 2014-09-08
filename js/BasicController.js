/**
 * @author Yikai Gong
 */
var keyBoardControler = {
    up : false,
    down : false,
    left : false,
    right : false
}

function onKeyDown(event){
    var e = event.keyCode;
    if (e == 38 || e == 87) keyBoardControler.up= true;
    else if (e == 40 || e == 83) keyBoardControler.down = true;
    else if (e == 37 || e == 65) keyBoardControler.left = true;
    else if (e == 39 || e == 68) keyBoardControler.right = true;
}
function onKeyUp(event){
    var e = event.keyCode;
    if (e == 38 || e == 87) keyBoardControler.up= false;
    else if (e == 40 || e == 83) keyBoardControler.down = false;
    else if (e == 37 || e == 65) keyBoardControler.left = false;
    else if (e == 39 || e == 68) keyBoardControler.right = false;
}

function degInRad(deg) {
    return deg * Math.PI / 180;
}