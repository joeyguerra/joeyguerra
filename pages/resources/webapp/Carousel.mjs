class SlideModel {
    constructor() {
        this.slides = []
    }

    addSlide(content = '') {
        this.slides.push(content)
    }

    getSlides() {
        return this.slides
    }
}

class SlideView {
    constructor() {
        this.slidesContainer = document.querySelector('.slides')
        this.addSlideButton = document.getElementById('add-slide')
    }

    renderSlides(slides) {
        this.slidesContainer.innerHTML = slides.map((slide, index) => `
            <div class="slide" data-index="${index}">
                <div contenteditable="true">${slide}</div>
            </div>
        `).join('')
    }

    bindAddSlide(handler) {
        this.addSlideButton.addEventListener('click', handler)
    }
}

class SlideController {
    constructor() {
        this.model = new SlideModel()
        this.view = new SlideView()

        this.view.bindAddSlide(this.handleAddSlide.bind(this))
        this.updateView()
    }

    handleAddSlide() {
        this.model.addSlide('New Slide')
        this.updateView()
    }

    updateView() {
        this.view.renderSlides(this.model.getSlides())
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlideController()
})