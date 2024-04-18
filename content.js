// Find class names
const HUMAN_MESSAGE_BUBBLE_CLASS = findClassName('Message_humanMessageBubble');
const BOT_MESSAGE_BUBBLE_CLASS = findClassName('Message_botMessageBubble');

// Check if class names were found
if (!HUMAN_MESSAGE_BUBBLE_CLASS || !BOT_MESSAGE_BUBBLE_CLASS) {
    console.error(`classes not found: Message_humanMessageBubble or Message_botMessageBubble`);
}

// Function to find the actual class name from the human-readable name
function findClassName(humanReadableName) {
    const regex = new RegExp(`${humanReadableName}_+[a-zA-Z0-9_-]+`, 'g');
    const matches = Array.from(document.documentElement.outerHTML.matchAll(regex));
    return matches.length > 0 ? `.${matches[0][0]}` : null;
}

// Get the currently visible top bubble in the conversation log
function getTopBubble() {
    return document.querySelectorAll(`${HUMAN_MESSAGE_BUBBLE_CLASS}, ${BOT_MESSAGE_BUBBLE_CLASS}`)[0];
}

async function scrollToTop() {
    return new Promise((resolve, reject) => {
        // Start scrolling up
        const scrollingInterval = setInterval(() => {
            getTopBubble().scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1000);

        // Preiodically check if scrolling is done
        let topBubble = getTopBubble();
        const testingInterval = setInterval(() => {
            const newTopBubble = getTopBubble();
            if (topBubble === newTopBubble) {
                // Clear intervals when done
                clearInterval(testingInterval);
                clearInterval(scrollingInterval);
                resolve();  // Resolve the promise
            }
            topBubble = newTopBubble;
        }, 2000);
    });
}

// Export the entire converation
function getTranscript({includeHuman, includeBot}) {
  console.log({includeHuman, includeBot});

  // Find more class names now that the entire conversation is loaded
  const BOT_NAME_CLASS = findClassName('BotInfoCardHeader_botName');
  const CONVERSATION_NAME_CLASS = findClassName('ChatHeader_textOverflow');
  const ATTACHMENT_CLASS = findClassName('Attachments_attachment');
  const IMAGE_ATTACHMENT_CLASS = findClassName('FileInfo_image');
  const FILE_TITLE_CLASS = findClassName('FileInfo_title');
  const FILE_TYPE_CLASS = findClassName('FileInfo_fileType');
  const MARKDOWN_CONTAINER_CLASS = findClassName('Markdown_markdownContainer');

  const botName = document.querySelector(BOT_NAME_CLASS)?.textContent.split('-')[0] || 'Bot';
  const conversationName = document.querySelector(CONVERSATION_NAME_CLASS)?.textContent;
  let messages = Array.from(document.querySelectorAll(`${HUMAN_MESSAGE_BUBBLE_CLASS}, ${BOT_MESSAGE_BUBBLE_CLASS}`));
  messages = messages.filter(msg => {
      if (msg.classList.contains(HUMAN_MESSAGE_BUBBLE_CLASS.slice(1)) && includeHuman) {
          return true;
      }
      if (msg.classList.contains(BOT_MESSAGE_BUBBLE_CLASS.slice(1)) && includeBot) {
          return true;
      }
      return false;
  });
  const filename = `${conversationName.replace(/[^\w]+/g, '_')} (${messages.length} messages).txt`;

  const text =
      `Conversation with ${botName} (${messages.length} messages)\n` +
      messages.map(msg => {
        const type = msg.classList.contains(HUMAN_MESSAGE_BUBBLE_CLASS.slice(1)) ? 'Human' : botName;
        const attachments = Array.from(msg.querySelectorAll(ATTACHMENT_CLASS)).map(attachment => {
            const isImage = IMAGE_ATTACHMENT_CLASS && attachment.classList.contains(IMAGE_ATTACHMENT_CLASS.slice(1));
            if (isImage) {
                const imageURL = attachment.getAttribute('src');
                return `- [Image] [${imageURL}]`;
            } else {
                const fileName = attachment.querySelector(FILE_TITLE_CLASS)?.textContent;
                const fileURL = attachment.getAttribute('href');
                return `- [${fileName}](${fileURL})`;
            }
        });
        const attachmentsList = attachments.length > 0 ? `\nAttached files:\n${attachments.join('\n')}\n` : '';
        const messageContent = msg.querySelector(MARKDOWN_CONTAINER_CLASS)?.textContent;
        return `\n${type}:\n\n${messageContent}${attachmentsList}`;
    }).join('\n');

    return {
        filename,
        text,
    };
}

// Listen for a message from the popup
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "startDownload") {
        await scrollToTop();
        const {filename, text} = getTranscript({includeHuman: request.includeHuman, includeBot: request.includeBot});
        chrome.runtime.sendMessage({action: "completeDownload", filename, text});
    }
});
