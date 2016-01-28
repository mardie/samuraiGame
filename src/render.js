
function parseObj(raw){
    var data = {
        objects : { },
        v: []
    };

    var currentObj;

    function _parse(elm,line){
        var token = line.split(' ');
        if(elm == 'o'){
            data.objects[token[1]] = {
                f : []
            };
            currentObj = token[1];
        }
        if(elm == 'g'){
            data.objects[token[1]] = {
                f : []
            };
            currentObj = token[1];
        }
        if(elm == 'v'){
            if(!currentObj) {
                currentObj = token[1];
            }

            var v = [parseFloat(token[1])*s,parseFloat(token[2])*s,parseFloat(token[3])*s];
            data.v.push(v);
        }
        if(elm == 'f'){
            var f = [~~token[1]-1,~~token[2]-1,~~token[3]-1];
            if(token[4]){f.push(~~token[4]-1);}
            data.objects[currentObj].f.push(f);
        }
    }
    raw.split(newlineSep).map(function(line){
            _parse(line[0],line);
        }
    );



    return data;

}


function isHighlighted(part,index){
    if(!highlightedtPart)
        return false;
    if(highlightedtPart == 'do' && part == 'body' && index == 10){
        return true;
    }
    if(highlightedtPart == 'kote' && part == 'arms' && index == 26){
        return true;
    }
    if(highlightedtPart == 'tsuki' && part == 'head' && index == 11){
        return true;
    }
    if(highlightedtPart == 'men' && part == 'head' && index == 13){
        return true;
    }
    return false;
}

function project(point){
    return  [((((Ez)*(point[0]-Ex))/((Ez)+point[2]))+Ex)+center.x,
             -1*((((Ez)*(point[1]-Ey))/((Ez)+point[2]))+Ey)+center.y,
            point[2]];
}

function translate(point,offsetx,offsety,offsetz){
    return [point[0]+offsetx,point[1]+offsety,point[2]+offsetz];
}

function rotate(point,ang){
    return point
}
function quicksort(arr){
    if (arr.length === 0) {
        return [];
    }
    var left = [];
    var right = [];

        var pivot = arr[0][2];

    //go through each element in array
    for (var i = 1; i < arr.length; i++) {
        if (arr[i][2] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return quicksort(left).concat(pivot, quicksort(right));
}

function medianFaceZ(p,drawVertex){
    var t=0;
    for(var i=0; i< p.length; i++){
        try{
            t += drawVertex[p[i]][2];
        }catch(e){}

    }
    return t / p.length;
}

function draw(data,context,t){
    oldt = oldt || t;
    var delta = t-oldt;
    oldt = t;

    if(bossLife<=0){
        return;
    }

    var offx = Math.sin(t*0.001)*40,
        offy = 0,
        ang = 0;


    //Object.keys(data.objects).map(function(objectName){
    ['body','head','arms','katana'].map(function(objectName){
        var object = data.objects[objectName];

        var drawVertex = data.v.map(function(vertex){
            return project(rotate(translate(vertex,offx,offy,0),ang));
        });

        object.f.sort(function(a,b){
            return medianFaceZ(a,drawVertex) - medianFaceZ(b,drawVertex);
        });

        object.f.map(function(face,index){
            context.beginPath();

            context.lineWidth = Math.abs(Math.sin(t*0.001))*5;

            if(context.lineWidth<1){
                context.lineWidth = 1;
            }

            context.lineWidth = 1;

            if(isHighlighted(objectName,index)) {
                context.fillStyle = '#cccccc';
                context.strokeStyle = '#cccccc';
            }else{
                context.fillStyle = bossColor;
                context.strokeStyle = '#eeeeee';
            }

            if(bossLife <= 20){
                context.lineWidth = 5;
                context.strokeStyle = '#ff0000';
            }

            context.moveTo(drawVertex[face[face.length-1]][0],drawVertex[face[face.length-1]][1]);
            for(var i = 0; i<face.length; i++){
                context.lineTo(drawVertex[face[i]][0],drawVertex[face[i]][1]);
            }

            if('stop' in  window){
               // debugger;
            }
            context.fill();
            context.stroke();

        });

    });


    var wtarget=canvas.width/300,
        htarget=wtarget*5;

    context.beginPath();
    context.setLineDash([wtarget,wtarget]);
    context.lineDashOffset = 2;
    context.lineWidth = 2;
    context.strokeStyle = '#FF6969';
    context.fillStyle = '#C32020';

    context.moveTo(canvas.width/2,canvas.height/3);
    context.lineTo(targetx,targety+htarget);
    context.lineTo(targetx-wtarget,targety-wtarget);
    context.lineTo(targetx+wtarget,targety-wtarget);
    context.lineTo(targetx,targety+htarget);

    context.fill();
    context.stroke();
    context.setLineDash([]);
}
