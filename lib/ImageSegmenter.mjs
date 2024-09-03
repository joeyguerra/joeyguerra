
import sharp from 'sharp'

async function getResizedImage(arg, desiredWidth) {
    const image = sharp(arg)
    const resizedImage = sharp(await (await image.resize(desiredWidth)).toBuffer())
    return resizedImage
}
async function* segment(image, options) {
    const { tileWidth, columns, rows } = options
    const { height: resizedHeight, format } = await image.metadata()
    for (let y = rows - 1; y >= 0; y--) {
        let height = tileWidth
        let top = y * tileWidth
        let width = tileWidth
        if (top + height > resizedHeight) {
            height = resizedHeight - top
        }
        if (height <= 0) continue
        for (let x = columns - 1; x >= 0; x--) {
            let left = x * tileWidth
            yield await (sharp(await image.toFormat(format).toBuffer())).extract({ left, top, width, height })
        }
    }
}

async function segmentFromFile(imagePath, options) {
    const { tileWidth, columns } = options
    const endFullWidth = tileWidth * columns
    const resizedImage = await getResizedImage(imagePath, endFullWidth)
    const slots = []
    let slot = 0
    for await (const image of segment(resizedImage, options)) {
        slot++
        slots.push(image)
    }
    return slots
}
async function segmentFromBuffer(imageBuffer, options) {
    const { tileWidth, columns } = options
    const endFullWidth = tileWidth * columns
    const resizedImage = await getResizedImage(imageBuffer, endFullWidth)
    const slots = []
    let slot = 0
    for await (const image of segment(resizedImage, options)) {
        slot++
        slots.push(image)
    }
    return slots
}
async function segmentFromBufferToStreams(imageBuffer, options) {
    const { tileWidth, columns } = options
    const endFullWidth = tileWidth * columns
    const resizedImage = await getResizedImage(imageBuffer, endFullWidth)
    const slots = []
    for await (const image of segment(resizedImage, options)) {
        slots.push(image)
    }
    return slots
}

export {
    segmentFromFile,
    segmentFromBuffer,
    segmentFromBufferToStreams
}