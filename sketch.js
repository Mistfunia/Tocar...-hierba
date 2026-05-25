let handPose;
let cam;
let hands = [];

let grass = [];
let points = [];
let dirt = [];

let palmas = [];
let minDist = 20;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  cam = createCapture(VIDEO);
  cam.size(640, 480);
  cam.hide();

  handPose.detectStart(cam, gotHands);
}

function draw() {
  if (palmas.length > 1) {
    background(0);
  }
  
  push();
  translate(width, 0);
  scale(-1, 1)

  for (let d of dirt) {
    let w = d.wear || 0;

    noStroke();
    let r = 90 + d.R;
    let v = 90 + d.G;
    let b = 40 + d.B;

    let targetR = 120;
    let targetG = 100;
    let targetB = 70;

    r = lerp(r, targetR, w * (-0.1));
    v = lerp(v, targetG, w * (-0.1));
    b = lerp(b, targetB, w * (-0.1));

    r = constrain(r, 100, 150);
    v = constrain(v, 60, 130);
    b = constrain(b, 40, 110);

    fill(r, v, b);
    ellipse(d.x1, d.y1, 15, 8);

    fill(140, 110, 70);
    ellipse(d.x2 + 2, d.y2 + 2, 6, 3);
  }

  for (let g of grass) {
    
    if (g.growth < g.maxGrowth) {
      g.growth += 1.5;
    }

    let t = g.growth / g.maxGrowth;
    t = min(1, t);

    let x2 = lerp(g.x1, g.x2, t);
    let y2 = lerp(g.y1, g.y2, t);
    
    let w = g.wear || 0;

    r = 140 + g.R + w * 1.6;
    v = 210 + g.G - w * 0.6;
    b = 90  + g.B  - w * 1.4;

    r = constrain(r, 120, 200);
    v = constrain(v, 180, 210);
    b = constrain(b, 30, 140);

    stroke(r, v, b);
    strokeWeight(1.5);
    line(g.x1, g.y1, x2, y2);

    if (!g.spawned && t >= 1) {

      points.push({
        x: g.x2,
        y: g.y2,
        r: random(170, 255),
        g: random(220, 255),
        b: random(90, 150),
        size: random(2, 4)
      });
      g.spawned = true;
      
      if (points.length > 2000) {
          points.shift(); //20 por array
        }
    }
  }

  for (let p of points) {
    noStroke();
    fill(p.r, p.g, p.b);
    circle(p.x, p.y, p.size);
  }
  pop();
}



function gotHands(results) {
  hands = results;

  let sx = width / cam.width;
  let sy = height / cam.height;

  for (let h of hands) {

    let kp0 = h.keypoints[0];

    let cx = (kp0.x - cam.width / 2) * sx + width / 2;
    let cy = kp0.y * sy;

    let demasiadoCerca = false;

    for (let p of palmas) {
      let d = dist(cx, cy, p.x, p.y);
      if (d < minDist) {
        demasiadoCerca = true;
        break;
      }
    }
    
    for (let g of grass) {

      let t = g.growth / g.maxGrowth;
      let gx = lerp(g.x1, g.x2, t);
      let gy = lerp(g.y1, g.y2, t);

      let d = dist(cx, cy, gx, gy);

      if (d < 200) {
        g.wear += 2;
      }
    }

    for (let d of dirt) {
      let distD = dist(cx, cy, d.x1, d.y1);
      if (distD < 200) {
        d.wear += 2;
      }
    }
    if (demasiadoCerca) continue;
    
    palmas.push({ x: cx, y: cy });
    if (palmas.length > 100) {
      palmas.shift(); //1 por array
    }
    

    for (let i = 0; i < 6; i++) {
      dirt.push({
        x1: cx + random(-30, 30),
        y1: cy + random(-30, 30),
        x2: cx + random(-50, 50),
        y2: cy + random(-50, 50),
        R: random(-40, 40),
        G: random(-20, 20),
        B: random(-20, 20),
        wear: 0
      });
      
      if (dirt.length > 600) {
        dirt.shift(); //6 cada array
      }
    }

    let connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20]
    ];

    for (let i = 0; i < connections.length; i++) {

      let [a, b] = connections[i];
      let kp1 = h.keypoints[a];
      let kp2 = h.keypoints[b];

      let x1 = (kp1.x - cam.width / 2) * sx + width / 2;
      let y1 = kp1.y * sy;

      let x2 = (kp2.x - cam.width / 2) * sx + width / 2;
      let y2 = kp2.y * sy;
      
      grass.push({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,

        growth: 0,
        maxGrowth: random(40, 120),

        R: random(-60, 20),
        G: random(-60, 10),
        B: random(-60, 20),

        spawned: false,
        wear: 0
      });
      
      if (grass.length > 2000) {
        grass.shift(); //20 cada array
      }
    }
  }
  print(palmas);
}