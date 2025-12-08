class ColorWheel {
  constructor(color) {
    this.setColor(color)
  }

  // ---- Public API ----

  /**
   * Set or change the base color.
   * @param {string|object} color - Hex string ("#BF8F7B") or {r,g,b}
   */
  setColor(color) {
    let rgb

    if (typeof color === 'string') {
      rgb = ColorWheel.hexToRgb(color)
    } else if (typeof color === 'object' && color !== null) {
      rgb = { r: color.r, g: color.g, b: color.b }
    } else {
      throw new Error('color must be a hex string or {r,g,b} object')
    }

    this.rgb = rgb
    this.hsl = ColorWheel.rgbToHsl(rgb.r, rgb.g, rgb.b)
  }

  /**
   * Get colors rotated by the given angles on the hue wheel.
   * @param {number[]} angles - e.g. [45, 90, 180]
   * @returns {{
   *   base: { hex: string, rgb: {r,g,b}, hsl: {h,s,l} },
   *   rotations: Array<{ angle: number, hex: string, rgb: {r,g,b}, hsl: {h,s,l} }>
   * }}
   */
  getRotations(angles = []) {
    const { r, g, b } = this.rgb
    const { h, s, l } = this.hsl

    const base = {
      hex: ColorWheel.rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: { h, s, l }
    }

    const rotations = angles.map(angle => {
      const rotatedHue = ColorWheel.rotateHue(h, angle)
      const rgbRot = ColorWheel.hslToRgb(rotatedHue, s, l)
      const hexRot = ColorWheel.rgbToHex(rgbRot.r, rgbRot.g, rgbRot.b)

      return {
        angle,
        hex: hexRot,
        rgb: rgbRot,
        hsl: { h: rotatedHue, s, l }
      }
    })

    return { base, rotations }
  }

  // ---- Static helpers ----

  // Parse hex string ("BF8F7B" or "#BF8F7B") -> { r, g, b }
  static hexToRgb(hex) {
    hex = hex.replace('#', '').trim()
    if (hex.length === 3) {
      // shorthand #abc => #aabbcc
      hex = hex.split('').map(ch => ch + ch).join('')
    }
    const num = parseInt(hex, 16)
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    }
  }

  // { r, g, b } (0–255) -> { h, s, l } with h in [0,360), s,l in [0,1]
  static rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min

    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1))

      switch (max) {
        case r:
          h = ((g - b) / d) % 6
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h *= 60
      if (h < 0) h += 360
    }
    return { h, s, l }
  }

  static hslToRgb(h, s, l) {
    h = h % 360
    if (h < 0) h += 360

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r1, g1, b1
    if (h < 60)       { r1 = c; g1 = x; b1 = 0 }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0 }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c }
    else              { r1 = c; g1 = 0; b1 = x }

    const r = Math.round((r1 + m) * 255)
    const g = Math.round((g1 + m) * 255)
    const b = Math.round((b1 + m) * 255)

    return { r, g, b }
  }

  static rgbToHex(r, g, b) {
    const toHex = v => v.toString(16).padStart(2, '0')
    return '#' + toHex(r) + toHex(g) + toHex(b)
  }

  // Rotate hue by `deg` degrees
  static rotateHue(h, deg) {
    let h2 = (h + deg) % 360
    if (h2 < 0) h2 += 360
    return h2
  }
}

// ---- Example usage ----

const baseColor = process?.argv[2] || '#BF8F7B'

const wheel = new ColorWheel(baseColor)
// or: const wheel = new ColorWheel({ r: 191, g: 143, b: 123 })

const result = wheel.getRotations([45, 90, 180])

console.log(result)

// Example shape:
/*
{
  base: {
    hex: "#BF8F7B",
    rgb: { r: 191, g: 143, b: 123 },
    hsl: { h: 17.8..., s: 0.34..., l: 0.616... }
  },
  rotations: [
    {
      angle: 45,
      hex: "#B1BF7B",
      rgb: { r: 177, g: 191, b: 123 },
      hsl: { h: 62.8..., s: 0.34..., l: 0.616... }
    },
    {
      angle: 90,
      hex: "#8FBF7B",
      rgb: { r: 143, g: 191, b: 123 },
      hsl: { h: 107.8..., s: 0.34..., l: 0.616... }
    },
    {
      angle: 180,
      hex: "#88B3BF",
      rgb: { r: 136, g: 179, b: 191 },
      hsl: { h: 197.8..., s: 0.34..., l: 0.616... }
    }
  ]
}
*/