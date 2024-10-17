import test from 'node:test'
import assert from 'node:assert/strict'
class Entity {
    constructor() {
        this.id = Math.random().toString(36).substr(2, 9)
        this.components = new Map()
    }
    addComponent(component) {
        this.components.set(component.constructor.name, component)
    }
    removeComponent(component) {
        this.components.delete(component.name)
    }
    getComponet(component) {
        return this.components.get(component.name)
    }
    hasComponet(component) {
        return this.components.has(component.name)
    }
}

class Ecs {
    constructor() {
        this.entities = new Set()
        this.systems = new Set()
        this.entityComponents = new Map()
    }
    addEntity(entity) {
        this.entities.add(entity)
        entity.components.forEach((component, name) => {
            if (!this.entityComponents.has(name)) {
                this.entityComponents.set(name, new Set())
            }
            this.entityComponents.get(name).add(entity)
        })
        this.systems.forEach(system => {
            system.addEntity(entity)
        })
    }
    removeEntity(entity) {
        this.entities.delete(entity)
        entity.components.forEach((component, name) => {
            this.entityComponents.get(name).delete(entity)
        })
        this.systems.forEach(system => {
            system.removeEntity(entity)
        })
    }
    addSystem(system){
        this.systems.add(system)
        this.entities.forEach(entity => {
            system.addEntity(entity)
        })
    }
    update(deltaTime) {
        this.systems.forEach(system => {
            system.update(deltaTime)
        })
    }
    getEntitiesWithComponet(componentClass) {
        return this.entityComponents.get(componentClass.name) ?? new Set()
    }
}
class Position {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}
class Velocity {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}
class Input {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}
class System {
    constructor(ecs) {
        this.ecs = ecs
        this.entities = new Set()
    }
    addEntity(entity) {
        if (this.isEntityRelevant(entity)) {
            this.entities.add(entity)
        }
    }
    removeEntity(entity) {
        this.entities.delete(entity)
    }
    update(deltaTime) {
        throw new Error('update method must be implemented')
    }
    isEntityRelevant(entity) {
        return true
    }
}
class MovementSystem extends System  {
    constructor(ecs) {
        super(ecs)
    }
    update(deltaTime) {
        this.entities.forEach(entity => {
            const position = entity.getComponet(Position)
            const velocity = entity.getComponet(Velocity)
            position.x += velocity.x * deltaTime
            position.y += velocity.y * deltaTime
        })
    }
}
class InputSystem extends System {
    constructor(ecs) {
        super(ecs)
    }
    update(deltaTime) {
        this.entities.forEach(entity => {
            if (entity.hasComponet(Velocity)) {
                const velocity = entity.getComponet(Velocity)
                if (entity.hasComponet(Input)) {
                    const input = entity.getComponet(Input)
                    velocity.x = input.x
                    velocity.y = input.y
                }
            }
        })
    }
}
test('Ecs', async t => {
    t.test('Pressing the up key should move the entity up at a velocity of 5 units per second', async t => {
        const ecs = new Ecs()
        const entity = new Entity()
        entity.addComponent(new Position(0, 0))
        entity.addComponent(new Velocity(0, 0))
        entity.addComponent(new Input(0, 0))
        ecs.addEntity(entity)
        ecs.addSystem(new InputSystem(ecs))
        ecs.addSystem(new MovementSystem(ecs))
        ecs.update(1)
        entity.getComponet(Input).y = 5
        ecs.update(1)
        assert.equal(entity.getComponet(Position).y, 5)
    })
})