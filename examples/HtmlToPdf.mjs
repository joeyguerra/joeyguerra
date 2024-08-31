import htmlToPdfmake from 'html-to-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { JSDOM } from 'jsdom'
import { writeFile, readFile } from 'node:fs/promises'

pdfMake.vfs = pdfFonts.pdfMake.vfs
const data = await readFile(`./examples/htmltopdf.html`, 'utf-8')

const html = htmlToPdfmake(data.toString(), { window: (new JSDOM()).window })
const docDefinition = {
    content: [
        html
    ]
}

const pdfDocGenerator = pdfMake.createPdf(docDefinition)
pdfDocGenerator.getBase64((data) => {
    writeFile('./examples/htmltopdf.pdf', data, 'base64')
})
