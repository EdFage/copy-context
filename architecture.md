# Chrome Extension: 'Copy with Context' - MVP Architecture

## Architecture Overview
A Chrome extension with service worker and content scripts that captures selected text and page context, converting HTML to markdown with Turndown.js.

## Components

### 1. Service Worker (service-worker.js)
- Creates and manages the "Copy with Context" context menu item
- Listens for menu click events
- Communicates with the active tab's content script

### 2. Content Script (content.js)
- Injected into web pages
- Receives messages from service worker
- Accesses DOM to get selected text and page context
- Uses Turndown.js to convert HTML to markdown
- Copies formatted output to clipboard

### 3. Manifest (manifest.json)
- Declares permissions (contextMenus, clipboardWrite)
- Registers service worker and content scripts
- Defines minimum required metadata:
  - manifest_version: 3
  - name: "Copy with Context"
  - version: "0.1"

## Data Flow

1. User selects text on a webpage
2. User right-clicks and selects "Copy with Context" from context menu
3. Service worker captures the click event
4. Service worker sends message to content script in active tab
5. Content script:
   - Gets selected text from window.getSelection()
   - Gets page DOM structure
   - Converts page to markdown using Turndown.js
   - Formats selected text + context
   - Writes to clipboard

## Key Implementation Details

### Context Menu Creation
```javascript
// service-worker.js
chrome.contextMenus.create({
  id: "copyWithContext",
  title: "Copy with Context",
  contexts: ["selection"]
});
```

### Message Passing
```javascript
// service-worker.js
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyWithContext") {
    chrome.tabs.sendMessage(tab.id, { action: "copyWithContext" });
  }
});
```

### HTML to Markdown Conversion
```javascript
// content.js
const turndownService = new TurndownService();
const markdown = turndownService.turndown(document.body.innerHTML);
```

### Output Format
```
<user_selected_text>
[user selected text]
</user_selected_text>

<full_page_content>
[markdown of full page]
</full_page_content>

<page_metadata>
<url>[current page URL]</url>
<title>[page title]</title>
</page_metadata>
```

## Project File Structure
```
copy-with-context/
├── manifest.json
├── service-worker.js
├── content.js
└── lib/
    └── turndown.js
```