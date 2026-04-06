/**
 * Free AI Fallback Handler
 * This module connects to a free, public text-generation API endpoint 
 * to answer conversational questions without requiring a paid API key.
 */

async function generateResponse(prompt) {
    try {
        console.log(`[ASTRA] Querying Pollinations AI: "${prompt}"`);

        // Using Pollinations AI - a stable, fast, keyless free endpoint!
        const systemPrompt = "You are ASTRA, a friendly and concise desktop AI voice assistant. Respond with very short answers suitable for text-to-speech reading. Do not use complex markdown.";
        const fullQuery = `${systemPrompt}\nUser: ${prompt}`;

        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullQuery)}`);

        if (response.ok) {
            const textData = await response.text();
            return textData.trim();
        } else {
            return "I couldn't process an answer from my free AI provider right now.";
        }

    } catch (error) {
        console.error("[ASTRA] Free API Generation Error:", error.message);
        return "I am unable to reach my AI brain. The server connection might have failed.";
    }
}

module.exports = {
    generateResponse
};
