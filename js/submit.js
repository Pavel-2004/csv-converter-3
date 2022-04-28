/*

1) Step 1 is to take all of the data and convert it into list format. This is the data that will be submitted
2) Step 2 is to filter that data. For example split some data like CJ.TO turn into CJ as one column and TO turns into TSX as another column. This will be either to plug into the converter function
3) Map out all of the data into the converter function
4) Once user click download activate the function

 */

var selected = ''

//initializing everything: step 1
function initAll(result, type){
    //add other types
    if(type == 'questrade'){
        selected = 'questrade'
        return CSVtoArray(result)
    } else if(type == 'TD'){
        selected = 'TD'
        return CSVtoArray(result)
    } else if(type == 'RBC'){
        selected = 'RBC'
        return CSVtoArray(result)
    } else if(type == 'SCOTIA BANK'){
        selected = 'SCOTIA BANK'
        return CSVtoArray(result)
    } else if(type == "CIBC"){
        selected = 'CIBC'
        return CSVtoArray(result)
    } else if(type == "NATIONAL BANK"){
        selected = "NATIONAL BANK"
        return CSVtoArray(result)
    } else if(type == "VIRTUAL BROKERS"){
        selected = "VIRTUAL BROKERS"
        return CSVtoArray(result)
    }

    else{
        return false
    }
}



//detection for error cases. Will return false if error detected
function errorCase(args){
    //add if statement for new type in error case here

    //questrade
    if(selected == 'questrade'){
        //this validates the proper format of the file.
        if(checkArrayEqual(args[0], ['Transaction Date', 'Settlement Date', 'Action', 'Symbol', 'Description', 'Quantity', 'Price', 'Gross Amount', 'Commission', 'Net Amount', 'Currency', 'Account #', 'Activity Type', 'Account Type\r'])){
            //continue activation process
            return questTradeFilter(args)
        }

        else{
            return false
        }




    } else if(selected == "TD"){

        if(checkArrayEqual(args[3], ['Trade Date', 'Settle Date', 'Description', 'Action', 'Quantity', 'Price', 'Commission', 'Net Amount\r'])){
            return tdFilter(args)
        } else{
            return false
        }


    } else if(selected == "RBC"){

        if(checkArrayEqual(args[8], ["Date", "Activity", "Symbol", "Symbol Description", "Quantity", "Price", "Settlement", "Account", "Value", "Currency", "Description"])){
            return rbcFilter(args)
        } else{
            return false
        }
    } else if(selected == "SCOTIA BANK"){
        if(checkArrayEqual(args[0], ["Description", "Symbol", "Transaction Date", "Settlement Date", "Account Currency", "Type", "Quantity", "Currency of Price", "Price", "Settlement Amount"])){
            return scotiaFilter(args)
        } else {

            return false
        }
    } else if(selected == "CIBC"){
        if(checkArrayEqual(args[9], ["Transaction Date", "Settlement Date", "Currency of Sub-account Held In", "Transaction Type", "Symbol", "Market", "Description", "Quantity", "Currency of Price", "Price", "Commission", "Exchange Rate", "Currency of Amount", "Amount", "Settlement Instruction", "Exchange Rate (Canadian Equivalent)", "Canadian Equivalent"])){
            return cibcFilter(args)
        } else {
            return false
        }
    } else if(selected == "NATIONAL BANK"){
        if(checkArrayEqual(args[0], ["Account number", "Account description","Trade date","Settlement date", "Processing date", "Market", "Symbol", "Description", "Operation", "Quantity", "Price", "Net amount", "Balance as at settlement date", "Current balance"])){
            return nationalBankFilter(args)
        } else {
            return false
        }
    } else if (selected == "VIRTUAL BROKERS"){
        if(checkArrayEqual(args[0], ["Account Number", "Effective Date", "Process Date", "Description", "TX Type", "Symbol", "TransactionID", "SubTransactionID", "SecurityType", "CC", "QTY", "COMSN", "Price", "Net Amount"])){
            return virtualBankFilter(args)
        } else {
            return false
        }
    }
    //case nothing is selected
    else {
        return false
    }



}




//filtering data. All of the different filter functions go here

//filtering for questrade
function questTradeFilter(data){
    final = []

    for (let i = 1; i < data.length; i++) {
        temp = []
        pushing = true

        for (let j = 0; j < data[i].length; j++) {

            //looks through every column by index and changes it based on requirements
            if(j == 2){
                if(data[i][j] == 'Buy'){
                    temp.push('BUY')
                    temp.push(data[i][j])
                } else if(data[i][j] == 'Sell'){
                    temp.push('SELL')
                    temp.push(data[i][j])
                } else{
                    temp.push('unallocated')
                    temp.push(data[i][j])
                }
            } else if(j == 11){
                temp.push(data[i][j] + data[i][10])

            } else if(j == 4){
                exchange = ((data[i][3]).split('.'))[1]
                symbol = ((data[i][3]).split('.'))[0]
                if(exchange == "TO"){
                    temp.push(getSecurityNameFromTicker(symbol, 'TO')["Name"])
                } else if(exchange == "VN"){
                    temp.push(getSecurityNameFromTicker(symbol, 'V')["Name"])
                } else{
                }
            } else if(j == 3){
                symbol = data[i][j].split('.')
                temp.push(symbol[0])
                if(symbol[1] == 'TO'){
                    temp.push('TSX')
                } else if(symbol[1] == 'VN'){
                    temp.push('TSXV')
                } else{
                    temp.push('other')
                }
            } else if(j == 0){
                myDate = data[i][j]
                newDate = myDate.split(' ')[0]
                temp.push(newDate)
            } else if(j == 1){
                myDate = data[i][j]
                newDate = myDate.split(' ')[0]
                temp.push(newDate)
            } else if(j == 9){
                temp.push(Math.abs(data[i][9]))
            } else if(j == 5){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 6){
                temp.push((Math.abs(data[i][9]) / Math.abs(data[i][5]).toFixed(15)))
            }
            else {

                temp.push(data[i][j].replace(/(\r\n|\n|\r)/gm, ""))

            }


        }





        if(data[i][0]){
            temp.push(data[i][4])
            final.push(temp)
        }
    }

    addOptionsToFinalFormat(final)
    //converts all of the important columns into proper format
    //return mapToProperFormat(final,{13:0, 0:1, 1:2, 4:3, 5:4, 16:5, 3:6, 2:7, 7:8, 8:9, 11:10})
}



function tdFilter(data){
    final = []
    lastCharInAccount = ((data[1][1].split(" "))[4]).charAt(((data[1][1].split(" "))[4].length) -1 )
    accountNum = data[1][1].split(" - ")[1]


    for (let i = 4; i < data.length; i++) {
        temp = []
        for (let j = 0; j < data[i].length; j++) {
            //looks through every column by index and changes it based on requirements
            if(j == 3){
                if(data[i][j] == "SELL"){
                    temp.push("sell")
                    temp.push(data[i][j])
                } else if(data[i][j] == "BUY"){
                    temp.push("buy")
                    temp.push(data[i][j])
                } else{
                    temp.push("unallocated")
                    temp.push(data[i][j])
                }
            } else if (j == 0){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 1){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                temp.push(month+"/"+day+"/"+year)
            } else if(j == 4){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 5){
                if(data[i][4] == 0){
                    temp.push(0)
                } else{
                    temp.push((Math.abs(data[i][7]) / Math.abs(data[i][4])).toFixed(15))
                }
            } else if(j == 6){
                if(data[i][j]){
                    temp.push(parseInt(data[i][j]))
                } else{
                    temp.push(0)
                }
            } else if(j == 7){
                temp.push(Math.abs(data[i][j]))
            }
            else{
                temp.push(data[i][j])
            }
        }
        temp.push(accountNum)
        temp.push("")
        temp.push("")
        if(data[i][0]){
            temp.push(data[i][2])
            final.push(temp)
        }

    }
    return addOptionsToFinalFormat(final)
    //return mapToProperFormat(final, {9:0, 0:1, 1:2, 11:3, 10:4, 12:5, 4:6, 3:7, 5:8, 6:9, 8:10})

}

function rbcFilter(data){
    dataReal = []
    for (let i = 9; i < data.length; i++) {
        trueValue = ''
        stopAt = 0
        charCount = 0
        temp = []
        //looks through every column by index and changes it based on requirements
        for (let j = 8; j < data[i].length; j++) {
            if(data[i][j] == "USD" || data[i][j] == "USD"){

                stopAt = j
                break
            } else{

                trueValue += data[i][j]
                charCount++

            }
        }

        for (let j = 0; j < stopAt-charCount; j++) {
            temp.push(data[i][j])
        }

        temp.push(parseFloat(trueValue.split('\"')[1]))

        for (let j = stopAt; j < stopAt + 2; j++) {
            temp.push(data[i][j])
        }
        if(data[i][0]){
            dataReal.push(temp)
        }

    }
    data = dataReal

    final = []

    for (let i = 0; i < data.length; i++) {
        temp = []

        for (let j = 0; j < data[i].length; j++) {

            //looks through every column by index and changes it based on requirements
            if(j == 0){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 1){
                if(data[i][j] == "Sell"){
                    temp.push("SELL")
                    temp.push(data[i][j])
                } else if(data[i][j] == "Buy"){
                    temp.push("BUY")
                    temp.push(data[i][j])
                } else{
                    temp.push("unallocated")
                    temp.push(data[i][j])
                }
            } else if(j == 4){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 5){
                if(data[i][4]){
                    temp.push((Math.abs(data[i][8]) / Math.abs(data[i][4])).toFixed(15))

                } else{
                    temp.push(0)
                }
            } else if(j == 6){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 7){

                temp.push(data[i][j] + data[i][9])
            } else if(j == 8){

                temp.push(Math.abs(data[i][j]))
            } else{
                temp.push(data[i][j])
            }
        }
        temp.push('')
        temp.push(data[i][3])
        final.push(temp)

    }

    return addOptionsToFinalFormat(final)
    //return mapToProperFormat(final, {8:0, 0:1, 7:2, 3:3, 12:4, 13:5, 1:6, 2:7, 5:8, 6:9, 9:10})
}

function scotiaFilter(data){
    finalData = []
    for (let i = 1; i < data.length; i++) {
        tempRow = []
        if(data[i].length > 1){
            for (let j = 0; j < data[i].length; j++) {
                if(j == 2 || j == 3){
                    tempDate = new Date(data[i][j])
                    pushDate = (tempDate.getMonth() + 1) + "/" + (tempDate.getDate()) + "/" + (tempDate.getFullYear());
                    tempRow.push(pushDate)
                } else if(j == 6 || j == 9){
                    tempNum = parseFloat(data[i][j])
                    tempNum = Math.abs(tempNum)
                    tempRow.push(tempNum)
                } else if(j == 8){
                    total = Math.abs(parseFloat(data[i][9]))
                    qty = Math.abs(parseFloat(data[i][6]))
                    if(total == 0 || qty == 0){
                        tempRow.push(0)
                    } else {
                        price = total / qty
                        tempRow.push(price.toFixed(15))
                    }

                } else if(j == 5){
                    if(data[i][j] == "BUY"){
                        tempRow.push(data[i][j])
                    } else if(data[i][j] == "SELL"){
                        tempRow.push(data[i][j])
                    } else {
                        tempRow.push("unallocated")
                    }
                    tempRow.push(data[i][j])
                } else{
                    tempRow.push(data[i][j])
                }
            }
            tempRow.push("")
            tempRow.push("")
            finalData.push(tempRow)
        }
    }




    //mapToProperFormat(finalData, {11:0, 2:1, 3:2, 1:3, 12:4, 0:5, 5:6, 6:7, 7:8, 9:9, 10:10})
    return addOptionsToFinalFormat(finalData)
}


function cibcFilter(data){
    accountNum = data[0][0]

    tempData = data
    finalData = []

    //takes care of commas separating and puts them all together
    for (let i = 10; i < tempData.length; i++) {
        tempRow = []
        if(tempData[i].length > 1){

            for (let j = 0; j < tempData[i].length; j++) {

                if(j == 0 || j == 1){
                    tempDate = new Date(tempData[i][j])
                    pushDate = (tempDate.getMonth() + 1) + "/" + (tempDate.getDate()) + "/" + (tempDate.getFullYear());
                    tempRow.push(pushDate)
                } else if(j == 3){
                    if(tempData[i][j] == "Sell"){
                        tempRow.push("SELL")
                    } else if(tempData[i][j] == "Buy"){
                        tempRow.push("BUY")
                    } else {
                        tempRow.push("unallocated")
                    }
                    tempRow.push(tempData[i][j])
                } else if (j == 7){
                    tempRow.push(Math.abs(parseFloat(tempData[i][j])))
                } else if (j == 13){
                    tempRow.push(Math.abs(parseFloat(tempData[i][j])))
                } else if (j == 9){
                    qty = Math.abs(parseFloat(tempData[i][7]))
                    amount = Math.abs(parseFloat(tempData[i][13]))
                    if(qty == 0 || amount == 0){
                        tempRow.push(0)
                    } else {
                        tempRow.push((amount/ qty).toFixed(15))
                    }
                } else if(j == 6){
                    tempRow.push(tempData[i][j].trim())
                }
                else {
                    tempRow.push(tempData[i][j])
                }
            }
            tempRow.push(accountNum)
            tempRow.push("")
            finalData.push(tempRow)
        }
    }

    return addOptionsToFinalFormat(finalData)
    //mapToProperFormat(finalData, {18:0, 0:1, 1:2, 5:3, 19:4, 7:5, 3:6, 4:7, 8:8, 10:9, 14:10})
}

function nationalBankFilter(data){
    finalData = []

    for (let i = 1; i < data.length; i++) {
        tempRow = []
        if(data[i].length > 1){
            for (let j = 0; j < data[i].length; j++) {
                if(j == 9){
                    tempRow.push(Math.abs(parseFloat(data[i][j])))
                } else if (j == 11){
                    tempRow.push(Math.abs(parseFloat(data[i][j])))
                } else if (j == 12){
                    qty = Math.abs(parseFloat(data[i][9]))
                    amount = Math.abs(parseFloat(data[i][12]))
                    if(qty == 0 || amount == 0){
                        tempRow.push(0)
                    } else {
                        tempRow.push((amount / qty).toFixed(15))
                    }
                } else if(j == 8){
                    if(data[i][j] == "Sell") {
                        tempRow.push("SELL")
                    } else if(data[i][j] == "Buy"){
                        tempRow.push("BUY")
                    } else {
                        tempRow.push("unallocated")
                    }
                    tempRow.push(data[i][j])
                } else if(j == 0){
                    tempRow.push((data[i][j] + " " + data[i][5]).trim())
                }
                else {
                    tempRow.push(data[i][j])
                }
            }
            tempRow.push("")
            finalData.push(tempRow)
        }
    }
    //mapToProperFormat(finalData, {0:0, 2:1, 3:2, 6:3, 15:4, 7:5, 8:6, 9:7, 10:8, 13:9, 12:10})
    addOptionsToFinalFormat(finalData)

}


function virtualBankFilter(data){
    finalData = []
    for (let i = 1; i < data.length; i++) {
        tempRow = []
        if(data[i].length > 0){
            for (let j = 0; j < data[i].length; j++) {
                if (j == 0){
                    tempRow.push(data[i][0] + " " + data[i][9])
                } else if(j == 4){
                    if(data[i][j] == "SELL"){
                        tempRow.push("SELL")
                    } else if(data[i][j] == "BUY"){
                        tempRow.push("BUY")
                    } else {
                        tempRow.push("unallocated")
                    }

                    tempRow.push(data[i][j])
                } else if(j == 10){
                    tempRow.push(Math.abs(parseFloat(data[i][j].replace("$", "").replace(",", "").replace('\"', ''))))
                } else if (j == 13){
                    tempRow.push(Math.abs(parseFloat(data[i][j].replace("$", "").replace(",", "").replace('\"', ''))))
                } else if (j == 12){
                    amount = parseFloat(data[i][13].replace("$", "").replace(",", "").replace('\"', ''))
                    qty = parseFloat(data[i][10].replace("$", "").replace(",", "").replace('\"', ''))
                    if(amount == 0 || qty == 0){
                        tempRow.push(0)
                    } else {
                        tempRow.push((amount / qty).toFixed(15))
                    }
                } else {
                    tempRow.push(data[i][j])
                }
            }
            tempRow.push("")
            finalData.push(tempRow)
        }
    }


    //mapToProperFormat(finalData, {0:0, 1:1, 2:2, 6:3, 15:4, 3:5, 4:6, 5:7, 11:8, 13:9, 14:10})
    addOptionsToFinalFormat(finalData)
}

//case that options need to be added such as exchange and it can not just be converted straight into csv
function addOptionsToFinalFormat(info){
    //similar to checking for errors there is an if statement for every type of broker (If required)
    if(selected == 'TD'){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][2]){
                results = getTickerFromDescription(info[i][2])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                        tempExchangeToTicker[results[j][1][k]] =  results[j][0]
                    }
                }
                infoFinal[i].push(tempExchangeToTicker)
            }

        }
        return optionVisualizer(infoFinal)
    } else if(selected == "RBC"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][3]){
                results = getTickerFromTicker(info[i][3])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                        tempExchangeToTicker[results[j][1][k]] = results[j][0]
                    }
                }
            }
            infoFinal[i].push(tempExchangeToTicker)
        }
        return optionVisualizer(infoFinal)


    } else if(selected == "questrade"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][4]){
                results = getTickerFromTicker(info[i][4])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                       tempExchangeToTicker[results[j][1][k]] = results[j][0]
                    }
                }
            }
            infoFinal[i].push(tempExchangeToTicker)
        }

        return optionVisualizer(infoFinal)
    } else if(selected == "SCOTIA BANK"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][1] != ""){
                newResults = getTickerFromDescription(info[i][0])
                if(newResults.length > 0){
                    infoFinal[i].push(newResults[0][2])
                    for (let j = 0; j < newResults.length; j++) {
                        for (let k = 0; k < newResults[j][1].length; k++) {
                            tempExchangeToTicker[newResults[j][1][k]] = newResults[j][0]
                        }
                    }
                    infoFinal[i].push(tempExchangeToTicker)
                } else {
                    infoFinal[i].push("")
                    infoFinal[i].push(false)
                }
            } else {
                infoFinal[i].push("")
                infoFinal[i].push(false)
            }

        }

        return optionVisualizer(infoFinal)
    } else if (selected == "CIBC") {
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][5] != ""){
                newResults = getTickerFromTicker(info[i][5])
                if(newResults.length > 0) {
                    infoFinal[i].push(newResults[0][2])
                    for (let j = 0; j < newResults.length; j++) {
                        for (let k = 0; k < newResults[j][1].length; k++) {
                            tempExchangeToTicker[newResults[j][1][k]] = newResults[j][0]
                        }
                    }
                    infoFinal[i].push(tempExchangeToTicker)
                } else {
                    infoFinal[i].push("")
                    infoFinal[i].push(false)
                }
            } else {
                infoFinal[i].push("")
                infoFinal[i].push(false)
            }
        }

        return optionVisualizer(infoFinal)
    } else if (selected == "NATIONAL BANK"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][6] != ""){
                newResults = getTickerFromTicker(info[i][6].split(".")[0])
                if(newResults.length > 0){
                    infoFinal[i].push(newResults[0][2])
                    for (let j = 0; j < newResults.length; j++) {
                        for (let k = 0; k < newResults[j][1].length; k++) {
                            tempExchangeToTicker[newResults[j][1][k]] = newResults[j][0]
                        }
                    }
                    infoFinal[i].push(tempExchangeToTicker)
                } else {
                    infoFinal[i].push("")
                    infoFinal[i].push(false)
                }
            } else {
                infoFinal[i].push("")
                infoFinal[i].push(false)
            }
        }
        return optionVisualizer(infoFinal)
    } else if (selected == "VIRTUAL BROKERS") {
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            if(info[i].length >= 16){
                infoFinal.push(info[i])
                console.log(info[i])
                tempExchangeToTicker = {}
                if(info[i][6] != "") {
                    newResults = getTickerFromTicker(info[i][6])
                    if(newResults.length > 0) {
                        infoFinal[i].push(newResults[0][2])
                        for (let j = 0; j < newResults.length; j++) {
                            for (let k = 0; k < newResults[j][1].length; k++) {
                                tempExchangeToTicker[newResults[j][1][k]] = newResults[j][0]
                            }
                        }
                        infoFinal[i].push(tempExchangeToTicker)
                    } else {
                        infoFinal[i].push("")
                        infoFinal[i].push(false)
                    }
                } else {
                    infoFinal[i].push("")
                    infoFinal[i].push(false)
                }
            }

        }
        return optionVisualizer(infoFinal)
    }

    else {
        return false
    }
}
