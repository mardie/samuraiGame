var dataref, myId = Date.now()+''+ Math.floor(Math.random()*100000000);

function sendMsg(msg){
    dataref.push({id:myId, msg: msg});
}

function getNewRoom(cbk) {
    var dataref = new Firebase('https://glowing-heat-7043.firebaseio.com/p2pgame');

    var roomId = Date.now()+''+ Math.floor(Math.random()*100000000);
    dataref.transaction(function (currentData) {
        if (currentData === null) {
            return roomId;
        }
    }, function (error, committed, snapshot) {
        if (error) {
            console.error('Transaction failed abnormally!', error);
            return cbk(error);
        } else if (!committed) {
            dataref.set(null);
            return cbk(null, snapshot.val(), true);
        } else {
            return cbk(null, roomId);
        }
    });

}

getNewRoom(function(err, roomId, startSign){
    if(err){
        return console.error(err);
    }
    dataref =  new Firebase('https://glowing-heat-7043.firebaseio.com/p2pgame'+roomId);

    dataref.on('child_added', function(data) {
        if(onMsg  && data.val().id !== myId){
            onMsg(data.val().msg);
        }
    });

    if(startSign) {
        startSignaling();
    }
});