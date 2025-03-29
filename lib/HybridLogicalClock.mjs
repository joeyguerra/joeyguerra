import crypto from 'node:crypto'
class HybridLogicalClock {
    constructor(nodeId) {
        this.wallClock = Date.now()
        this.logicalCounter = 0
        this.nodeId = nodeId ?? this.generateNodeId()
    }

    generateNodeId() {
        return crypto.randomBytes(4).toString('hex')
    }

    getCurrentTime() {
        return Date.now()
    }

    update(receivedTimestamp) {
        const currentTime = this.getCurrentTime()
        const receivedWallClock = receivedTimestamp.wallClock
        const receivedLogicalCounter = receivedTimestamp.logicalCounter

        this.wallClock = Math.max(this.wallClock, receivedWallClock, currentTime)

        if (this.wallClock === receivedWallClock) {
            this.logicalCounter = Math.max(this.logicalCounter, receivedLogicalCounter) + 1
        } else {
            this.logicalCounter = 0
        }
    }

    generateTimestamp() {
        this.wallClock = this.getCurrentTime()
        this.logicalCounter += 1
        return {
            wallClock: this.wallClock,
            logicalCounter: this.logicalCounter,
            nodeId: this.nodeId
        };
    }

    serialize() {
        return JSON.stringify({
            wallClock: this.wallClock,
            logicalCounter: this.logicalCounter,
            nodeId: this.nodeId
        })
    }

    static deserialize(serializedData) {
        const data = JSON.parse(serializedData)
        const clock = new HybridLogicalClock()
        clock.wallClock = data.wallClock
        clock.logicalCounter = data.logicalCounter
        clock.nodeId = data.nodeId
        return clock
    }

    static compare(clock1, clock2) {
        if (clock1.wallClock < clock2.wallClock || 
            (clock1.wallClock === clock2.wallClock && clock1.logicalCounter < clock2.logicalCounter)) {
            return -1 // clock1 is before clock2
        } else if (clock1.wallClock > clock2.wallClock || 
                   (clock1.wallClock === clock2.wallClock && clock1.logicalCounter > clock2.logicalCounter)) {
            return 1 // clock1 is after clock2
        } else {
            return 0 // clock1 is equal to clock2
        }
    }
}

export {
    HybridLogicalClock
}
