// Description:
//   a bot that tells you something.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot lunch - Pick a random place for lunch.
//
// Notes:
//   Make this good
//
// Author:
//   Joey Guerra

class Option {
    constructor (title, description, link) {
      this.title = title
      this.description = description
      this.link = link
    }
  
    toString () {
      return `How 'bout ${this.title}. ${this.description} @ ${this.link}`
    }
  }
  
  const dallasLunchOptions = [
    new Option('Village Burger Bar', 'Serves burgers and fries', 'https://www.villageburgerbar.com'),
    new Option('Taqueria La Ventana', 'Serves tacos', 'https://www.yelp.com/biz/taqueria-la-ventana-dallas-4'),
    new Option('Roti', 'Serves Mediterranean', 'https://roti.com/menu'),
    new Option('Shake Shack', 'Serves burgers and shakes', 'https://shakeshack.com/'),
    new Option('Mixt', 'Serves salads', 'https://www.mixt.com/menu/dallas/?set=true'),
    new Option('The Henry', 'Serves various American', 'https://www.thehenryrestaurant.com/locations/the-henry-dallas/'),
    new Option('Sammy\'s Bar-B-Q', 'Serves barbeque', 'http://sammysbarbeque.com'),
    new Option('Becks Prime', 'Delicious burgers', 'https://www.becksprime.com'),
    new Option('Cattleack BBQ', 'BBQ in Addison, Tx', 'https://cattleackbbq.com'),
    new Option('Tiz Taco', 'Tacos', 'http://tiztaco.com/'),
    new Option('Loro', 'Smoked meats, boozy slushees, rad veggies, chill vibes.', 'https://www.loroeats.com')
  ]
  
  const randomFrom = options => options[Math.floor(Math.random() * options.length)]
  export default robot => {
    robot.router.get(/lunch/, (req, res) => {
      const selectedLunch = randomFrom(dallasLunchOptions)
      res.send(`${selectedLunch}`)
    })
    
    robot.router.get(/helo(.*)/, (req, res) => {
      res.reply('Hi!') 
    })
    robot.respond(/lunch$/i, resp => {
      const selectedLunch = randomFrom(dallasLunchOptions)
      resp.reply(`${selectedLunch}`)
    })
  }
  