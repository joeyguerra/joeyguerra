// Event Bus for component communication
export const EventBus = {
    events: {},
    subscribe(event, callback) {
        if (!this.events[event]) this.events[event] = []
        this.events[event].push(callback)
    },
    publish(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data))
        }
    }
}

// State Aggregator for centralized state management
export const StateAggregator = {
    components: [],
    register(component) {
        this.components.push(component)
    },
    getState() {
        return this.components.reduce((state, component) => {
            state[component.name] = component.getState()
            return state
        }, {})
    },
    setState(state) {
        this.components.forEach(component => {
            if (state[component.name]) {
                component.setState(state[component.name])
            }
        })
    }
}

// Shared AppState object
export const AppState = {
    groups: [],
    selectedList: null,
    selectedItem: null,
    selectedGroup: null
}

// Sidebar Component with DOM element tracking
export const SidebarComponent = {
    name: 'sidebar',
    state: AppState,
    // Store DOM references
    elements: {
        container: null,
        groups: [], // Array of group element references
        lists: {}   // Object mapping group_index:list_index to list element references
    },
    isDraggingGroup: false,
    init() {
        StateAggregator.register(this)
        this.elements.container = document.getElementById('groupContainer')

        EventBus.subscribe('groupAdded', this.addGroup.bind(this))
        EventBus.subscribe('groupDeleted', this.deleteGroup.bind(this))
        EventBus.subscribe('listAdded', this.addList.bind(this))
        EventBus.subscribe('listDeleted', this.deleteList.bind(this))
        EventBus.subscribe('listSelected', this.selectList.bind(this))
        EventBus.subscribe('listRenamed', this.renameList.bind(this))
        EventBus.subscribe('groupReordered', this.reorderGroups.bind(this))
        EventBus.subscribe('listReordered', this.reorderLists.bind(this))
        
        // Initial render to set up the DOM structure
        this.initialRender()
    },
    addGroup(group) {
        const groupIndex = this.state.groups.length
        this.state.groups.push(group)
        
        // Create and add the group element
        const groupEl = this.createGroupElement(group, groupIndex)
        this.elements.container.appendChild(groupEl)
        this.elements.groups.push(groupEl)
        
        EventBus.publish('stateSaved')
    },
    deleteGroup(groupIndex) {
        // Remove the group element from DOM
        const groupEl = this.elements.groups[groupIndex]
        groupEl.remove()
        
        // Clean up references for this group's lists
        const listsToRemove = Object.keys(this.elements.lists)
            .filter(key => key.startsWith(`${groupIndex}:`))
        
        listsToRemove.forEach(key => {
            const groupIndex = key.split(':')[0]
            const listIndex = key.split(':')[1]
            EventBus.publish('listDeleted', { groupIndex , listIndex })
        })
        
        // Update the state
        this.state.groups.splice(groupIndex, 1)
        this.elements.groups.splice(groupIndex, 1)
        
        // Update data-index attributes for remaining groups
        this.elements.groups.forEach((groupEl, idx) => {
            groupEl.dataset.index = idx
            
            // Update group input event handler
            const addListInput = groupEl.querySelector('input')
            this.updateAddListInputHandler(addListInput, idx)
            
            // Update list item event handlers
            const listItems = groupEl.querySelectorAll('li')
            listItems.forEach((li, listIdx) => {
                this.updateListHandlers(li, idx, listIdx)
            })
        })
        this.selectedList = null
        this.selectedGroup = null
        EventBus.publish('stateSaved')
    },
    addList({ groupIndex, list }) {
        this.state.groups[groupIndex].lists.push(list)
        
        // Get the group element and its list container
        const groupEl = this.elements.groups[groupIndex]
        const listContainer = groupEl.querySelector('ul')
        
        // Create and add the list element
        const listIndex = this.state.groups[groupIndex].lists.length - 1
        const listEl = this.createListElement(list, groupIndex, listIndex)
        listContainer.appendChild(listEl)
        
        // Store reference to the list element
        this.elements.lists[`${groupIndex}:${listIndex}`] = listEl
        
        EventBus.publish('stateSaved')
        EventBus.publish('listSelected', list)
    },
    deleteList({ groupIndex, listIndex }) {
        // Remove the list element from DOM
        const listEl = this.elements.lists[`${groupIndex}:${listIndex}`]
        listEl.remove()
        
        // Update the state
        this.state.groups[groupIndex].lists.splice(listIndex, 1)
        
        // Clean up the reference
        delete this.elements.lists[`${groupIndex}:${listIndex}`]
        
        // Update keys and indexes for remaining lists in this group
        for (let i = listIndex + 1; i < this.state.groups[groupIndex].lists.length + 1; i++) {
            const oldKey = `${groupIndex}:${i}`
            const newKey = `${groupIndex}:${i-1}`
            
            if (this.elements.lists[oldKey]) {
                this.elements.lists[newKey] = this.elements.lists[oldKey]
                delete this.elements.lists[oldKey]
                
                // Update data attributes and event handlers
                const li = this.elements.lists[newKey]
                this.updateListHandlers(li, groupIndex, i-1)
            }
        }
        
        EventBus.publish('stateSaved')
    },
    selectList(list) {
        this.state.selectedList = list
        
        // Update selected state visually
        Object.values(this.elements.lists).forEach(listEl => {
            listEl.classList.remove('selected', 'active')
        })
        
        // Find and highlight the selected list
        for (let groupIndex = 0; groupIndex < this.state.groups.length; groupIndex++) {
            const group = this.state.groups[groupIndex]
            const listIndex = group.lists.findIndex(l => l === list)
            
            if (listIndex !== -1) {
                const listEl = this.elements.lists[`${groupIndex}:${listIndex}`]
                listEl.classList.add('selected', 'active')
                break
            }
        }
    },
    renameList({ list, newTitle }) {
        list.title = newTitle
        
        // Find and update the list element
        for (let groupIndex = 0; groupIndex < this.state.groups.length; groupIndex++) {
            const group = this.state.groups[groupIndex]
            const listIndex = group.lists.findIndex(l => l === list)
            
            if (listIndex !== -1) {
                const listEl = this.elements.lists[`${groupIndex}:${listIndex}`]
                const textSpan = listEl.querySelector('span')
                textSpan.textContent = newTitle
                break
            }
        }
        
        // Update the main title if this is the selected list
        if (this.state.selectedList === list) {
            EventBus.publish('updateMainTitle', newTitle)
        }
        
        EventBus.publish('stateSaved')
    },
    reorderGroups({ fromIndex, toIndex }) {
        // Update the state
        const movedGroup = this.state.groups.splice(fromIndex, 1)[0]
        this.state.groups.splice(toIndex, 0, movedGroup)
        
        // Update the DOM - move the element
        const movedEl = this.elements.groups.splice(fromIndex, 1)[0]
        
        if (toIndex >= this.elements.groups.length) {
            this.elements.container.appendChild(movedEl)
            this.elements.groups.push(movedEl)
        } else {
            this.elements.container.insertBefore(movedEl, this.elements.groups[toIndex])
            this.elements.groups.splice(toIndex, 0, movedEl)
        }
        
        // Update data-index attributes for all groups
        this.elements.groups.forEach((groupEl, idx) => {
            groupEl.dataset.index = idx
            
            // Update group input event handler
            const addListInput = groupEl.querySelector('input')
            this.updateAddListInputHandler(addListInput, idx)
            
            // Update list item event handlers
            const listItems = groupEl.querySelectorAll('li')
            listItems.forEach((li, listIdx) => {
                this.updateListHandlers(li, idx, listIdx)
            })
        })
        
        // Update the lists references object
        this.updateListReferences()
        
        EventBus.publish('stateSaved')
    },
    reorderLists({ groupIndex, fromIndex, toIndex }) {
        // Update the state
        const group = this.state.groups[groupIndex]
        const movedList = group.lists.splice(fromIndex, 1)[0]
        group.lists.splice(toIndex, 0, movedList)
        
        // Get the list container and list elements
        const groupEl = this.elements.groups[groupIndex]
        const listContainer = groupEl.querySelector('ul')
        const movedEl = this.elements.lists[`${groupIndex}:${fromIndex}`]
        
        // Remove movedEl reference from elements.lists
        delete this.elements.lists[`${groupIndex}:${fromIndex}`]
        
        // Update DOM - remove and insert the element
        if (toIndex >= group.lists.length - 1) {
            listContainer.appendChild(movedEl)
        } else {
            const targetEl = this.elements.lists[`${groupIndex}:${toIndex}`] || 
                            listContainer.querySelector(`li[data-list-index="${toIndex}"]`)
            if (targetEl) {
                listContainer.insertBefore(movedEl, targetEl)
            }
        }
        
        // Update data attributes and references for all lists in this group
        const listItems = listContainer.querySelectorAll('li')
        listItems.forEach((li, idx) => {
            li.dataset.listIndex = idx
            this.elements.lists[`${groupIndex}:${idx}`] = li
            
            // Update event handlers
            this.updateListHandlers(li, groupIndex, idx)
        })
        
        EventBus.publish('stateSaved')
    },
    updateListReferences() {
        // Clear existing references
        this.elements.lists = {}
        
        // Rebuild references
        this.elements.groups.forEach((groupEl, groupIndex) => {
            const listItems = groupEl.querySelectorAll('li')
            listItems.forEach((li, listIndex) => {
                this.elements.lists[`${groupIndex}:${listIndex}`] = li
            })
        })
    },
    createGroupElement(group, groupIndex) {
        const groupEl = document.createElement('div')
        groupEl.className = 'group'
        groupEl.dataset.index = groupIndex
        groupEl.draggable = true
        // Group name display
        const header = document.createElement('strong')
        header.textContent = group.name
        // Double click to edit group name
        header.addEventListener('dblclick', e => {
            e.stopPropagation()
            // Replace header text with input
            const input = document.createElement('input')
            input.type = 'text'
            input.value = group.name
            input.className = 'input-inline'
            header.replaceWith(input)
            input.focus()
            input.select()
            // Save on blur or Enter
            function finishEdit() {
                const newName = input.value.trim()
                if (newName && newName !== group.name) {
                    group.name = newName
                    // Optionally trigger a re-render or event if needed
                }
                input.replaceWith(header)
                header.textContent = group.name
            }
            function keyHandler(e) {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    input.blur()
                }
            }
            input.addEventListener('blur', finishEdit)
            input.addEventListener('keydown', keyHandler)
        })

        groupEl.setAttribute('draggable', true)
        groupEl.addEventListener('dragstart', e => {
            this.state.selectedGroup = e.target
            this.isDraggingGroup = true
        })
        
        groupEl.addEventListener('dragend', e => {
            this.state.selectedGroup.classList.remove('dropped')
            this.state.selectedGroup = null
            this.isDraggingGroup = false
        })

        groupEl.addEventListener('dragenter', e => {
            if (!this.isDraggingGroup) return
            if (this.state.selectedGroup === e.target || this.state.selectedGroup.contains(e.target)) {
                return
            }
            let groupContainer = e.target
            while (groupContainer && !groupContainer.classList.contains('group')) {
                if (groupContainer === document.body) break
                groupContainer = groupContainer.parentElement
            }
            if (groupContainer === document.body) return
            this.state.selectedGroup.classList.add('dropped')
            if (groupContainer === groupEl.parentNode.lastElementChild) {
                groupEl.insertAdjacentElement('afterend', this.state.selectedGroup)
            } else {
                groupEl.parentNode.insertBefore(this.state.selectedGroup, groupEl)
            }
        })
        
        groupEl.addEventListener('dragover', e => {
            e.preventDefault()
            if(!this.isDraggingGroup) return
            if (this.state.selectedGroup === e.target || this.state.selectedGroup.contains(e.target)) {
                return
            }
            e.dataTransfer.dropEffect = 'move'
        })
        
        groupEl.addEventListener('dragleave', e => {
        })
                
        // Delete button for the group
        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = '🗑'
        deleteBtn.classList.add('trash')
        deleteBtn.addEventListener('click', e => {
            EventBus.publish('groupDeleted', groupEl.dataset.index)
        })
        
        header.appendChild(deleteBtn)
        groupEl.appendChild(header)
        
        // Create the list container
        const listContainer = document.createElement('ul')
        
        // Create list elements
        group.lists.forEach((list, listIndex) => {
            const listEl = this.createListElement(list, groupIndex, listIndex)
            if (list.title === this.state.selectedList?.title) {
                listEl.classList.add('selected', 'active')
            }
            listContainer.appendChild(listEl)
            this.elements.lists[`${groupIndex}:${listIndex}`] = listEl
        })
        
        groupEl.appendChild(listContainer)
        
        // Add input for new lists
        const addListInput = document.createElement('input')
        addListInput.placeholder = 'New list name'
        this.updateAddListInputHandler(addListInput, groupIndex)
        
        groupEl.appendChild(addListInput)
        
        return groupEl
    },
    createListElement(list, groupIndex, listIndex) {
        const listEl = document.createElement('li')
        listEl.setAttribute('draggable', true)
        listEl.setAttribute('droppable', true)

        // Add drag and drop event listeners
        listEl.addEventListener('dragstart', (e) => {
            e.stopPropagation()
            this.state.selectedItem = e.target
            this.state.selectedItem.classList.add('dragging')
        })

        listEl.addEventListener('dragend', e => {
            e.stopPropagation()
            this.state.selectedItem.classList.remove('dragging')
            EventBus.publish('listSelected', list)
        })

        listEl.addEventListener('dragenter', (e) => {
            if(this.isDraggingGroup) return
            if (this.state.selectedItem === e.target || this.state.selectedItem.contains(e.target)) {
                return
            }
            if (e.target === listEl.parentNode.lastElementChild) {
                listEl.insertAdjacentElement('afterend', this.state.selectedItem)
            } else {
                listEl.parentNode.insertBefore(this.state.selectedItem, listEl)
            }
        })
        
        listEl.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (this.state.selectedItem === e.target) {
                return
            }
            e.dataTransfer.dropEffect = 'move'
        })
        
        listEl.addEventListener('dragleave', (e) => {
            listEl.classList.remove('drag-over')
        })

        listEl.addEventListener('drop', (e) => {
            e.stopPropagation()
        })

        // Create span for the text content
        const textSpan = document.createElement('span')
        textSpan.textContent = list.title
        textSpan.style.flex = '1'
        
        // Set up event handlers
        this.updateListHandlers(listEl, groupIndex, listIndex, list, textSpan)
        
        // Add delete button
        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = '🗑'
        deleteBtn.classList.add('trash')
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            EventBus.publish('listDeleted', { groupIndex, listIndex })
        })
        
        listEl.appendChild(textSpan)
        listEl.appendChild(deleteBtn)
        
        return listEl
    },
    updateAddListInputHandler(input, groupIndex) {
        // Instead of cloning, let's directly set up the keypress handler
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const title = input.value.trim()
                if (title) {
                    EventBus.publish('listAdded', {
                        groupIndex,
                        list: { title, sections: [] }
                    })
                    input.value = ''
                }
            }
        })
        
        return input
    },
    updateListHandlers(listEl, groupIndex, listIndex, list, textSpan) {
        if (!list) {
            list = this.state.groups[groupIndex].lists[listIndex]
        }
        
        if (!textSpan) {
            textSpan = listEl.querySelector('span')
        }
        
        // Direct approach without replaceChild
        
        // Remove existing click listeners by overwriting onclick
        listEl.onclick = null
        
        // Add fresh click event listener
        listEl.addEventListener('click', (e) => {
            if (e.target.isContentEditable) return
            
            // Remove active and selected classes from all list items
            Object.values(this.elements.lists).forEach(el => {
                el.classList.remove('selected', 'active')
            })
            
            // Add selected and active classes to this list item
            listEl.classList.add('selected', 'active')
            
            // Update state and publish event
            this.state.selectedList = list
            EventBus.publish('listSelected', list)
        })
        
        // Set up double-click editing on the span
        textSpan.ondblclick = null  // Clear any existing handler
        textSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation()
            textSpan.contentEditable = 'true'
            textSpan.focus()
            
            // Select all text
            const range = document.createRange()
            range.selectNodeContents(textSpan)
            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
            
            const blurHandler = () => {
                textSpan.contentEditable = 'false'
                const newTitle = textSpan.textContent.trim()
                
                if (newTitle && newTitle !== list.title) {
                    EventBus.publish('listRenamed', { list, newTitle })
                } else {
                    textSpan.textContent = list.title
                }
                
                textSpan.removeEventListener('blur', blurHandler)
            }
            
            textSpan.addEventListener('blur', blurHandler)
            
            textSpan.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    textSpan.blur()
                }
            })
        })
        
        return listEl
    },
    initialRender() {
        this.elements.container.innerHTML = ''
        this.elements.groups = []
        this.elements.lists = {}
        
        // Create and add all group elements
        this.state.groups.forEach((group, groupIndex) => {
            const groupEl = this.createGroupElement(group, groupIndex)
            this.elements.container.appendChild(groupEl)
            this.elements.groups.push(groupEl)
        })
    },
    getState() {
        return this.state
    },
    setState(state) {
        this.state = state
        this.initialRender()
    }
}

// Main Component with DOM element tracking
export const MainComponent = {
    name: 'main',
    state: AppState,
    // Store DOM references
    elements: {
        container: null,
        title: null,
        addSectionInput: null,
        sections: {}, // Map of sectionIndex to section element references
        reminders: {} // Map of sectionIndex:reminderIndex to reminder element references
    },
    init() {
        StateAggregator.register(this)
        this.elements.container = document.getElementById('mainContent')

        EventBus.subscribe('listSelected', this.selectList.bind(this))
        EventBus.subscribe('listDeleted', this.deleteList.bind(this))
        EventBus.subscribe('sectionAdded', this.addSection.bind(this))
        EventBus.subscribe('sectionRenamed', this.renameSection.bind(this))
        EventBus.subscribe('reminderAdded', this.addReminder.bind(this))
        EventBus.subscribe('reminderToggled', this.toggleReminder.bind(this))
        EventBus.subscribe('updateMainTitle', this.updateTitle.bind(this))
        EventBus.subscribe('reminderStatusChanged', this.changeReminderStatus.bind(this))
        
        // Initial render
        this.initialRender()
    },
    deleteList({ groupIndex , listIndex }) {
        // Clear the main content
        this.elements.container.innerHTML = ''
        this.elements.sections = {}
        this.elements.reminders = {}
        
        // Clear the selected list in the state
        this.state.selectedList = null
    },
    renderCalendar() {
        const calendar = document.getElementById('calendarYearView')
        if (calendar) {
            renderYearCalendar(calendar, this.state.selectedList)
        }        
    },
    selectList(list) {
        this.state.selectedList = list
        this.initialRender()
        EventBus.publish('stateSaved')
        this.renderCalendar()
    },
    updateTitle(newTitle) {
        if (this.elements.title) {
            this.elements.title.textContent = newTitle
        }
    },
    addSection(section) {
        if (!this.state.selectedList) return
        
        const sectionIndex = this.state.selectedList.sections.length
        this.state.selectedList.sections.push(section)
        
        // Create and add the section element
        const sectionEl = this.createSectionElement(section, sectionIndex)
        this.elements.container.appendChild(sectionEl)
        this.elements.sections[sectionIndex] = sectionEl
        
        EventBus.publish('stateSaved')
    },
    renameSection({ sectionIndex, name }) {
        if (!this.state.selectedList) return
        
        // Update the state
        this.state.selectedList.sections[sectionIndex].name = name
        
        // Update the section name input
        const sectionEl = this.elements.sections[sectionIndex]
        if (sectionEl) {
            const nameInput = sectionEl.querySelector('input')
            if (nameInput) nameInput.value = name
        }
        
        EventBus.publish('stateSaved')
    },
    addReminder({ sectionIndex, reminder }) {
        if (!this.state.selectedList) return
        
        // Ensure new reminders have status and history
        const now = Date.now()
        const newReminder = {
            text: reminder.text,
            status: 'pending',
            history: [{ status: 'pending', timestamp: now }]
        }
        const section = this.state.selectedList.sections[sectionIndex]
        const reminderIndex = section.reminders.length
        section.reminders.push(newReminder)
        
        // Add the reminder element to the DOM
        const sectionEl = this.elements.sections[sectionIndex]
        if (sectionEl) {
            const ul = sectionEl.querySelector('ul')
            if (ul) {
                const reminderEl = this.createReminderElement(newReminder, sectionIndex, reminderIndex)
                ul.appendChild(reminderEl)
                this.elements.reminders[`${sectionIndex}:${reminderIndex}`] = reminderEl
            }
        }
        EventBus.publish('stateSaved')
        this.renderCalendar()
    },
    changeReminderStatus({ sectionIndex, reminderIndex, status }) {
        if (!this.state.selectedList) return
        const reminder = this.state.selectedList.sections[sectionIndex].reminders[reminderIndex]
        if (!reminder) return
        reminder.status = status
        if (!reminder.history) reminder.history = []
        reminder.history.push({ status, timestamp: Date.now() })

        // Update the UI
        const reminderEl = this.elements.reminders[`${sectionIndex}:${reminderIndex}`]
        if (reminderEl) {
            const statusBtn = reminderEl.querySelector('button')
            const checkbox = reminderEl.querySelector('input[type="checkbox"]')
            const span = reminderEl.querySelector('span')
            if (statusBtn && checkbox && span) {
                if (status === 'completed') {
                    statusBtn.disabled = true
                    statusBtn.textContent = 'Start'
                    checkbox.checked = true
                } else if (status === 'in_progress') {
                    statusBtn.disabled = false
                    statusBtn.textContent = 'Stop'
                    checkbox.checked = false
                } else {
                    statusBtn.disabled = false
                    statusBtn.textContent = 'Start'
                    checkbox.checked = false
                }
                span.classList.remove('completed', 'in-progress', 'pending')
                if (status === 'completed') span.classList.add('completed')
                if (status === 'in_progress') span.classList.add('in-progress')
                if (status === 'pending') span.classList.add('pending')
            }
            // Update the history view
            let hist = reminderEl.querySelector('.reminder-history')
            hist.innerHTML = ''
            reminder.history.forEach(h => {
                const span = document.createElement('span')
                span.textContent = `${new Date(h.timestamp).toLocaleString()} - ${h.status}`
                hist.appendChild(span)
           })
        }        
        EventBus.publish('stateSaved')
        this.renderCalendar()
    },
    toggleReminder({ sectionIndex, reminderIndex }) {
        if (!this.state.selectedList) return
        
        // Update the state
        const reminder = this.state.selectedList.sections[sectionIndex].reminders[reminderIndex]
        reminder.completed = !reminder.completed
        
        // Update the UI
        const reminderEl = this.elements.reminders[`${sectionIndex}:${reminderIndex}`]
        if (reminderEl) {
            const checkbox = reminderEl.querySelector('input[type="checkbox"]')
            const span = reminderEl.querySelector('span')
            
            if (checkbox) checkbox.checked = reminder.completed
            if (span) {
                if (reminder.completed) {
                    span.classList.add('completed')
                } else {
                    span.classList.remove('completed')
                }
            }
        }
        
        EventBus.publish('stateSaved')
        this.renderCalendar()
    },
    createSectionElement(section, sectionIndex) {
        const details = document.createElement('details')
        details.className = 'section'
        details.dataset.sectionIndex = sectionIndex
        // Open by default
        details.open = true
        // Section summary (title input)
        const summary = document.createElement('summary')
        const nameInput = document.createElement('input')
        nameInput.value = section.name
        nameInput.className = 'input-inline'
        nameInput.addEventListener('change', () => {
            EventBus.publish('sectionRenamed', {
                sectionIndex,
                name: nameInput.value
            })
        })
        summary.appendChild(nameInput)
        details.appendChild(summary)
        // Reminders list
        const ul = document.createElement('ul')
        section.reminders.forEach((reminder, reminderIndex) => {
            const reminderEl = this.createReminderElement(reminder, sectionIndex, reminderIndex)
            ul.appendChild(reminderEl)
            this.elements.reminders[`${sectionIndex}:${reminderIndex}`] = reminderEl
        })
        details.appendChild(ul)
        // New reminder input (at bottom)
        const reminderInput = document.createElement('input')
        reminderInput.placeholder = 'New reminder'
        reminderInput.className = 'input-inline'
        reminderInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                const text = reminderInput.value.trim()
                if (text) {
                    EventBus.publish('reminderAdded', {
                        sectionIndex,
                        reminder: {
                            text,
                            completed: false
                        }
                    })
                    reminderInput.value = ''
                }
            }
        })
        details.appendChild(reminderInput)
        return details
    },
    createReminderElement(reminder, sectionIndex, reminderIndex) {
        const li = document.createElement('li')
        li.className = 'reminder'
        li.dataset.sectionIndex = sectionIndex
        li.dataset.reminderIndex = reminderIndex

        // Use a container div instead of label to avoid label/checkbox click propagation
        const container = document.createElement('div')

        // Start/Stop button
        const statusBtn = document.createElement('button')
        statusBtn.type = 'button'

        // Checkbox for completed
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = reminder.status === 'completed'

        // Set initial button text and state
        function updateBtnAndCheckbox() {
            statusBtn.className = null
            if (reminder.status === 'completed') {
                statusBtn.disabled = true
                statusBtn.textContent = 'Start'
                checkbox.checked = true
            } else if (reminder.status === 'in_progress') {
                statusBtn.disabled = false
                statusBtn.textContent = 'Stop'
                statusBtn.className = 'in-progress'
                checkbox.checked = false
            } else {
                statusBtn.disabled = false
                statusBtn.textContent = 'Start'
                checkbox.checked = false
            }
        }
        updateBtnAndCheckbox()

        statusBtn.addEventListener('click', e => {
            e.target.className = null
            if (reminder.status === 'pending') {
                e.target.className = 'in-progress'
                EventBus.publish('reminderStatusChanged', {
                    sectionIndex,
                    reminderIndex,
                    status: 'in_progress'
                })
            } else if (reminder.status === 'in_progress') {
                EventBus.publish('reminderStatusChanged', {
                    sectionIndex,
                    reminderIndex,
                    status: 'pending'
                })
            }
        })

        checkbox.addEventListener('change', e => {
            if (e.target.checked) {
                statusBtn.className =  null
            }
            EventBus.publish('reminderStatusChanged', {
                sectionIndex,
                reminderIndex,
                status: e.target.checked ? 'completed' : 'pending'
            })
        })

        // Reminder text
        const span = document.createElement('span')
        span.textContent = reminder.text
        span.classList.remove('completed', 'in-progress', 'pending')
        if (reminder.status === 'completed') span.classList.add('completed')
        if (reminder.status === 'in_progress') span.classList.add('in-progress')
        if (!reminder.status || reminder.status === 'pending') span.classList.add('pending')

        // Prevent click on span from propagating to parent
        span.addEventListener('click', e => {
            e.stopPropagation()
        })

        // Double click to edit
        span.addEventListener('dblclick', e => {
            e.stopPropagation()
            span.contentEditable = 'true'
            span.focus()

            // Select all text
            const range = document.createRange()
            range.selectNodeContents(span)
            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)

            // Save on blur or Enter
            function finishEdit() {
                span.contentEditable = 'false'
                const newText = span.textContent.trim()
                if (newText && newText !== reminder.text) {
                    reminder.text = newText
                    EventBus.publish('stateSaved')
                } else {
                    span.textContent = reminder.text
                }
                span.removeEventListener('blur', finishEdit)
                span.removeEventListener('keydown', keyHandler)
            }

            function keyHandler(e) {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    span.blur()
                }
            }

            span.addEventListener('blur', finishEdit)
            span.addEventListener('keydown', keyHandler)
        })

        container.appendChild(statusBtn)
        container.appendChild(checkbox)
        container.appendChild(span)
        li.appendChild(container)

        const hist = document.createElement('div')
        hist.className = 'reminder-history'
        reminder.history.forEach(h => {
            const span = document.createElement('span')
            span.textContent = `${new Date(h.timestamp).toLocaleString()} - ${h.status}`
            hist.appendChild(span)
        })
        li.appendChild(hist)
        this.renderCalendar()
        return li
    },
    initialRender() {
        // Clear existing elements and references
        this.elements.container.innerHTML = ''
        this.elements.sections = {}
        this.elements.reminders = {}
        
        if (!this.state.selectedList) {
            const placeholder = document.createElement('p')
            placeholder.textContent = 'No list selected'
            this.elements.container.appendChild(placeholder)
            return
        }
        
        // Create title
        this.elements.title = document.createElement('h2')
        this.elements.title.textContent = this.state.selectedList.title
        this.elements.container.appendChild(this.elements.title)
        
        // Create add section input
        this.elements.addSectionInput = document.createElement('input')
        this.elements.addSectionInput.placeholder = 'New section title'
        this.elements.addSectionInput.className = 'input-inline'
        this.elements.addSectionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const name = this.elements.addSectionInput.value.trim()
                if (name) {
                    EventBus.publish('sectionAdded', {
                        name,
                        reminders: []
                    })
                    this.elements.addSectionInput.value = ''
                }
            }
        })
        this.elements.container.appendChild(this.elements.addSectionInput)
        
        // Create sections
        this.state.selectedList.sections.forEach((section, sectionIndex) => {
            const sectionEl = this.createSectionElement(section, sectionIndex)
            this.elements.container.appendChild(sectionEl)
            this.elements.sections[sectionIndex] = sectionEl
        })
    },
    getState() {
        return this.state
    },
    setState(state) {
        this.state = state
        this.initialRender() 
    }
}

// Application Initialization
function saveToLocalStorage() {
    const state = StateAggregator.getState()
    localStorage.setItem('appState', JSON.stringify(state))
}

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('appState')
    if (savedState) {
        const parsedState = JSON.parse(savedState)
        Object.assign(AppState, parsedState.sidebar || {})
        if (parsedState.main && parsedState.main.selectedList) {
            AppState.selectedList = parsedState.main.selectedList
        }
    }
}

function renderYearCalendar(container, selectedList) {
    if (!container) return
    const now = new Date()
    const year = now.getFullYear()
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const daysInMonth = month =>
        new Date(year, month + 1, 0).getDate()
    const maxDays = Math.max(...months.map((_, i) => daysInMonth(i)))
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    // Build a map: { 'YYYY-MM-DD': {pending: n, in_progress: n, completed: n} }
    let reminderMap = {}
    if (selectedList && Array.isArray(selectedList.sections)) {
        for (const section of selectedList.sections) {
            for (const reminder of section.reminders || []) {
                // Find the date for each state
                let pendingDate = null
                let inProgressDate = null
                let completedDate = null
                if (reminder.history && reminder.history.length > 0) {
                    for (const h of reminder.history) {
                        if (h.status === 'pending' && !pendingDate) {
                            pendingDate = h.timestamp
                        }
                        if (h.status === 'in_progress') {
                            inProgressDate = h.timestamp
                        }
                        if (h.status === 'completed') {
                            completedDate = h.timestamp
                        }
                    }
                }
                // Pending: use first created date
                if (reminder.status === 'pending' && pendingDate) {
                    let d = new Date(pendingDate)
                    if (!isNaN(d)) {
                        let key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
                        if (!reminderMap[key]) reminderMap[key] = { pending: 0, in_progress: 0, completed: 0 }
                        reminderMap[key].pending++
                    }
                }
                // In progress: use most recent in_progress date
                if (reminder.status === 'in_progress' && inProgressDate) {
                    let d = new Date(inProgressDate)
                    if (!isNaN(d)) {
                        let key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
                        if (!reminderMap[key]) reminderMap[key] = { pending: 0, in_progress: 0, completed: 0 }
                        reminderMap[key].in_progress++
                    }
                }
                // Completed: use most recent completed date
                if (reminder.status === 'completed' && completedDate) {
                    let d = new Date(completedDate)
                    if (!isNaN(d)) {
                        let key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
                        if (!reminderMap[key]) reminderMap[key] = { pending: 0, in_progress: 0, completed: 0 }
                        reminderMap[key].completed++
                    }
                }
            }
        }
    }
    let html = '<table class="calendar-table"><tbody>'
    for (let m = 0; m < 12; m++) {
        html += '<tr>'
        html += `<td class='month-name'>${months[m]}</td>`
        const days = daysInMonth(m)
        for (let d = 1; d <= maxDays; d++) {
            if (d <= days) {
                const date = new Date(year, m, d)
                const dayName = dayNames[date.getDay()]
                const key = year + '-' + String(m+1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
                const counts = reminderMap[key] || { pending: 0, in_progress: 0, completed: 0 }
                let circles = ''
                if (counts.pending > 0) {
                    circles += `<span class='circle pending'>${counts.pending}</span>`
                }
                if (counts.in_progress > 0) {
                    circles += `<span class='circle in-progress'>${counts.in_progress}</span>`
                }
                if (counts.completed > 0) {
                    circles += `<span class='circle completed'>${counts.completed}</span>`
                }
                html += `<td><div>${d}</div><div class='day-name'>${dayName}</div><div>${circles}</div></td>`
            } else {
                html += `<td></td>`
            }
        }
        html += '</tr>'
    }
    html += '</tbody></table>'
    container.innerHTML = html
}

function initApp() {
    loadFromLocalStorage()
    SidebarComponent.init()
    MainComponent.init()
    renderYearCalendar(document.getElementById('calendarYearView'), SidebarComponent.state.selectedList)

    // No need to call render manually as init now includes initialRender

    // Subscribe saveToLocalStorage to relevant events
    EventBus.subscribe('groupAdded', saveToLocalStorage)
    EventBus.subscribe('listAdded', saveToLocalStorage)
    EventBus.subscribe('listDeleted', saveToLocalStorage)
    EventBus.subscribe('listRenamed', saveToLocalStorage)
    EventBus.subscribe('sectionAdded', saveToLocalStorage)
    EventBus.subscribe('sectionRenamed', saveToLocalStorage)
    EventBus.subscribe('reminderAdded', saveToLocalStorage)
    EventBus.subscribe('reminderToggled', saveToLocalStorage)
    EventBus.subscribe('reminderStatusChanged', saveToLocalStorage)
    EventBus.subscribe('stateSaved', saveToLocalStorage)

    document.getElementById('newGroupInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const groupName = e.target.value.trim()
            if (groupName) {
                EventBus.publish('groupAdded', { name: groupName, lists: [] })
                e.target.value = ''
            }
        }
    })
}

window.addEventListener('DOMContentLoaded', initApp)
window.addEventListener('morphed',initApp)