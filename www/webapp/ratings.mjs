import MakeKeyValueObservable from "./MakeKeyValueObservable.mjs"
class Controller {
    constructor(delegate, model){
        this.delegate = delegate
        this.model = model
        this.view = null
    }
    release(){
        this.model?.release()
    }
    setView(view){
        this.view = view
        if(this.didSetView){
            this.didSetView(view)
        }
    }
}

class View {
    constructor(container, controller, model){
        this.container = container
        this.model = model
        this.controller = controller
        this.views = []
    }
    release(){
        this.controller?.release()
    }
}

class RatingView extends View {
    constructor(container, controller, model){
        super(container, controller, model)
        this.items = Array.from(this.container.querySelectorAll('li'))
        this.controller?.setView(this)
        this.model.observe('value', this.update.bind(this))
    }
    reset(){
        this.items.forEach(li=>{
            li.classList.remove('selected')
        })
    }
    update(key, old, v){
        this.reset()
        for(let i = 0; i < v+1; i++){
            this.items[i].classList.add('selected')
        }
    }
}

class RatingController extends Controller {
    constructor(delegate, model){
        super(delegate, model)
    }
    handleEvent(e){
        this.view.items.forEach((li, i)=>{
            if(li == e.target){
                this.model.value = i
            }
        })
    }
    didSetView(view){
        this.view.container.addEventListener('click', this, true)
    }
}
const app = {}
    window.addEventListener('load', (e)=>{
    const rating = MakeKeyValueObservable({value: 0, max: 10})
    const views = []
    views.push(new RatingView(window.fundooRating, new RatingController(app, rating), rating))
    views.push(new RatingView(window.readonlyRating, null, rating))
    window.addEventListener('unload', e => views.forEach(v=>v.release()), true)
}, true)

export default app
