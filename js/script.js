(async () => {
    let currenciesIntials;
    let currenciesNames;

    //containers to let the user hide / show the optionsContainer
    //and display the current selected currency
    let currencySelect = document.getElementsByClassName("currency-select");
    let firstCurrencySelect = currencySelect[0];
    let secondCurrencySelect = currencySelect[1]; 

    //containers for displaying aveliable currencies
    let optionsContainer = document.getElementsByClassName("options-container");
    let firstOptionContainer = optionsContainer[0];
    let secondOptionContainer = optionsContainer[1];

    //containers to contain the text inputs elements 
    //and the h3 needed to show the conversion rate
    let currencyContainer = document.getElementsByClassName("currency-container");
    let firstCurrencyContainer = currencyContainer[0];
    let secondCurrencyContainer = currencyContainer[1];
    
    //text inputs used by the user to type the amount that 
    //has to be converted and to show the converted amount
    let textInputs = document.getElementsByClassName("currency-input");
    let firstTextInput = textInputs[0];
    let secondTextInput = textInputs[1];

    let chart;
    
    let swapCurrenciesButton = document.getElementById("swap");

    let disabledCurrencies = new Array(2);

    //swap currencies button
    swapCurrenciesButton.addEventListener("click", async () => {
        if(getFirstConversionRate() != undefined){
            let swapvar = firstCurrencySelect.innerHTML;
            firstCurrencySelect.innerHTML = secondCurrencySelect.innerHTML; 
            secondCurrencySelect.innerHTML = swapvar;
            
            //update the conversion rate
            await showConversionRateText();
            
            //fill the second input with the new first input converted amount
            convertCurrency(firstTextInput);
            await setConversionGraph();
        }
    });

    getFirstConversionRate = () => currencyContainer[0].children[1].innerHTML.split(" ")[3];
    getSecondConversionRate = () => currencyContainer[1].children[1].innerHTML.split(" ")[3];
     
    //set the converted value in the input that is not used
    let convertCurrency = (input) => {
        if(getFirstConversionRate() != undefined){
            if(input == firstTextInput){
                secondTextInput.value = (input.value * getFirstConversionRate()).toFixed(2);
                if(input.value == ""){
                    //delete the other input value instead of setting it to 0
                    secondTextInput.value = "";
                }
            }else{
                firstTextInput.value = (input.value * getSecondConversionRate()).toFixed(2);
                if(input.value == ""){
                    firstTextInput.value = "";
                }
            }
            
        }
    }

    firstTextInput.addEventListener("keyup", () => convertCurrency(firstTextInput));
    secondTextInput.addEventListener("keyup",() => convertCurrency(secondTextInput));

    const options = {
        method: "GET",
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    }
    
    let response = await fetch("https://api.frankfurter.app/currencies", options);
    let jsonResponse = await response.json();
    
    currenciesIntials = Object.keys(jsonResponse).map(key => key);
    currenciesNames = Object.keys(jsonResponse).map(key => jsonResponse[key]);
    
    let currencyList1 = document.createElement("ul");
    let currencyList2 = document.createElement("ul");
   

    let toggleMenu = (select) => {
        if(select.style.display == "none" || select.style.display == ""){
            select.style.display = "block";
        }else{
            select.style.display = "none";
        }
    }

    firstCurrencySelect.addEventListener("click", () => toggleMenu(firstOptionContainer));
    secondCurrencySelect.addEventListener("click", () => toggleMenu(secondOptionContainer));


    //replace the old selected value from the currencySelect container with the new one
    let replaceSelectedCurrency = (current_currencySelect, target) => {
        current_currencySelect.innerHTML = "";
        current_currencySelect.style.display = "flex";
        current_currencySelect.style.alignItems = "center";
        current_currencySelect.style.paddingLeft = "20px";

        let img = document.createElement("img");
        img.src = target.children[0].src;
        let text = document.createElement("p");
        text.innerHTML = target.children[1].innerHTML;    
           
        current_currencySelect.append(img);
        current_currencySelect.append(text);
    }

    let removeCurrencyOption = (index) => {
        console.log(index);
        console.log(firstOptionContainer.firstChild.children[index]);
        //check which of the two select input has changed
        if(firstCurrencySelect.lastChild.innerHTML == firstOptionContainer.firstChild.children[index].lastChild.innerHTML){
            //if both select are initialized and a new selection has been made
            if(disabledCurrencies[0] != null && disabledCurrencies[1] != null){
                //make the currency selected previously appear again
                firstOptionContainer.firstChild.children[disabledCurrencies[0]].style.display = "block"; 
                secondOptionContainer.firstChild.children[disabledCurrencies[0]].style.display = "block"; 
            }
            //hide the one that has been selected
            firstOptionContainer.firstChild.children[index].style.display = "none"; 
            secondOptionContainer.firstChild.children[index].style.display = "none"; 

            disabledCurrencies[0] = index;

        } 
        else if (secondCurrencySelect.lastChild.innerHTML == firstOptionContainer.firstChild.children[index].lastChild.innerHTML){
            //if both select are initialized and a new selection has been made
            if(disabledCurrencies[0] != null && disabledCurrencies[1] != null){
                //make the currency selected previously appear again
                firstOptionContainer.firstChild.children[disabledCurrencies[1]].style.display = "block"; 
                secondOptionContainer.firstChild.children[disabledCurrencies[1]].style.display = "block"; 
            }
            //hide the one that has been selected
            firstOptionContainer.firstChild.children[index].style.display = "none"; 
            secondOptionContainer.firstChild.children[index].style.display = "none"; 
            disabledCurrencies[1] = index;
        }
    }

    let showConversionRateText = async () => {
        //if both currencySelect are initialialized
        if(firstCurrencySelect.firstChild.tagName == "IMG" && secondCurrencySelect.firstChild.tagName == "IMG"){
            
            //get the currencies strings from the [currencySelect.h3] innerHTML values
            firstCurr = firstCurrencySelect.lastChild.innerHTML.split(' - ')[0];
            secondCurr = secondCurrencySelect.lastChild.innerHTML.split(' - ')[0];
            
            response = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${firstCurr}&to=${secondCurr}`, options);
            jsonResponse = await response.json();
            rate = jsonResponse["rates"][secondCurr];
            
            //set the [currencyContainer.h3] text
            firstCurrencyContainer.children[1].innerHTML = `1 ${firstCurr} = ${rate} ${secondCurr}`;

            response = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${secondCurr}&to=${firstCurr}`, options);
            jsonResponse = await response.json();
            rate = jsonResponse["rates"][firstCurr];
            secondCurrencyContainer.children[1].innerHTML = `1 ${secondCurr} = ${rate} ${firstCurr}`;

            firstCurrencyContainer.children[1].style.display = "block";
            secondCurrencyContainer.children[1].style.display = "block";
        }
    }

    let selectOption = async (target) =>{
        
        //check from which of the two currencySelect element has been used to select currency
        let fromOrTo = target.parentNode.parentNode.parentNode.id;
        let canvasContainer = document.getElementsByClassName("canvas-container")[0];
        
        if(fromOrTo == "from"){
            replaceSelectedCurrency(firstCurrencySelect, target);
            toggleMenu(firstOptionContainer);
            
        }else if(fromOrTo == "to"){
            replaceSelectedCurrency(secondCurrencySelect, target);
            toggleMenu(secondOptionContainer);
        } 

        await showConversionRateText();

        index = target.getAttribute("value");
        
        //remove the selected currency from both of the [currency_options]
        removeCurrencyOption(index);
        
        //when both currencies are set show the conversion rate with an h3 inside of both [currency_container]
        if(getFirstConversionRate() != undefined){ 
            canvasContainer.className = "canvas-container show-chart";
     
            console.log("not undefined");
            await setConversionGraph();
        }
            
    }

    //add new li item to the currencies list [ul] 
    let addNewCurrency = (currency, currencyName, ul) =>{
        let newOption = document.createElement("li");
        newOption.className = "option";
        newOption.innerHTML = 
        `<img class = "flag" src="https://raw.githubusercontent.com/Lissy93/currency-flags/master/assets/flags_svg/${currency.toLowerCase()}.svg"> 
        <p>${currency} - ${currencyName}</p>`;
        newOption.setAttribute("value", ul.childElementCount);
        newOption.addEventListener("click", (event) => {
            //if user select the currency 
            //by cliking on the img or p element
            if(event.target.tagName != "LI"){
                return selectOption(event.target.parentNode);
            }
            return selectOption(event.target);
        } );
        ul.append(newOption);
        return ul;
    }

    for(i = 0; i < currenciesIntials.length; i++){
        currencyList1 = addNewCurrency(currenciesIntials[i], currenciesNames[i], currencyList1);
        currencyList2 = addNewCurrency(currenciesIntials[i], currenciesNames[i], currencyList2);
    }
    
    firstOptionContainer.append(currencyList1);
    secondOptionContainer.append(currencyList2);
    

    //return a date string that will be 
    //used to build rest api requests
    let formatDate = (isInitDate) => {
        date = new Date();
        let year = date.getFullYear();

        //we add 1 because months are rapresented 
        //as an array so january is 0 and december 11 
        let month = date.getMonth() + 1;

        let day = date.getDate();
        
        let isJanuary = month == 1;

        //init date is set one month prior the end date 
        //end date is set to the current day
        if(isInitDate){
            if(isJanuary){
                year--;
                month = 12;
            }else{
                month--;
            }
        }

        //if month or day are single digit numbers we have to add '0' 
        //before, otherwise the rest api won't accept the request
        if(month / 10 < 1){
            month = `0${month}`;
        }

        if(day / 10 < 1){
            day = `0${day}`;
        }
       
        return `${year}-${month}-${day}`;  
    }

    let fetchCurrencyRate = async () => {
        //get the currently selected currencies to build the rest api request
        firstCurr = firstCurrencySelect.lastChild.innerHTML.split(' - ')[0];
        secondCurr = secondCurrencySelect.lastChild.innerHTML.split(' - ')[0];
        response = await fetch(`https://api.frankfurter.app/${formatDate(true)}..${formatDate(false)}?base=${secondCurr}&to=${firstCurr}`);
        return response.json();
    }
 
    //build the chartjs chart 
    let setConversionGraph = async () => {
        firstCurr = firstCurrencySelect.lastChild.innerHTML.split(' - ')[0];
  
        let jsonData = await fetchCurrencyRate();
        console.log(jsonData);
        dates = Object.keys(jsonData.rates).map(key => key);
        rates = Object.keys(jsonData.rates).map(key => jsonData.rates[key]).map(currRate =>  currRate[firstCurr]);

        console.log(rates);
        //chart js init
        let chartElement = document.getElementById("chart").getContext("2d");
       
        //chart area gradient
        let gradient = chartElement.createLinearGradient(0, 0, 0, 400); 
        gradient.addColorStop(0, 'rgba(75,121,215,1)');   
        gradient.addColorStop(1, 'rgba(75,121,215,0.41)');
        
        //make a new chart when user 
        //select a different currency 
        if(chart != undefined){
            chart.destroy();
        }

        chart = new Chart(chartElement, {
            type: "line",
            data: {
                //x axys labels
                labels: dates,
                datasets: [{
                    //y axis labels
                    data: rates,
                    fill: true,
                    backgroundColor : gradient,
                    borderColor: "#a8c4fb",
                }]
            },
            options: {
                tension: 0.4,
                plugins: {
                   legend: {
                      display: false
                   }
                },
                scales: {
                    x: {
                        //hide x axis chart lines
                        grid: {
                            drawOnChartArea: false,
                        },
                        //set color of x axis label
                        ticks: { 
                            color: 'white', 
                            beginAtZero: true 
                        },    
                    },

                    y: {
                        ticks: { 
                            color: 'white', 
                            beginAtZero: true 
                        },   
                    }
                },
            }
        });
    }
})();

