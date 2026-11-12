// E2. Poesia concreta generativa
//
// Testo: onomatopee tratte da "Zang Tumb Tumb" di Filippo Tommaso Marinetti;
// elenco proprio: ZANG, TUMB, TA-TA-TA, BOOM, SBAM, TRRR, CRAC
// Font: Anton, scaricato da https://fonts.google.com/specimen/Anton
//       (file Anton-Regular.ttf nella cartella dell'esercitazione)
// Composizione: le parole formano un blocco tipografico centrato, con una
// parola dominante più grande. A riposo le lettere vibrano appena; il click
// attiva il comportamento della parola più vicina al cursore, un tasto
// qualsiasi passa alla parola successiva e ne attiva il comportamento.
//
// Obiettivo: far generare una composizione tipografica che cambi,
// autonomamente o grazie all'interazione dell'utente, mantenendo una coerenza
// semantica o formale con il testo scelto.
//
// Vincoli (dalle specifiche della consegna):
// - tela di riferimento 800x600 pixel (larghezza x altezza)
// - solo caratteri tipografici: niente figure geometriche
// - font TTF o OTF salvato nella cartella dello sketch e caricato con
//   await loadFont() dentro async function setup(), senza preload(): p5.js 2
//   non lo usa più
// - attributi delle lettere (posizione, dimensione, rotazione, colore) che
//   cambiano nel tempo o con l'interazione di mouse e tastiera
// - commento iniziale con il testo di partenza e il font usato
// - anteprima "preview.png" con un fotogramma rappresentativo del risultato

// ============================================================
// TESTO E COMPORTAMENTI
// ============================================================
const PAROLE = ["ZANG", "TUMB", "TA-TA-TA", "BOOM", "SBAM", "TRRR", "CRAC"];

// ogni parola ha il comportamento che porta il suo nome
const COMPORTAMENTO_PER_PAROLA = {
  ZANG: "ZANG",
  TUMB: "TUMB",
  "TA-TA-TA": "TA-TA-TA",
  BOOM: "BOOM",
  SBAM: "SBAM",
  TRRR: "TRRR",
  CRAC: "CRAC",
};

// ============================================================
// PARAMETRI GENERALI
// ============================================================

// misure della tela
const LARGHEZZA_TELA = 800;
const ALTEZZA_TELA = 600;

// disposizione del blocco tipografico
const DIMENSIONE_BASE = 42; // altezza del carattere delle parole normali
const FATTORE_DOMINANTE = 2; // quanto è più grande la parola dominante
const INTERLINEA = 0.95; // spazio fra le righe, in multipli della dimensione
const SPAZIO_RIGHE = 6; // pixel aggiunti fra una riga e l'altra
const SPAZIO_LETTERE = 1; // pixel aggiunti fra una lettera e l'altra
const VARIAZIONE_DIMENSIONE = 0.08; // scarto casuale della dimensione
const VARIAZIONE_ROTAZIONE = 0.08; // scarto casuale della rotazione

// vibrazione di riposo: dà l'idea di energia trattenuta
const AMPIEZZA_VIBRAZIONE = 1.5; // pixel di spostamento massimo
const VELOCITA_VIBRAZIONE = 0.01; // velocità con cui cambia il rumore

// repulsione del cursore, attiva solo quando nessuna parola si muove
const RAGGIO_REPULSIONE = 110; // distanza entro cui il mouse spinge le lettere
const FORZA_REPULSIONE = 0.18; // spinta applicata a ogni fotogramma

// ritorno verso la posizione di casa
const ATTRITO = 0.92; // quanto la velocità si spegne a ogni fotogramma
const RITORNO_CASA = 0.02; // quanto la posizione si avvicina alla casa
const RITORNO_ROTAZIONE = 0.02; // quanto la rotazione torna all'angolo di casa
const RITORNO_SCALA = 0.025; // quanto la scala torna a 1

// colori
const COLORE_SFONDO = "#0c0c10";
const COLORE_TESTO = "#f4f0e6";
const COLORE_ACCENTO = "#e63329";
const SBIADIMENTO_ACCENTO = 0.985; // quanto il rosso svanisce a ogni fotogramma

// scossa del canvas: l'ampiezza si spegne in modo esponenziale
const SCOSSA_DECADIMENTO = 0.78; // quanto cala la scossa a ogni fotogramma
const SCOSSA_MINIMA = 0.2; // sotto questa ampiezza la scossa si considera finita

// ============================================================
// PARAMETRI DI BOOM
// ============================================================
const BOOM_DURATA = 60; // fotogrammi totali del comportamento
const BOOM_VELOCITA_INIZIALE = 55; // velocità radiale al primo fotogramma
const BOOM_ATTRITO = 0.5; // frenata forte: la velocità si spegne in pochi frame
const BOOM_RITORNO_CASA = 0.1; // rientro breve, circa mezzo secondo
const BOOM_SCALA_INIZIALE = 4.5; // scala enorme impostata in un solo fotogramma
const BOOM_RITORNO_SCALA = 0.22; // riduzione rapida della scala
const BOOM_SBIADIMENTO_ACCENTO = 0.78; // durata del flash rosso
const BOOM_SCOSSA = 18; // intensità della scossa del canvas

// ============================================================
// PARAMETRI DI TUMB
// ============================================================
const TUMB_DURATA = 180; // fotogrammi totali del comportamento
const TUMB_VELOCITA_INIZIALE = 8; // spinta verso il basso al primo fotogramma
const TUMB_GRAVITA = 3.5; // accelerazione verso il bordo inferiore
const TUMB_ATTRITO_CADUTA = 1; // nessuna frenata durante la caduta
const TUMB_BORDO = ALTEZZA_TELA - 15; // quota del bordo inferiore per le lettere
const TUMB_DURATA_SCHIACCIAMENTO = 4; // fotogrammi in cui resta schiacciata
const TUMB_SCHIACCIAMENTO_X = 1.35; // allargamento orizzontale all'impatto
const TUMB_SCHIACCIAMENTO_Y = 0.55; // riduzione verticale all'impatto
const TUMB_COEFFICIENTE_RIMBALZO = 0.4; // ogni rimbalzo vale il 40% del precedente
const TUMB_RIMBALZI_MASSIMI = 2; // rimbalzi consentiti dopo l'impatto
const TUMB_ATTRITO_RIMBALZO = 1; // il rimbalzo non viene frenato dall'attrito
const TUMB_RITORNO_CASA = 0.13; // rientro morbido ma rapido
const TUMB_RITORNO_SCALA = 0.15; // ritorno della scala a 1 dopo lo schiacciamento
const TUMB_ACCENTO = 1; // flash rosso all'impatto
const TUMB_SBIADIMENTO_ACCENTO = 0.9; // durata del flash rosso
const TUMB_SCOSSA = 14; // intensità della scossa del canvas
const TUMB_FERMO_IMMAGINE = 3; // fotogrammi di sospensione all'impatto

// ============================================================
// PARAMETRI DI SBAM
// ============================================================
const SBAM_DURATA = 100; // fotogrammi totali del comportamento
const SBAM_VELOCITA_INIZIALE = 80; // velocità orizzontale al primo fotogramma
const SBAM_ATTRITO = 0.85; // frenata forte durante il volo
const SBAM_MARGINE = 20; // distanza dal bordo in cui avviene l'impatto
const SBAM_DURATA_SCHIACCIAMENTO = 4; // fotogrammi in cui resta schiacciata
const SBAM_SCHIACCIAMENTO_X = 0.5; // compressione orizzontale contro il bordo
const SBAM_SCHIACCIAMENTO_Y = 1.3; // allungamento verticale contro il bordo
const SBAM_RIMBALZO = 0.15; // il rimbalzo copre il 15% della distanza percorsa
const SBAM_DURATA_RIMBALZO = 8; // fotogrammi del piccolo rimbalzo
const SBAM_RITORNO_CASA = 0.14; // rientro rapido e senza oscillazioni
const SBAM_RITORNO_SCALA = 0.2; // ritorno rapido della scala a 1
const SBAM_ACCENTO = 1; // flash rosso all'impatto
const SBAM_SBIADIMENTO_ACCENTO = 0.85; // durata del flash rosso
const SBAM_SCOSSA = 18; // intensità della scossa del canvas
const SBAM_FERMO_IMMAGINE = 3; // fotogrammi di sospensione all'impatto

// ============================================================
// PARAMETRI DI ZANG
// ============================================================
const ZANG_DURATA = 90; // fotogrammi totali del comportamento
const ZANG_NUMERO_SCATTI = 3; // quanti scatti diagonali
const ZANG_INTERVALLO_SCATTI = 8; // fotogrammi fra uno scatto e l'altro
const ZANG_IMPULSO = 5; // forza di ogni scatto
const ZANG_ANGOLO = Math.PI / 4; // apertura della diagonale
const ZANG_ROTAZIONE = 0.35; // rotazione casuale massima a ogni scatto
const ZANG_CRESCITA = 0.15; // crescita della scala a ogni scatto
const ZANG_AMPIEZZA_VIBRAZIONE = 5; // pixel massimi del tremolio
const ZANG_FREQUENZA_VIBRAZIONE = 0.9; // velocità del tremolio
const ZANG_SMORZAMENTO = 0.94; // quanto il tremolio cala a ogni fotogramma
const ZANG_ACCENTO = 0.75; // rosso massimo durante gli scatti

// ============================================================
// PARAMETRI DI TRRR
// ============================================================
const TRRR_DURATA = 140; // fotogrammi totali del comportamento
const TRRR_AMPIEZZA_INIZIALE = 0.5; // pixel del tremolio all'inizio
const TRRR_AMPIEZZA_FINALE = 14; // pixel del tremolio alla fine
const TRRR_FREQUENZA = 0.45; // velocità dell'oscillazione
const TRRR_FREQUENZA_SECONDA = 1.7; // rapporto fra oscillazione orizzontale e verticale
const TRRR_NUMERO_COPIE = 5; // quante R finali in più
const TRRR_SPAZIO_COPIE = 10; // distanza fra le R ripetute
const TRRR_RIDUZIONE_COPIE = 0.92; // riduzione di scala di ogni copia
const TRRR_ACCENTO = 0.7; // rosso massimo alla fine del tremolio

// ============================================================
// PARAMETRI DI CRAC
// ============================================================
const CRAC_DURATA = 170; // fotogrammi totali del comportamento
const CRAC_APERTURA = 60; // fotogrammi per separare le due metà
const CRAC_CHIUSURA = 70; // fotogrammi finali per ricomporle
const CRAC_DISTANZA = 70; // pixel di separazione fra le metà
const CRAC_SALTO = 20; // scarto verticale fra le due metà
const CRAC_ROTAZIONE = 0.45; // rotazione opposta delle metà, in radianti
const CRAC_ACCENTO = 0.6; // rosso massimo quando è aperta
const CRAC_SCOSSA = 7; // intensità della scossa quando la parola si spezza

// ============================================================
// PARAMETRI DI TA-TA-TA
// ============================================================
const TA_DURATA = 110; // fotogrammi totali del comportamento
const TA_RITARDO = 10; // fotogrammi fra una sillaba e la successiva
const TA_IMPULSO = 6; // forza dello scatto di ogni sillaba
const TA_INCLINAZIONE = 0.55; // inclinazione laterale dello scatto
const TA_ROTAZIONE = 0.35; // rotazione casuale massima a ogni scatto
const TA_CRESCITA = 0.35; // crescita della scala a ogni scatto
const TA_ACCENTO = 1; // rosso al momento dello scatto

// durata di ogni comportamento, usata per fermarlo alla fine
const DURATA_COMPORTAMENTO = {
  BOOM: BOOM_DURATA,
  TUMB: TUMB_DURATA,
  SBAM: SBAM_DURATA,
  ZANG: ZANG_DURATA,
  "TA-TA-TA": TA_DURATA,
  TRRR: TRRR_DURATA,
  CRAC: CRAC_DURATA,
};

// ============================================================
// VARIABILI
// ============================================================
let font;
let lettere = [];
let parole = [];
let indiceDominante = 0;
let coloreTesto;
let coloreAccento;

// effetti globali
let scossaIntensita = 0;
let scossaX = 0;
let scossaY = 0;
let fermoImmagine = 0; // fotogrammi in cui le lettere non vengono aggiornate

// ============================================================
// SETUP  -  una volta sola, all'avvio
// ============================================================
async function setup() {
  createCanvas(LARGHEZZA_TELA, ALTEZZA_TELA);
  textAlign(CENTER, CENTER);
  noStroke();

  font = await loadFont("Anton-Regular.ttf");
  textFont(font);

  coloreTesto = color(COLORE_TESTO);
  coloreAccento = color(COLORE_ACCENTO);

  disponiParole();
}

// ============================================================
// DRAW  -  viene richiamato 60 volte al secondo
// ============================================================
function draw() {
  background(COLORE_SFONDO);

  // il fermo-immagine blocca le lettere per qualche fotogramma: è il colpo
  // che "pesa", e la scossa del canvas continua comunque a muoversi
  if (fermoImmagine > 0) {
    fermoImmagine--;
  } else {
    aggiornaParole();
    aggiornaLettere();
  }

  aggiornaScossa();

  push();
  translate(scossaX, scossaY);
  disegnaLettere();
  pop();
}

// ============================================================
// EFFETTI GLOBALI
// ============================================================

// fa partire una scossa, oppure rinforza quella già in corso
function avviaScossa(intensita) {
  scossaIntensita = max(scossaIntensita, intensita);
}

// la scossa sposta tutta la composizione e perde ampiezza a ogni fotogramma
function aggiornaScossa() {
  if (scossaIntensita < SCOSSA_MINIMA) {
    scossaIntensita = 0;
    scossaX = 0;
    scossaY = 0;
    return;
  }

  scossaX = random(-1, 1) * scossaIntensita;
  scossaY = random(-1, 1) * scossaIntensita;
  scossaIntensita *= SCOSSA_DECADIMENTO;
}

// sospende l'aggiornamento delle lettere per il numero di fotogrammi indicato
function avviaFermoImmagine(fotogrammi) {
  fermoImmagine = max(fermoImmagine, fotogrammi);
}

// ============================================================
// DISPOSIZIONE  -  costruisce il blocco tipografico
// ============================================================
function disponiParole() {
  lettere = [];
  parole = [];
  textFont(font);

  // prima misura tutte le righe, così il blocco può essere centrato in verticale
  const righe = [];
  let altezzaTotale = 0;

  for (let i = 0; i < PAROLE.length; i++) {
    const dimensione = i === indiceDominante
      ? DIMENSIONE_BASE * FATTORE_DOMINANTE
      : DIMENSIONE_BASE;
    const altezzaRiga = dimensione * INTERLINEA;

    righe.push({ parola: PAROLE[i], dimensione, altezzaRiga });
    altezzaTotale += altezzaRiga;
  }
  altezzaTotale += SPAZIO_RIGHE * (righe.length - 1);

  // poi dispone una riga dopo l'altra, partendo dall'alto del blocco
  let y = ALTEZZA_TELA / 2 - altezzaTotale / 2;

  for (const riga of righe) {
    const centroRiga = y + riga.altezzaRiga / 2;
    creaParola(riga.parola, riga.dimensione, centroRiga);
    y += riga.altezzaRiga + SPAZIO_RIGHE;
  }
}

// crea una parola, misura le lettere e le riunisce in un oggetto Parola
function creaParola(testo, dimensione, centroY) {
  const caratteri = [...testo];
  const misure = [];
  let larghezzaTotale = 0;
  let sillaba = 0;

  // il conteggio delle sillabe serve a TA-TA-TA per far partire gli scatti
  for (let i = 0; i < caratteri.length; i++) {
    const carattere = caratteri[i];
    if (i > 0 && caratteri[i - 1] === "-") sillaba++;

    const dimensioneLettera = dimensione
      * random(1 - VARIAZIONE_DIMENSIONE, 1 + VARIAZIONE_DIMENSIONE);

    textSize(dimensioneLettera);
    const larghezza = textWidth(carattere);

    misure.push({ carattere, dimensioneLettera, larghezza, sillaba });
    larghezzaTotale += larghezza;
  }
  larghezzaTotale += SPAZIO_LETTERE * (caratteri.length - 1);

  const lettereParola = [];
  let x = LARGHEZZA_TELA / 2 - larghezzaTotale / 2;

  for (let i = 0; i < misure.length; i++) {
    const misura = misure[i];
    const centroX = x + misura.larghezza / 2;
    const rotazione = random(-VARIAZIONE_ROTAZIONE, VARIAZIONE_ROTAZIONE);

    // CRAC divide la parola in due metà: la prima a sinistra, la seconda a destra
    const meta = i < misure.length / 2 ? -1 : 1;

    lettereParola.push(new Lettera(
      misura.carattere,
      centroX,
      centroY,
      misura.dimensioneLettera,
      rotazione,
      misura.larghezza,
      i,
      misura.sillaba,
      meta,
    ));

    x += misura.larghezza + SPAZIO_LETTERE;
  }

  const comportamento = COMPORTAMENTO_PER_PAROLA[testo];
  const parola = new Parola(testo, lettereParola, comportamento);

  parole.push(parola);
  lettere.push(...lettereParola);
}

// ============================================================
// AGGIORNAMENTO
// ============================================================
function aggiornaParole() {
  // azzero gli effetti temporanei del fotogramma precedente
  for (const lettera of lettere) {
    lettera.offset.set(0, 0);
    lettera.rotazioneExtra = 0;
  }

  const mouseDentroTela = mouseX >= 0 && mouseX <= width
    && mouseY >= 0 && mouseY <= height;
  const cEUnComportamentoAttivo = parole.some((parola) => parola.attivo);

  for (const parola of parole) {
    if (parola.attivo) {
      aggiornaComportamento(parola);
      parola.tempo++;
      parola.tempoStato++;

      if (parola.tempo > parola.durata) {
        parola.ferma();
      }
    } else {
      // le parole a riposo tornano alla loro scala e, se il mouse è sulla
      // tela e nessun comportamento è in corso, si lasciano respingere
      if (mouseDentroTela && !cEUnComportamentoAttivo) {
        for (const lettera of parola.lettere) {
          lettera.respingi(mouseX, mouseY);
        }
      }

      for (const lettera of parola.lettere) {
        lettera.scala = lerp(lettera.scala, 1, RITORNO_SCALA);
        lettera.scalaX = lerp(lettera.scalaX, 1, RITORNO_SCALA);
        lettera.scalaY = lerp(lettera.scalaY, 1, RITORNO_SCALA);
      }
    }
  }
}

function aggiornaLettere() {
  for (const lettera of lettere) {
    lettera.aggiorna();
  }
}

// sceglie il comportamento da eseguire per la parola
function aggiornaComportamento(parola) {
  switch (parola.comportamento) {
    case "BOOM":
      aggiornaBoom(parola);
      break;
    case "TUMB":
      aggiornaTumb(parola);
      break;
    case "SBAM":
      aggiornaSbam(parola);
      break;
    case "ZANG":
      aggiornaZang(parola);
      break;
    case "TRRR":
      aggiornaTrrr(parola);
      break;
    case "CRAC":
      aggiornaCrac(parola);
      break;
    case "TA-TA-TA":
      aggiornaTaTaTa(parola);
      break;
    default:
      break;
  }
}

// attiva una parola e ferma tutte le altre
function attivaParola(parola, px, py) {
  if (!parola) return;

  for (const altra of parole) {
    if (altra !== parola) altra.ferma();
  }
  parola.attiva(px, py);
}

// trova la parola con la lettera più vicina al punto indicato
function parolaPiuVicina(px, py) {
  let scelta = null;
  let distanzaMinima = Infinity;

  for (const parola of parole) {
    let distanzaParola = Infinity;

    for (const lettera of parola.lettere) {
      const d = dist(lettera.posizione.x, lettera.posizione.y, px, py);
      if (d < distanzaParola) distanzaParola = d;
    }

    if (distanzaParola < distanzaMinima) {
      distanzaMinima = distanzaParola;
      scelta = parola;
    }
  }

  return scelta;
}

// ============================================================
// DISEGNO
// ============================================================
function disegnaLettere() {
  for (const lettera of lettere) {
    lettera.disegna();
  }
}

// funzione di appoggio per ammorbidire l'inizio e la fine dei movimenti
function attenua(t) {
  const x = constrain(t, 0, 1);
  return x * x * (3 - 2 * x);
}

// ============================================================
// INTERAZIONE
// ============================================================
function mousePressed() {
  if (!mouseButton.left) return;

  const parola = parolaPiuVicina(mouseX, mouseY);
  attivaParola(parola, mouseX, mouseY);
}

function keyPressed(event) {
  if (!font) return;

  // lascio passare le scorciatoie del browser, come Ctrl+S
  if (event && (event.ctrlKey || event.metaKey || event.altKey)) return;

  // se il tasto resta premuto, non riattivo il comportamento a raffica
  if (event && event.repeat) return;

  // la parola successiva diventa dominante e mostra il suo comportamento
  indiceDominante = (indiceDominante + 1) % PAROLE.length;
  disponiParole();

  const parola = parole[indiceDominante];
  attivaParola(parola, width / 2, height / 2);
}

// ============================================================
// COMPORTAMENTI DELLE PAROLE
// ============================================================

// BOOM: esplosione radiale brevissima, scala enorme, flash e rientro secco
function aggiornaBoom(parola) {
  for (const lettera of parola.lettere) {
    if (parola.tempo === 0) {
      // ogni lettera parte in direzione radiale rispetto al punto del click
      const d = dist(
        lettera.posizione.x,
        lettera.posizione.y,
        parola.origine.x,
        parola.origine.y,
      );
      const angolo = d < 1
        ? random(TWO_PI)
        : atan2(
          lettera.posizione.y - parola.origine.y,
          lettera.posizione.x - parola.origine.x,
        );

      lettera.velocita.set(
        cos(angolo) * BOOM_VELOCITA_INIZIALE,
        sin(angolo) * BOOM_VELOCITA_INIZIALE,
      );
      lettera.attrito = BOOM_ATTRITO;
      lettera.ritornoCasa = BOOM_RITORNO_CASA;
      lettera.scala = BOOM_SCALA_INIZIALE;
      lettera.scalaX = 1;
      lettera.scalaY = 1;
      lettera.accento = 1;
    } else {
      // la scala crolla subito e il flash rosso si spegne in pochi fotogrammi
      lettera.scala = lerp(lettera.scala, 1, BOOM_RITORNO_SCALA);
      lettera.accento *= BOOM_SBIADIMENTO_ACCENTO;
    }
  }

  if (parola.tempo === 0) {
    avviaScossa(BOOM_SCOSSA);
  }
}

// TUMB: caduta pesante, schiacciamento, due rimbalzi corti e rientro
function aggiornaTumb(parola) {
  const lettereParola = parola.lettere;
  const prima = lettereParola[0];

  if (parola.tempo === 0) {
    parola.stato = "caduta";
    parola.tempoStato = 0;
    parola.rimbalzi = 0;
    parola.velocitaImpatto = 0;

    for (const lettera of lettereParola) {
      lettera.velocita.set(0, TUMB_VELOCITA_INIZIALE);
      lettera.attrito = TUMB_ATTRITO_CADUTA;
      lettera.ritornoCasa = 0;
      lettera.scalaX = 1;
      lettera.scalaY = 1;
      lettera.accento = 0;
    }
  }

  if (parola.stato === "caduta") {
    for (const lettera of lettereParola) {
      lettera.attrito = TUMB_ATTRITO_CADUTA;
      lettera.ritornoCasa = 0;
      lettera.velocita.y += TUMB_GRAVITA;
    }

    if (prima.posizione.y >= TUMB_BORDO) {
      parola.stato = "schiacciamento";
      parola.tempoStato = 0;
      parola.velocitaImpatto = abs(prima.velocita.y);

      for (const lettera of lettereParola) {
        lettera.posizione.y = TUMB_BORDO;
        lettera.velocita.set(0, 0);
        lettera.attrito = 1;
        lettera.ritornoCasa = 0;
        lettera.scalaX = TUMB_SCHIACCIAMENTO_X;
        lettera.scalaY = TUMB_SCHIACCIAMENTO_Y;
        lettera.accento = TUMB_ACCENTO;
      }

      avviaScossa(TUMB_SCOSSA);
      avviaFermoImmagine(TUMB_FERMO_IMMAGINE);
    }
    return;
  }

  if (parola.stato === "schiacciamento") {
    for (const lettera of lettereParola) {
      lettera.velocita.set(0, 0);
      lettera.attrito = 1;
      lettera.ritornoCasa = 0;
      lettera.scalaX = TUMB_SCHIACCIAMENTO_X;
      lettera.scalaY = TUMB_SCHIACCIAMENTO_Y;
      lettera.accento *= TUMB_SBIADIMENTO_ACCENTO;
    }

    if (parola.tempoStato >= TUMB_DURATA_SCHIACCIAMENTO) {
      parola.stato = "rimbalzo";
      parola.tempoStato = 0;
      parola.rimbalzi = 1;

      for (const lettera of lettereParola) {
        lettera.velocita.set(
          0,
          -parola.velocitaImpatto * TUMB_COEFFICIENTE_RIMBALZO,
        );
        lettera.attrito = TUMB_ATTRITO_RIMBALZO;
        lettera.ritornoCasa = 0;
        lettera.scalaX = 1;
        lettera.scalaY = 1;
        lettera.accento *= TUMB_SBIADIMENTO_ACCENTO;
      }
    }
    return;
  }

  if (parola.stato === "rimbalzo") {
    for (const lettera of lettereParola) {
      lettera.attrito = TUMB_ATTRITO_RIMBALZO;
      lettera.ritornoCasa = 0;
      lettera.scalaX = lerp(lettera.scalaX, 1, TUMB_RITORNO_SCALA);
      lettera.scalaY = lerp(lettera.scalaY, 1, TUMB_RITORNO_SCALA);
      lettera.accento *= TUMB_SBIADIMENTO_ACCENTO;
      lettera.velocita.y += TUMB_GRAVITA;
    }

    if (prima.posizione.y >= TUMB_BORDO) {
      if (parola.rimbalzi < TUMB_RIMBALZI_MASSIMI) {
        parola.rimbalzi++;

        for (const lettera of lettereParola) {
          lettera.posizione.y = TUMB_BORDO;
          lettera.velocita.y = -abs(lettera.velocita.y)
            * TUMB_COEFFICIENTE_RIMBALZO;
          lettera.scalaX = TUMB_SCHIACCIAMENTO_X;
          lettera.scalaY = TUMB_SCHIACCIAMENTO_Y;
          lettera.accento = TUMB_ACCENTO;
        }
      } else {
        parola.stato = "rientro";
        parola.tempoStato = 0;

        for (const lettera of lettereParola) {
          lettera.velocita.set(0, 0);
          lettera.attrito = ATTRITO;
          lettera.ritornoCasa = TUMB_RITORNO_CASA;
          lettera.scalaX = 1;
          lettera.scalaY = 1;
        }
      }
    }
    return;
  }

  if (parola.stato === "rientro") {
    for (const lettera of lettereParola) {
      lettera.attrito = ATTRITO;
      lettera.ritornoCasa = TUMB_RITORNO_CASA;
      lettera.scalaX = lerp(lettera.scalaX, 1, TUMB_RITORNO_SCALA);
      lettera.scalaY = lerp(lettera.scalaY, 1, TUMB_RITORNO_SCALA);
      lettera.accento *= TUMB_SBIADIMENTO_ACCENTO;
    }
  }
}

// SBAM: colpo orizzontale secco contro il bordo più vicino, un solo rimbalzo
function aggiornaSbam(parola) {
  const lettereParola = parola.lettere;

  if (parola.tempo === 0) {
    let sommaX = 0;
    for (const lettera of lettereParola) sommaX += lettera.posizione.x;

    const centroX = sommaX / lettereParola.length;
    parola.direzione = centroX < LARGHEZZA_TELA / 2 ? -1 : 1;
    parola.stato = "volo";
    parola.tempoStato = 0;
    parola.distanzaImpatto = 0;

    for (const lettera of lettereParola) {
      lettera.velocita.set(parola.direzione * SBAM_VELOCITA_INIZIALE, 0);
      lettera.attrito = SBAM_ATTRITO;
      lettera.ritornoCasa = 0;
      lettera.scalaX = 1;
      lettera.scalaY = 1;
      lettera.vibrazioneBase = false;
      lettera.accento = 0;
    }
  }

  if (parola.stato === "volo") {
    const limite = parola.direzione === 1
      ? LARGHEZZA_TELA - SBAM_MARGINE
      : SBAM_MARGINE;
    let eccesso = 0;

    // controlla il bordo esterno di ogni lettera, non il suo centro
    for (const lettera of lettereParola) {
      const bordo = lettera.posizione.x
        + parola.direzione * lettera.larghezza / 2;
      eccesso = max(eccesso, parola.direzione * (bordo - limite));
    }

    if (eccesso > 0) {
      for (const lettera of lettereParola) {
        lettera.posizione.x -= parola.direzione * eccesso;
        lettera.velocita.set(0, 0);
        lettera.attrito = 1;
        lettera.ritornoCasa = 0;
        lettera.scalaX = SBAM_SCHIACCIAMENTO_X;
        lettera.scalaY = SBAM_SCHIACCIAMENTO_Y;
        lettera.accento = SBAM_ACCENTO;
      }

      parola.distanzaImpatto = abs(
        lettereParola[0].posizione.x - lettereParola[0].casa.x,
      );
      parola.stato = "schiacciamento";
      parola.tempoStato = 0;

      avviaScossa(SBAM_SCOSSA);
      avviaFermoImmagine(SBAM_FERMO_IMMAGINE);
    }
    return;
  }

  if (parola.stato === "schiacciamento") {
    for (const lettera of lettereParola) {
      lettera.velocita.set(0, 0);
      lettera.attrito = 1;
      lettera.ritornoCasa = 0;
      lettera.scalaX = SBAM_SCHIACCIAMENTO_X;
      lettera.scalaY = SBAM_SCHIACCIAMENTO_Y;
      lettera.accento *= SBAM_SBIADIMENTO_ACCENTO;
    }

    if (parola.tempoStato >= SBAM_DURATA_SCHIACCIAMENTO) {
      parola.stato = "rimbalzo";
      parola.tempoStato = 0;
    }
    return;
  }

  if (parola.stato === "rimbalzo") {
    const avanzamento = constrain(
      parola.tempoStato / SBAM_DURATA_RIMBALZO,
      0,
      1,
    );
    // il blocco arretra del 15% della distanza percorsa, senza oscillare
    const arretramento = 1 - SBAM_RIMBALZO * attenua(avanzamento);

    for (const lettera of lettereParola) {
      lettera.posizione.x = lettera.casa.x
        + parola.direzione * parola.distanzaImpatto * arretramento;
      lettera.velocita.set(0, 0);
      lettera.attrito = 1;
      lettera.ritornoCasa = 0;
      lettera.scalaX = lerp(lettera.scalaX, 1, SBAM_RITORNO_SCALA);
      lettera.scalaY = lerp(lettera.scalaY, 1, SBAM_RITORNO_SCALA);
      lettera.accento *= SBAM_SBIADIMENTO_ACCENTO;
    }

    if (avanzamento >= 1) {
      parola.stato = "rientro";
      parola.tempoStato = 0;

      for (const lettera of lettereParola) {
        lettera.attrito = ATTRITO;
        lettera.ritornoCasa = SBAM_RITORNO_CASA;
      }
    }
    return;
  }

  if (parola.stato === "rientro") {
    for (const lettera of lettereParola) {
      lettera.attrito = ATTRITO;
      lettera.ritornoCasa = SBAM_RITORNO_CASA;
      lettera.scalaX = lerp(lettera.scalaX, 1, SBAM_RITORNO_SCALA);
      lettera.scalaY = lerp(lettera.scalaY, 1, SBAM_RITORNO_SCALA);
      lettera.accento *= SBAM_SBIADIMENTO_ACCENTO;
    }
  }
}

// ZANG: scatti rapidi in diagonale, poi tremolio veloce che si smorza
function aggiornaZang(parola) {
  for (const lettera of parola.lettere) {
    if (parola.tempo === 0) {
      lettera.ampiezzaVibrazione = ZANG_AMPIEZZA_VIBRAZIONE;
    }

    // gli scatti partono a intervalli regolari e cambiano diagonale
    if (
      lettera.prossimoScatto < ZANG_NUMERO_SCATTI
      && parola.tempo >= lettera.prossimoScatto * ZANG_INTERVALLO_SCATTI
    ) {
      const verso = lettera.prossimoScatto % 2 === 0 ? 1 : -1;
      const angolo = verso * ZANG_ANGOLO;

      lettera.velocita.x += cos(angolo) * ZANG_IMPULSO;
      lettera.velocita.y += sin(angolo) * ZANG_IMPULSO;
      lettera.rotazione += random(-ZANG_ROTAZIONE, ZANG_ROTAZIONE);
      lettera.scala = max(lettera.scala, 1 + ZANG_CRESCITA);
      lettera.prossimoScatto++;
    }

    // il tremolio ad alta frequenza perde ampiezza a ogni fotogramma
    lettera.ampiezzaVibrazione *= ZANG_SMORZAMENTO;
    const fase = parola.tempo * ZANG_FREQUENZA_VIBRAZIONE
      + lettera.faseOscillazione;

    lettera.offset.x = sin(fase) * lettera.ampiezzaVibrazione;
    lettera.offset.y = cos(fase * 1.3) * lettera.ampiezzaVibrazione;

    // il rosso segue il tremolio, non resta acceso fino alla fine
    const intensita = lettera.ampiezzaVibrazione / ZANG_AMPIEZZA_VIBRAZIONE;
    lettera.accento = ZANG_ACCENTO * intensita;
  }
}

// TRRR: lettere ferme al loro posto, tremolio crescente, R finale ripetuta
function aggiornaTrrr(parola) {
  const avanzamento = constrain(parola.tempo / TRRR_DURATA, 0, 1);
  const ampiezza = lerp(
    TRRR_AMPIEZZA_INIZIALE,
    TRRR_AMPIEZZA_FINALE,
    avanzamento,
  );

  for (const lettera of parola.lettere) {
    const fase = parola.tempo * TRRR_FREQUENZA
      + lettera.faseOscillazione;

    // l'oscillazione è solo visiva: la posizione di casa non cambia
    lettera.offset.x = sin(fase) * ampiezza;
    lettera.offset.y = cos(fase * TRRR_FREQUENZA_SECONDA) * ampiezza * 0.6;
    lettera.accento = TRRR_ACCENTO * avanzamento;
  }

  // la R finale si moltiplica man mano che il tremolio cresce
  const ultima = parola.lettere[parola.lettere.length - 1];
  ultima.copie = 1 + floor(avanzamento * TRRR_NUMERO_COPIE);
}

// CRAC: la parola si spezza a metà, le metà ruotano in versi opposti
function aggiornaCrac(parola) {
  const apertura = aperturaCrac(parola.tempo);

  // la frattura dà una scossa breve solo nel fotogramma in cui si apre
  if (parola.tempo === 0) avviaScossa(CRAC_SCOSSA);

  for (const lettera of parola.lettere) {
    const segno = lettera.meta;

    lettera.offset.x = segno * CRAC_DISTANZA * apertura;
    lettera.offset.y = -segno * CRAC_SALTO * apertura;
    lettera.rotazioneExtra = segno * CRAC_ROTAZIONE * apertura;
    lettera.accento = CRAC_ACCENTO * apertura;
  }
}

// calcola quanto è aperta la frattura di CRAC, da 0 a 1
function aperturaCrac(tempo) {
  if (tempo < CRAC_APERTURA) {
    return attenua(tempo / CRAC_APERTURA);
  }

  const inizioChiusura = CRAC_DURATA - CRAC_CHIUSURA;
  if (tempo < inizioChiusura) return 1;

  return 1 - attenua((tempo - inizioChiusura) / CRAC_CHIUSURA);
}

// TA-TA-TA: ogni sillaba scatta in sequenza, come una raffica
function aggiornaTaTaTa(parola) {
  for (const lettera of parola.lettere) {
    const inizioSillaba = lettera.sillaba * TA_RITARDO;

    if (parola.tempo < inizioSillaba || lettera.scattoFatto) continue;

    // le sillabe alterne scattano verso destra e verso sinistra
    const inclinazione = lettera.sillaba % 2 === 0
      ? -TA_INCLINAZIONE
      : TA_INCLINAZIONE;
    const angolo = -Math.PI / 2 + inclinazione;

    lettera.velocita.x += cos(angolo) * TA_IMPULSO;
    lettera.velocita.y += sin(angolo) * TA_IMPULSO;
    lettera.rotazione += random(-TA_ROTAZIONE, TA_ROTAZIONE);
    lettera.scala = max(lettera.scala, 1 + TA_CRESCITA);
    lettera.accento = TA_ACCENTO;
    lettera.scattoFatto = true;
  }
}

// ============================================================
// CLASSI
// ============================================================

// una lettera è un oggetto autonomo con una posizione di casa e uno stato
class Lettera {
  constructor(
    carattere,
    x,
    y,
    dimensione,
    rotazione,
    larghezza,
    indice,
    sillaba,
    meta,
  ) {
    this.carattere = carattere;
    this.dimensione = dimensione;
    this.larghezza = larghezza;
    this.indice = indice;
    this.sillaba = sillaba;
    this.meta = meta;

    // posizione di casa e posizione attuale
    this.casa = createVector(x, y);
    this.posizione = createVector(x, y);

    // velocità e stato del movimento
    this.velocita = createVector(0, 0);
    this.rotazione = rotazione;
    this.rotazioneCasa = rotazione;
    this.scala = 1;
    this.scalaX = 1; // schiacciamento orizzontale
    this.scalaY = 1; // schiacciamento verticale
    this.attrito = ATTRITO; // frenata usata dalla fisica comune
    this.ritornoCasa = RITORNO_CASA; // forza del rientro verso la casa

    // effetti temporanei applicati solo al disegno
    this.offset = createVector(0, 0);
    this.rotazioneExtra = 0;
    this.copie = 1;
    this.vibrazioneBase = true;

    // stato interno dei comportamenti
    this.faseOscillazione = random(TWO_PI);
    this.ampiezzaVibrazione = 0;
    this.prossimoScatto = 0;
    this.scattoFatto = false;

    // il colore parte dal chiaro e tende al rosso durante il movimento
    this.accento = 0;
    this.colore = coloreTesto;

    // fase diversa per ogni lettera, così la vibrazione non è sincronizzata
    this.fase = random(1000);
  }

  // riporta a zero tutto ciò che un comportamento ha aggiunto
  azzeraComportamento() {
    this.velocita.set(0, 0);
    this.offset.set(0, 0);
    this.rotazioneExtra = 0;
    this.copie = 1;
    this.scala = 1;
    this.ampiezzaVibrazione = 0;
    this.prossimoScatto = 0;
    this.scattoFatto = false;
    this.scalaX = 1;
    this.scalaY = 1;
    this.attrito = ATTRITO;
    this.ritornoCasa = RITORNO_CASA;
    this.vibrazioneBase = true;
  }

  // spostamento piccolo e continuo, calcolato solo al momento del disegno
  vibrazione() {
    if (!this.vibrazioneBase) return { x: 0, y: 0 };

    const x = (noise(this.fase, frameCount * VELOCITA_VIBRAZIONE) - 0.5)
      * 2 * AMPIEZZA_VIBRAZIONE;
    const y = (noise(this.fase + 100, frameCount * VELOCITA_VIBRAZIONE) - 0.5)
      * 2 * AMPIEZZA_VIBRAZIONE;
    return { x, y };
  }

  // il cursore spinge le lettere vicine verso l'esterno
  respingi(px, py) {
    const d = dist(this.posizione.x, this.posizione.y, px, py);
    if (d > RAGGIO_REPULSIONE || d === 0) return;

    const forza = (1 - d / RAGGIO_REPULSIONE) * FORZA_REPULSIONE;
    const angolo = atan2(this.posizione.y - py, this.posizione.x - px);

    this.velocita.x += cos(angolo) * forza;
    this.velocita.y += sin(angolo) * forza;
  }

  // fisica comune: la velocità muove la lettera e il lerp la riporta a casa
  aggiorna() {
    this.velocita.mult(this.attrito);
    this.posizione.add(this.velocita);
    this.posizione.lerp(this.casa, this.ritornoCasa);

    this.rotazione = lerp(this.rotazione, this.rotazioneCasa, RITORNO_ROTAZIONE);

    // il rosso svanisce gradualmente
    this.accento *= SBIADIMENTO_ACCENTO;
    this.colore = lerpColor(coloreTesto, coloreAccento, this.accento);
  }

  disegna() {
    const v = this.vibrazione();
    const x = this.posizione.x + v.x + this.offset.x;
    const y = this.posizione.y + v.y + this.offset.y;

    // normalmente c'è una sola lettera; TRRR può ripetere la R finale
    for (let copia = 0; copia < this.copie; copia++) {
      const scalaCopia = this.scala * pow(TRRR_RIDUZIONE_COPIE, copia);

      push();
      translate(x + copia * TRRR_SPAZIO_COPIE, y);
      rotate(this.rotazione + this.rotazioneExtra);
      scale(scalaCopia * this.scalaX, scalaCopia * this.scalaY);

      fill(this.colore);
      textSize(this.dimensione);
      text(this.carattere, 0, 0);
      pop();
    }
  }
}

// una parola riunisce le sue lettere e il comportamento che le anima
class Parola {
  constructor(testo, lettere, comportamento) {
    this.testo = testo;
    this.lettere = lettere;
    this.comportamento = comportamento;
    this.durata = DURATA_COMPORTAMENTO[comportamento];

    this.attivo = false;
    this.tempo = 0;
    this.origine = createVector(0, 0);

    // stato interno dei comportamenti a più fasi (TUMB, SBAM)
    this.stato = "";
    this.tempoStato = 0;
    this.rimbalzi = 0;
    this.velocitaImpatto = 0;
    this.direzione = 1;
    this.distanzaImpatto = 0;
  }

  // riporta lo stato delle fasi al valore iniziale
  azzeraStato() {
    this.stato = "";
    this.tempoStato = 0;
    this.rimbalzi = 0;
    this.velocitaImpatto = 0;
    this.direzione = 1;
    this.distanzaImpatto = 0;
  }

  attiva(px, py) {
    this.attivo = true;
    this.tempo = 0;
    this.origine.set(px, py);
    this.azzeraStato();

    for (const lettera of this.lettere) {
      lettera.azzeraComportamento();
    }
  }

  ferma() {
    this.attivo = false;
    this.tempo = 0;
    this.azzeraStato();

    for (const lettera of this.lettere) {
      lettera.azzeraComportamento();
    }
  }
}
