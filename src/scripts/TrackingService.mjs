// Description:
// Ship Tracking Service.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//
// Notes:
//
// Author:
//   Joey Guerra

class Ship {
    constructor (name, location) {
        this.name = name
        this.location = location
    }
}
class KingRoy extends Ship {
    constructor (name, location) {
        super(name, location)
    }
}
class PrinceTrevor extends Ship {
    constructor (name, location) {
        super(name, location)
    }
}

class ShippingEvent {
    constructor (occurred, recorded) {
        this.occurred = occurred
        this.recorded = recorded
    }
}
class ArrivalEvent extends ShippingEvent {
    constructor (occurred, recorded, ship, port) {
        super(occurred, recorded)
        this.ship = ship
        this.port = port
    }
}
class DepartureEvent extends ShippingEvent {
    constructor (occurred, recorded, ship, port) {
        super(occurred, recorded)
        this.ship = ship
        this.port = port
    }
}
class ShipTrackingService {
    constructor() {
        this.events = []
        this.ships = []
    }
    arrive () {

    }
    depart () {

    }
}
export default async robot => {

}