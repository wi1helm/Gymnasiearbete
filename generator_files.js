function generateInitFunction(jsonData) {
    const guiName = 'gui1'; // Set your GUI name here

    const itemsToSummon = [];
    const uniqueItems = new Set(); // A Set to store unique items

    for (let index = 0; index < 27; index++) {
        const slot = jsonData.slots[index];
        const item = slot[`slot:${index}`];

        const itemName = item.Item.id;
        uniqueItems.add(itemName); // Add the item to the Set

        const itemCommand = `{Slot:${index}b,id:"${itemName}",Count:1b,tag:{${guiName}:1b`;

        const tagParts = [];

        if (item.Name.text || item.Lore.text || item.Function) {
            const displayTag = {};

            if (item.Name.text) {
                displayTag.Name = `{"text":"${item.Name.text}","color":"white"}`;
            }

            if (item.Lore.text) {
                const loreLines = item.Lore.text.split('\n');
                displayTag.Lore = loreLines.map(line => `{"text":"${line}","color":"white"}`);
            }

            if (item.Function) {
                displayTag.Function = `["${item.Function}"]`;
            }

            tagParts.push(`display:${JSON.stringify(displayTag)}`);
        }

        const tag = tagParts.join(',');
        const itemCommandFull = `${itemCommand}${tag ? `,${tag}` : ''}}}`;

        itemsToSummon.push(itemCommandFull);
    }

    // Join item commands with commas and add the 'Items' array
    const itemsCommand = `Items:[${itemsToSummon.join(', ')}]`;

    const summonCommand = `summon chest_minecart ~ ~ ~ {${itemsCommand}}`;
    const initFunction = `# Initialize chest minecart with custom items\n${summonCommand}`;

    // Create a Blob from the function text
    const blob = new Blob([initFunction], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'init.mcfunction';

    // Trigger a click event to download the file
    a.click();
    URL.revokeObjectURL(url);

    // Generate the JSON file with unique items
    const uniqueItemsArray = Array.from(uniqueItems); // Convert the Set to an array
    const guiItemsJSON = JSON.stringify({ replace: false, values: uniqueItemsArray }, null, 2);

    // Create a Blob from the JSON text
    const itemsBlob = new Blob([guiItemsJSON], { type: 'application/json' });
    const itemsUrl = URL.createObjectURL(itemsBlob);

    // Create a link element to trigger the download
    const itemsLink = document.createElement('a');
    itemsLink.href = itemsUrl;
    itemsLink.download = `${guiName}_items.json`;

    // Trigger a click event to download the JSON file
    itemsLink.click();
    URL.revokeObjectURL(itemsUrl);
}

// Add an event listener to the download button
document.getElementById('download-button').addEventListener('click', () => {
    generateInitFunction(jsonData); // Pass the JSON data to the generation function
});
