//Sorry for the ketch code.It will be refactored.

var fsm = new FSM();

var oldt ,
    highlightedtPart,
    pos = 0,
    center = {x:0,y:0},
    s = 75,
    targetElems,
    Ex= center.x,
    Ey= center.y,
    Ez= 800,
    mousex = 0,
    mousey = 0,
    targetx = 0,
    targety = 0,
    tsLastChange = Date.now(),
    lastx = 0,
    lasty = 0,
    life = 100,
    bossLife = 100,
    points = 0,
    targets = [],
    actionCompleted = true,
    bgColor = "#84DEFF",
    isGameOver = false,
    possibleTargets = [ "men", "kote", "do", "tsuki"],
    states = ['idle', 'warning', 'danger'],
    beated = [],
    enemy,
    playerName = prompt('Player name:'),
    newlineSep='\n',
    bots = 0,
    sleepingBot,
    actionInterval = 500;

function init(){
    canvas = document.getElementById('myCanvas'),
    body = document.querySelectorAll('body')[0],
    lifeElem = document.getElementById('life'),
    bossLifeElem = document.getElementById('bossLife'),
    enemyNameElem = document.getElementById('enemyName'),
    pointsElem = document.getElementById('points'),
    targetElems = document.querySelectorAll('.target');
    body.className = fsm.cs;

    generateBoss();

    fsm.onC('any',function(state){
        body.className = state;
    });

    for(var i=0; i< targetElems.length; i++) {
        targetElems[i].onclick = function (evt){


            var weaks = getWeakPoints(targetx, targety);
            var targetName = evt.currentTarget.className.split(' ')[1];
            if(weaks.indexOf(targetName) == -1){
                return;
            }

            if(connectedWEBRTC) {
                p2pMessageSender({type: 'HIT', target: targetName})
            }

            if(bossLife <= 0){
                return;
            }
            bossLife -=10;
            points ++;
            updateBossLife();
        };

    };

    possibleTargets.map(function(target){
        var el = document.querySelector('.'+target);
        el.onmouseenter = function (){
            highlightedtPart = target;
        };
        el.onmouseleave = function (){
            highlightedtPart = null;
        };
    });



    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    center.x = canvas.width/2;
    center.y = canvas.height/2;
    mousex = canvas.width/2;
    mousey = canvas.height/2;
    targetx = canvas.width/2;
    targety = canvas.height/2;
    updateLife();
    Ex = center.x;
    Ey = center.y;
    Ez = 800;

    context = canvas.getContext('2d');

    window.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        mousex = mousePos.x;
        mousey = mousePos.y;
        if(connectedWEBRTC) {
            p2pMessageSender({type: 'MOUSE_MOVE', x: mousex/canvas.width, y: mousey/canvas.height})
        }

    }, false);


    $.get('models/samurai.obj').then(function (objData) {

        var data = parseObj(objData);
        function loop() {
            requestAnimationFrame(function (t) {
                context.fillStyle = getBgColor();
                context.fillRect(0, 0, canvas.width, canvas.height);
                draw(data, context, t);

                if (!sleepingBot) {
                    ai();
                }

                getWeakPoints(targetx, targety);

                Ey = (center.y - targety) * 2;
                Ex = targetx - center.x;

                if (life <= 0) {
                    isGameOver = true;
                    console.error('gameOver', beated);
                }

                if (bossLife <= 0) {
                    setTimeout(function () {
                        beated.push(enemy.name);
                        generateBoss();
                        loop();
                    }, 1500);
                    return;
                }

                if (!isGameOver) {
                    loop();
                } else {
                    gameOver();
                }
            });
        }

         loop();
    })//CLOSING OBJDATA

}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function sleepBot(){

    sleepingBot = {
        bossLife: bossLife,
        bossColor : bossColor,
        enemy: enemy,
        ai : ai
    };

}


function updateLife(){
    lifeElem.style.width = life+"%";
}

function updateBossLife(){
    pointsElem.innerHTML = points;
    bossLifeElem.style.width = bossLife+"%";
}


function rand(max){
    return Math.round(Math.random()*(max+1))%(max+1);
}

function attack(target,cbk){
    ci = 2;
    fsm.c(states[ci]);
    var isUp = true;
    function doAttack(){
        if(getWeakPoints(mousex,mousey,true).indexOf(target) != -1){
            life -= 10;
            updateLife();
            var orig = bgColor;
            bgColor="red";
            setTimeout(function(){
                bgColor=orig;
                ci = 0;
                fsm.c(states[ci]);
                cbk();
            },100);
        }else{
            cbk();
        }

    }


    var timer = setInterval(function(){
        var minY = 10,maxY = canvas.height/ 2, destx = canvas.width/2;
        if(target=="tsuki"){
            minY = canvas.height/3;
            maxY = canvas.height/5
        }
        if(target=="do"){
            destx = canvas.width/3;
        }
        if(target=="kote"){
            minY = canvas.height/3;
            maxY = canvas.height/2
        }

        if(isUp){
            if(targety>minY) {
                targety -= 10;
                Ey = (center.y - targety)*2;

            }
            if(Math.abs((canvas.width/2)-targetx) > 50){
                targetx += (targetx>canvas.width/2) ? -10 : 10;
                Ex = targetx-center.x;

            }
            if(targety<=minY && Math.abs((canvas.width/2)-targetx) <= 50){
                isUp = false;
            }
        }else{

            if(targety<maxY) {
                targety += 50;
                Ey = (center.y - targety)*2;
            }
            if(Math.abs(destx-targetx) > 50){
                targetx += (targetx>destx) ? -30 : 30;
                Ex = targetx-center.x;
            }
            if(targety >= maxY && Math.abs(destx-targetx) <= 50){
                doAttack();
                clearInterval(timer);
            }

        }



    },16);

}

function follow(){
    ci = 1;
    fsm.c(states[ci]);
    actionCompleted = false;
    //defensive
    var timer = setInterval(function(){
        targetx += (mousex - targetx)/20;
        targety += (mousey - targety)/20;

        if(Math.abs(targetx-mousex)<25 && Math.abs(targety-mousey)<25){
            clearInterval(timer);
            actionCompleted = true
            ci = 0;
            fsm.c(states[ci]);
        }
    },16);
}


function ofensive1(){
    actionCompleted = false;
    //ofensive1. just attacks

    var isShake = !!rand(1);

    function at() {
        var multi = !!rand(1);
        var target, target2;
        var targets = getWeakPoints(mousex, mousey, true);

        if (targets.length == 0) {
            actionCompleted = true;
            return;
        }

        if (!multi) {
            target = targets[rand(targets.length - 1)];
        } else {
            target2 = targets[rand(targets.length - 1)];
            target = possibleTargets[rand(possibleTargets.length - 1)];
        }

        attack(target, function () {
            if (multi) {
                attack(target2, function () {
                    actionCompleted = true;
                });
            } else {
                actionCompleted = true;
            }
        })
    }
    if(isShake){
        shake(500);
        setTimeout(function(){
            at();
        },500);
    }else{
        at();
    }
}

function ofensive2(){
    actionCompleted = false;
    //Shake
    var t = 500;

    setTimeout(function(){
        var targets = getWeakPoints(mousex,mousey,true);
        actionCompleted = true;
    },t);
}

function ofensive3(){
    actionCompleted = false;
    actionCompleted = true;
}

function ofensive4(){
    actionCompleted = false;
    actionCompleted = true;
}



function shake(t){
    var axis = Math.random();
    var oldt = Date.now();
    var iniy = targety;
    var timer = setInterval(function(){

        var now = Date.now();
        targety = iniy + Math.sin(now/400 + Math.random()*1 )*10;
        Ey = (center.y - targety)*2;

        if(now-oldt>t){
            clearInterval(timer);
        }
    },16);
}


function getWeakPoints(targetx,targety, invert){
    var targets = [];

    if(targety > 2*(canvas.height/6) && targety < 3*(canvas.height/6) &&
        targetx > 4*(canvas.width/10) && targetx < 6*(canvas.width/10)){
        targets.push("tsuki");
    }

    if(targety > 2*(canvas.height/3)){
        targets.push("men");
    }

    if(targety < canvas.height/3){
        targets.push("do");
    }

    if(targetx > 2*(canvas.width/3) && !invert){
        targets.push("men");
        targets.push("kote");
    }

    if(targetx < canvas.width/3 && !invert){
        targets.push("men");
    }

    if(targetx > 2*(canvas.width/3) && invert){
        targets.push("men");
    }

    if(targetx < canvas.width/3 && invert){
        targets.push("men");
        targets.push("kote");
    }

    return targets;
}


function generateBoss(){

    if(sleepingBot){
        enemy = sleepingBot.enemy;
        bossColor = sleepingBot.bossColor;
        ai = sleepingBot.ai;
        bossLife = sleepingBot.bossLife;
        enemyNameElem.innerText = enemy.name;
        updateBossLife();
        sleepingBot = false;
        return;
    }

    bossLife = 100;
    updateBossLife();

    var _rand = Math.random();

    bossColor = '#cc0000';

    if(_rand > 0.3){
        bossColor = '#00ff00';
    }
    if(_rand > 0.6){
        bossColor = '#0000ff';
    }

    enemy = {
        name: "bot"+(++bots)+'['+bossColor+']'
    };
    enemyNameElem.innerText = enemy.name;

    ai = function(){
            var now = Date.now();

            if(now - tsLastChange > actionInterval && actionCompleted){
                tsLastChange = now;

                lastx = mousex;
                lasty = mousey;

                //esto es la ia en si;
                var f = rand(100);
                if(f>70){
                    ofensive1();
                }else{
                    follow();
                }

            }

        }
}

function gameOver(){
    context.fillStyle = "#D0F8FF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(function(){
        alert("GAME OVER\n You beated "+beated.length+' enemies.\nYour score is '+points+'.');
    },200);
}


function getBgColor(){

    return bgColor;
}



