var connectedWEBRTC;

function error(){console.error(arguments)};

var RTCPeerConnection = RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCIceCandidate = RTCIceCandidate || mozRTCIceCandidate;
var RTCSessionDescription = RTCSessionDescription || mozRTCSessionDescription;

var servers = {
    'iceServers': [
        {
            'urls': 'stun:stun.l.google.com:19302'
        },
        {
            'urls': 'turn:192.158.29.39:3478?transport=udp',
            'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            'username': '28224511:1379330808'
        },
        {
            'urls': 'turn:192.158.29.39:3478?transport=tcp',
            'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            'username': '28224511:1379330808'
        }
    ]
};

var pc;
var channel;
var configuration = {optional: []};

var dataChannelOptions = {

    ordered: false,
    maxRetransmitTime: 3000,
};



if(window.mozRTCPeerConnection){
    pc = new RTCPeerConnection(configuration);

}else {
    pc = new RTCPeerConnection(servers, configuration);
}

pc.ondatachannel = function (evt) {
    channel = evt.channel;
    bindChannel(channel);;
};

pc.onicecandidate = function (evt) {
    sendMsg(JSON.stringify({
        candidate: evt.candidate,
        sdpMLineIndex: evt.sdpMLineIndex
    } ));
};

channel = pc.createDataChannel("datachannel", dataChannelOptions);
bindChannel(channel);

function bindChannel(dataChannel){

    dataChannel.onmessage = function (event) {
        p2pMessageHandler(event.data);
    };

    dataChannel.onopen = function () {
        connectedWEBRTC = true;
        p2pMessageSender({
            type: 'JOIN',
            name: playerName
        })
    };

    dataChannel.onclose = function () {
        connectedWEBRTC = false;
    };
}

function startSignaling() {
    pc.createOffer(function(offer) {
        pc.setLocalDescription(new RTCSessionDescription(offer), function() {
            sendMsg(JSON.stringify( offer ));
        }, error);
    }, error);
}

function onMsg(msg){
    try{
        var data = JSON.parse(msg);

        if(data.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }

        if(data.type == 'offer'){
            pc.setRemoteDescription(new RTCSessionDescription(data), function() {
                pc.createAnswer(function(answer) {
                    pc.setLocalDescription(new RTCSessionDescription(answer), function() {
                        sendMsg(JSON.stringify( answer ));
                    }, error);
                }, error);
            }, error);
        }

        if(data.type == 'answer'){
            pc.setRemoteDescription(new RTCSessionDescription(data), function() { }, error);
        }

    } catch (e) {
        console.error(e);
    };

};


function p2pMessageHandler(msg){
    try{
        var data = JSON.parse(msg);

        if(data.type == 'MOUSE_MOVE'){
            targetx = data.x * canvas.width;
            targety = data.y * canvas.height;
        }

        if(data.type == 'JOIN'){
            sleepBot();

            bossLife = 100,
            bossColor = '#333333';
            enemy = {
                name : data.name
            }
            enemyNameElem.innerText = enemy.name;
            updateBossLife();
        }


        if(data.type == 'HIT') {
            life -= 10;

            updateLife();
            var orig = bgColor;
            bgColor = "red";
            setTimeout(function () {
                bgColor = orig;
            }, 100);
        }


    }catch(e){}
}

function p2pMessageSender(data){
    channel.send(JSON.stringify(data));
}
