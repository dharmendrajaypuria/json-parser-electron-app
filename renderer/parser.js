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
            var headers = prepareColumns(jsonText[0])
            var columns = Object.keys(jsonText[0]).join(",")
            jsonText.forEach(json => {
                populateHeaderData(headers, json)
            })
            var records = new Array();
            records.push(columns)
            for (let i = 0; i < jsonText.length; i++) {
                var row = new Array()
                populateRow(headers, i, row)
                records.push(row.join(","))
            }
            saveToFile(records)
        } else {
            var headers = prepareColumns(jsonText)
            var columns = Object.keys(jsonText).join(",")
            populateHeaderData(headers, jsonText)
            var records = new Array();
            records.push(columns)
            var row = new Array()
            populateRow(headers, 0, row)
            records.push(row.join(","))
            saveToFile(records)
        }
    } catch (error) {
        console.error(error)
        alert( 'Unable to parse')
    }
    
}

function populateRow(headers, i, row) {
    headers.forEach(data => {
        if("object" === typeof data [i]) {
            data[i] = ""
        }
        row.push(data[i])
    }) 
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
