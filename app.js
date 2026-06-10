let produkte=[];
fetch('produkte.json').then(r=>r.json()).then(data=>{
produkte=data;
let select=document.getElementById('produkt');
data.forEach((produkt,index)=>{
let option=document.createElement('option');
option.value=index;
option.textContent=produkt.name;
select.appendChild(option);
});
});
function berechnen(){
const gewicht=parseFloat(document.getElementById('gewicht').value);
const faktor=parseFloat(document.getElementById('aktivitaet').value);
const produkt=produkte[document.getElementById('produkt').value];
const metabolischesKG=Math.pow(gewicht,0.75);
const energiebedarf=faktor*metabolischesKG;
const futtermenge=(energiebedarf/produkt.me)*100;
document.getElementById('energiebedarf').textContent=energiebedarf.toFixed(0);
document.getElementById('produktname').textContent=produkt.name;
document.getElementById('mewert').textContent=produkt.me;
document.getElementById('futtermenge').textContent=futtermenge.toFixed(0);
}