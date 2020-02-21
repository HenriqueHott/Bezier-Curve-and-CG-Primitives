
// Control global vars
controlPoints = [];

selectedControlPoint = null;
draggbleCurve = false;
flag = false;

// bit map
const CANVAS_WIDTH = document.getElementById('sketch-holder').offsetWidth;
const CANVAS_HEIGHT = document.getElementById('sketch-holder').offsetHeight;
const CANVAS_CENTER = [Math.floor(CANVAS_WIDTH/2), Math.floor(CANVAS_HEIGHT/2)];


/**
 * Setup Application
 */

function setup() { 
    var canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('sketch-holder');
    background(219);
    document.getElementById("myLog").value = "Application started;\n";
    noFill();
    cursor(CROSS);
} 

/** 
 * Event listners
 *
*/
function mousePressed(){
	if( (mouseX >= 0 && mouseX <= CANVAS_WIDTH) && (mouseY >= 0 && mouseY <= CANVAS_HEIGHT) ) {
		controlPoints.forEach((cp, i) => {
            if( mouseX <= cp[0] + 10 && mouseX >= cp[0] - 10 && mouseY <= cp[1] + 10 && mouseX >= cp[1] - 10){
                selectedControlPoint = i;
                console.log(selectedControlPoint, 'inside if');
				return true;
            }

		});			
	}
}

function mouseDragged(){
	if(flag && (mouseX >= 0 && mouseX <= CANVAS_WIDTH) && (mouseY >= 0 && mouseY <= CANVAS_HEIGHT) ) {
		if(selectedControlPoint != null){
            // Update control Point
            controlPoints[selectedControlPoint] = [mouseX, mouseY];
            
            // redraw control points
            background(219);
            controlPoints.forEach(cp => {
                stroke(255, 0, 0);
                point(cp[0], cp[1]);
                stroke(0, 255, 0);
                circle(cp[0], cp[1], 20);
            });
            
            // redraw Bezier Curve
            bezierCurve();
		}
	}
}

function mouseClicked(){
	if( !draggbleCurve && (mouseX >= 0 && mouseX <= CANVAS_WIDTH) && (mouseY >= 0 && mouseY <= CANVAS_HEIGHT) ) {
		controlPoints.push([mouseX, mouseY]);
        stroke(0, 255, 0);
        circle(mouseX, mouseY, 20);
        stroke(255, 0, 0);
		point(mouseX, mouseY);
    }

}

function mouseReleased(){

		if(draggbleCurve && selectedControlPoint != null && (mouseX >= 0 && mouseX <= CANVAS_WIDTH) && (mouseY >= 0 && mouseY <= CANVAS_HEIGHT)){
			selectedControlPoint = null;
			updateLog("Control Points Updated - ");
		}

    }


/**
 *  Button Events
 */


 function drawBezier(){
	bezierCurve();
	draggbleCurve = true;
	updateLog("Bezier Curve Created");
}

function restart(){
    controlPoints = [];
	flag = false;
	draggbleCurve = false;
	selectedControlPoint = null;
    background(219);
	document.getElementById("myLog").value = "Application restarted;\n";
}



function updateLog(msg){
    myLog = document.getElementById("myLog").value;
    myLog += msg + "["
	controlPoints.forEach((cp, index) => {
		myLog +=  "C" + index + " (" + Math.floor(cp[0]) + ", " + Math.floor(cp[1]) + ") "
	});
	myLog += "];\n"
    document.getElementById("myLog").value = myLog;
}

/*
* Berzier Curve Algorithm
* acc - Accuracy - 0 to 1 is the number of points will be ploted
*/

function bezierCurve(){
	flag = true;
    let acc = 0.0001;
    stroke(255, 0, 0);
    
    for(let i = 0; i < 1; i += acc){
       let pi = getBezierPoint(i);
       point(Math.round(pi[0]), Math.round(pi[1]));
    }
}


/** 
 * Cacluate the next coodininate of Berzier Curve for t paramter and each control point. 
*/
function getBezierPoint(t){
    
    let x = 0, y = 0;
    var n = controlPoints.length - 1;
    for(let i = 0; i < controlPoints.length; i++){
        let bern_poly = bernstein(t, i, n);
        x+= controlPoints[i][0] * bern_poly;
        y+= controlPoints[i][1] * bern_poly; 
    }

    return [x, y];
}  


/**
 * Function to calaculute Bernstein Poly
 * combination(n, i) * u^i * (1 - u)^(n - i)
 */

function bernstein(u, i, n){
    let x = comb(n, i);
    let y = Math.pow(u, i);
    let p1 = (1 - u);
    let p2 = (n - i);
    let z = Math.pow(p1, p2);   
    let k = x * y * z
    return k;

}

// Combination operation
function comb(n , i){
    return fact(n) / (fact(i) * fact(n - i));
}

// Factiorial operation
function fact(n){
    let resp = 1;
    for(let i = 2; i <= n; i++){
        resp = resp * i;
    }	
    return resp;
}
