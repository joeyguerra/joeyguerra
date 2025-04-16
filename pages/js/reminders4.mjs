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

// Sidebar Component with DOM element tracking
export const SidebarComponent = {
    name: 'sidebar',
    state: {
        groups: [],
        selectedList: null
    },
    // Store DOM references
    elements: {
        container: null,
        groups: [], // Array of group element references
        lists: {}   // Object mapping group_index:list_index to list element references
    },
    selectedItem: null,
    phantomSlot: null,
    selectedGroup: null,
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
            delete this.elements.lists[key]
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
        let isDragging = false
        groupEl.className = 'group'
        groupEl.dataset.index = groupIndex
        groupEl.draggable = true
        const header = document.createElement('strong')
        header.textContent = group.name
        
        groupEl.addEventListener('dragstart', e => {
            e.stopPropagation()
            groupEl.classList.add('group-dragging')
            this.selectedGroup = e.target
            isDragging = true
        })
        
        groupEl.addEventListener('dragend', e => {
            e.stopPropagation()
            groupEl.classList.remove('group-dragging')
            this.selectedGroup = null
            isDragging = false
        })

        groupEl.addEventListener('dragenter', e => {
            if (!isDragging) return
            e.stopPropagation()
        })
        
        groupEl.addEventListener('dragover', e => {
            e.preventDefault()
            if (this.selectedGroup === e.target) {
                return
            }
            e.dataTransfer.dropEffect = 'move'
        })
        
        groupEl.addEventListener('dragleave', e => {
            e.target.classList.remove('drag-over')
        })
        
        groupEl.addEventListener('drop', e => {
            e.preventDefault()
            e.stopPropagation()
            groupEl.classList.remove('drag-over')
            if (this.selectedGroup === e.target) {
                return
            }
            e.target.insertAdjacentElement('afterend', this.selectedGroup)
            this.selectedGroup = null
        })
        
        // Delete button for the group
        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = '🗑'
        deleteBtn.addEventListener('click', () => {
            EventBus.publish('groupDeleted', groupIndex)
        })
        
        header.appendChild(deleteBtn)
        groupEl.appendChild(header)
        
        // Create the list container
        const listContainer = document.createElement('ul')
        
        // Create list elements
        group.lists.forEach((list, listIndex) => {
            const listEl = this.createListElement(list, groupIndex, listIndex)
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
        let isDragging = false
        
        // Add drag and drop event listeners
        listEl.addEventListener('dragstart', (e) => {
            e.stopPropagation()
            this.selectedItem = e.target
            this.selectedItem.classList.add('dragging')
            isDragging = true
        })

        listEl.addEventListener('dragenter', (e) => {
            if (!isDragging) return
            if (this.selectedItem === e.target) {
                return
            }

            if (e.target === listEl.parentNode.lastElementChild) {
                listEl.insertAdjacentElement('afterend', this.selectedItem)
            } else {
                listEl.parentNode.insertBefore(this.selectedItem, listEl)
            }
        })
        
        listEl.addEventListener('dragover', (e) => {
            e.preventDefault()
            if (this.draggedItem === e.target) {
                return
            }
            e.dataTransfer.dropEffect = 'move'
        })
        
        listEl.addEventListener('dragleave', (e) => {
            listEl.classList.remove('drag-over')
        })

        listEl.addEventListener('dragend', () => {
            this.selectedItem.classList.remove('dragging')
            EventBus.publish('listSelected', list)
            isDragging = false
        })

        listEl.addEventListener('drop', (e) => {
            e.stopPropagation()
            isDragging = false
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
    state: {
        selectedList: null
    },
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
        EventBus.subscribe('sectionAdded', this.addSection.bind(this))
        EventBus.subscribe('sectionRenamed', this.renameSection.bind(this))
        EventBus.subscribe('reminderAdded', this.addReminder.bind(this))
        EventBus.subscribe('reminderToggled', this.toggleReminder.bind(this))
        EventBus.subscribe('updateMainTitle', this.updateTitle.bind(this))
        
        // Initial render
        this.initialRender()
    },
    selectList(list) {
        // Skip if the same list is already selected
        if (this.state.selectedList === list) return
        
        this.state.selectedList = list
        this.initialRender() // Full render needed when changing lists
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
        
        // Update the state
        const section = this.state.selectedList.sections[sectionIndex]
        const reminderIndex = section.reminders.length
        section.reminders.push(reminder)
        
        // Add the reminder element to the DOM
        const sectionEl = this.elements.sections[sectionIndex]
        if (sectionEl) {
            const ul = sectionEl.querySelector('ul')
            if (ul) {
                const reminderEl = this.createReminderElement(reminder, sectionIndex, reminderIndex)
                ul.appendChild(reminderEl)
                this.elements.reminders[`${sectionIndex}:${reminderIndex}`] = reminderEl
            }
        }
        
        EventBus.publish('stateSaved')
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
    },
    createSectionElement(section, sectionIndex) {
        const sectionDiv = document.createElement('div')
        sectionDiv.className = 'section'
        sectionDiv.dataset.sectionIndex = sectionIndex
        
        // Section name input
        const nameInput = document.createElement('input')
        nameInput.value = section.name
        nameInput.className = 'input-inline'
        nameInput.addEventListener('change', () => {
            EventBus.publish('sectionRenamed', {
                sectionIndex,
                name: nameInput.value
            })
        })
        sectionDiv.appendChild(nameInput)
        
        // New reminder input
        const reminderInput = document.createElement('input')
        reminderInput.placeholder = 'New reminder'
        reminderInput.className = 'input-inline'
        reminderInput.addEventListener('keypress', (e) => {
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
        sectionDiv.appendChild(reminderInput)
        
        // Reminders list
        const ul = document.createElement('ul')
        section.reminders.forEach((reminder, reminderIndex) => {
            const reminderEl = this.createReminderElement(reminder, sectionIndex, reminderIndex)
            ul.appendChild(reminderEl)
            this.elements.reminders[`${sectionIndex}:${reminderIndex}`] = reminderEl
        })
        sectionDiv.appendChild(ul)
        
        return sectionDiv
    },
    createReminderElement(reminder, sectionIndex, reminderIndex) {
        const li = document.createElement('li')
        li.className = 'reminder'
        li.dataset.sectionIndex = sectionIndex
        li.dataset.reminderIndex = reminderIndex
        
        const label = document.createElement('label')
        
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = reminder.completed
        checkbox.addEventListener('change', () => {
            EventBus.publish('reminderToggled', {
                sectionIndex,
                reminderIndex
            })
        })
        
        const span = document.createElement('span')
        span.textContent = reminder.text
        if (reminder.completed) {
            span.classList.add('completed')
        }
        
        label.appendChild(checkbox)
        label.appendChild(span)
        li.appendChild(label)
        
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
        StateAggregator.setState(parsedState)
        SidebarComponent.state = parsedState.sidebar || { groups: [] }
        MainComponent.state = parsedState.main || { selectedList: null }
    }
}

function initApp() {
    loadFromLocalStorage()
    SidebarComponent.init()
    MainComponent.init()
    
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