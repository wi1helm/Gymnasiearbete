function generateFiles(jsonData) {
    const guiName = document.getElementById("gui_name_input").value 
    if (guiName == ""){
        return
    }

    let additionalFiles = {}; // Store additional files
    const uniqueVariables = new Set(); // Set to store unique variables
    hasVariables = false;
    const itemsToSummon = [];
    const uniqueItems = new Set();

    for (let index = 0; index < 27; index++) {
        const slot = jsonData.slots[index][`slot:${index}`];
        const itemName = slot.Item.id;
        uniqueItems.add(itemName);

        const itemCommand = `{Slot:${index}b,id:"${itemName}",Count:1b,tag:{${guiName}:1b`;

        const tagParts = [];

        if (slot.Name.length > 0 || slot.Lore.length > 0 || slot.Function) {
            const displayTag = {};

            if (slot.Name.length > 0) {
                const nameArray = slot.Name.map(item => {
                    if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                        hasVariables = true; // Set the variable flag 
                        uniqueVariables.add(item.text); // Add unique variable to the set
                    }
                    return JSON.stringify(item);
                });
                displayTag.Name = `[${nameArray.join(",")}]`;
            }

            if (slot.Lore.length > 0) {
                displayTag.Lore = slot.Lore.map(line => {

                    line.forEach(item => {
                        if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                            hasVariables = true; // Set the variable flag 
                            uniqueVariables.add(item.text); // Add unique variable to the set
                        }
                    });

                    return JSON.stringify(line);
                });
            }
            
            

            if (slot.Function) {
                displayTag.Function = `${slot.Function}`;
            }

            tagParts.push(`display:${JSON.stringify(displayTag)}`);
        }

        const tag = tagParts.join(',');
        const itemCommandFull = `${itemCommand}${tag ? `,${tag}` : ''}}}`;

        itemsToSummon.push(itemCommandFull);
    }

    const itemsCommand = `Items:[${itemsToSummon.join(',')}]`;

    const summonCommand = hasVariables ? `$summon chest_minecart ~ ~1 ~ {Tags:["${guiName}"],${itemsCommand}}` :
        `summon chest_minecart ~ ~1 ~ {Tags:["${guiName}"],${itemsCommand}}`;
    const dataStorage = hasVariables ? `$data modify storage minecraft:${guiName} Items set value [${itemsToSummon.join(',')}]`:
    `data modify storage minecraft:${guiName} Items set value [${itemsToSummon.join(',')}]`
    const initFunctionContent = `
scoreboard objectives add loop dummy
scoreboard objectives add ${guiName}_inv_check dummy
data modify storage minecraft:${guiName}_used settings set value {"name":"@a","slot":"","id":"","nbt":"","function":"general:boat_shop/no_function"}

# Initialize chest minecart with custom items\n${summonCommand}
${dataStorage}
function general:${guiName}/loop_start`;

    const loopStartContent = `execute if score .j loop matches 0.. run scoreboard players add .j loop 1
execute unless score .j loop matches -2147483648..2147483647 run scoreboard players set .j loop 0
execute store result storage loop index int 1 run scoreboard players get .j loop
function general:${guiName}/loop_execute with storage minecraft:loop`;

    const loopExecuteContent = `$data modify storage minecraft:${guiName} Items append from entity @e[tag=${guiName},limit=1] Items[$(index)]
execute if score .j loop matches 27.. run scoreboard players reset .j loop
execute if score .j loop matches ..26 run function general:${guiName}/loop_start`;

    const finishGuiContent = `
$item replace entity @e[tag=${guiName}] container.$(slot) with $(id)$(nbt) 1
$clear $(name) #general:${guiName}_items{${guiName}:1b}
$execute as $(name) at @s run function $(function)
data modify storage minecraft:${guiName}_used settings set value {"name":"@a","slot":"","id":"","nbt":"","function":"general:${guiName}/no_function"}`;

    const loadOnceContent = `summon text_display 0 0 0 {Tags:["pnt.name"],UUID:[I;112,110,116,120]}
scoreboard objectives add pnt.left minecraft.custom:minecraft.leave_game
scoreboard players set #4 pnt.left 4`;

    const checkEmptySlotContent = `$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.nbt set from storage minecraft:${guiName} Items[$(index)].tag
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.id set from storage minecraft:${guiName} Items[$(index)].id
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.function set from storage minecraft:${guiName} Items[$(index)].tag.display.Function
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run data modify storage minecraft:${guiName}_used settings.slot set value "$(index)"
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run function general:${guiName}/finish_gui with storage minecraft:${guiName}_used settings
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run scoreboard players reset .i loop
$execute unless data entity @e[tag=${guiName},limit=1] Items[{Slot:$(index)b}] run return 0
function general:${guiName}/get_empty_slot`;
    const getEmptySlotContent = `execute if score .i loop matches 0.. run scoreboard players add .i loop 1
execute unless score .i loop matches -2147483648..2147483647 run scoreboard players set .i loop 0
execute store result storage loop index int 1 run scoreboard players get .i loop
function general:${guiName}/check_empty_slot with storage minecraft:loop`;
    const getNameStrContent = `$data modify storage minecraft:${guiName}_used settings.name set string entity @s text -$(len) -2
kill @s
scoreboard players reset .i loop
function general:${guiName}/get_empty_slot`;

    const getNameContent = `function general:${guiName}/load_once

data modify entity 00000070-0000-006e-0000-007400000078 text set value '{"selector":"@p"}'

# calcualte length of the name
execute store result score .str_len pnt.left run data get entity 00000070-0000-006e-0000-007400000078 text
scoreboard players remove .str_len pnt.left 226
scoreboard players operation .str_len pnt.left /= #4 pnt.left
execute store result storage pnt args.len int 1 run scoreboard players add .str_len pnt.left 2
execute as 00000070-0000-006e-0000-007400000078 run function general:${guiName}/get_name_str with storage pnt args`;

    const noFunctionContent = 'return 0';

    const tickContent = `
execute store success score @a ${guiName}_inv_check run clear @a #general:${guiName}_items{${guiName}:1b} 0
execute at @a[scores={${guiName}_inv_check=1..}] run function general:${guiName}/get_name
execute at @a[scores={${guiName}_inv_check=1..}] run function general:${guiName}/update_varible with storage ${guiName} varibles`;


    // Check if the JSON data contains variables
    if (hasVariables) {
        if (uniqueVariables.size > 0) {
            // Convert the set of unique variables to an array
            const uniqueVariablesArray = Array.from(uniqueVariables).map(variable => variable.slice(2, -1));

            // Generate the varible_init.mcfunction content
            const varibleInitContent = `data modify storage ${guiName} varibles set value {${uniqueVariablesArray.map(variable => `"${variable}":"[defualt value]"`).join(',')}}
function general:${guiName}/init with storage minecraft:${guiName} varibles`;
            // Add content for varible_init.mcfunction and update_varible.mcfunction
            additionalFiles['varible_init.mcfunction'] = varibleInitContent;

            // Initialize an array to store item replace commands
            const itemReplaceCommands = [];
           
            for (let index = 0; index < 27; index++) {
                hasVariables = false;
                const slot = jsonData.slots[index][`slot:${index}`];
                const itemName = slot.Item.id;
                const tagParts = [];
                const itemCommand = `{${guiName}:1b`

                if (slot.Name.length > 0 || slot.Lore.length > 0) {
                    const displayTag = {};

                    if (slot.Name.length > 0) {
                        const nameArray = slot.Name.map(item => {
                            if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                                hasVariables = true; // Set the variable flag 
                                uniqueVariables.add(item.text); // Add unique variable to the set
                            }
                            return JSON.stringify(item);
                        });
                        displayTag.Name = `[${nameArray.join(",")}]`;
                    }
        
                    if (slot.Lore.length > 0) {
                        displayTag.Lore = slot.Lore.map(line => {
        
                            line.forEach(item => {
                                if (item.text.startsWith("$(") && item.text.endsWith(")")) {
                                    hasVariables = true; // Set the variable flag 
                                    uniqueVariables.add(item.text); // Add unique variable to the set
                                }
                            });
        
                            return JSON.stringify(line);
                        });
                    }
                    if (slot.Function) {
                        displayTag.Function = `${slot.Function}`;
                    }
        
                    tagParts.push(`display:${JSON.stringify(displayTag)}`);
                }
                const tag = tagParts.join(',');
                const itemCommandFullTag = `${itemCommand}${tag ? `,${tag}` : ''}`;
                if (hasVariables){
                itemReplaceCommands.push(`$item replace entity @e[tag=${guiName}] container.${index} with ${itemName}${itemCommandFullTag}}`);
                }
            }

            
            const updateVaribleContent = itemReplaceCommands.join('\n');

            additionalFiles['update_varible.mcfunction'] = updateVaribleContent;
        }
    }

    

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

    // Create a new JSZip instance
    const zip = new JSZip();

    // Create a folder for the GUI name
    const guiFolder = zip.folder(guiName);

    // Add each file to the GUI folder
    for (const fileName in filesToGenerate) {
        guiFolder.file(fileName, filesToGenerate[fileName]);
    }

    // Add the additional files to the GUI folder
    for (const fileName in additionalFiles) {
        guiFolder.file(fileName, additionalFiles[fileName]);
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
// Add an event listener to the download button
document.getElementById('download-button').addEventListener('click', () => {
    generateFiles(jsonData); // Pass the JSON data to the generation function
});

