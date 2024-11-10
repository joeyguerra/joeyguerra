class LinkedInCarouselBuilder {
    constructor(window, socket, user, model){
        this.window = window
        this.user = user
        this.model = model
        this.socket = socket
        this.views = []
        this.socket.on('update', this.update.bind(this))
        this.socket.on('message', this.message.bind(this))
        this.socket.on('joined', this.joined.bind(this))
    }
    message(message){
        console.log("got message from message: ", message.substr(0, 20))
        this.messages.push(message)
    }
    update(message){
        console.log("got message from update: ", message.substr(0, 20))
        if(!message) return
        if(message.length == 0) return
        if(message.indexOf("<html") == -1) return
        window.location.reload(true)
        // const parser = new DOMParser()
        // const doc = parser.parseFromString(message, "text/html")
        // this.window.document.body = doc.body
        // this.window.document.open()
        // this.window.document.write(message)
        // this.window.document.close()
    }
    joined(message){
        console.log("Someone just joined", message.member.id, this.model.self.id)

    }
    send(message){
        this.socket.emit("sending message from user", message)
    }
}

export { LinkedInCarouselBuilder }