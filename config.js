/**
 * @file config.js
 * @description Centralized configuration settings for the Astra Nexus AI system.
 * @author Astra Nexus Team
 * @version 1.0.0
 */

const path = require('path');

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 5500,
        host: 'localhost',
    },

    // AI & External APIs
    ai: {
        fallbackProvider: 'PollinationsAI',
        baseUrl: 'https://text.pollinations.ai/',
    },

    // Storage Paths
    paths: {
        data: path.join(__dirname, 'data'),
        history: path.join(__dirname, 'data', 'history.json'),
        logs: path.join(__dirname, 'logs'),
        memory: path.join(__dirname, 'data', 'memory.json'),
        generatedSites: path.join(__dirname, 'generated', 'sites'),
        generatedFiles: path.join(__dirname, 'generated', 'files'),
        modules: path.join(__dirname, 'modules'),
        plugins: path.join(__dirname, 'plugins'),
        knowledge: path.join(__dirname, 'knowledge'),
    },

    // Security & Logic Constants
    security: {
        privacyModeDefault: false,
        maxCommandHistory: 500,
    }
};

module.exports = config;
