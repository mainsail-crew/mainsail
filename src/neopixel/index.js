import store from '../store/index'
import socket from '../store/socket/index'

var ledcolor = hexAToRGBA(store.state.gui.neopixelcenter.color);

setTimeout(executeNeopixel(ledcolor),1500);

function hexAToRGBA(h) {
    let r = 0, g = 0, b = 0, a = 1;

    if (h.length == 5) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
        a = "0x" + h[4] + h[4];

    } else if (h.length == 9) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
        a = "0x" + h[7] + h[8];
    }
    a = +(a / 255)
    a = a*100
    a = a.toFixed(0);
    var ledcolor = [+r,+g,+b,+a]

    return ledcolor;
}

function executeNeopixel(color){
    socket.sendObj('printer.gcode.script', { script: 'SET_LED LED='+store.state.gui.neopixelcenter.stripname+' RED='+color[0]+' GREEN='+color[1]+' BLUE='+color[2] });
}