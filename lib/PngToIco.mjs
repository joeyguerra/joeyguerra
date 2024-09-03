import {PNG} from 'pngjs'
import sharp from 'sharp'

const parsePng = async (buffer, options) => {
	if (!Buffer.isBuffer(buffer)) {
		throw new TypeError(`Expected \`buffer\` to be of type \`Buffer\` but received type \`${typeof buffer}\``);
	}

	return new Promise((resolve, reject) => {
		let png = new PNG(options)
        
		png.on('metadata', data => {
			png = Object.assign(png, data)
		})

		png.on('error', reject)
		png.on('parsed', data => {
            resolve(png)
        })
        png.on('end', ()=>{ })

		png.end(buffer)
	})
}

const constants = {
	bitmapSize: 40,
	colorMode: 0,
	directorySize: 16,
	headerSize: 6
}

const createHeader = n => {
	const buf = Buffer.alloc(constants.headerSize)

	buf.writeUInt16LE(0, 0)
	buf.writeUInt16LE(1, 2)
	buf.writeUInt16LE(n, 4)

	return buf
};

const createDirectory = (data, offset) => {
	const buf = Buffer.alloc(constants.directorySize)
	const size = data.data.length + constants.bitmapSize
	const width = data.width === 256 ? 0 : data.width
	const height = data.height === 256 ? 0 : data.height
	const bpp = data.bpp * 8

	buf.writeUInt8(width, 0)
	buf.writeUInt8(height, 1)
	buf.writeUInt8(0, 2)
	buf.writeUInt8(0, 3)
	buf.writeUInt16LE(1, 4)
	buf.writeUInt16LE(bpp, 6)
	buf.writeUInt32LE(size, 8)
	buf.writeUInt32LE(offset, 12)

	return buf
};

const createBitmap = (data, compression) => {
	const buf = Buffer.alloc(constants.bitmapSize)

	buf.writeUInt32LE(constants.bitmapSize, 0)
	buf.writeInt32LE(data.width, 4)
	buf.writeInt32LE(data.height * 2, 8)
	buf.writeUInt16LE(1, 12)
	buf.writeUInt16LE(data.bpp * 8, 14)
	buf.writeUInt32LE(compression, 16)
	buf.writeUInt32LE(data.data.length, 20)
	buf.writeInt32LE(0, 24)
	buf.writeInt32LE(0, 28)
	buf.writeUInt32LE(0, 32)
	buf.writeUInt32LE(0, 36)

	return buf
};

const createDib = (data, width, height, bpp) => {
	const cols = width * bpp
	const rows = height * cols
	const end = rows - cols
	const buf = Buffer.alloc(data.length)

	for (let row = 0; row < rows; row += cols) {
		for (let col = 0; col < cols; col += bpp) {
			let pos = row + col

			const r = data.readUInt8(pos)
			const g = data.readUInt8(pos + 1)
			const b = data.readUInt8(pos + 2)
			const a = data.readUInt8(pos + 3)

			pos = (end - row) + col

			buf.writeUInt8(b, pos)
			buf.writeUInt8(g, pos + 1)
			buf.writeUInt8(r, pos + 2)
			buf.writeUInt8(a, pos + 3)
		}
	}

	return buf
}

const toIco = pngs => {
    const header = createHeader(pngs.length)
    const arr = [header]
    let len = header.length
    let offset = constants.headerSize + (constants.directorySize * pngs.length)
    for (const x of pngs) {
        const dir = createDirectory(x, offset)
        arr.push(dir)
        len += dir.length
        offset += x.data.length + constants.bitmapSize
    }
    for (const x of pngs) {
        const header = createBitmap(x, constants.colorMode)
        const dib = createDib(x.data, x.width, x.height, x.bpp)
        arr.push(header, dib)
        len += header.length + dib.length
    }
    return Buffer.concat(arr, len)
}

const resize = async (imageBits, sizes) => {
    const images = []
    for await (let size of sizes){
        const data = await sharp(imageBits).resize({
            width: size,
            height: size
        }).toBuffer()
        images.push(data)
    }
    return images
}
const resizeImages = async (data, sizes) => {
    let images = []
    for await (let imageBits of data){
        const png = await parsePng(imageBits)
        let bottomSizes = sizes.filter(s => s <= png.width)
        const resized = await resize(imageBits, bottomSizes)
        resized.forEach(r => images.push(r))
    }
    return images
}

const createIco = async (input, sizes = [32]) => {
	const data = Array.isArray(input) ? input : [input]
    const batches = await resizeImages(data, sizes)
    const pngs = []
    for await (let batch of batches){
        const png = await parsePng(batch)
        pngs.push(png)
    }
    return toIco(pngs)
}

export {
    createIco,
	resizeImages
}