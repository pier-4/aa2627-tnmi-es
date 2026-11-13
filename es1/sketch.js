// E1. Ricombinare una fotografia
//
// Fotografia: https://unsplash.com/it/foto/fiore-di-dalia-con-gocce-dacqua-_v9CTt9WWqs
// Autore: Sarah Louise Kinsella
// Procedimento: la foto è scomposta in anelli circolari concentrici; ogni
// anello ruota secondo la posizione del mouse e al centro tornano a combaciare.
// La posizione verticale del mouse invece cambia il numero degli anelli: pochi
// al centro, molti verso il bordo alto o basso. Un click col tasto sinistro
// ferma la composizione e la lascia così com'è, un altro click la rimette in moto.
// Comandi: H apre e chiude l'aiuto, S salva il fotogramma; il pannello è sopra la tela.
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
const numeroCerchiMin = 6; // quanti anelli quando il mouse è al centro (Y)
const numeroCerchiMax = 20; // quanti anelli quando il mouse è sul bordo alto o basso
// scambiare i due valori qui sopra inverte la direzione dell'effetto
const diametroMassimo = 600; // diametro dell'anello esterno (l'altezza della tela)
const rotazioneMassima = 2.5; // radianti: quanto ruota l'anello più interno a piena distanza
const morbidezza = 0.3; // da 0 a 1: quanto il movimento segue il mouse (1 = immediato)
const ampiezzaInversione = 0.5; // quanto è dolce l'inversione sopra e sotto il centro
// (0 = netta come prima, 1 = il verso segue tutto l'angolo e varia al massimo)

// comandi da tastiera
const tastoAiuto = "h"; // apre e chiude il pannello dei comandi
const tastoSalva = "s"; // salva il fotogramma corrente
const nomeFileSalvataggio = "ricombinazione.png";

let fotografia;
let scalaFoto;
let larghezzaFoto;
let altezzaFoto;

// stato del mouse: prima che entri nella tela vale il centro, così si parte
// con l'immagine intera
let dentroTela = false;
let quanto = 0; // distanza attuale del mouse dal centro, con scorrimento morbido
let versoAttuale = 1; // segno della rotazione al momento presente
let numeroCerchiAttuale = numeroCerchiMin; // anelli al momento presente, deciso dalla Y
let congelato = false; // fermo immagine: si attiva e si disattiva col click sinistro

// pannello dei comandi e messaggio di focus: sono elementi HTML, fuori dal canvas,
// così non finiscono nell'immagine salvata
let aiutoAperto = false; // all'avvio il pannello è visibile per far scoprire il tasto H
let focusPrecedente;
let riattivaFocus = false; // il primo click dopo la perdita del focus serve solo a riattivare la finestra
let elementoAiuto;
let pulsanteAiuto;
let testoPulsante;
let messaggioFocus;

// ============================================================
// SETUP  -  una volta sola, all'avvio
// ============================================================
async function setup() {
  // il pannello e il messaggio stanno nell'HTML: qui li collego allo sketch
  elementoAiuto = document.getElementById("aiuto");
  pulsanteAiuto = document.getElementById("pulsante-aiuto");
  testoPulsante = document.getElementById("testo-pulsante");
  messaggioFocus = document.getElementById("messaggio-focus");

  pulsanteAiuto.addEventListener("click", cambiaAiuto);
  aggiornaAiuto();

  // il messaggio deve comparire anche se il browser sospende draw() mentre
  // la finestra non è attiva
  window.addEventListener("blur", aggiornaMessaggioFocus);
  window.addEventListener("focus", aggiornaMessaggioFocus);

  createCanvas(800, 600);
  fotografia = await loadImage("image.jpg");

  // la foto (verticale) copre tutta la tela restando proporzionata:
  // la scala è il fattore più grande fra quelli che riempirebbero larghezza e altezza
  scalaFoto = max(width / fotografia.width, height / fotografia.height);
  larghezzaFoto = fotografia.width * scalaFoto;
  altezzaFoto = fotografia.height * scalaFoto;

  imageMode(CENTER);

  aggiornaMessaggioFocus();
}

// ============================================================
// DRAW  -  viene richiamato 60 volte al secondo
// ============================================================
function draw() {
  // focused è true solo quando la finestra del browser è attiva:
  // è il momento in cui la tastiera può ricevere i comandi
  if (focused !== focusPrecedente) {
    aggiornaMessaggioFocus();
  }

  background(0);

  // se la composizione non è congelata, segue il mouse
  if (!congelato) {
    // scorrimento morbido verso la distanza bersaglio
    quanto = lerp(quanto, distanzaBersaglio(), morbidezza);

    // il verso (orario o antiorario) lo decide l'angolo del mouse rispetto al
    // centro: a destra positivo, a sinistra negativo, con passaggio graduale
    // sopra e sotto, così da non invertirsi di colpo
    versoAttuale = versoBersaglio();

    // il numero di anelli lo decide la distanza verticale dal centro: al centro
    // resta al valore minimo, verso il bordo alto o basso cresce
    numeroCerchiAttuale = lerp(
      numeroCerchiAttuale,
      lerp(numeroCerchiMin, numeroCerchiMax, influenzaY()),
      morbidezza,
    );
  }

  // prima la foto per intero, poi gli anelli dal più grande al più piccolo:
  // ogni cerchio riscrive quello precedente dentro la propria circonferenza
  push();
  translate(width / 2, height / 2);
  image(fotografia, 0, 0, larghezzaFoto, altezzaFoto);

  const passo = diametroMassimo / numeroCerchiAttuale;
  for (let i = 0; i < numeroCerchiAttuale; i++) {
    const diametro = diametroMassimo - i * passo;
    // gli anelli più interni ruotano di più: al centro della foto il moltiplicatore
    // (i + 1) raggiunge il numero di anelli, quindi teniamo conto anche di quello
    const rotazione =
      quanto *
      rotazioneMassima *
      ((i + 1) / numeroCerchiAttuale) *
      versoAttuale;

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

// distanzaBersaglio  -  quanto è lontano il mouse dal centro (0 al centro, 1 al bordo)
function distanzaBersaglio() {
  if (!dentroTela) return 0;
  return map(
    dist(mouseX, mouseY, width / 2, height / 2),
    0,
    dist(0, 0, width / 2, height / 2),
    0,
    1,
  );
}

// versoBersaglio  -  segno della rotazione, deciso dall'angolo del mouse
function versoBersaglio() {
  const angoloMouse = atan2(mouseY - height / 2, mouseX - width / 2);
  return constrain(cos(angoloMouse) / ampiezzaInversione, -1, 1);
}

// influenzaY  -  distanza verticale dal centro (0 al centro, 1 al bordo alto o basso)
// alta e bassa valgono uguale: la distanza è sempre positiva
function influenzaY() {
  if (!dentroTela) return 0;
  return constrain(abs(mouseY - height / 2) / (height / 2), 0, 1);
}

// mousePressed  -  il tasto sinistro ferma la composizione e la sblocca di nuovo
function mousePressed() {
  // il click che riporta il focus sulla finestra non deve anche congelare l'immagine
  if (riattivaFocus) {
    riattivaFocus = false;
    return;
  }

  // in p5.js 2 mouseButton è un oggetto con left, right e center
  if (!mouseButton.left) return;
  congelato = !congelato;
  if (congelato) {
    // il fermo immagine corrisponde esattamente al punto del click
    quanto = distanzaBersaglio();
    versoAttuale = versoBersaglio();
    numeroCerchiAttuale = lerp(numeroCerchiMin, numeroCerchiMax, influenzaY());
  }
}

function mouseMoved() {
  dentroTela = true;
}

function mouseOut() {
  dentroTela = false;
}

// keyPressed  -  H apre e chiude l'aiuto, S salva il fotogramma
function keyPressed(event) {
  // lascio passare le scorciatoie del browser, come Ctrl+S
  if (event && (event.ctrlKey || event.metaKey || event.altKey)) return;

  const tasto = key.toLowerCase();
  if (tasto === tastoAiuto) {
    cambiaAiuto();
  } else if (tasto === tastoSalva) {
    salvaImmagine();
  }
}

// salvaImmagine  -  scarica il canvas così com'è, senza il pannello HTML
function salvaImmagine() {
  save(nomeFileSalvataggio);
}

// cambiaAiuto  -  inverte lo stato del pannello
function cambiaAiuto() {
  aiutoAperto = !aiutoAperto;
  aggiornaAiuto();
}

// aggiornaAiuto  -  allinea pannello, pulsante e attributi per l'accessibilità
function aggiornaAiuto() {
  elementoAiuto.hidden = !aiutoAperto;
  pulsanteAiuto.setAttribute("aria-expanded", aiutoAperto);
  testoPulsante.textContent = aiutoAperto ? "Chiudi aiuto" : "Aiuto";
}

// aggiornaMessaggioFocus  -  mostra il messaggio quando la finestra perde il focus
function aggiornaMessaggioFocus() {
  focusPrecedente = focused;
  messaggioFocus.hidden = focused;

  if (!focused) {
    riattivaFocus = true;
  } else {
    // il click che ha riportato il focus è appena passato: lo ignoro,
    // poi i click tornano a funzionare normalmente
    setTimeout(() => {
      riattivaFocus = false;
    }, 200);
  }
}
