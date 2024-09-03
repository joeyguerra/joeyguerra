import path from 'node:path'
import { createReadStream, createWriteStream } from 'node:fs'
import readline from 'node:readline'

// const root = new URL(import.meta.url).pathname.split('/kaizen-io')[0]
// const logFilePath = path.join(root, 'klowen', 'lab.log')
// console.log(logFilePath)

const inputFilePath = process.argv[2]
const outputFilePath = process.argv[3]

if (!inputFilePath || !outputFilePath) {
    console.error('Usage: node LogParser.js <inputFilePath> <outputFilePath>')
    process.exit(1)
}
  
const readStream = createReadStream(inputFilePath)
const writeStream = createWriteStream(outputFilePath)

const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
})

const extractTimestamp = (line) => {
    const timestampString = line.slice(0, 23)
    return new Date(timestampString)
}

const word = 'Validating: '
rl.on('line', (line) => {
    const wordStart = line.indexOf(word)
    if (wordStart > -1) {
        const pos = wordStart + word.length
        const json = JSON.parse(line.slice(pos))
        json.recordedAt = extractTimestamp(line)
        writeStream.write(JSON.stringify(json) + '\n')
    }
})

rl.on('close', () => {
    console.log('Finished parsing and writing to file.')
})