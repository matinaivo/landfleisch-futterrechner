let produkte = [];

const felder = {
  A: {
    typ: "typA",
    linie: "linieA",
    produkt: "produktA",
    info: "infoA"
  },
  B: {
    typ: "typB",
    linie: "linieB",
    produkt: "produktB",
    info: "infoB"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("anteilA").addEventListener("input", () => {
    aktualisiereAnteil();
    berechnenWennMoeglich();
  });

  document.getElementById("mengeA").addEventListener("input", berechnenWennMoeglich);

  document.querySelectorAll("input[name='rechenmodus']").forEach(radio => {
    radio.addEventListener("change", () => {
      aktualisiereModusAnsicht();
      berechnenWennMoeglich();
    });
  });

  document.getElementById("berechnenButton").addEventListener("click", berechnen);
  document.getElementById("gewicht").addEventListener("input", berechnenWennMoeglich);
  document.getElementById("aktivitaet").addEventListener("change", berechnenWennMoeglich);

  ["A", "B"].forEach(seite => {
    document.getElementById(felder[seite].typ).addEventListener("change", () => {
      fuelleLinien(seite);
      fuelleProdukte(seite);
      aktualisiereProduktInfo(seite);
      berechnenWennMoeglich();
    });

    document.getElementById(felder[seite].linie).addEventListener("change", () => {
      fuelleProdukte(seite);
      aktualisiereProduktInfo(seite);
      berechnenWennMoeglich();
    });

    document.getElementById(felder[seite].produkt).addEventListener("change", () => {
      aktualisiereProduktInfo(seite);
      berechnenWennMoeglich();
    });
  });

  aktualisiereAnteil();
  aktualisiereModusAnsicht();
  ladeProduktdaten();
});

async function ladeProduktdaten(){
  try{
    const response = await fetch("./produkte.json?v=8", { cache: "no-store" });

    if(!response.ok){
      throw new Error("produkte.json konnte nicht geladen werden.");
    }

    const data = await response.json();

    if(!Array.isArray(data) || data.length === 0){
      throw new Error("produkte.json enthält keine Produktliste.");
    }

    validiereProduktdaten(data);

    produkte = data;
    initialisiereAuswahl();
    aktiviereRechner();
    berechnen();
  }catch(error){
    console.error(error);
    zeigeDatenFehler();
  }
}

function validiereProduktdaten(data){
  data.forEach((produkt, index) => {
    if(!produkt.id || !produkt.name || !produkt.typ || !produkt.linie || typeof produkt.me_kcal_100g !== "number"){
      throw new Error(`Produktdaten unvollständig bei Eintrag ${index + 1}.`);
    }
  });
}

function initialisiereAuswahl(){
  ["A", "B"].forEach(seite => {
    fuelleTypen(seite);
  });

  setzeAuswahl("A", "Nassfutter", "Classic", "classic_adult_ente_reis");
  setzeAuswahl("B", "Trockenfutter", "Adult", "trocken_adult_rind_reis");
}

function setzeAuswahl(seite, typ, linie, produktId){
  const typSelect = document.getElementById(felder[seite].typ);
  const linieSelect = document.getElementById(felder[seite].linie);
  const produktSelect = document.getElementById(felder[seite].produkt);

  typSelect.value = typ;
  fuelleLinien(seite);

  linieSelect.value = linie;
  fuelleProdukte(seite);

  produktSelect.value = produktId;
  aktualisiereProduktInfo(seite);
}

function zeigeDatenFehler(){
  document.getElementById("datenFehler").classList.remove("hidden");
  document.getElementById("berechnenButton").disabled = true;
}

function aktiviereRechner(){
  ["A", "B"].forEach(seite => {
    document.getElementById(felder[seite].typ).disabled = false;
    document.getElementById(felder[seite].linie).disabled = false;
    document.getElementById(felder[seite].produkt).disabled = false;
  });

  document.getElementById("berechnenButton").disabled = false;
}

function fuelleTypen(seite){
  const select = document.getElementById(felder[seite].typ);
  const typen = getUniqueSorted(produkte.map(p => p.typ));

  select.innerHTML = "";

  typen.forEach(typ => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ;
    select.appendChild(option);
  });
}

function fuelleLinien(seite){
  const typ = document.getElementById(felder[seite].typ).value;
  const select = document.getElementById(felder[seite].linie);
  const linien = getUniqueSorted(
    produkte
      .filter(p => p.typ === typ)
      .map(p => p.linie)
  );

  select.innerHTML = "";

  linien.forEach(linie => {
    const option = document.createElement("option");
    option.value = linie;
    option.textContent = linie;
    select.appendChild(option);
  });
}

function fuelleProdukte(seite){
  const typ = document.getElementById(felder[seite].typ).value;
  const linie = document.getElementById(felder[seite].linie).value;
  const select = document.getElementById(felder[seite].produkt);

  const produktListe = produkte.filter(p => p.typ === typ && p.linie === linie);

  select.innerHTML = "";

  produktListe.forEach(produkt => {
    const option = document.createElement("option");
    option.value = produkt.id;
    option.textContent = produkt.name;
    select.appendChild(option);
  });
}

function getUniqueSorted(values){
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "de"));
}

function getProdukt(seite){
  const produktId = document.getElementById(felder[seite].produkt).value;
  return produkte.find(p => p.id === produktId);
}

function aktualisiereProduktInfo(seite){
  const produkt = getProdukt(seite);
  const info = document.getElementById(felder[seite].info);

  if(!produkt){
    info.textContent = "-";
    return;
  }

  info.textContent = `${produkt.me_kcal_100g} kcal/100 g · ${produkt.typ} · ${produkt.linie}`;
}

function getRechenmodus(){
  return document.querySelector("input[name='rechenmodus']:checked").value;
}

function aktualisiereModusAnsicht(){
  const modus = getRechenmodus();
  const prozentBereich = document.getElementById("prozentBereich");
  const festeMengeBereich = document.getElementById("festeMengeBereich");
  const festeMengeHinweis = document.getElementById("festeMengeHinweis");

  if(modus === "festeMenge"){
    prozentBereich.classList.add("hidden");
    festeMengeBereich.classList.remove("hidden");
    festeMengeHinweis.classList.remove("hidden");
  }else{
    prozentBereich.classList.remove("hidden");
    festeMengeBereich.classList.add("hidden");
    festeMengeHinweis.classList.add("hidden");
  }

  versteckeWarnung();
}

function aktualisiereAnteil(){
  const anteilA = Number(document.getElementById("anteilA").value);
  const anteilB = 100 - anteilA;

  document.getElementById("anteilAnzeige").textContent = anteilA;
  document.getElementById("anteilBAnzeige").textContent = anteilB;
}

function berechnenWennMoeglich(){
  if(produkte.length > 0){
    berechnen();
  }
}

function berechnen(){
  const gewicht = Number(document.getElementById("gewicht").value);
  const faktor = Number(document.getElementById("aktivitaet").value);

  if(!gewicht || gewicht <= 0){
    setzeErgebnisZurueck();
    return;
  }

  const produktA = getProdukt("A");
  const produktB = getProdukt("B");

  if(!produktA || !produktB){
    setzeErgebnisZurueck();
    return;
  }

  const metabolischesKG = Math.pow(gewicht, 0.75);
  const energiebedarf = faktor * metabolischesKG;
  const modus = getRechenmodus();

  if(modus === "festeMenge"){
    berechneFesteMenge(energiebedarf, produktA, produktB);
  }else{
    berechneProzent(energiebedarf, produktA, produktB);
  }
}

function berechneProzent(energiebedarf, produktA, produktB){
  const anteilA = Number(document.getElementById("anteilA").value) / 100;
  const anteilB = 1 - anteilA;

  const kcalA = energiebedarf * anteilA;
  const kcalB = energiebedarf * anteilB;

  const grammA = (kcalA / produktA.me_kcal_100g) * 100;
  const grammB = (kcalB / produktB.me_kcal_100g) * 100;

  versteckeWarnung();
  schreibeErgebnis(energiebedarf, produktA, produktB, grammA, grammB, kcalA, kcalB);
}

function berechneFesteMenge(energiebedarf, produktA, produktB){
  const grammA = Math.max(0, Number(document.getElementById("mengeA").value) || 0);
  const kcalA = (grammA * produktA.me_kcal_100g) / 100;
  const restKcal = energiebedarf - kcalA;

  let grammB = 0;
  let kcalB = 0;

  if(restKcal > 0){
    kcalB = restKcal;
    grammB = (kcalB / produktB.me_kcal_100g) * 100;
    versteckeWarnung();
  }else{
    const ueberschreitung = Math.abs(restKcal);
    const prozent = energiebedarf > 0 ? (ueberschreitung / energiebedarf) * 100 : 0;

    zeigeWarnung(
      `Die gewählte Menge von Futter 1 deckt oder überschreitet den berechneten Tagesenergiebedarf bereits. Futter 2 wird daher mit 0 g berechnet. Überschreitung: ${ueberschreitung.toFixed(0)} kcal (${prozent.toFixed(0)} %). Bitte Eingabe prüfen.`
    );
  }

  schreibeErgebnis(energiebedarf, produktA, produktB, grammA, grammB, kcalA, kcalB);
}

function schreibeErgebnis(energiebedarf, produktA, produktB, grammA, grammB, kcalA, kcalB){
  const gesamt = grammA + grammB;

  document.getElementById("energiebedarf").textContent = energiebedarf.toFixed(0);

  document.getElementById("produktAName").textContent =
    `${produktA.name} (${produktA.me_kcal_100g} kcal/100 g)`;

  document.getElementById("produktBName").textContent =
    `${produktB.name} (${produktB.me_kcal_100g} kcal/100 g)`;

  document.getElementById("grammA").textContent = grammA.toFixed(0);
  document.getElementById("grammB").textContent = grammB.toFixed(0);
  document.getElementById("kcalA").textContent = kcalA.toFixed(0);
  document.getElementById("kcalB").textContent = kcalB.toFixed(0);
  document.getElementById("gesamtmenge").textContent = gesamt.toFixed(0);
}

function zeigeWarnung(text){
  document.getElementById("warnungText").textContent = text;
  document.getElementById("warnung").classList.remove("hidden");
}

function versteckeWarnung(){
  document.getElementById("warnung").classList.add("hidden");
  document.getElementById("warnungText").textContent = "-";
}

function setzeErgebnisZurueck(){
  document.getElementById("energiebedarf").textContent = "-";
  document.getElementById("produktAName").textContent = "-";
  document.getElementById("produktBName").textContent = "-";
  document.getElementById("grammA").textContent = "-";
  document.getElementById("grammB").textContent = "-";
  document.getElementById("kcalA").textContent = "-";
  document.getElementById("kcalB").textContent = "-";
  document.getElementById("gesamtmenge").textContent = "-";
  versteckeWarnung();
}
