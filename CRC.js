//------------------------------------
document.getElementById("dataEncoding").addEventListener("input", Polynomial)
document.getElementById("dataEncoding").addEventListener("input", inputlength)

VypsaniNk()
inputlength()
Polynomial()

function Polynomial(){
    inputDataBIN = document.getElementById("dataEncoding").value.toString()

    const CRCvalue = document.getElementById('CRCvalue');
    let CRC = CRCvalue.options[CRCvalue.selectedIndex].value;
    let delkaCRC = parseInt(CRC)+1


    console.log("delka CRC")
    console.log(delkaCRC)

    let n

    if(CRC == 3){
        n = 8
    }else{
        n = 16
    }

   

    if(inputDataBIN.length != 0 ){  // spravne zadane
        console.log("Spravny vstup");

        //vytvoreni polynomu pro zjisteni gen.pol.
        let polynomOdhadu = "1";

        for(i=0;i<n-2;i++){
            polynomOdhadu = polynomOdhadu.concat("0")
        }

        polynomOdhadu = polynomOdhadu.concat("1")
        console.log("polynom Odhadu"+polynomOdhadu)
       
       
        //generovani kombinaci
        let combinations = generateBinaryStrings(delkaCRC)

        console.log(combinations)
        let generujiciPolynom=[]

        for(let i=0;i<Math.pow(2,delkaCRC);i++){
            
            zbytek = modulo(polynomOdhadu,combinations[i])
            console.log("zbytek: "+zbytek)
            if(zbytek==0 % combinations[i].startsWith("1")){
                generujiciPolynom.push(combinations[i])
            }
        }

        //vypsani gen polynomu 
        console.log("generujici polynomy")
        console.log(generujiciPolynom)

        var select = document.getElementById("polynoms");

        select.innerHTML=" "

        generujiciPolynom.forEach(value =>{
            let optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.textContent = value;
            select.appendChild(optionElement);
        })

    }
    else{  // rozseka se na kousky
        console.log("nespravny vstup");
    }
}

function encoding(){
    let data = document.getElementById("dataEncoding").value.toString();
    let key = document.getElementById("polynoms").value.toString();
    document.getElementById("vystupVseho").style.display = "none"

    const CRCvalue = document.getElementById('CRCvalue');
    let CRC = CRCvalue.options[CRCvalue.selectedIndex].value;

    if(data=="TomasJeBorec"){
        window.open("https://media.tenor.com/sp8bzlDgPYYAAAAi/dancing-monkey.gif")
    }


    if(kontrolaVstupu(data) & kontrolaVstupu(key)){
        let delkaKlice = key.length;
 
        // rozsireni
        let str = "";
        for (let i = 0; i < delkaKlice - 1; i++) {
                str = str.concat('0');
        }
        console.log(str);
        let appended_data = data.concat(str);
         
        let zbytek = modulo(appended_data, key)
 
        // Append remainder in the original data
        let zakodovanaData = data + zbytek;
 
        // Adding the print statements 
        document.getElementById("textEncoding").innerHTML = "Zakódovaná data:";
        document.getElementById("dataEncodingOutput").innerHTML = zakodovanaData;
        document.getElementById("polynomEncodingOutput").innerHTML = binaryToPolynomial(zakodovanaData);
        document.getElementById("vystupVseho").style.display = "block"

        // console
        // console.log("Data: ", data)
        // console.log("generujici polynom: ",key)
        // console.log("appended data: ",appended_data)        
        // console.log("Zbytek : ", zbytek);
        // console.log("Encoded Data (Data + Remainder) :", zakodovanaData);

        return zakodovanaData
    }
    else{
        alert("špatný vstup, zadejte Binární číslo, kde jsou pouze 1 a 0")
    }
    
    
}

function decoding(){
    //vymazani dat
    document.getElementById("textDecoding").innerHTML=" "
    document.getElementById("dataDecodingOutput").innerHTML=" ";

    document.getElementById("polynomDecodingOutput").innerHTML=" ";


    let zakodovanaData = document.getElementById("dataDecoding").value.toString()
    let key = document.getElementById("keyDecoding").value.toString()

    if(kontrolaVstupu(zakodovanaData) & kontrolaVstupu(key)){
        let zbytek = modulo(zakodovanaData,key)
        console.log("Zbytek zakodovanadata/key: "+zbytek)
        if(zbytek == 0){ //bez chyby 

            let dekodovanaData = zakodovanaData.slice(0,-key.length+1)

            // console.log(dekodovanaData)
            document.getElementById("textDecoding").innerHTML="Data jsou správně"+"<br />"+"<br />"+" Dekódovaná data:"
            document.getElementById("dataDecodingOutput").innerHTML=dekodovanaData;

            document.getElementById("polynomDecodingOutput").innerHTML= binaryToPolynomial(dekodovanaData);
        }
        else{  //je s chybou
            console.log("Je s chybou")

            delkaDat = zakodovanaData.length
            let test = ""
            // Vytvoření počátečního řetězce
            for (let i = 0; i < delkaDat-1; i++) {
                test += '0';
            }
            test += '1';
            
            // Posun jedničky a výpis
            for (let i = 0; i < delkaDat; i++) {
                let pozice = i
                
                console.log("testovaci polynom: "+test);
                zkouskaPozice = modulo(test,key)
                console.log("zbytek po deleni polynomu: "+zkouskaPozice)
                test = test.slice(1) + '0';

                if(zkouskaPozice==zbytek){ // oprava hodnoty 
                    const binaryArray = zakodovanaData.split('');
                    const binaryArrayReversed = binaryArray.reverse()
                    console.log("pozice: ",pozice)

                    // Změna hodnoty na zadaném indexu
                    binaryArrayReversed[pozice] = (binaryArrayReversed[pozice] === '0') ? '1' : '0';

                    const result = binaryArrayReversed.reverse();
                    const finalResult = result.join("").slice(0,-key.length+1)

                    // Výpis výsledku
                    document.getElementById("textDecoding").innerHTML = 
                            `Chyba nalezena na pozici x<sup>${pozice}</sup>`+"</br>"+"</br>"+"Dekódovaná data:"
                    document.getElementById('dataDecodingOutput').textContent = `${finalResult}`;
                    document.getElementById("polynomDecodingOutput").innerHTML = binaryToPolynomial(finalResult) 

                }
                
            }


        }
    }
    else{
        alert("špatný vstup, zadejte Binární číslo, kde jsou pouze 1 a 0")
    }

    
}

function generateBinaryStrings(length) {
    const binaryString = [];

    // Pomocná funkce pro generování všech možností
    function generate(str, remainingLength) {
        if (remainingLength === 0) {
            binaryString.push(str);
            return;
        }

        generate(str + '0', remainingLength - 1);
        generate(str + '1', remainingLength - 1);
    }

    generate('', length);

    return binaryString;
}

function XORfunction(a,b){
    let vysledek = ""
    let bLN = b.length

    // presouvani bitu
    for (let i = 1; i < bLN; i++) {
        if (a[i] == b[i]) {
                vysledek += "0";
        }
        else {
                vysledek += "1";
        }
    }
    return vysledek;

}

function modulo(citatel,jmenovatel){
    let jmenLN = jmenovatel.length
    let citLN = citatel.length

    let tmp= citatel.substr(0,jmenLN)

    while(jmenLN < citLN){
        if(tmp[0]=="1"){
            tmp = XORfunction(jmenovatel,tmp) + citatel[jmenLN]
            // console.log("tmp1: ",tmp)
        }
        else{
            let str = "";
            for(let i = 0; i< jmenLN;i++){
                str=str.concat("0")
            }
            tmp = XORfunction(str,tmp)+citatel[jmenLN]
            // console.log("tmp2: ",tmp)
        }
        jmenLN += 1;
    }
    
    // zmena posledniho bitu 
    if (tmp[0] == '1') {
        tmp = XORfunction(jmenovatel, tmp);
        // console.log("tmp3: ",tmp)
    }
    else {
            // odstrani se nula
            tmp = tmp.slice(1)
            // console.log("tmp4: ",tmp)
    }
    // console.log("tmp, last: ",tmp)
    return tmp;
}

function copyOut(){
    // Získání hodnoty z elementu s id "dataEncodingOutput"
    const outputElement = document.getElementById('dataEncodingOutput');
    const textToCopy = outputElement.textContent;

    // Vytvoření dočasného textarea elementu
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;

    // Přidání dočasného textarea elementu do dokumentu
    document.body.appendChild(tempTextArea);

    // Vybrání textu v dočasném textarea elementu
    tempTextArea.select();

    try {
        // Pokus o zkopírování do schránky pomocí Clipboard API
        document.execCommand('copy');
        alert(`Data ${textToCopy} byli zkopírovány do schránky.`);
    } catch (err) {
        console.error('Kopírování do schránky selhalo:', err);
    } finally {
        // Odstranění dočasného textarea elementu z dokumentu
        document.body.removeChild(tempTextArea);
    }
}

function kontrolaVstupu(input){
    const binaryRegex = /^[01]+$/;
    return binaryRegex.test(input);
}

function binaryToPolynomial(binaryNumberToTransfer) {
    // Obrácení binárního čísla, protože pozice odpovídají mocninám 2
    const reversedBinary = binaryNumberToTransfer.split('').reverse().join('');

    let polynomialFromBinary = '';

    for (let i = reversedBinary.length; i >=0 ; i--) {
        // Pokud je aktuální bit 1, přidej odpovídající mocninu 2
        if (reversedBinary[i] === '1') {
            // Výsledek přidáváme do polynomu
            if (polynomialFromBinary !== '') {
                polynomialFromBinary += ' + ';
            }
            const exponent = i;
            polynomialFromBinary +=`x<sup>${exponent}</sup>`
        }
    }

    // Pokud je polynom prázdný, znamená to, že všechny bity byly 0
    if (polynomialFromBinary === '') {
        polynomialFromBinary = '0';
    }

    return polynomialFromBinary;
}

function VypsaniNk(){
    const CRCvalue = document.getElementById('CRCvalue');
    let CRC = CRCvalue.options[CRCvalue.selectedIndex].value;
    
    vepsani = document.getElementById("vepsaniNk")

    if(CRC == 3){
        vepsani.innerHTML="kod (n,k)=(7,4)"
    }
    else{
        vepsani.innerHTML="kod (n,k)=(15,11)"
    }
}

function inputlength(){
    let data = document.getElementById("dataEncoding").value.toString();

    let dataLen = data.length

    document.getElementById("lengthInput").innerHTML = `(délka: ${dataLen})`
}