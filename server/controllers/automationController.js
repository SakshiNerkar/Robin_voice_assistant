/**
 * @file automationController.js
 * @description Master logic for autonomous code and file generation.
 */

const codeLogic = require('../../ai/codeHandler');

const handleSystemGeneration = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No topic defined for generation." });

    console.log(`[Automation Node] Initiating Generation: "${prompt}"`);
    try {
        const resultPayload = await codeLogic.generateCode(prompt);
        res.json(resultPayload);
    } catch (automationError) {
        console.error("[Automation Node] Critical Failure during code synthesis:", automationError);
        res.status(500).json({ error: "Generation module failed to synthesize artifact." });
    }
};

module.exports = {
    handleSystemGeneration
};
