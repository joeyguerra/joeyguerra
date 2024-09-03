// Description:
// Kubernetes help.
//
// Dependencies:
//
// Commands:
//   hubot kubernetes|k8s help - Get help with Kubernetes. #kubernetes
//
// Configuration:
//
// Notes:
//
// Author:
//   Joey Guerra


function formatForCodeBlock(text, language = 'sh') {
    return `\`\`\`${language}\n${text}\n\`\`\``
}
export default async robot => {
    robot.respond(/(kubernetes|k8s) help/i, async res => {
        let output = []
        output.push('# Kubernetes Help')
        output.push('## Delete pods from the CLI')
        output.push(formatForCodeBlock(`k get pods -n default | grep 'ContainerStatusUnknown' | awk '{print $1}' | xargs -I {} kubectl delete pod {}`))
        await res.reply(output.join('\n'))
    })
}