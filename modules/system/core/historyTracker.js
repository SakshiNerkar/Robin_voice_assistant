const fs = require('fs');
const path = require('path');
const config = require('../../../config');

const historyFilePath = config.paths.history;

function ensureHistoryPath() {
    const dir = path.dirname(historyFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(historyFilePath)) fs.writeFileSync(historyFilePath, JSON.stringify([]));
}

function logCommand(command, privacyMode) {
    if (privacyMode) return;
    ensureHistoryPath();
    const history = JSON.parse(fs.readFileSync(historyFilePath));
    history.push({ command, timestamp: new Date().toISOString() });
    if (history.length > 500) history.shift();
    fs.writeFileSync(historyFilePath, JSON.stringify(history));
}

function getCommandStats() {
    ensureHistoryPath();
    const history = JSON.parse(fs.readFileSync(historyFilePath));
    return { todayCount: history.length, mostUsed: [] };
}

module.exports = { logCommand, getCommandStats };
