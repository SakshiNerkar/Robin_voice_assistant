/**
 * @file interactionController.js
 * @description Logic for processing user transcripts into system actions.
 * @author Astra Nexus Team
 */

const nexusRegistry = require('../../modules/system/commandRegistry');

const processNexusIntent = async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: "Empty command payload received." });
    }

    console.log(`[Interaction Node] Analyzing Intent: "${command}"`);
    try {
        const resolution = await nexusRegistry.processUnifiedCommand(command.toLowerCase().trim());
        
        if (resolution) {
            // Package response for delivery to the client layer
            return res.json({ 
                handled: true, 
                success: resolution.success, 
                transcript: resolution.response, 
                isSuggestion: resolution.isSuggestion || false, 
                callbackAction: resolution.action 
            });
        }

        // Pass through to generic AI if no modular handler triggered
        return res.json({ handled: false, message: "Standardizing for conversational model." });
    } catch (operationError) {
        console.error("[Interaction Node] Execution Failure:", operationError);
        return res.status(500).json({ handled: true, success: false, transcript: "System encountered an error processing your request." });
    }
};

module.exports = {
    processNexusIntent
};
