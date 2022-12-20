const crypto = require('crypto-promise')
const fs = require('fs')
const { parse } = require('csv-parse')
const { finished } = require('stream/promises')

const input = './input.csv'
const output = './output.csv'
const password = 'IPDROX'
const encryptString = false

var newFileStream = fs.createWriteStream(output)

const encrypt = async ( text ) => {
    const cipher = await crypto.cipher('aes256', password)(text)
    return cipher.toString('hex')
}

const decrypt = async ( text ) => {
    const decipher = await crypto.decipher('aes256', password)(text, 'hex')
    return decipher.toString()
}

const processCSV = async (receiver) => {
    const parser = fs
        .createReadStream(input)
        .pipe(parse({
            columns: false,
            trim: true
        }))
    parser.on('readable', async function() {
        let record
        while (record = parser.read()) {
	    let string = record[0]
	    if ( encryptString ) {
                let encrypted = await encrypt( string )
		newFileStream.write(`${encrypted}\n`)
     	    }
	    else {
	        let decrypted = await decrypt( string )
		newFileStream.write(`${decrypted}\n`)
	    }
        }
    })
    await finished(parser)
}

const main = async () => {
    await processCSV()
}

main()
