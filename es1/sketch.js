// E1. Ricombinare una fotografia
//
// Fotografia: https://unsplash.com/@sarahlouisekinsella
// Autore: Sarah Louise Kinsella
// Procedimento: la foto è scomposta in anelli circolari concentrici; ogni
// anello ruota secondo la posizione del mouse e al centro tornano a combaciare.
//
// Obiettivo: scomporre una fotografia e ricomporla progressivamente, per intero
// o in parte, fino a un risultato inatteso in cui la figura cambia di senso,
// si scioglie nelle sue componenti plastiche o riemerge dai frammenti.
//
// Vincoli (dalle specifiche della consegna):
// - tela di riferimento 800x600 pixel (larghezza x altezza); se serve un altro
//   rapporto, uno solo dei due lati può essere inferiore (es. 800x400, 600x600)
// - fotografia salvata nella cartella dello sketch e caricata con await loadImage()
//   dentro async function setup(), senza preload(): p5.js 2 non lo usa più
// - una parte ricombinatoria: porzioni della fotografia spostate in altre
//   posizioni; filtri, reinterpretazioni dei colori e trasformazioni dell'intera
//   immagine, da soli, non bastano
// - commento iniziale con l'indirizzo della pagina della fotografia (o
//   "fotografia propria") e il nome dell'autore, se la licenza lo richiede
// - anteprima "preview.png" con un fotogramma rappresentativo del risultato

// ============================================================
// CONFIG  -  tutti i parametri da modificare stanno qui
// ============================================================
const numeroCerchi = 12;      // quanti anelli concentrici compongono la scomposizione
const diametroMassimo = 600;  // diametro dell'anello esterno (l'altezza della tela)
const rotazioneMassima = 1.5; // radianti: quanto ruota l'anello più interno a piena distanza
const morbidezza = 0.1;       // da 0 a 1: quanto il movimento segue il mouse (1 = immediato)

let fotografia;
let scalaFoto;
let larghezzaFoto;
let altezzaFoto;

// stato del mouse: prima che entri nella tela vale il centro, così si parte
// con l'immagine intera
let dentroTela = false;
let quanto = 0;               // distanza attuale del mouse dal centro, con scorrimento morbido

// ============================================================
// SETUP  -  una volta sola, all'avvio
// ============================================================
async function setup() {
  createCanvas(800, 600);
  fotografia = await loadImage("image.jpg");

  // la foto (verticale) copre tutta la tela restando proporzionata:
  // la scala è il fattore più grande fra quelli che riempirebbero larghezza e altezza
  scalaFoto = max(width / fotografia.width, height / fotografia.height);
  larghezzaFoto = fotografia.width * scalaFoto;
  altezzaFoto = fotografia.height * scalaFoto;

  imageMode(CENTER);
}

// ============================================================
// DRAW  -  viene richiamato 60 volte al secondo
// ============================================================
function draw() {
  background(0);

  // il mouse lontano dalla tela si comporta come al centro: l'immagine si ricompone
  let bersaglio = dentroTela
    ? map(dist(mouseX, mouseY, width / 2, height / 2), 0, dist(0, 0, width / 2, height / 2), 0, 1)
    : 0;

  // scorrimento morbido verso la distanza bersaglio
  quanto = lerp(quanto, bersaglio, morbidezza);

  // il verso (orario o antiorario) lo decide la metà in cui sta il mouse
  const angoloMouse = atan2(mouseY - height / 2, mouseX - width / 2);
  const segno = cos(angoloMouse) >= 0 ? 1 : -1;

  // prima la foto per intero, poi gli anelli dal più grande al più piccolo:
  // ogni cerchio riscrive quello precedente dentro la propria circonferenza
  push();
  translate(width / 2, height / 2);
  image(fotografia, 0, 0, larghezzaFoto, altezzaFoto);

  const passo = diametroMassimo / numeroCerchi;
  for (let i = 0; i < numeroCerchi; i++) {
    const diametro = diametroMassimo - i * passo;
    // gli anelli più interni ruotano di più: al centro della foto il moltiplicatore
    // (i + 1) raggiunge numeroCerchi, quindi teniamo conto anche di quello
    const rotazione =
      quanto * rotazioneMassima * ((i + 1) / numeroCerchi) * segno;

    push();
    beginClip();
    circle(0, 0, diametro);
    endClip();
    rotate(rotazione);
    image(fotografia, 0, 0, larghezzaFoto, altezzaFoto);
    pop();
  }
  pop();
}

function mouseOver() {
  dentroTela = true;
}

function mouseOut() {
  dentroTela = false;
}
