import { execSync } from 'child_process'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import path from 'path'
import os from 'os'
import zlib from 'zlib'

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)

const version = '0.12.6-1'
const platform = os.platform()
const arch = os.arch()
const downloadDir = path.join(__dirname, 'downloads')
const wkhtmltopdfDir = path.join(__dirname, 'node_modules', '.bin')

let downloadUrl

switch (platform) {
  case 'darwin':
    downloadUrl = `https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${version}/wkhtmltox-${version}_osx-cocoa-${arch}.pkg`
    break
  case 'linux':
    downloadUrl = `https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${version}/wkhtmltox_${version}_${arch}.tar.xz`
    break
  case 'win32':
    downloadUrl = `https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${version}/wkhtmltox-${version}_windows-${arch}.zip`
    break
  default:
    console.error(`Unsupported platform: ${platform}`)
    process.exit(1)
}

const downloadPath = path.join(downloadDir, `wkhtmltox_${version}_${arch}.pkg`)
const wkhtmltopdfExecutable = path.join(wkhtmltopdfDir, 'wkhtmltopdf')

const downloadWkhtmltopdf = async () => {
  try {
    console.log(`Downloading WKHTMLTOPDF from: ${downloadUrl}`)
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error(`Failed to download WKHTMLTOPDF (${response.statusText})`)
    }

    // Create the downloads directory if it doesn't exist
    await fs.mkdir(downloadDir, { recursive: true })

    // Save the downloaded file
    const fileStream = await fs.createWriteStream(downloadPath)
    await response.body.pipe(fileStream)

    console.log(`Downloaded to: ${downloadPath}`)

    // Extract WKHTMLTOPDF
    console.log('Extracting WKHTMLTOPDF')

    if (platform === 'darwin') {
      // For macOS, use the package directly
      await execSync(`installer -pkg ${downloadPath} -target /`)
    } else if (platform === 'linux') {
      // For Linux, extract the tar.xz file
      const tarBuffer = await fs.readFile(downloadPath)
      const untarredBuffer = zlib.unzipSync(tarBuffer)
      const untarredPath = path.join(downloadDir, 'wkhtmltox')
      await fs.writeFile(untarredPath, untarredBuffer)
      await execSync(`tar -xf ${untarredPath} -C ${wkhtmltopdfDir}`)
      await fs.unlink(untarredPath)
    } else if (platform === 'win32') {
      // For Windows, extract the ZIP file
      const zipBuffer = await fs.readFile(downloadPath)
      const unzippedBuffer = zlib.unzipSync(zipBuffer)
      await fs.writeFile(wkhtmltopdfExecutable, unzippedBuffer)
    }

    // Set execute permissions for the wkhtmltopdf executable
    await fs.chmod(wkhtmltopdfExecutable, '755')

    console.log('WKHTMLTOPDF extraction successful')
  } catch (error) {
    console.error('Error installing WKHTMLTOPDF:', error)
    process.exit(1)
  }
}

// Run the downloadWkhtmltopdf function
downloadWkhtmltopdf()
