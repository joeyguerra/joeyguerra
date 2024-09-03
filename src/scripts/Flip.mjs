// Description:
// Flip a table.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot flip - Flip a table. #flip
// Notes:
//
// Author:
//   Joey Guerra

export default robot => {
  robot.respond(/flip\b/i, async res => {
        const flips = [
          '(╯°□°）╯︵ ┻━┻',
          '┬─┬﻿ ノ( ゜-゜ノ)',
          '(ノ ゜Д゜)ノ ︵ ┻━┻',
          '(╯°□°)╯︵ ┻━┻ ︵ ╯(°□° ╯)',
          '┬─┬﻿ ︵ /(.□. \）',
          '‎(ﾉಥ益ಥ）ﾉ﻿ ┻━┻',
          '(ノ^_^)ノ┻━┻ ┬─┬ ノ( ^_^ノ)',
          '(╯°Д°）╯︵ /(.□ . \)',
          "(╯'□')╯︵ ┻━┻",
          '(ﾉಥДಥ)ﾉ︵┻━┻･/',
          '(/ .□.)\ ︵╰(゜Д゜)╯︵ /(.□. \)',
          '(._.) ~ ︵ ┻━┻',
          'ʕノ•ᴥ•ʔノ ︵ ┻━┻',
          '(/¯◡ ‿ ◡)/¯ ~ ┻━┻',
          '(/¯◡ ‿ ◡)/¯ ~ ┻━┻',
          '┻━┻ ︵ ლ(⌒-⌒ლ)',
          'ʇǝʞɔɐɹq ︵ヽ(`Д´)ﾉ︵ ǝʞup'
        ];
        return res.reply(res.random(flips));
    })
}
