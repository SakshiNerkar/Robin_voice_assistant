const fs = require('fs');
const path = require('path');
const historyTracker = require('./core/historyTracker');

const commandRegistry = [];
let isPrivacyMode = false;

function loadModulesFromDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            loadModulesFromDirectory(fullPath);
        } else if (item.endsWith('.js') && item !== 'commandRegistry.js' && item !== 'historyTracker.js') {
            try {
                const loadedModule = require(fullPath);
                if (loadedModule.intentData && Array.isArray(loadedModule.intentData) && typeof loadedModule.execute === 'function') {
                    commandRegistry.push({
                        intents: loadedModule.intentData,
                        execute: loadedModule.execute,
                        name: item.replace('.js', '')
                    });
                }
            } catch (e) {}
        }
    });
}

function initializeRegistry() {
    loadModulesFromDirectory(path.join(__dirname, '..'));
    loadModulesFromDirectory(path.join(__dirname, '..', '..', 'plugins'));
}

async function processUnifiedCommand(commandStr) {
    historyTracker.logCommand(commandStr, isPrivacyMode);
    if (commandStr === "enable privacy mode" || commandStr === "disable privacy mode") {
        isPrivacyMode = commandStr.includes("enable");
        return { success: true, response: `Privacy mode ${isPrivacyMode ? 'enabled' : 'disabled'}.` };
    }
    for (const mod of commandRegistry) {
        for (const intent of mod.intents) {
            let isMatch = false;
            let capturedData = null;
            if (intent instanceof RegExp) {
                const match = commandStr.match(intent);
                if (match) { isMatch = true; capturedData = match; }
            } else if (typeof intent === 'string' && commandStr.includes(intent)) {
                isMatch = true; capturedData = commandStr;
            }
            if (isMatch) {
                try {
                    const result = await mod.execute(capturedData, commandStr);
                    if (result) return result;
                } catch (e) { isMatch = false; }
            }
        }
    }
    return null;
}

initializeRegistry();

module.exports = { processUnifiedCommand };
