chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

/**
 * Initializes the extension by creating the context menu item
 * 
 * @throws {Error} If context menu creation fails
 */
function initializeExtension() {
  chrome.contextMenus.create({
    id: "copyWithContext",
    title: "Copy with Context",
    contexts: ["selection"]
  }, (error) => {
    if (error) {
      console.error("Failed to create context menu:", error);
    }
  });
}

/**
 * Handles the context menu click event and sends a message to the content script
 * 
 * @param {Object} info - Information about the context menu item clicked
 * @param {Object} tab - Information about the active tab
 * @throws {Error} If no active tab is found or message sending fails
 */
function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "copyWithContext") {
    if (!tab) {
      console.error("No active tab found");
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: "copyWithContext" }, (response) => {
      console.log("Message sent to content script");
      if (chrome.runtime.lastError) {
        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
      }
    });
  }
}