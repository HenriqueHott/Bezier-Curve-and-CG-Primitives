// Sketch information
const SKETCH_WIDTH = document.getElementById('sketch-holder').offsetWidth;
const SKETCH_HEIGHT = document.getElementById('sketch-holder').offsetHeight;
const SKETCH_CENTER = [Math.floor(SKETCH_WIDTH/2), Math.floor(SKETCH_HEIGHT/2)];
const BACKGROUND_COLOR = 219;

// View window limits
maxWindowWidth = minWidowWidth = maxWindowHeight = minWindowHeight = null; 

// Flags
isFinal = false
lastInitialPoint = [-1, -1];
lastFinalPoint = [-1, -1];


function setup() { 
    var sketch = createCanvas(SKETCH_WIDTH, SKETCH_HEIGHT);
    sketch.parent('sketch-holder');
    background(BACKGROUND_COLOR);
    noFill();
    stroke('green');
    cursor(CROSS);
}

function mousePressed(){
    if( (mouseX >= 0 && mouseX <= SKETCH_WIDTH) && (mouseY >= 0 && mouseY <= SKETCH_HEIGHT) ) {
        if (!isFinal){
            isFinal = true;
            document.getElementById("cordXI").value = Math.floor(mouseX);
            document.getElementById("cordYI").value = Math.floor(mouseY);
            
            stroke(BACKGROUND_COLOR);
            point(lastInitialPoint[0], lastInitialPoint[1]); // remove last point setted
            stroke('green');
            point(mouseX, mouseY);
            lastInitialPoint = [mouseX, mouseY];
        
        }else {
            isFinal = false;
            document.getElementById("cordXF").value =Math.floor(mouseX);
            document.getElementById("cordYF").value = Math.floor(mouseY);
            stroke(BACKGROUND_COLOR);
            point(lastFinalPoint[0], lastFinalPoint[1]); // remove last point setted
            stroke('green');
            point(mouseX, mouseY);
            lastFinalPoint = [mouseX, mouseY];
        }

    }

}

function restart(){
    background(BACKGROUND_COLOR);
    noFill();
    isFinal = false
    lastInitialPoint = [-1, -1];
    lastFinalPoint = [-1, -1];
    stroke('green');
    cursor(CROSS);
}


/**
 *  Basic Primitivies Code
 */


/* DDA line algorithms  - https://www.geeksforgeeks.org/dda-line-generation-algorithm-computer-graphics/ */
function dda(initialCord=null, finalCord=null, color='blue'){
    stroke(color);
    // get coordinates from sketch
    if (initialCord == null){
        initialCord = [parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)];
        finalCord = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)];
    }

    var dx, dy, step, k;
    var x_incr, y_incr, x, y;

    dx = finalCord[0] - initialCord[0];
    dy = finalCord[1] - initialCord[1];

    if(Math.abs(dx) > Math.abs(dy)){
        step = Math.abs(dx);
    }else{
        step = Math.abs(dy);
    }
    x_incr = dx/step;
    y_incr = dy/step;

    x = initialCord[0]; y = initialCord[1]
    point(Math.round(x), Math.round(y));

    for (var k = 0; k < step; k++){
        x = x + x_incr;
        y = y + y_incr;
        point(Math.round(x), Math.round(y)); // Do not perpetuate the float point loss
    }

    stroke('green');
}




/* bresenham's line using only intergers avoding round loss - https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm */
function bresenhamLine(initialCord=null, finalCord=null, color='blue'){
    stroke(color);
    // get coordinates from sketch
    if(initialCord ==  null && finalCord==null){
        initialCord = [parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)];
        finalCord = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)];
    }

    var dx, dy, x, y, i, p, const1, const2;
    var incrx, incry;
    dx = finalCord[0] - initialCord[0];
    dy = finalCord[1] - initialCord[1];
    
    if(dx >= 0){
        incrx = 1;
    }else{incrx = -1; dx = -dx;}

    if(dy >= 0){
        incry = 1;
    }else{incry = -1; dy = -dy;}
    
    x = initialCord[0]; y = initialCord[1]
    point(x, y);
    if(dy < dx){
        p = 2*dy - dx; const1 = 2*dy; const2 = 2*(dy-dx);
        for (i = 0; i < dx; i++){
            x += incrx;
            if(p < 0){
                p += const1;
            }else{
                y+= incry; p += const2;
            }           
            point(x,y);
        }

    }else{
        p = 2*dx - dy; const1 = 2*dx; const2 = 2*(dx-dy);
        for (i = 0; i < dy; i++){
            y += incry;
            
            if(p < 0){
                p += const1;
            }else{
                x += incrx; p += const2;
            }          
            point(x,y);
        }
    }
    
    stroke('green');
}

/* Bresenham's Circle algorithm - https://www.geeksforgeeks.org/bresenhams-circle-drawing-algorithm/ */
function bresenhamCircle(initialCord=null, finalCord=null, color='blue'){
    stroke(color);

    initialCord = [parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)];
    finalCord = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)];
    
    var center = initialCord;
    var cordRadius = finalCord;
    var radius = Math.floor( Math.sqrt( Math.pow(cordRadius[0] - center[0], 2)  +  Math.pow(cordRadius[1] - center[1], 2) ) );
    
    var x = 0;
    var y = radius;
    var p = 3 - 2*radius;
    symmetricalPoints(x, y, center[0], center[1]); // Calculate only the points for the first quadrant. The rest are obtained by symmetry
    while(x < y){  
        if(p < 0){
            p+= 4*x + 6;

        }else{
            p+= 4*(x-y) + 10;
            y--;
        }
        x++;
        symmetricalPoints(x, y, center[0], center[1]);
    }

    stroke('green');
}

function symmetricalPoints(x, y, xc, yc){
    point((xc + x), (yc + y));
    point((xc + x), (yc - y));
    point((xc - x), (yc + y));
    point((xc - x), (yc - y));
    point((xc + y), (yc + x));
    point((xc + y), (yc - x));
    point((xc - y), (yc + x));
    point((xc - y), (yc - x));
}


/**
*  Clipping/window view code
*/


/* 
 Set the view window to clipping algorithms (using DDA to draw the limits)
*/
function setWindow(){

// set basic edges
edge1 =[parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)]; // Limit 1 
edge2 = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)]; // Limit 2
edge3 = [edge1[0], edge2[1]];
edge4 = [edge2[0], edge1[1]];

// get width limit
if(edge1[0] > edge2[0] ){
    maxWindowWidth = edge1[0];
    minWidowWidth = edge2[0];

} else {
    maxWindowWidth = edge2[0];
    minWidowWidth = edge1[0];
}

// get height limit
if(edge1[1] > edge2[1] ){
    maxWindowHeight = edge1[1];
    minWindowHeight = edge2[1];

} else {
    maxWindowHeight = edge2[1];
    minWindowHeight = edge1[1];
}

// Draw view Window to user
dda(edge1, edge3, 'red');
dda(edge1, edge4, 'red');
dda(edge2, edge3, 'red');
dda(edge2, edge4, 'red');

}


/* 
 Cohen-Sutherland clipping algorithm - limit the the image to window view -  https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm 
 The test is performed drawing a DDA line respecting the limits of window.
*/

function cohenSutherland(){
    cordI =[parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)]; 
    cordF = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)];
    
    var accept = false;
    var done = false;
    var outc;
    var xint, yint, c1, c2;

    var x1 = cordI[0];
    var y1 = cordI[1];
    var x2 = cordF[0];
    var y2 = cordF[1];

    var xmin = minWidowWidth;
    var xmax = maxWindowWidth;
    
    var ymin = minWindowHeight;
    var ymax = maxWindowHeight;

    while(!done){
        
        c1 = region_code(x1, y1);
        c2 = region_code(x2, y2);

        if (c1 == 0 && c2 == 0){
            accept = true; done = true;
        
        }else if((c1 & c2) != 0){
            done = true; // out of bounds
        
        }else{
            
            if(c1 != 0){
                outc = c1;
            }else{
                outc = c2;
            }
            
            if((outc & 1)==1){ // Left limit 
                xint = xmin;
                yint = y1 +  (y2 - y1) * (xmin - x1) / (x2 - x1);
            
            }else if((outc & 2)==2){ // Right limit
                xint = xmax;
                yint = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
            
            }else if((outc & 4)==4){ // Down limit
                yint = ymin;
                xint = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
            
            }else if((outc & 8)==8){ // Upper Limit
                yint = ymax;
                xint = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
            }
            
            if (c1 == outc){
                x1 = xint;
                y1 = yint;
            }else{
                x2 = xint;
                y2 = yint;
            }
        }    
    }

    if(accept){
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
        dda([x1, y1], [x2, y2], 'red');
    }
    
}

// Function to calculate the relation of the point to its position in the visualization window
function region_code(x,y){
let code=0;

if (x < minWidowWidth){
    code = code + 1;

}else if (x > maxWindowWidth){
    code = code + 2;
}
if (y < minWindowHeight){
    code = code + 4;

}else if (y > maxWindowHeight){
    code = code + 8;
}
return code;
}


/* 
 Liang-Barsky clipping - The Liang–Barsky algorithm uses the parametric equation of a line and inequalities describing the range of the clipping 
 window to determine the intersections between the line and the clip window -  https://en.wikipedia.org/wiki/Liang%E2%80%93Barsky_algorithm
 The test is performed drawing a DDA line respecting the limits of window.
*/

function liangBarsky(){
    var cordI =[parseInt(document.getElementById("cordXI").value), parseInt(document.getElementById("cordYI").value)]; 
    var cordF = [parseInt(document.getElementById("cordXF").value), parseInt(document.getElementById("cordYF").value)];

    var x1 = cordI[0];
    var y1 = cordI[1];
    var x2 = cordF[0];
    var y2 = cordF[1];
    
    var xmin = minWidowWidth;
    var xmax = maxWindowWidth;
    
    var ymin = minWindowHeight;
    var ymax = maxWindowHeight;
    
    // parameters
    u1 = 0.0; 
    u2 = 1.0;
    var dx, dy, x1, x2;

    dx = x2 - x1;
    dy = y2 - y1;

    if(cliptest(-dx, x1 - xmin)){
        if(cliptest(dx, xmax - x1)){
            if(cliptest(-dy, y1 - ymin)){
                if(cliptest(dy, ymax - y1)){
                    
                    if(u2 < 1.0){
                        x2 = x1 + u2*dx;
                        y2 = y1 + u2*dy;
                    }

                    if (u1 > 0.0){
                        x1 = x1 + u1*dx;
                        y1 = y1 + u1*dy;
                    }
                    dda( [Math.round(x1), Math.round(y1)], [Math.round(x2), Math.round(y2)], 'red');
                }
            }
        }
    }

}

function cliptest(p, q){
    var result = true;
    var r;
    
    if( p < 0.0 ){
        r = q/p;
        
        if( r > u2 ){
            result = false;
        
        }else if(r > u1){
            u1 = r;
        }
    
    } else if( p > 0.0){
        r = q/p;
        
        if( r < u1 ){
            result = false;
        
        }else if(r < u2){
            u2 = r;
        }

    } else if( q < 0.0 ){
        result = false;
    }
    return result;
}