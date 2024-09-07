// Description:
// The Unix Philosophy
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot unix philosophy - Display the Unix Philosophy
// Notes:
//
// Author:
//   Joey Guerra


export const TheUnixPhilosophy = `1. Make each program do one thing well. To do a new job, build afresh rather than complicate old programs by adding new "features".
1. Expect the output of every program to become the input to another, as yet unknown, program. Don't clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don't insist on interactive input.
1. Design and build software, even operating systems, to be tried early, ideally within weeks. Don't hesitate to throw away the clumsy parts and rebuild them.
1. Use tools in preference to unskilled help to lighten a programming task, even if you have to detour to build the tools and expect to throw some of them out after you've finished using them.
`

export default async robot => {
    robot.respond(/unix philosophy/igs, async res => {
        res.reply(`${TheUnixPhilosophy}\n\nhttps://en.wikipedia.org/wiki/Unix_philosophy`)
    })
}