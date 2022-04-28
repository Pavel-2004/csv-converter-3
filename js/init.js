//set the input which will take in the csv

console.log("here")
const input = document.getElementById("csv")
const selectedTypeInput = document.getElementById("type")
var options = ["questrade", "TD", "RBC", "SCOTIA BANK", "CIBC", "NATIONAL BANK", "VIRTUAL BROKERS"]
for (let i = 0; i < options.length; i++) {
    if(i == 0){
        document.getElementById("type").value = options[0]
    }
    option = document.createElement("option")
    option.innerText = options[i]
    option.value = options[i]
    document.getElementById("type").append(option)
}

input.addEventListener('change', function(e){
    //this is temporary until more types are addeda

    const reader = new FileReader()
    selectedType = selectedTypeInput.value

    reader.onload = function (){
        result = initAll(reader.result, selectedType)

        if(result){
            //successful case
        } else{
            //error occurred
        }
    }
    reader.readAsText(input.files[0])
})






