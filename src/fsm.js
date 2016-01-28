function FSM(){
    var self = this;

    this.STATES = [
        'idle',
        'warning',
        'danger',
        'atacking',
        'win',
        'lose'
    ];

    this.cbks = {};
    this.STATES.map(function(state){
        self.cbks[state] = [];
    });
    this.cbks.any =[];

    this.cs = 'idle';
}

FSM.prototype.c = function(state){
    this.cs = state;

    this.cbks.idle.map(function(cbk) {
        cbk(state);
    });

    this.cbks.any.map(function(cbk) {
        cbk(state);
    });
};

FSM.prototype.onC = function(state,cbk){
    this.cbks[state].push(cbk);
};