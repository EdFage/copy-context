const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Remove elements that are likely UI clutter or not part of the main content
turndownService.remove(['script', 'style', 'noscript', 'iframe', 'svg', 'button', 'input', 'nav', 'footer']);

// Customize handling of certain elements
turndownService.addRule('ignoreClasses', {
    filter: function(node) {
        // Check if the node has classes that suggest it's not main content
        if (node.classList) {
            const nonContentClasses = ['menu', 'sidebar', 'navigation', 'nav', 'ad', 'banner', 'footer', 'header'];
            for (const cls of nonContentClasses) {
                if (node.classList.contains(cls)) return true;
            }
        }
        return false;
    },
    replacement: function() {
        return '';
    }
});

/**
 * Listens for messages from the service worker and handles the "copyWithContext" action
 * 
 * @param {Object} message - Message object from service worker
 * @param {string} message.action - Action identifier, expected to be "copyWithContext"
 * @param {Object} sender - Information about the sender of the message
 * @param {Function} sendResponse - Callback function to send response back to sender
 * @throws {Error} If no text is selected
 * @throws {Error} If clipboard write fails
 * @throws {Error} If HTML to markdown conversion fails
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyWithContext") {
        try {
            const selectedText = window.getSelection().toString();
            if (!selectedText) {
                throw new Error("No text selected");
            }

            const pageTitle = document.title;
            const pageUrl = window.location.href;
            
            const pageHtml = document.body.innerHTML;
            const markdown = turndownService.turndown(pageHtml);
            
            const formattedOutput = 
            `explain the user_selected_text in context\n\n` +
            `<user_selected_text>\n${selectedText}\n</user_selected_text>\n\n` +
            `<full_page_content>\n${markdown}\n</full_page_content>\n\n` +
            `<page_metadata>\n` +
            `<url>${pageUrl}</url>\n` +
            `<title>${pageTitle}</title>\n` +
            `</page_metadata>`;

            navigator.clipboard.writeText(formattedOutput)
            .then(() => {
                sendResponse({ success: true, message: "Content copied to clipboard" });
            })
            .catch(error => {
                console.error("Failed to write to clipboard:", error);
                sendResponse({ success: false, error: "Failed to write to clipboard" });
            });

        } catch (error) {
            console.error("Error:", error);
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
})

