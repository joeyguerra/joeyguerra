
export default (elements = []) => {
    elements.forEach(el => {
        let cursorPosition = 0
        el.addEventListener('keyup', e => {
            if (e.key === 'Backspace') {
                if (cursorPosition > 0) {
                    const newValue = el.value.slice(0, cursorPosition - 1) + el.value.slice(cursorPosition)
                    e.target.value = newValue
                    cursorPosition--
                }
            } else if (e.key === 'ArrowLeft') {
                if (cursorPosition > 0) {
                    cursorPosition--
                }
            } else if (e.key === 'ArrowRight') {
                if (cursorPosition < el.value.length) {
                    cursorPosition++
                }
            } else {
                const newValue = el.value.slice(0, cursorPosition) + e.key + el.value.slice(cursorPosition)
                e.target.value = newValue
                cursorPosition++
            }
        })
    })
}