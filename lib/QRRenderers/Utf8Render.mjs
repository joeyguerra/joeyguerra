/**
 * 
 * QRCode for JavaScript
 *
 * modified by Joey Guerra for ES6 support
 * Copyright (c) 2020 Joey Guerra
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 */

/**
 * QRCode for JavaScript
 *
 * modified by Ryan Day for nodejs support
 * Copyright (c) 2011 Ryan Day
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
*/

const BLOCK_CHAR = {
  WW: ' ',
  WB: '▄',
  BB: '█',
  BW: '▀'
}

const INVERTED_BLOCK_CHAR = {
  BB: ' ',
  BW: '▄',
  WW: '█',
  WB: '▀'
}

function hex2rgba (hex) {
  if (typeof hex === 'number') {
    hex = hex.toString()
  }

  if (typeof hex !== 'string') {
    throw new Error('Color should be defined as hex string')
  }

  let hexCode = hex.slice().replace('#', '').split('')
  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    throw new Error('Invalid hex color: ' + hex)
  }

  // Convert from short to long form (fff -> ffffff)
  if (hexCode.length === 3 || hexCode.length === 4) {
    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
      return [c, c]
    }))
  }

  // Add default alpha value
  if (hexCode.length === 6) hexCode.push('F', 'F')

  const hexValue = parseInt(hexCode.join(''), 16)

  return {
    r: (hexValue >> 24) & 255,
    g: (hexValue >> 16) & 255,
    b: (hexValue >> 8) & 255,
    a: hexValue & 255,
    hex: '#' + hexCode.slice(0, 6).join('')
  }
}

function getBlockChar (top, bottom, blocks) {
  if (top && bottom) return blocks.BB
  if (top && !bottom) return blocks.BW
  if (!top && bottom) return blocks.WB
  return blocks.WW
}
function getOptions(options) {
  if (!options) options = {}
  if (!options.color) options.color = {}

  const margin = typeof options.margin === 'undefined' ||
    options.margin === null ||
    options.margin < 0 ? 4 : options.margin

  const width = options.width && options.width >= 21 ? options.width : undefined
  const scale = options.scale || 4

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    type: options.type,
    rendererOpts: options.rendererOpts || {}
  }
}

export default {
  render(qrData, options, cb) {
    const opts = getOptions(options)
    let blocks = BLOCK_CHAR
    if (opts.color.dark.hex === '#ffffff' || opts.color.light.hex === '#000000') {
      blocks = INVERTED_BLOCK_CHAR
    }

    const size = qrData.modules.size
    const data = qrData.modules.data

    let output = ''
    let hMargin = Array(size + (opts.margin * 2) + 1).join(blocks.WW)
    hMargin = Array((opts.margin / 2) + 1).join(hMargin + '\n')

    const vMargin = Array(opts.margin + 1).join(blocks.WW)

    output += hMargin
    for (let i = 0; i < size; i += 2) {
      output += vMargin
      for (let j = 0; j < size; j++) {
        const topModule = data[i * size + j]
        const bottomModule = data[(i + 1) * size + j]

        output += getBlockChar(topModule, bottomModule, blocks)
      }

      output += vMargin + '\n'
    }

    output += hMargin.slice(0, -1)

    if (typeof cb === 'function') {
      cb(null, output)
    }

    return output
  },
  renderToFile(path, qrData, options, cb) {
    if (typeof cb === 'undefined') {
      cb = options
      options = undefined
    }

    const fs = require('fs')
    const utf8 = exports.render(qrData, options)
    fs.writeFile(path, utf8, cb)
  }
}
