//change this in the case that other columns will be added into the new format
var header = ["Account #",	'Trade date',	'Settlement date',	'Symbol',	'Exchange',	'Security name',	'TE type',	'Broker type',	'#units',	'$price/unit',	'Amount']
const exchanges = ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'ARCA', 'NEO']
const apiFormatToSystem =  {"TO": ["TSX"], "V": ["TSXV"], "CN": ["CSE"], "US": ["US"], "NEO": ["NEO"]}
const systemToApiFormat = {"TSX":"TO", "TSXV":"V", "CSE":"CN", "US":"US", "NEO": "NEO"}
const apiKey = "625b5df8a34626.35549490"



function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function checkExchangeCorrect(exchange){
    if(Object.keys(apiFormatToSystem).includes(exchange)){
        return {"contains": true, "tickers": apiFormatToSystem[exchange]}
    } else{
        return {"contains": false}
    }
}


function convertExchangeToApiFormat(exchange){
    return systemToApiFormat[exchange]
}

function convertExchangeFromApiFormat(exchange){
    return apiFormatToSystem[exchange]
}





function checkArrayEqual(arrayOne, arrayTwo){

    if(arrayOne.length == arrayTwo.length){
        for (let i = 0; i < arrayOne.length; i++) {
            if(arrayOne[i] != arrayTwo[i]){
                return false
            }
            return true
        }
    } else{
        return false
    }

}


function CSVtoArray(text) {
    rows = text.split('\n')
    final = []
    for (let i = 0; i < rows.length; i++) {
        row = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        final.push(row)
    }
    return errorCase(final)
}


//takes in format of {originalIndex:newIndex}. Rearranges the function
function mapToProperFormat(currentData, args){
    final = []

    //initializes the array
    for (let i = 0; i < currentData.length; i++) {
        add = []
        for (let j = 0; j < Object.keys(args).length; j++) {
            add.push('')
        }
        final.push(add)
    }
    //maps everything out
    for (let i = 0; i < currentData.length; i++) {
        for (let j = 0; j < currentData[i].length; j++) {
            if(Object.keys(args).includes(String(j))){
                //due to the API not specifying exactly what stock exchange is from the US it defaults to US which temporarily is put as nothing
                if(currentData[i][j] == "US"){
                    final[i][args[j]]
                } else{
                    final[i][args[j]] = currentData[i][j]
                }
            }
        }
    }

    finalValue = []
    finalValue.push(header)
    for (let i = 0; i < final.length; i++) {
        finalValue.push(final[i])
    }

    return arrayToCsv(finalValue, 'test.csv', 'text/csv;encoding:utf-8')

}

function arrayToCsv(data, type){
    final = data.map(row =>
        row
            .map(String)
            .map(v => v.replaceAll('"', '""'))
            .map(v => `"${v}"`)
            .join(',')
    ).join('\r\n');
    return downloadBlob(final, type)
}


function downloadBlob(content, contentType) {
    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    filename = today + "_traders_edge_"+ input.files[0]["name"]




    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);

    var pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', filename);
    pom.click();
    return true
}



function filterDescriptionTD(data){
    all = data.split(" ")
    finalData = ""
    for (let i = 0; i < all.length; i++) {
        if(/\d/.test(all[i])){
            break
        } else{
            finalData = finalData + " " + all[i]
        }
    }

    return finalData
}


function getTickerFromDescription(name){
    //special cases
    if(name.includes("CALL .")){
        return []
    }

    args = name.split(" ")
    results = []
    finalRes = []
    $.ajax({
        url: "https://eodhistoricaldata.com/api/search/" + args[0] + "?api_token=" + apiKey,
        type: "get",
        async: false,
        dataType: "json",
        success: function (res){
            results = res
        },
        error: function(xhr, ajaxOptions, thrownError){

        }
    })


    wordCount = 0
    while(true){
        tempResult = []
        word = ""


        for (let i = 0; i < wordCount; i++) {
            word += args[i] + " "
        }
        word = word.trim()
        wordCount+=1

        for (let i = 0; i < results.length; i++) {
            if((results[i]["Name"].toUpperCase()).includes(word.toUpperCase())){
                tempResult.push(results[i])
            }
        }


        if(tempResult.length > 0){
            results = tempResult
        } else {

            break
        }
    }









    allNameCount = {}
    for (let i = 0; i < results.length; i++) {
        if(Object.keys(allNameCount).includes(results[i])){
            allNameCount[results[i]]++
        } else{
            allNameCount[results[i]] = 1
        }
    }

    maxCount = 0
    selectedName = ""


    for (let i = 0; i < Object.keys(allNameCount).length; i++) {
        if(maxCount < allNameCount[Object.keys(allNameCount)[i]]) {
            maxCount = allNameCount[Object.keys(allNameCount)[i]]
            selectedName = Object.keys(allNameCount)[i]
        }
    }

    info = []



    for (let i = 0; i < results.length; i++) {
        currentExchangeInfo = checkExchangeCorrect(results[i]["Exchange"])

        if(currentExchangeInfo["contains"]){
            tempElement = []
            tempElement.push(results[i]["Code"])
            tempElement.push(convertExchangeFromApiFormat(results[i]["Exchange"]))
            tempElement.push(results[i]["Name"])
            info.push(tempElement)
        }
    }


    return info
}

function getTickerFromTicker(name){
    finalRes = []
    $.ajax({
        url: "https://eodhistoricaldata.com/api/search/" + name + "?api_token=" + apiKey,
        type: "get",
        async: false,
        dataType: "json",
        success: function (res){
            for (let i = 0; i < res.length; i++) {
                currentExchangeInfo = checkExchangeCorrect(res[i]["Exchange"])
                if(res[i]["Code"] == name && currentExchangeInfo["contains"]){
                    tempElement = []
                    tempElement.push(res[i]["Code"])
                    tempElement.push(convertExchangeFromApiFormat(res[i]["Exchange"]))
                    tempElement.push(res[i]["Name"])
                    finalRes.push(tempElement)
                }
            }
        },
        error: function(xhr, ajaxOptions, thrownError){

        }
    })
    return finalRes
}


function getSecurityNameFromTicker(ticker, exchange){
    exchange = {}
    finalSecurity = []

    $.ajax({
        url: "https://eodhistoricaldata.com/api/search/" + ticker + "?api_token=" + apiKey,
        type: "get",
        async: false,
        dataType: "json",
        success: function (res){
            for (let i = 0; i < res.length; i++) {

                if(res[i]["Exchange"] == exchange && res[i]["Code"] == ticker){
                    finalSecurity = res[i]
                }
            }
        }
    })


    return finalSecurity
}

var optionPointers = {}
var importantOptions = {}
function optionVisualizer(optionInfo){
    document.getElementById("inputBoxes").classList.add("d-none")
    document.getElementById("infoContainer").classList.remove("d-none")
    document.getElementById("infoHolder").innerHTML = ""
    document.getElementById("finalizeButton").setAttribute("onclick", `finalizeOptions()`)
    if(selected == "TD"){
        importantOptions = optionInfo
        for (let i = 0; i < optionInfo.length; i++) {
            //index of info (all trading logs) : id of selector
            optionPointers[i] = "option" + i
            element = `
            <div class="row justify-content-center border" style="margin-top: 10px;">
                    <div class="col-3">
                        <p class="text-center">${optionInfo[i][13]}</p>
                    </div>
                    <div class="col-1"></div>
                    <div class="col-5 ">
                        <select id="${'option' + i}" class="form-control">
                        </select>
                    </div>
                </div>
        `
            document.getElementById("infoHolder").innerHTML += element
            for (let j = 0; j < Object.keys(optionInfo[i][14]).length; j++) {
                option = document.createElement("option")
                option.value = Object.keys(optionInfo[i][14])[j]
                option.innerText = Object.keys(optionInfo[i][14])[j]
                if(j == 0){
                    document.getElementById("option" + i).value = Object.keys(optionInfo[i][14])[j]
                }
                document.getElementById("option" + i).append(option)
            }
        }    
    } else if(selected == "RBC"){
        importantOptions = optionInfo
        for (let i = 0; i < optionInfo.length; i++) {
            optionPointers[i] = "option" + i
            element = `
            <div class="row justify-content-center border" style="margin-top: 10px;">
                    <div class="col-3">
                        <p class="text-center">${optionInfo[i][14]}</p>
                    </div>
                    <div class="col-1"></div>
                    <div class="col-5 ">
                        <select id="${'option' + i}" class="form-control">
                        </select>
                    </div>
                </div>
            `
            document.getElementById("infoHolder").innerHTML += element
            for (let j = 0; j < Object.keys(optionInfo[i][15]).length; j++) {
                option = document.createElement("option")
                option.value = Object.keys(optionInfo[i][15])[j]
                option.innerText = Object.keys(optionInfo[i][15])[j]
                if(j == 0){
                    document.getElementById("option" + i).value = Object.keys(optionInfo[i][15])[j]
                }
                document.getElementById("option" + i).append(option)
            }

        }
    } else if(selected == "questrade"){
        importantOptions = optionInfo
        for (let i = 0; i < optionInfo.length; i++) {
            optionPointers[i] = "option" + i

            element = `
            <div class="row justify-content-center border" style="margin-top: 10px;">
                    <div class="col-3">
                        <p class="text-center">${optionInfo[i][17]}</p>
                    </div>
                    <div class="col-1"></div>
                    <div class="col-5 ">
                        <select id="${'option' + i}" class="form-control">
                        </select>
                    </div>
                </div>
            `
            document.getElementById("infoHolder").innerHTML += element
            for (let j = 0; j < Object.keys(optionInfo[i][18]).length; j++) {
                option = document.createElement("option")
                option.value = Object.keys(optionInfo[i][18])[j]
                option.innerText = Object.keys(optionInfo[i][18])[j]
                if(j == 0){
                    document.getElementById("option" + i).value = Object.keys(optionInfo[i][15])[j]
                }
                document.getElementById("option" + i).append(option)
            }

        }
    } else if (selected == "SCOTIA BANK"){
        importantOptions = optionInfo
        for (let i = 0; i < importantOptions.length; i++) {
            if(optionInfo[i][14]){
                optionPointers[i] = "option" + i

                element = `
                        <div class="row justify-content-center border" style="margin-top: 10px;">
                            <div class="col-3">
                                <p class="text-center">${optionInfo[i][13]}</p>
                            </div>
                            <div class="col-1"></div>
                            <div class="col-5 ">
                                <select id="${'option' + i}" class="form-control">
                                </select>
                            </div>
                        </div>
                `
                document.getElementById("infoHolder").innerHTML += element
                for (let j = 0; j < Object.keys(optionInfo[i][14]).length; j++) {
                    option = document.createElement("option")
                    option.value = Object.keys(optionInfo[i][14])[j]
                    option.innerText = Object.keys(optionInfo[i][14])[j]
                    if(j == 0){
                        document.getElementById("option" + i).value = Object.keys(optionInfo[i][14])[j]
                    }
                    document.getElementById("option" + i).append(option)
                }
            }
        }
    } else if (selected == "CIBC") {
        importantOptions = optionInfo
        for (let i = 0; i < importantOptions.length; i++) {

            if(optionInfo[i][21]){
                optionPointers[i] = "option" + i


                element = `
                        <div class="row justify-content-center border" style="margin-top: 10px;">
                            <div class="col-3">
                                <p class="text-center">${optionInfo[i][20]}</p>
                            </div>
                            <div class="col-1"></div>
                            <div class="col-5 ">
                                <select id="${'option' + i}" class="form-control">
                                </select>
                            </div>
                        </div>
                `

                document.getElementById("infoHolder").innerHTML += element
                for (let j = 0; j < Object.keys(optionInfo[i][21]).length; j++) {
                    option = document.createElement("option")
                    option.value = Object.keys(optionInfo[i][21])[j]
                    option.innerText = Object.keys(optionInfo[i][21])[j]
                    if(j == 0){
                        document.getElementById("option" + i).value = Object.keys(optionInfo[i][21])[j]
                    }
                    document.getElementById("option" + i).append(option)
                }

            }
        }
    } else if (selected == "NATIONAL BANK") {
        importantOptions = optionInfo
        for (let i = 0; i < importantOptions.length; i++) {
            if(optionInfo[i][17]){
                optionPointers[i] = "option" + i

                element = `
                        <div class="row justify-content-center border" style="margin-top: 10px;">
                            <div class="col-3">
                                <p class="text-center">${optionInfo[i][16]}</p>
                            </div>
                            <div class="col-1"></div>
                            <div class="col-5 ">
                                <select id="${'option' + i}" class="form-control">
                                </select>
                            </div>
                        </div>
                `
                document.getElementById("infoHolder").innerHTML += element
                for (let j = 0; j < Object.keys(optionInfo[i][17]).length; j++) {
                    option = document.createElement("option")
                    option.value = Object.keys(optionInfo[i][17])[j]
                    option.innerText = Object.keys(optionInfo[i][17])[j]
                    if(j == 0){
                        document.getElementById("option" + i).value = Object.keys(optionInfo[i][17])[j]
                    }
                    document.getElementById("option" + i).append(option)
                }
            }
        }
    } else if  (selected == "VIRTUAL BROKERS") {
        importantOptions = optionInfo
        for (let i = 0; i < importantOptions.length; i++) {
            if(optionInfo[i][17]){
                optionPointers[i] = "option" + i

                element = `
                        <div class="row justify-content-center border" style="margin-top: 10px;">
                            <div class="col-3">
                                <p class="text-center">${optionInfo[i][16]}</p>
                            </div>
                            <div class="col-1"></div>
                            <div class="col-5 ">
                                <select id="${'option' + i}" class="form-control">
                                </select>
                            </div>
                        </div>
                `
                document.getElementById("infoHolder").innerHTML += element
                for (let j = 0; j < Object.keys(optionInfo[i][17]).length; j++) {
                    option = document.createElement("option")
                    option.value = Object.keys(optionInfo[i][17])[j]
                    option.innerText = Object.keys(optionInfo[i][17])[j]
                    if(j == 0){
                        document.getElementById("option" + i).value = Object.keys(optionInfo[i][17])[j]
                    }
                    document.getElementById("option" + i).append(option)
                }
            }
        }
    }
    
}


function finalizeOptions(){
    output = []
    if(selected == "TD"){
        for (let i = 0; i < importantOptions.length; i++) {
            temp = importantOptions[i]
            correntExchange = document.getElementById(optionPointers[i]).value
            correctSymbol = importantOptions[i][14][correntExchange]
            temp.push(correntExchange)
            temp.push(correctSymbol)
            output.push(temp)
        }
        mapToProperFormat(output, {9:0, 0:1, 1:2, 16:3, 15:4, 13:5, 4:6, 3:7, 5:8, 6:9, 8:10})
    } else if(selected == "RBC"){
        for (let i = 0; i < importantOptions.length; i++) {
            temp = importantOptions[i]
            correntExchange = document.getElementById(optionPointers[i]).value
            correctSymbol = importantOptions[i][15][correntExchange]
            temp.push(correntExchange)
            temp.push(correctSymbol)
            output.push(temp)
        }
        mapToProperFormat(output, {8:0, 0:1, 7:2, 17:3, 16:4, 14:5, 1:6, 2:7, 5:8, 6:9, 9:10})
    } else if(selected == "questrade"){
        for (let i = 0; i < importantOptions.length; i++) {
            temp = importantOptions[i]
            correntExchange = document.getElementById(optionPointers[i]).value
            correctSymbol = importantOptions[i][18][correntExchange]
            temp.push(correctSymbol)
            temp.push(correntExchange)
            output.push(temp)
        }
        mapToProperFormat(output, {13:0, 0:1, 1:2, 19:3, 20:4, 17:5, 2:6, 3:7, 7:8, 8:9, 11:10})
    } else if (selected == "SCOTIA BANK"){
        for (let i = 0; i < importantOptions.length; i++) {
            if(importantOptions[i][14]){
                temp = importantOptions[i]
                correntExchange = document.getElementById(optionPointers[i]).value
                correctSymbol = importantOptions[i][14][correntExchange]
                temp.push(correctSymbol)
                temp.push(correntExchange)
            } else {
                temp = importantOptions[i]
                temp.push("")
                temp.push("")
            }
            output.push(temp)

        }
        mapToProperFormat(output, {11:0, 2:1, 3:2, 15:3, 16:4, 13:5, 5:6, 6:7, 7:8, 9:9, 10:10})
    } else if (selected == "CIBC") {
        for (let i = 0; i < importantOptions.length; i++) {
            if(importantOptions[i][21]){
                temp = importantOptions[i]
                correntExchange = document.getElementById(optionPointers[i]).value
                correctSymbol = importantOptions[i][21][correntExchange]
                temp.push(correctSymbol)
                temp.push(correntExchange)
            } else {
                temp = importantOptions[i]
                temp.push("")
                temp.push("")
            }
            output.push(temp)
        }
        mapToProperFormat(output, {18:0, 0:1, 1:2, 22:3, 23:4, 20:5, 3:6, 4:7, 8:8, 10:9, 14:10})
    } else if (selected == "NATIONAL BANK") {
        for (let i = 0; i < importantOptions.length; i++) {
            if(importantOptions[i][17]){
                temp = importantOptions[i]
                correntExchange = document.getElementById(optionPointers[i]).value
                correctSymbol = importantOptions[i][17][correntExchange]
                temp.push(correctSymbol)
                temp.push(correntExchange)
            } else {
                temp = importantOptions[i]
                temp.push("")
                temp.push("")
            }
            output.push(temp)
        }
        mapToProperFormat(output, {0:0, 2:1, 3:2, 18:3, 19:4, 16:5, 8:6, 9:7, 10:8, 13:9, 14:10})
    } else if (selected == "VIRTUAL BROKERS") {
        for (let i = 0; i < importantOptions.length; i++) {
            if(importantOptions[i][17]){
                temp = importantOptions[i]
                correntExchange = document.getElementById(optionPointers[i]).value
                correctSymbol = importantOptions[i][17][correntExchange]
                temp.push(correctSymbol)
                temp.push(correntExchange)
            } else {
                temp = importantOptions[i]
                temp.push("")
                temp.push("")
            }
            output.push(temp)
        }
        console.log(output)
        mapToProperFormat(output, {0:0, 1:1, 2:2, 18:3, 19:4, 16:5, 4:6, 5:7, 11:8, 13:9, 14:10})
    }

    document.getElementById("infoContainer").classList.add("d-none")
    document.getElementById("inputBoxes").classList.remove("d-none")
}
