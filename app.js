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
  ladeProduktdaten();
});

async function ladeProduktdaten(){
  try{
    const response = await fetch("./produkte.json", { cache: "no-store" });

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
    fuelleLinien(seite);
    fuelleProdukte(seite);
    aktualisiereProduktInfo(seite);
  });

  setzeStandardAuswahl("A", "Nassfutter", "Classic", "classic_adult_ente_reis");
  setzeStandardAuswahl("B", "Trockenfutter", "Adult", "trocken_adult_rind_reis");
}

function setzeStandardAuswahl(seite, typ, linie, produktId){
  const typSelect = document.getElementById(felder[seite].typ);
  const linieSelect = document.getElementById(felder[seite].linie);
  const produktSelect = document.getElementById(felder[seite].produkt);

  if([...typSelect.options].some(o => o.value === typ)){
    typSelect.value = typ;
  }

  fuelleLinien(seite);

  if([...linieSelect.options].some(o => o.value === linie)){
    linieSelect.value = linie;
  }

  fuelleProdukte(seite);

  if([...produktSelect.options].some(o => o.value === produktId)){
    produktSelect.value = produktId;
  }

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
  const typen = [...new Set(produkte.map(p => p.typ))];

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
  const linien = [...new Set(produkte.filter(p => p.typ === typ).map(p => p.linie))];

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
    option.textContent = `${produkt.name} – ${produkt.me_kcal_100g} kcal/100 g`;
    select.appendChild(option);
  });
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

  const quelle = produkt.me_quelle ? `, ME: ${produkt.me_quelle}` : "";
  info.textContent = `${produkt.me_kcal_100g} kcal/100 g · ${produkt.typ} · ${produkt.linie}${quelle}`;
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
  const anteilA = Number(document.getElementById("anteilA").value) / 100;
  const anteilB = 1 - anteilA;

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

  const kcalA = energiebedarf * anteilA;
  const kcalB = energiebedarf * anteilB;

  const grammA = (kcalA / produktA.me_kcal_100g) * 100;
  const grammB = (kcalB / produktB.me_kcal_100g) * 100;
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

function setzeErgebnisZurueck(){
  document.getElementById("energiebedarf").textContent = "-";
  document.getElementById("produktAName").textContent = "-";
  document.getElementById("produktBName").textContent = "-";
  document.getElementById("grammA").textContent = "-";
  document.getElementById("grammB").textContent = "-";
  document.getElementById("kcalA").textContent = "-";
  document.getElementById("kcalB").textContent = "-";
  document.getElementById("gesamtmenge").textContent = "-";
}
