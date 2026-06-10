let produkte = [];

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("anteilA")
    .addEventListener("input", () => {
      aktualisiereAnteil();
      berechnenWennMoeglich();
    });

  document
    .getElementById("berechnenButton")
    .addEventListener("click", berechnen);

  document
    .getElementById("gewicht")
    .addEventListener("input", berechnenWennMoeglich);

  document
    .getElementById("aktivitaet")
    .addEventListener("change", berechnenWennMoeglich);

  document
    .getElementById("produktA")
    .addEventListener("change", berechnenWennMoeglich);

  document
    .getElementById("produktB")
    .addEventListener("change", berechnenWennMoeglich);

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
    fuelleProduktSelects();
    aktiviereRechner();
    berechnen();
  }catch(error){
    console.error(error);
    zeigeDatenFehler();
  }
}

function validiereProduktdaten(data){
  data.forEach((produkt, index) => {
    if(!produkt.name || typeof produkt.me_kcal_100g !== "number"){
      throw new Error(`Produktdaten unvollständig bei Eintrag ${index + 1}.`);
    }
  });
}

function zeigeDatenFehler(){
  document.getElementById("datenFehler").classList.remove("hidden");
  document.getElementById("berechnenButton").disabled = true;
}

function aktiviereRechner(){
  document.getElementById("produktA").disabled = false;
  document.getElementById("produktB").disabled = false;
  document.getElementById("berechnenButton").disabled = false;
}

function fuelleProduktSelects(){
  const selectA = document.getElementById("produktA");
  const selectB = document.getElementById("produktB");

  selectA.innerHTML = "";
  selectB.innerHTML = "";

  produkte.forEach((produkt, index) => {
    const optionText = `${produkt.name} – ${produkt.me_kcal_100g} kcal/100 g`;

    const optionA = document.createElement("option");
    optionA.value = index;
    optionA.textContent = optionText;
    selectA.appendChild(optionA);

    const optionB = document.createElement("option");
    optionB.value = index;
    optionB.textContent = optionText;
    selectB.appendChild(optionB);
  });

  if(produkte.length > 1){
    selectB.value = "1";
  }
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
  const indexA = document.getElementById("produktA").value;
  const indexB = document.getElementById("produktB").value;
  const anteilA = Number(document.getElementById("anteilA").value) / 100;
  const anteilB = 1 - anteilA;

  if(!gewicht || gewicht <= 0){
    setzeErgebnisZurueck();
    return;
  }

  const produktA = produkte[indexA];
  const produktB = produkte[indexB];

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

  document.getElementById("energiebedarf").textContent =
    energiebedarf.toFixed(0);

  document.getElementById("produktAName").textContent =
    `${produktA.name} (${produktA.me_kcal_100g} kcal/100 g)`;

  document.getElementById("produktBName").textContent =
    `${produktB.name} (${produktB.me_kcal_100g} kcal/100 g)`;

  document.getElementById("grammA").textContent =
    grammA.toFixed(0);

  document.getElementById("grammB").textContent =
    grammB.toFixed(0);

  document.getElementById("kcalA").textContent =
    kcalA.toFixed(0);

  document.getElementById("kcalB").textContent =
    kcalB.toFixed(0);

  document.getElementById("gesamtmenge").textContent =
    gesamt.toFixed(0);
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
