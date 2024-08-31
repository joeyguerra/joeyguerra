import ansiEscapes from 'ansi-escapes'

async function main() {
  if (process.argv.length < 3) {
    console.error('Please provide an image description as a command line argument.')
    process.exit(1)
  }

  const imageDescription = process.argv[2]
  const apiKey = process.env.OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/images/generations'
  const apiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'OpenAI-Image-Generator/0.1',
    },
    body: JSON.stringify({
        prompt: imageDescription,
        n: 1,
        size: '1024x1024',
    })
  })
  const response = await apiResponse.json()
  console.log(response.data[0].url)
  try {
    const imageResponse = await fetch(response.data[0].url)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const imageData = ansiEscapes.image(buffer, { width: '50%' })
    // console.write(imageData)
    Bun.spawn(['open', response.data[0].url])
  } catch (error) {
    console.error('Error displaying image in console:', error.message)
  }
}


main()
