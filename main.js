// Initialize the activeSlot variable with 0
let activeSlot = 0;
const jsonOutput = document.getElementById('json-output');
const inventoryGrid = document.querySelector('.inventory-grid');
let jsonData = {}; // To store the JSON data

// Initialize an array to store all items
let allItems = [];

// Initialize an array to store slot-specific settings
const slotSettings = Array.from({ length: 27 }, () => ({
    type: 'minecraft:gray_stained_glass_pane',
    name: [], // Name as an array of segments
    lore: [], // Lore as an array of segments
    function: '',
    icon: 'gray_stained_glass_pane.png',
    nameDisplay: "",
    loreDisplay: ""
}));

// Load test items from Minecraft JSON file
fetch('minecraft_items.json')
    .then((response) => response.json())
    .then((data) => {
        allItems = data; // Store all items
        createInventoryGrid();
        createItemMenu(allItems);
        createItemList(allItems);
        openItemMenu(activeSlot);
        setInterval(generateJSON, 1000);
    });

function createInventoryGrid() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 9; column++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.slot = row * 9 + column; // Calculate slot number

            // Get the block's icon filename from slotSettings
            const iconFileName = slotSettings[row * 9 + column].icon;

            // Create an img element for the block icon
            const icon = document.createElement('img');
            icon.classList.add('item-icon-chest')
            icon.src = `item/${iconFileName}`;
            icon.alt = slotSettings[row * 9 + column].name; // Alt text for accessibility
            icon.dataset.slot = row * 9 + column; // Associate the icon with a slot
            // Append the icon to the slot
            slot.appendChild(icon);

            inventoryGrid.appendChild(slot);
        }
    }
}

// Event listener for slot clicks
document.querySelector('.inventory-grid').addEventListener('click', (event) => {
    if (event.target.classList.contains('item-icon-chest')) {
        activeSlot = event.target.dataset.slot; // Update the active slot
        openItemMenu(activeSlot);
    }
});

function createItemMenu(items) {
    const itemMenu = document.querySelector('.item-settings');
    //const itemDropdown = document.createElement('select');
    const itemFunctionInput = document.createElement('input');
    itemFunctionInput.placeholder = 'Function (optional)';
    itemFunctionInput.id = "function_input";
    itemFunctionInput.spellcheck = false
    
    // Create contenteditable divs for item name and lore
    const itemNameInput = document.createElement('div');
    itemNameInput.id = "name_input";
    itemNameInput.spellcheck = false
    itemNameInput.className = "content-editable";
    itemNameInput.style.backgroundColor = 'black';
    itemNameInput.style.fontFamily = "Minecraftia"
    itemNameInput.style.color = 'white';
    itemNameInput.style.border = '1px solid #ccc';
    itemNameInput.contentEditable = true; // Enable content editing

    const itemLoreInput = document.createElement('div');
    itemLoreInput.id = "lore_input";
    itemLoreInput.spellcheck = false
    itemLoreInput.className = "content-editable";
    itemLoreInput.style.fontFamily = "Minecraftia"
    itemLoreInput.style.backgroundColor = 'black';
    itemLoreInput.style.color = 'white';
    itemLoreInput.style.height = '150px';
    itemLoreInput.style.resize = 'none';
    itemLoreInput.style.overflowY = 'auto';
    itemLoreInput.style.border = '1px solid #ccc';
    itemLoreInput.contentEditable = true; // Enable content editing
    
    // Add toolbar buttons for text formatting
    const boldButton = document.createElement('button');
    boldButton.textContent = 'Bold';
    boldButton.onclick = () => document.execCommand('bold', false, null);

    const italicButton = document.createElement('button');
    italicButton.textContent = 'Italic';
    italicButton.onclick = () => document.execCommand('italic', false, null);

    // Create an input field for color selection
    const colorButton = document.createElement('input');
    colorButton.type = 'color';
    colorButton.title = 'Pick a color';
    colorButton.oninput = () => document.execCommand('foreColor', false, colorButton.value);

    colorButton.oninput = () => document.execCommand('foreColor', false, colorButton.value);
    boldButton.onclick = () => {
        document.execCommand('bold', false, null);
        updateButtonsState();
    };
    italicButton.onclick = () => {
        document.execCommand('italic', false, null);
        updateButtonsState();
    };


    // Add a label for the active slot
    const activeSlotLabel = document.createElement('label');
    activeSlotLabel.textContent = 'Active Slot:';
    const activeSlotDisplay = document.createElement('span');
    activeSlotDisplay.id = 'active-slot-display';
    activeSlotLabel.appendChild(activeSlotDisplay);

    for (const item of items) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        //itemDropdown.appendChild(option);
    }

    // Add event listeners to input elements
    //itemDropdown.addEventListener('change', updateJSON);
    itemNameInput.addEventListener('input', updateJSON);
    itemFunctionInput.addEventListener('input', updateJSON);
    itemLoreInput.addEventListener('input', updateJSON);

    const styleButtons = document.createElement('div')
    styleButtons.id = "style-button"

    styleButtons.appendChild(boldButton);
    styleButtons.appendChild(italicButton);
    styleButtons.appendChild(colorButton);

    itemMenu.appendChild(activeSlotLabel);
    //itemMenu.appendChild(itemDropdown);
    itemMenu.appendChild(styleButtons)
    itemMenu.appendChild(itemNameInput);
    itemMenu.appendChild(itemLoreInput);
    itemMenu.appendChild(itemFunctionInput);
    
    // Add the event listener for the search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = filterItems(items, searchTerm);
        createItemList(filteredItems);
    });

    // Load initial settings for the active slot
    loadItemSettings(activeSlot);

    function updateButtonsState() {
        boldButton.style.fontWeight = document.queryCommandState('bold') ? 'bold' : 'normal';
        italicButton.style.fontStyle = document.queryCommandState('italic') ? 'italic' : 'normal';
    }
}




function openItemMenu(slot) {
    const itemMenu = document.querySelector('.item-settings');
    const activeSlotDisplay = document.getElementById('active-slot-display');
    
    activeSlotDisplay.textContent = slot; // Update the active slot display
    itemMenu.dataset.activeSlot = slot;
    
    // Load settings for the active slot
    loadItemSettings(slot);
}

function filterItems(items, searchTerm) {
    return items.filter((item) => {
        const itemName = item.name.toLowerCase();
        return itemName.includes(searchTerm);
    });
}

function loadItemSettings(slot) {
    const selectedItem = slotSettings[slot];
    //document.querySelector('.item-settings select').value = selectedItem.type;
    document.querySelector('.item-settings #name_input').innerHTML = selectedItem.nameDisplay;
    document.querySelector('.item-settings #function_input').value = selectedItem.function;
    document.querySelector('.item-settings #lore_input').innerHTML = selectedItem.loreDisplay;

    
}

function generateJSON() {
    const formattedSlots = slotSettings.map((settings, index) => {
        const item = {
            id: settings.type,
            // Add more properties as needed
        };

        const name = settings.name
        const lore = settings.lore

        const func = settings.function || '';
        const icon = settings.icon || '';

        // Update the icon for the active slot in slotSettings
        if (settings.type) {
            settings.icon = settings.type.replace('minecraft:', '') + '.png';
        }

        return {
            [`slot:${index}`]: {
                Item: item,
                Name: name,
                Lore: lore,
                Function: func,
                Icon: icon,
            },
        };
    });
    jsonData = { slots: formattedSlots };
    console.log(jsonData);
}

// Function to update the displayed icon for the active slot
function updateIconDisplay(activeSlot, iconFileName) {
    // Find the img element with the corresponding data-slot attribute
    const iconElement = document.querySelector(`img[data-slot="${activeSlot}"]`);
    if (iconElement) {
        iconElement.src = `item/${iconFileName}`;
        iconElement.alt = ''; // You can set an appropriate alt text here if needed
    }
}

function updateJSON() {
    const activeSlot = document.querySelector('.item-settings').dataset.activeSlot;
    //const selectedOption = document.querySelector('.item-settings select').value;
    const itemName = document.querySelector('.item-settings #name_input').innerHTML; // Get name from content-editable div
    const itemFunction = document.querySelector('.item-settings #function_input').value;
    const itemLore = document.querySelector('.item-settings #lore_input').innerHTML; // Get lore from textarea

    // Update the icon for the active slot in slotSettings
    //slotSettings[activeSlot].icon = selectedOption.replace('minecraft:', '') + '.png';

    // Check if nameSegmentsFromInput returns a valid array or is null
    const nameSegments = nameSegmentsFromInput(itemName);
    if (Array.isArray(nameSegments)) {
        slotSettings[activeSlot].name = nameSegments;
    } else {
        slotSettings[activeSlot].name = []; // Set to an empty array if null
    }

    // Handle loreSegmentsFromInput similarly (checking for null)
    const loreSegments = loreSegmentsFromInput(itemLore);
    slotSettings[activeSlot].lore = loreSegments;
    slotSettings[activeSlot].function = itemFunction || '';
    slotSettings[activeSlot].icon = slotSettings[activeSlot].icon; // Set the icon
    slotSettings[activeSlot].loreDisplay = itemLore
    slotSettings[activeSlot].nameDisplay = itemName

    // Update the displayed icon for the active slot
    updateIconDisplay(activeSlot, slotSettings[activeSlot].icon);
}


// Function to extract name segments from input
function nameSegmentsFromInput(htmlString) {
    console.log(htmlString)
    // Arrays to store text and styles
    const textSegments = [];
    const colorStyles = [];
    const boldStyles = [];
    const italicStyles = [];

    // Initialize default styles
    let currentColor = 'white';
    let currentBold = false;
    let currentItalic = false;

    while (htmlString.length > 0) {
    // Search for the next '<'
    const openTagIndex = htmlString.indexOf('<');

    if (openTagIndex === -1) {
        // No more tags, treat the remaining content as plain text
        const textContent = htmlString;
        if (textContent.trim() !== '') {
        textSegments.push(textContent);
        colorStyles.push(currentColor);
        boldStyles.push(currentBold);
        italicStyles.push(currentItalic);
        }
        break;
    }

    // Get the text content before the next '<'
    const textBeforeTag = htmlString.slice(0, openTagIndex);

    // Update the arrays with the text and styles (only if not empty)
    if (textBeforeTag.trim() !== '') {
        textSegments.push(textBeforeTag);
        colorStyles.push(currentColor);
        boldStyles.push(currentBold);
        italicStyles.push(currentItalic);
    }

    // Remove the processed text from the string
    htmlString = htmlString.slice(openTagIndex);

    // Check for supported tags (you can expand this list)
    if (htmlString.startsWith('<font')) {
        const colorMatch = htmlString.match(/color="(.*?)"/);
        if (colorMatch) {
        currentColor = colorMatch[1];
        }
        htmlString = htmlString.slice(htmlString.indexOf('>') + 1); // Skip the opening tag
    } else if (htmlString.startsWith('</font>')) {
        htmlString = htmlString.slice(7); // Skip the closing tag
        currentColor = 'white'; // Reset to the default color
    } else if (htmlString.startsWith('<b>')) {
        currentBold = true;
        htmlString = htmlString.slice(3); // Skip the opening tag
    } else if (htmlString.startsWith('</b>')) {
        currentBold = false;
        htmlString = htmlString.slice(4); // Skip the closing tag
    } else if (htmlString.startsWith('<i>')) {
        currentItalic = true;
        htmlString = htmlString.slice(3); // Skip the opening tag
    } else if (htmlString.startsWith('</i>')) {
        currentItalic = false;
        htmlString = htmlString.slice(4); // Skip the closing tag
    } else {
        // Unsupported tag, just skip it
        htmlString = htmlString.slice(1);
    }
    }
    // Create an array of objects
    const result = textSegments.map((text, index) => ({
        text: text,
        color: colorStyles[index],
        bold: boldStyles[index],
        italic: italicStyles[index],
    }));

    return result
}

// Function to extract lore segments from input
function loreSegmentsFromInput(inputLines) {
    // Ensure inputLines is a string
    if (typeof inputLines !== 'string') {
        console.log("invalid input"); // Return an empty array for invalid input
    }

    // Use regular expression to match the text inside div tags
    var tagContent = inputLines.match(/<div>(.*?)<\/div>/g);

    // Ensure tagContent is an array, and if not, return an empty array
    if (!Array.isArray(tagContent)) {
        tagContent = [];
    }

    // Remove <div> and </div> tags from the matched content
    const cleanedContent = tagContent.map(tag => tag.replace(/<\/?div>/g, ''));

    // Use regular expression to split the string into an array
    const splitStrings = inputLines.split(/<div>.*?<\/div>/);

    // Remove empty strings and trim whitespace
    const result = splitStrings
        .concat(cleanedContent)
        .filter(str => str && str.trim() !== '');

    // Replace <br> with a space
    const finalResult = result.map(segment => segment.replace(/<br>/g, ' '));

    const processedArray = finalResult.map(nameSegmentsFromInput);
    // Ensure that empty arrays contain the specified object
    const finalProcessedArray = processedArray.map(segment => {
        if (segment.length === 0) {
            return [{ text: ' ', color: 'white', bold: false, italic: false }];
        } else {
            return segment;
        }
    });
    console.log(finalProcessedArray)
    return finalProcessedArray;
}

function createItemList(items) {
    const itemList = document.querySelector('.item-list');
    const itemListContainer = document.querySelector('.item-list-container');

    // Store the current scroll position
    const scrollPosition = itemListContainer.scrollTop;

    // Clear the existing item list
    itemList.innerHTML = '';

    // Determine how many items to display (up to a maximum of 10)
    const numItemsTodisplay = Math.min(10, items.length);

    for (let i = 0; i < 10; i++) {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container');

        if (i < numItemsTodisplay) {
            const item = items[i];
            const itemIcon = document.createElement('img');
            itemIcon.classList.add('item-icon-list');
            itemIcon.src = `item/${item.id.replace('minecraft:', '')}.png`;
            itemIcon.draggable = true;
            itemIcon.dataset.type = item.id;
            itemIcon.alt = item.name;
            itemContainer.appendChild(itemIcon);
        } else {
            const itemIcon = document.createElement('img');
            itemIcon.classList.add('item-icon-list');
            itemIcon.src = `item/placeholder.png`;
            itemIcon.draggable = false;
            itemIcon.dataset.type = "Unknown";
            itemIcon.alt = "placeholder";
            itemContainer.appendChild(itemIcon);
        }

        itemList.appendChild(itemContainer);
    }

    // Reset the scroll position to the top
    itemListContainer.scrollTop = scrollPosition;
}

// Event listener for item drag start
document.addEventListener('dragstart', (event) => {
    if (event.target.classList.contains('item-icon-list')) {
        event.dataTransfer.setData('text/plain', event.target.dataset.type);
    } else {
        // Prevent dragging for icons with the class 'item-icon-chest'
        event.preventDefault();
    }
});

// Event listener for inventory slot drag over
inventoryGrid.addEventListener('dragover', (event) => {
    // Prevent the default behavior to allow dropping
    event.preventDefault();
});

// Event listener for inventory slot drop
inventoryGrid.addEventListener('drop', (event) => {
    // Prevent the default behavior to allow dropping
    event.preventDefault();
    // Get the item type from the data transfer
    const itemType = event.dataTransfer.getData('text/plain');

    // Get the target slot where the item was dropped
    const targetSlot = event.target.dataset.slot;
    activeSlot = targetSlot;
    openItemMenu(activeSlot);
    // Ensure that slotSettings is an array with a length of at least 27
    if (!Array.isArray(slotSettings)) {
        slotSettings = Array.from({ length: 27 }, () => ({
            type: 'minecraft:gray_stained_glass_pane',
            name: [], // Name as an array of segments
            lore: [], // Lore as an array of segments
            function: '',
            icon: 'gray_stained_glass_pane.png',
        }));
    }

    // Update the slotSettings for the target slot
    slotSettings[targetSlot].type = itemType;

    // Update the icon for the target slot
    const targetIcon = document.querySelector(`img[data-slot="${targetSlot}"]`);
    targetIcon.src = `item/${itemType.replace('minecraft:', '')}.png`;

    // Generate JSON to reflect the changes
    generateJSON();
});

const inventorygrid = document.querySelector('.inventory-grid');
const itemTooltip = document.getElementById('item-tooltip');
const itemName = document.getElementById('item-name');
const itemLore = document.getElementById('item-lore');
const itemId = document.getElementById('item-id');

// Event listener for mouseover on inventory grid items
inventorygrid.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (target.classList.contains('item-icon-chest')) {
        const slot = target.dataset.slot;

        // Retrieve item information from slotSettings
        const selectedItem = slotSettings[slot];

        // Populate the tooltip content
        itemName.textContent = `Name: ${selectedItem.name}`;
        itemLore.textContent = `Lore: ${selectedItem.lore}`;
        itemId.textContent = `Item ID: ${selectedItem.type}`;
        
        // Position the tooltip near the mouse cursor
        itemTooltip.style.left = (event.clientX + 60) + 'px';
        itemTooltip.style.top = (event.clientY + 60) + 'px';

        // Show the tooltip
        itemTooltip.classList.add('show');
    }
});

// Event listener for mouseout on inventory grid items
inventoryGrid.addEventListener('mouseout', () => {
    // Hide the tooltip when the mouse leaves the item
    itemTooltip.classList.remove('show');
});











