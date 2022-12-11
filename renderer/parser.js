const { ipcRenderer } = require("electron");
const fs = require('fs')

const form = document.querySelector('form')
const textArea = document.querySelector('textarea')
form.addEventListener('submit', convert)

const csvOptions = {
    filters: [
        {
            name: 'CSV files (*.csv)',
            extensions: ['csv']
        }, ]
}

function convert(e) {
    e.preventDefault()
    try {
        const jsonText = JSON.parse(textArea.value)
        if ( Array.isArray(jsonText)) {
            console.log(jsonText.length, Object.keys(jsonText[0]).length)
            var headers = prepareColumns(jsonText[0])
            var columns = Object.keys(jsonText[0]).join(",")
            jsonText.forEach(json => {
                populateHeaderData(headers, json)
            })
            var records = new Array();
            records.push(columns)
            for (let i = 0; i < jsonText.length; i++) {
                var row = new Array()
                headers.forEach(data => {row.push(data[i])})
                records.push(row.join(","))
            }
            saveToFile(records)
        } else {
            console.log(Object.keys(jsonText))
            var headers = prepareColumns(jsonText)
            var columns = Object.keys(jsonText).join(",")
            populateHeaderData(headers, jsonText)
            var records = new Array();
            records.push(columns)
            var row = new Array()
            headers.forEach(data => {row.push(data[0])})
            records.push(row.join(","))
            saveToFile(records)
        }
    } catch (error) {
        console.error(error)
        alert( 'Unable to parse')
    }
    
}

function prepareColumns(jsonRow) {
    var headers = new Map()
    Object.keys(jsonRow).forEach(element => {
        headers.set(element, new Array()) 
    });
    return headers
}

function populateHeaderData(headers, jsonRow) {
    Object.keys(jsonRow).forEach(key => {
        headers.get(key).push(jsonRow[key])
    })
}

function saveToFile(records) {
    ipcRenderer.invoke("showSaveDialog", csvOptions).then(file => {
        if(!file.canceled) {
            fs.writeFile(file.filePath.toString(), records.join('\n'), function(err) {
                if(err) throw err
                console.log('Saved!')
                alert('File saved!')
            })
        }
    })
}
