hasVariables = false;
additionalFiles = {};
function generateFiles(jsonData) {
    const guiName = document.getElementById("gui_name_input").value;

    if (guiName == "") {
        return;
    }

    let uniqueVariables = populateVariables(jsonData) // Set to store unique variables
    let uniqueItems = new Set(); // Set to store unique items
    
    for (const pageName in jsonData.pages) {
        const pageData = jsonData.pages[pageName];
        populateUniqueItemsArray(pageData, uniqueItems);
    }


    const itemsToSummon = generateItemsArray(jsonData.pages, guiName, uniqueItems, uniqueVariables);

    const initFunctionContent = generateInitFunctionContent(guiName, itemsToSummon, hasVariables);
    const loopStartContent = generateLoopStartContent(guiName);
    const loopExecuteContent = generateLoopExecuteContent(guiName);
    const finishGuiContent = generateFinishGuiContent(guiName,hasVariables);
    const loadOnceContent = generateLoadOnceContent();
    const checkEmptySlotContent = generateCheckEmptySlotContent(guiName);
    const getEmptySlotContent = generateGetEmptySlotContent(guiName);
    const getNameStrContent = generateGetNameStrContent(guiName);
    const getNameContent = generateGetNameContent(guiName);
    const noFunctionContent = 'return 0';
    const tickContent = generateTickContent(guiName);
    console.log(hasVariables,uniqueVariables)
    const spawnGuiContent = generateSpawnGuiContent(guiName, hasVariables, uniqueVariables);
    
    // Define an object with filename-content pairs

    

    const filesToGenerate = {
        'init.mcfunction': initFunctionContent,
        'loop_start.mcfunction': loopStartContent,
        'loop_execute.mcfunction': loopExecuteContent,
        'finish_gui.mcfunction': finishGuiContent,
        'load_once.mcfunction': loadOnceContent,
        'check_empty_slot.mcfunction': checkEmptySlotContent,
        'get_empty_slot.mcfunction': getEmptySlotContent,
        'get_name_str.mcfunction': getNameStrContent,
        'get_name.mcfunction': getNameContent,
        'no_function.mcfunction': noFunctionContent,
        'tick.mcfunction': tickContent,
    };
    
    filesToGenerate[`spawn_gui_${guiName}.mcfunction`] = spawnGuiContent;

    // Check if the JSON data contains variables
    if (hasVariables) {
    // Loop through pages to generate variable initialization content for each page
    for (const pageName in jsonData.pages) {
        const uniqueVariablesArray = Array.from(uniqueVariables[pageName]).map(variable => variable.slice(2, -1));
        const variableInitContent = generateVariableInitContent(guiName, uniqueVariablesArray, pageName);
        filesToGenerate[`variable_init_${pageName}.mcfunction`] = variableInitContent;
    }
}

    // Create a new JSZip instance
    const zip = new JSZip();

    // Create a folder for the GUI name
    const guiFolder = zip.folder(guiName);
    // Inside generateFiles function
    const pagesFolder = generatePagesFolder(guiName, jsonData,hasVariables);

    // Add the pages folder to the GUI folder
    const pagesFolderName = 'pages';
    const pagesFolderZip = guiFolder.folder(pagesFolderName);

    // Add each page file to the pages folder
    for (const fileName in pagesFolder) {
        pagesFolderZip.file(fileName, pagesFolder[fileName]);
    }

    // Add each file to the GUI folder
    for (const fileName in filesToGenerate) {
        guiFolder.file(fileName, filesToGenerate[fileName]);
    }

    // Generate the JSON file with unique items
    const uniqueItemsArray = Array.from(uniqueItems);
    const guiItemsJSON = {
        replace: false,
        values: uniqueItemsArray,
    };

    // Add the items.json file outside the GUI folder with the desired name
    zip.file(`${guiName}_items.json`, JSON.stringify(guiItemsJSON, null, 2));

    // Generate the folder and compress it
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
        // Create an anchor element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${guiName}_folder.zip`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Function to generate items array for the main page and other pages
function populateVariables(jsonData) {
    const pageVariables = {};

    for (const pageName in jsonData.pages) {
        const uniqueVariables = new Set();

        for (let index = 0; index < 27; index++) {
            const slot = jsonData.pages[pageName].slots[index][`slot:${index}`];

            // Check for variables in Name
            checkVariablesInName(slot.Name, uniqueVariables);

            // Check for variables in Lore
            checkVariablesInLore(slot.Lore, uniqueVariables);
            
        }

        // Convert the set to an array and assign it to the page
        pageVariables[pageName] = Array.from(uniqueVariables);
    }

    return pageVariables;
}

// Helper function to check for variables in the 'Name' array
function checkVariablesInName(nameArray, variableSet) {
    if (nameArray) {
        nameArray.forEach(item => {
            checkVariablesInString(item.text, variableSet);
        });
    }
}

// Helper function to check for variables in the 'Lore' array
function checkVariablesInLore(loreArray, variableSet) {
    if (loreArray) {
        loreArray.forEach(line => {
            line.forEach(item => {
                checkVariablesInString(item.text, variableSet);
            });
        });
    }
}

// Helper function to check for variables in a string
function checkVariablesInString(text, variableSet) {
    if (text && text.startsWith("$(") && text.endsWith(")")) {
        variableSet.add(text);
    }
}


function generateItemsArray(pages, guiName, uniqueItems, uniqueVariables) {
    const itemsToSummon = [];
        const page = pages["main"];

        for (let index = 0; index < 27; index++) {
            const slot = page.slots[index][`slot:${index}`];
            const itemName = slot.Item.id;

            const itemCommand = `{Slot:${index}b,id:"${itemName}",Count:1b,tag:{${guiName}:1b`;

            const tagParts = [];

            if (slot.Name.length > 0 || slot.Lore.length > 0 || slot.Function) {
                const displayTag = {};

                if (slot.Name.length > 0) {
                    const nameArray = slot.Name.map(item => {
                        if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                            hasVariables = true;
                            
                            
                        }
                        return JSON.stringify(item);
                    });
                    displayTag.Name = `[${nameArray.join(",")}]`;
                }

                if (slot.Lore.length > 0) {
                    displayTag.Lore = slot.Lore.map(line => {
                        line.forEach(item => {
                            if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                                hasVariables = true;
                                
                            }
                        });
                        return JSON.stringify(line);
                    });
                }

                if (slot.Function) {
                    displayTag.Function = `${slot.Function}`;
                }

                if (slot.Page) {
                    displayTag.Page = `${slot.Page}`;
                }

                tagParts.push(`display:${JSON.stringify(displayTag)}`);
            }

            const tag = tagParts.join(',');
            const itemCommandFull = `${itemCommand}${tag ? `,${tag}` : ''}}}`;

            itemsToSummon.push(itemCommandFull);
        }
        return itemsToSummon;
    }

    


// Function to generate init.mcfunction content

function generateSpawnGuiContent(guiName, hasVariables, uniqueVariables) {
    if (hasVariables) {
        const variablesContent = Object.entries(uniqueVariables).map(([pageName, variablesArray]) => {
            const variablesString = variablesArray.map(variable => `"${variable.slice(2, -1)}":"default value"`).join(',');
            return `data modify storage ${guiName} varibles.${pageName} set value {${variablesString}}`;
        }).join('\n');

        const initContent = `function general:${guiName}/init with storage minecraft:${guiName} varibles.main`;

        return `${variablesContent}\n${initContent}`;
    } else {
        return `function general:${guiName}/init`;
    }
}



function generateInitFunctionContent(guiName, itemsToSummon, hasVariables) {
    const summonCommand = hasVariables
        ? `$summon chest_minecart ~ ~1 ~ {Tags:["${guiName}"],Items:[${itemsToSummon.join(',')}]}`
        : `summon chest_minecart ~ ~1 ~ {Tags:["${guiName}"],Items:[${itemsToSummon.join(',')}]}`;

    const dataStorage = hasVariables
        ? `$data modify storage minecraft:${guiName} Items set value [${itemsToSummon.join(',')}]`
        : `data modify storage minecraft:${guiName} Items set value [${itemsToSummon.join(',')}]`;

    return `
scoreboard objectives add loop dummy
scoreboard objectives add ${guiName}_inv_check dummy
data modify storage minecraft:${guiName}_used settings set value {"name":"@a","slot":"","id":"","nbt":"","function":"general:${guiName}/no_function","page":"no_page"}

# Initialize chest minecart with custom items\n${summonCommand}
${dataStorage}
function general:${guiName}/loop_start`;
}

// Function to generate loop_start.mcfunction content
function generateLoopStartContent(guiName) {
    return `execute if score .j loop matches 0.. run scoreboard players add .j loop 1
execute unless score .j loop matches -2147483648..2147483647 run scoreboard players set .j loop 0
execute store result storage loop index int 1 run scoreboard players get .j loop
function general:${guiName}/loop_execute with storage minecraft:loop`;
}

// Function to generate loop_execute.mcfunction content
function generateLoopExecuteContent(guiName) {
    return `$data modify storage minecraft:${guiName} Items append from entity @e[tag=${guiName},limit=1] Items[$(index)]
execute if score .j loop matches 27.. run scoreboard players reset .j loop
execute if score .j loop matches ..26 run function general:${guiName}/loop_start`;
}

// Function to generate finish_gui.mcfunction content
function generateFinishGuiContent(guiName,hasVariables) {
    if (hasVariables){
    return `
$item replace entity @e[tag=${guiName}] container.$(slot) with $(id)$(nbt) 1
$clear $(name) #general:${guiName}_items{${guiName}:1b}
$execute as $(name) at @s run function $(function)
$function general:${guiName}/variable_init_$(page)
data modify storage minecraft:${guiName}_used settings set value {"name":"@a","slot":"","id":"","nbt":"","function":"general:${guiName}/no_function","page":"no_page"}`;
    }
    else{
        return `
$item replace entity @e[tag=${guiName}] container.$(slot) with $(id)$(nbt) 1
$clear $(name) #general:${guiName}_items{${guiName}:1b}
$execute as $(name) at @s run function $(function)
$function general:${guiName}/pages/$(page)
data modify storage minecraft:${guiName}_used settings set value {"name":"@a","slot":"","id":"","nbt":"","function":"general:${guiName}/no_function","page":"no_page"}`;
    }
}

// Function to generate load_once.mcfunction content
function generateLoadOnceContent() {
    return `summon text_display 0 0 0 {Tags:["pnt.name"],UUID:[I;112,110,116,120]}
scoreboard objectives add pnt.left minecraft.custom:minecraft.leave_game
scoreboard players set #4 pnt.left 4`;
}

// Function to generate check_empty_slot.mcfunction content
function generateCheckEmptySlotContent(guiName) {
    return `$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.nbt set from storage minecraft:${guiName} Items[$(index)].tag
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.id set from storage minecraft:${guiName} Items[$(index)].id
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.function set from storage minecraft:${guiName} Items[$(index)].tag.display.Function
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.page set from storage minecraft:${guiName} Items[$(index)].tag.display.Page
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.slot set value "$(index)"
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run function general:${guiName}/finish_gui with storage minecraft:${guiName}_used settings
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run scoreboard players reset .i loop
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run return 0
function general:${guiName}/get_empty_slot`;
}

// Function to generate get_empty_slot.mcfunction content
function generateGetEmptySlotContent(guiName) {
    return `execute if score .i loop matches 0.. run scoreboard players add .i loop 1
execute unless score .i loop matches -2147483648..2147483647 run scoreboard players set .i loop 0
execute store result storage loop index int 1 run scoreboard players get .i loop
function general:${guiName}/check_empty_slot with storage minecraft:loop`;
}

// Function to generate get_name_str.mcfunction content
function generateGetNameStrContent(guiName) {
    return `$data modify storage minecraft:${guiName}_used settings.name set string entity @s text -$(len) -2
kill @s
scoreboard players reset .i loop
function general:${guiName}/get_empty_slot`;
}

// Function to generate get_name.mcfunction content
function generateGetNameContent(guiName) {
    return `function general:${guiName}/load_once

data modify entity 00000070-0000-006e-0000-007400000078 text set value '{"selector":"@p"}'

# calculate length of the name
execute store result score .str_len pnt.left run data get entity 00000070-0000-006e-0000-007400000078 text
scoreboard players remove .str_len pnt.left 226
scoreboard players operation .str_len pnt.left /= #4 pnt.left
execute store result storage pnt args.len int 1 run scoreboard players add .str_len pnt.left 2
execute as 00000070-0000-006e-0000-007400000078 run function general:${guiName}/get_name_str with storage pnt args`;
}

// Function to generate tick.mcfunction content
function generateTickContent(guiName) {
    return `
execute store success score @a ${guiName}_inv_check run clear @a #general:${guiName}_items{${guiName}:1b} 0
execute at @a[scores={${guiName}_inv_check=1..}] run function general:${guiName}/get_name
execute at @a[scores={${guiName}_inv_check=1..}] run function general:${guiName}/update_varible with storage ${guiName} varibles`;
}

// Function to generate variablePages and update_varible.mcfunction for each page
function generateVariablePages(guiName, uniqueVariablesArray) {
    const variablePages = {};

    for (const pageName in jsonData.pages) {
        const pageVariables = uniqueVariablesArray.map(variable => `"${variable}":{"value":"default value"}`);
        variablePages[pageName] = `{${pageVariables.join(',')}}`;

        const updateVaribleContent = `
data modify storage ${guiName} varibles.${pageName} set from storage ${guiName} varibles.${pageName}
${uniqueVariablesArray.map(variable => `
execute as @e[tag=${guiName}] run data modify storage ${guiName} varibles.${pageName}.${variable} set from storage ${guiName} varibles.${variable}
`).join('')}
`;
        additionalFiles[`update_varible_${pageName}.mcfunction`] = updateVaribleContent;
    }

    return variablePages;
}

// Function to generate variableInit.mcfunction content
function generateVariableInitContent(guiName, uniqueVariablesArray, pageName) {
    return `
data modify storage ${guiName} varibles.${pageName} set value {${uniqueVariablesArray.map(variable => `"${variable}":"default value"`).join(',')}}
function general:${guiName}/pages/${pageName} with storage minecraft:${guiName} varibles.${pageName}`;
}


function generatePagesFolder(guiName, jsonData,hasVariables) {
    const pagesFolder = {};

    for (const pageName in jsonData.pages) {
        const pageContent = generatePageContent(guiName, pageName, jsonData.pages[pageName],hasVariables);
        pagesFolder[`${pageName}.mcfunction`] = pageContent;
        pagesFolder[`no_page.mcfunction`] = "return 0";
    }

    return pagesFolder;
}
function generatePageContent(guiName, pageName, pageData, hasVariables) {
    const itemsToSummon = [];

    for (let index = 0; index < 27; index++) {
        const slot = pageData.slots[index][`slot:${index}`];
        const itemName = slot.Item.id;

        const itemCommand = `{Slot:${index}b,id:"${itemName}",Count:1b,tag:{${guiName}:1b`;

        const tagParts = [];

        if (slot.Name.length > 0 || slot.Lore.length > 0 || slot.Function) {
            const displayTag = {};

            if (slot.Name.length > 0) {
                const nameArray = slot.Name.map(item => {
                    return JSON.stringify(item);
                });
                displayTag.Name = `[${nameArray.join(",")}]`;
            }

            if (slot.Lore.length > 0) {
                displayTag.Lore = slot.Lore.map(line => {
                    return JSON.stringify(line);
                });
            }

            if (slot.Function) {
                displayTag.Function = `${slot.Function}`;
            }

            if (slot.Page) {
                displayTag.Page = `${slot.Page}`;
            }

            tagParts.push(`display:${JSON.stringify(displayTag)}`);
        }

        const tag = tagParts.join(',');
        const itemCommandFull = `${itemCommand}${tag ? `,${tag}` : ''}}}`;
        itemsToSummon.push(itemCommandFull);
    }

    // Add $ before the first command if the page has variables
    const content = hasVariables
        ? `\n$data modify entity @e[tag=${guiName},limit=1] Items set value [${itemsToSummon}]
data modify storage minecraft:${guiName} Items set value [${itemsToSummon}]`
        : `\ndata modify entity @e[tag=${guiName},limit=1] Items set value [${itemsToSummon}]
data modify storage minecraft:${guiName} Items set value [${itemsToSummon}]`;

    return content;
}


function populateUniqueItemsArray(pageData, uniqueItems) {
    for (let index = 0; index < 27; index++) {
        const slot = pageData.slots[index][`slot:${index}`];
        const itemName = slot.Item.id;
        uniqueItems.add(itemName);
    }
}
      
    


document.getElementById('download-button').addEventListener('click', () => {
    generateFiles(jsonData);
});
