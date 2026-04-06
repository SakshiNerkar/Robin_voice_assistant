/**
 * @file intelligenceController.js
 * @description Controller for LLM-driven conversational logic.
 */

const astraIntelligence = require('../ai/aiHandler');

const handleChatInteraction = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Empty prompt" });

    console.log(`[Intelligence Node] Conversing on Topic: "${prompt}"`);
    try {
        const resolutionText = await astraIntelligence.getResponse(prompt);
        res.json({ success: true, response: resolutionText });
    } catch (networkError) {
        console.error("[Intelligence Node] Cloud Retrieval Error:", networkError);
        res.status(500).json({ success: false, response: "I encountered a connectivity issue." });
    }
};

module.exports = {
    handleChatInteraction
};
