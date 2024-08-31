// Description:
// Listens to /healthz for k8s deployment.
//
// Dependencies:
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra

export default robot => {
    robot.router.get('/healthz', (req, resp) => {
        resp.writeHead(200, {'Content-Type': 'text/plain'})
        resp.end(`Hello? Is it me you're looking for?`)
    })
    robot.respond(/helo/i, async res => {
        res.reply('Hi!')
    })
}
