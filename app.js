let produkte=[];

fetch('produkte.json')
    .then(response => response.json())
    .then(data => {
        produkte=data;
        fuelleProduktSelects();
    });

function fuelleProduktSelects(){
    const selectA=document.getElementById('produktA');
    const selectB=document.getElementById('produktB');

    produkte.forEach((produkt,index)=>{
        const optionA=document.createElement('option');
        optionA.value=index;
        optionA.textContent=produkt.name;
        selectA.appendChild(optionA);

        const optionB=document.createElement('option');
        optionB.value=index;
        optionB.textContent=produkt.name;
        selectB.appendChild(optionB);
    });

    if(produkte.length > 1){
        selectB.value=1;
    }
}

function aktualisiereAnteil(){
    const anteilA=parseFloat(document.getElementById('anteilA').value);
    document.getElementById('anteilAnzeige').textContent=anteilA;
    document.getElementById('anteilBAnzeige').textContent=100-anteilA;
}

function berechnen(){
    const gewicht=parseFloat(document.getElementById('gewicht').value);
    const faktor=parseFloat(document.getElementById('aktivitaet').value);
    const indexA=document.getElementById('produktA').value;
    const indexB=document.getElementById('produktB').value;
    const anteilA=parseFloat(document.getElementById('anteilA').value)/100;
    const anteilB=1-anteilA;

    if(!gewicht || gewicht <= 0 || !produkte[indexA] || !produkte[indexB]){
        alert('Bitte Gewicht und Futtersorten prüfen.');
        return;
    }

    const produktA=produkte[indexA];
    const produktB=produkte[indexB];

    const metabolischesKG=Math.pow(gewicht,0.75);
    const energiebedarf=faktor*metabolischesKG;

    const kcalA=energiebedarf*anteilA;
    const kcalB=energiebedarf*anteilB;

    const grammA=(kcalA/produktA.me)*100;
    const grammB=(kcalB/produktB.me)*100;
    const gesamt=grammA+grammB;

    document.getElementById('energiebedarf').textContent=energiebedarf.toFixed(0);

    document.getElementById('produktAName').textContent=produktA.name + ' (' + produktA.me + ' kcal/100 g)';
    document.getElementById('produktBName').textContent=produktB.name + ' (' + produktB.me + ' kcal/100 g)';

    document.getElementById('grammA').textContent=grammA.toFixed(0);
    document.getElementById('grammB').textContent=grammB.toFixed(0);

    document.getElementById('kcalA').textContent=kcalA.toFixed(0);
    document.getElementById('kcalB').textContent=kcalB.toFixed(0);

    document.getElementById('gesamtmenge').textContent=gesamt.toFixed(0);
}
