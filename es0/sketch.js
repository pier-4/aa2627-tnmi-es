// ============================================================
// CONFIG  -  tutti i parametri da modificare stanno qui
// ============================================================
const CONFIG = {
  colonne: 9,
  righe: 6,
  cella: 80,
  margine: 28,
  raggio: 26,
  sfondo: [13, 13, 18],
  formaLontano: "#E4E4EA",
  formaVicino: "#C15F3C",

  raggioInfluenza: 230,
  scalaMassima: 0.65,
  smorzamento: 0.14,
  rotazioneMassima: 1.12,
};

let shapes = [];
let coloreLontano;
let coloreVicino;

let puntatoreDentro = false;
let puntatoreX = 0;
let puntatoreY = 0;

// ============================================================
// SETUP  -  una volta sola, all'avvio
// ============================================================
function setup() {
  const cont = document.getElementById("contenitore");
  if (cont) {
    createCanvas(windowWidth, windowHeight).parent(cont);
  } else {
    createCanvas(windowWidth, windowHeight);
  }
  colorMode(RGB);
  coloreLontano = color(CONFIG.formaLontano);
  coloreVicino = color(CONFIG.formaVicino);
  buildShapes();
}

// windowResized  -  ricostruisce tutto quando cambia la finestra
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildShapes();
}

// buildShapes  -  calcola il centro di ogni cella della griglia
function buildShapes() {
  shapes = [];
  const passo = calcolaPasso();
  const x0 = (width - (CONFIG.colonne - 1) * passo) / 2;
  const y0 = (height - (CONFIG.righe - 1) * passo) / 2;

  for (let r = 0; r < CONFIG.righe; r++) {
    for (let c = 0; c < CONFIG.colonne; c++) {
      shapes.push({
        x: x0 + c * passo,
        y: y0 + r * passo,
        tipo: (r + c) % 3,
        calore: 0,
        rot: 0,
      });
    }
  }
}

// calcolaPasso  -  distanza fra i centri, ridotta se la finestra e piccola
function calcolaPasso() {
  const richiesto = CONFIG.cella + CONFIG.margine;
  const orizzontale = (width - CONFIG.raggio * 4) / (CONFIG.colonne - 1);
  const verticale = (height - CONFIG.raggio * 4) / (CONFIG.righe - 1);
  return Math.min(richiesto, orizzontale, verticale);
}

// ============================================================
// DRAW  -  viene richiamato 60 volte al secondo
// ============================================================
function mouseMoved() {
  puntatoreDentro = true;
  puntatoreX = mouseX;
  puntatoreY = mouseY;
}

function mouseOut() {
  puntatoreDentro = false;
}

function draw() {
  background(...CONFIG.sfondo);

  for (const s of shapes) {
    const dx = puntatoreX - s.x;
    const dy = puntatoreY - s.y;
    const dist = Math.hypot(dx, dy);

    const obiettivoCalore = puntatoreDentro
      ? Math.max(0, Math.min(1, 1 - dist / CONFIG.raggioInfluenza))
      : 0;

    s.calore = lerp(s.calore, obiettivoCalore, CONFIG.smorzamento);

    const obiettivoRot = puntatoreDentro
      ? lerpAngolo(0, Math.atan2(dy, dx), s.calore) * CONFIG.rotazioneMassima
      : 0;
    s.rot = lerpAngolo(s.rot, obiettivoRot, CONFIG.smorzamento);

    drawShape(s);
  }
}

// influence  -  0 lontano dal mouse, 1 sotto il mouse
function influence(s) {
  const dist = Math.hypot(puntatoreX - s.x, puntatoreY - s.y);
  const t = 1 - dist / CONFIG.raggioInfluenza;
  return Math.max(0, Math.min(1, t));
}

// lerpAngolo  -  come lerp, ma sceglie sempre la strada piu corta
function lerpAngolo(a, b, t) {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * t;
}

// drawShape  -  disegna una singola forma al suo centro
function drawShape(s) {
  push();
  translate(s.x, s.y);
  scale(1 + CONFIG.scalaMassima * s.calore);
  rotate(s.rot);
  noStroke();
  fill(lerpColor(coloreLontano, coloreVicino, s.calore));

  if (s.tipo === 0) {
    circle(0, 0, CONFIG.raggio * 2);
  } else if (s.tipo === 1) {
    rectMode(CENTER);
    rect(0, 0, CONFIG.raggio * 2, CONFIG.raggio * 2, 10);
  } else {
    const r = CONFIG.raggio;
    triangle(0, -r, r, r * 0.9, -r, r * 0.9);
  }

  pop();
}
