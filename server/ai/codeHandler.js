const fs = require('fs');
const path = require('path');

/**
 * Connects to Pollinations AI to generate a single-file raw HTML website.
 * @param {string} topic The user's requested website topic
 * @returns {Promise<string>} The filename of the newly created website, or null if failed
 */
async function generateWebsite(topic) {
    console.log(`[ASTRA] Querying AI to build a website about: "${topic}"`);

    // Strict system prompt to ensure ONLY raw HTML is returned
    const systemPrompt = "You are ASTRA, an expert Web Developer AI. You must generate a complete, beautiful, modern, single-page website about the user's topic. Include all CSS inside a <style> tag and all JS within <script> tags. Use modern aesthetics like gradients, flexbox, and rounded corners. YOUR ENTIRE RESPONSE MUST START WITH <!DOCTYPE html> AND CONTAIN NO MARKDOWN BACKTICKS (DO NOT WRAP IN ```html). RETURN RAW HTML ONLY.";
    const fullQuery = `${systemPrompt}\nUser Topic: ${topic}`;

    try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullQuery)}`);

        if (response.ok) {
            let htmlContent = await response.text();

            // Cleanup in case the AI stubbornly added markdown blocks
            htmlContent = htmlContent.trim();
            if (htmlContent.startsWith("```html")) htmlContent = htmlContent.replace("```html", "");
            if (htmlContent.startsWith("```")) htmlContent = htmlContent.replace("```", "");
            if (htmlContent.endsWith("```")) htmlContent = htmlContent.slice(0, -3);

            // Ensure minimum structure
            if (!htmlContent.toLowerCase().includes("<!doctype html>")) {
                htmlContent = "<!DOCTYPE html>\n" + htmlContent;
            }

            // Create a unique filename based on the topic and timestamp
            const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 20);
            const fileName = `site_${safeTopic}_${Date.now()}.html`;

            // Save it to the public/websites directory
            const filePath = path.join(__dirname, '..', 'public', 'websites', fileName);
            fs.writeFileSync(filePath, htmlContent, 'utf8');

            console.log(`[ASTRA] Website generated successfully: ${fileName}`);
            return fileName;
        } else {
            console.error(`[ASTRA] Failed to fetch from AI: ${response.status}`);
            return null;
        }

    } catch (error) {
        console.error("[ASTRA] Website Generation Error:", error.message);
        return null;
    }
}

module.exports = {
    generateWebsite
};
