// Initialize the activeSlot variable with 0
let activeSlot = 0;
const jsonOutput = document.getElementById('json-output');
const inventoryGrid = document.querySelector('.inventory-grid'); // Add this line

// Initialize an array to store slot-specific settings
const slotSettings = Array.from({ length: 27 }, () => ({
    type: 'minecraft:gray_stained_glass_pane', // Default type
    name: '', // Default name
    lore: '', // Default lore
    function: '', // Default function
    icon: 'gray_stained_glass_pane.png'
})); 

// Load test items from Minecraft JSON file
fetch('minecraft_items.json')
    .then(response => response.json())
    .then(data => {
        // Create the inventory grid and item menu
        createInventoryGrid();
        createItemMenu(data);
        createItemList(data);
        openItemMenu(activeSlot);

        // Event listener for slot clicks
        document.querySelector('.inventory-grid').addEventListener('click', (event) => {
            if (event.target.classList.contains('item-icon-chest')) {
                activeSlot = event.target.dataset.slot; // Update the active slot
                openItemMenu(activeSlot);
            }
        });

        // Update JSON continuously
        setInterval(generateJSON, 1000); // Update every second
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

function createItemMenu(items) {
    const itemMenu = document.querySelector('.item-menu');
    const itemDropdown = document.createElement('select');
    const itemFunctionInput = document.createElement('input');
    itemFunctionInput.placeholder = 'Function (optional)';


    const itemNameInput = document.createElement('input');
    itemNameInput.placeholder = 'Item Name';
    const itemLoreInput = document.createElement('input'); // Add "Lore" input field
    itemLoreInput.placeholder = 'Lore (optional)';
    
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
        itemDropdown.appendChild(option);
    }

    // Add event listeners to input elements
    itemDropdown.addEventListener('change', updateJSON);
    itemNameInput.addEventListener('input', updateJSON);
    itemFunctionInput.addEventListener('input', updateJSON);
    itemLoreInput.addEventListener('input', updateJSON); // Add event listener for "Lore" input

    itemMenu.appendChild(activeSlotLabel); // Add the active slot label
    itemMenu.appendChild(itemDropdown);
    itemMenu.appendChild(itemNameInput);
    itemMenu.appendChild(itemLoreInput); // Add the "Lore" input field to the menu
    itemMenu.appendChild(itemFunctionInput);
    
    // Load initial settings for the active slot
    loadItemSettings(activeSlot);
}

function openItemMenu(slot) {
    const itemMenu = document.querySelector('.item-menu');
    const activeSlotDisplay = document.getElementById('active-slot-display');
    
    activeSlotDisplay.textContent = slot; // Update the active slot display
    itemMenu.dataset.activeSlot = slot;
    
    // Load settings for the active slot
    loadItemSettings(slot);
}

function loadItemSettings(slot) {
    const selectedItem = slotSettings[slot];
    document.querySelector('.item-menu select').value = selectedItem.type;
    document.querySelector('.item-menu input[placeholder="Item Name"]').value = selectedItem.name;
    document.querySelector('.item-menu input[placeholder="Lore (optional)"]').value = selectedItem.lore;
    document.querySelector('.item-menu input[placeholder="Function (optional)"]').value = selectedItem.function;
}

function generateJSON() {
    const jsonOutput = document.getElementById('json-output');

    if (jsonOutput) {
        const formattedSlots = slotSettings.map((settings, index) => {
            const item = {
                id: settings.type,
                // Add more properties as needed
            };
            const name = {
                text: settings.name || '',
                color: 'white',
            };
            const lore = {
                text: settings.lore || '',
                color: 'white',
            };
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
                    Icon: settings.icon,
                },
            };
        });

        const jsonResult = JSON.stringify({ slots: formattedSlots }, null, 2);
        jsonOutput.textContent = jsonResult;
    }
}



// Function to automatically update settings for the active slot
function updateJSON() {
    const activeSlot = document.querySelector('.item-menu').dataset.activeSlot;
    const selectedOption = document.querySelector('.item-menu select').value;
    const itemName = document.querySelector('.item-menu input[placeholder="Item Name"]').value;
    const itemFunction = document.querySelector('.item-menu input[placeholder="Function (optional)"]').value;
    const itemLore = document.querySelector('.item-menu input[placeholder="Lore (optional)"]').value;

    // Update the icon for the active slot in slotSettings
    slotSettings[activeSlot].icon = selectedOption.replace('minecraft:', '') + '.png';

    // Update other settings for the active slot
    slotSettings[activeSlot] = {
        type: selectedOption,
        name: itemName,
        lore: itemLore || '',
        function: itemFunction || '',
        icon: slotSettings[activeSlot].icon, // Set the icon
    };

    // Update the displayed icon for the active slot
    updateIconDisplay(activeSlot, slotSettings[activeSlot].icon);
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


// Function to create a list of items that can be dragged (limit to 10 items)
function createItemList(items, startIndex = 0) {
    const itemList = document.querySelector('.item-list');

    // Begränsa loopen till högst 10 objekt eller så många objekt som finns kvar
    for (let i = startIndex; i < Math.min(startIndex + 10, items.length); i++) {
        const item = items[i];

        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container');

        const itemIcon = document.createElement('img');
        itemIcon.classList.add('item-icon-list');
        itemIcon.src = `item/${item.id.replace('minecraft:', '')}.png`; // Use the item's ID as the icon filename
        itemIcon.draggable = true;
        itemIcon.dataset.type = item.id; // Store the item type in the dataset
        itemIcon.alt = item.name; // Alt text for accessibility

        itemContainer.appendChild(itemIcon);
        itemList.appendChild(itemContainer);
    }
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

    // Update the slotSettings for the target slot
    slotSettings[targetSlot].type = itemType;

    // Update the icon for the target slot
    const targetIcon = document.querySelector(`img[data-slot="${targetSlot}"]`);
    targetIcon.src = `item/${itemType.replace('minecraft:', '')}.png`;

    // Generate JSON to reflect the changes
    generateJSON();
});










