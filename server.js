/**
 * @file server.js
 * @description Professional entry point for the Astra Nexus AI Backend.
 * Centralizes command processing, AI conversation, and code generation services.
 */

// Load environmental variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Modular configuration access
const appConfig = require('./config');

// System Controllers
const interactionController = require('./server/controllers/interactionController');
const intelligenceController = require('./server/controllers/intelligenceController');
const automationController = require('./server/controllers/automationController');

// Initialize Astra Nexus Instance
const astraApp = express();
const SERVICE_PORT = appConfig.server.port;

// Base Middleware Stack
astraApp.use(cors());
astraApp.use(express.json());
// Serve the professional client interface
astraApp.use(express.static(path.join(__dirname, 'client')));

// --- CORE SERVICE ENDPOINTS ---

/**
 * REST Endpoint for modular command execution.
 * Routes raw user voice/text transcripts to the Astra Command Registry.
 */
astraApp.post('/api/nexus/process', interactionController.processNexusIntent);

/**
 * High-level conversational AI interface.
 * Connects the desktop bridge to the large language model providers.
 */
astraApp.post('/api/nexus/chat', intelligenceController.handleChatInteraction);

/**
 * Autonomous generation service.
 * Handles the creation of web artifacts and project structures.
 */
astraApp.post('/api/nexus/generate', automationController.handleSystemGeneration);

// Launch Service Listener
astraApp.listen(SERVICE_PORT, () => {
    console.log("\n" + "=".repeat(45));
    console.log(`🌌 ASTRA NEXUS: Professional Intelligence Active`);
    console.log(`📡 Service Node Operational: http://localhost:${SERVICE_PORT}`);
    console.log("=".repeat(45) + "\n");
});
