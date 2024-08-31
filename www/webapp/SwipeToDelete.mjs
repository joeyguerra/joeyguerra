class SwipeToDelete {
    #active = false
    constructor(container, model, options = { threshold: 0.5 }, delegate) {
        this.container = container
        this.model = model
        this.options = Object.assign({ threshold: 0.5 }, options)
        this.delegate = delegate
        this.startX = 0
        this.startY = 0
        this.currentX = 0
        this.currentY = 0
        this.attachListeners()
    }
    attachListeners() {
        this.container.addEventListener('touchstart', this.startSwipe.bind(this))
        this.container.addEventListener('touchmove', this.swipeMove.bind(this))
        this.container.addEventListener('touchend', this.endSwipe.bind(this))
        this.container.addEventListener('mousedown', this.startSwipe.bind(this))
        this.container.addEventListener('mousemove', this.swipeMove.bind(this))
        this.container.addEventListener('mouseup', this.endSwipe.bind(this))
        this.container.addEventListener('mouseleave', this.cancelSwipe.bind(this))
    }
    calculateSwipeDeleteThreshold() {
        const parentWidth = this.container.parentElement.offsetWidth
        const thresholdPercentage = this.options.threshold
        return parentWidth * thresholdPercentage
    }
    startSwipe(e) {
        this.#active = true
        this.startX = e.touches ? e.touches[0].pageX : e.pageX
        this.startY = e.touches ? e.touches[0].pageY : e.pageY
        this.container.style.transition = 'none'
    }
    swipeMove(e) {
        if (!this.#active) return
        let x = this.currentX
        let y = this.currentY
        this.currentX = e.touches ? e.touches[0].pageX - this.startX : e.pageX - this.startX
        this.currentY = e.touches ? e.touches[0].pageY - this.startY : e.pageY - this
        if (Math.abs(this.currentY) >= 10) {
            this.cancelSwipe(e)
            return
        }
        
        e.preventDefault()
        if (this.currentX < 0) {
            this.container.style.transform = `translateX(${this.currentX}px)`
        }
    }
    cancelSwipe(e) {
        this.container.style.transition = 'transform 0.3s ease'
        this.container.style.transform = 'translateX(0)'
        this.#active = false
    }
    endSwipe(e) {
        this.container.style.transition = 'transform 0.3s ease'
        const parentWidth = this.container.parentElement.offsetWidth
        if (Math.abs(this.currentX) > this.calculateSwipeDeleteThreshold() && this.currentX < 0) {
            this.container.style.transform = 'translateX(-100%)'
            setTimeout(() => this.delegate.shouldRemove(this.container, e), 60)
        } else {
            this.container.style.transform = 'translateX(0)'
        }
        this.#active = false
    }
}

export { 
    SwipeToDelete
}