(function() {
  // Function to find the actual class name from the human-readable name
  function findClassName(humanReadableName) {
    const regex = new RegExp(`${humanReadableName}_+[a-zA-Z0-9_-]+`, 'g');
    const matches = Array.from(document.documentElement.outerHTML.matchAll(regex));
    return matches.length > 0 ? `.${matches[0][0]}` : null;
  }

  // Find class names
  const HUMAN_MESSAGE_BUBBLE_CLASS = findClassName('Message_humanMessageBubble');
  const BOT_MESSAGE_BUBBLE_CLASS = findClassName('Message_botMessageBubble');

  // Check if class names were found
  if (!HUMAN_MESSAGE_BUBBLE_CLASS || !BOT_MESSAGE_BUBBLE_CLASS) {
    console.error(`classes not found: Message_humanMessageBubble or Message_botMessageBubble`);
    return;
  }

  // Scroll up until the entire conversation is loaded and then export it
  let topBubble = getTopBubble();
  topBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const loadingInterval = setInterval(() => {
    // If current top buble is the same as last time it means we're done loading
    const newTopBubble = getTopBubble();
    if (topBubble === newTopBubble) {
      clearInterval(loadingInterval);
      exportConversation();
    }
    topBubble = newTopBubble;
  }, 2000);

  function getTopBubble() {
    return document.querySelectorAll(`${HUMAN_MESSAGE_BUBBLE_CLASS}, ${BOT_MESSAGE_BUBBLE_CLASS}`)[0];
  }

  function exportConversation() {
    // Find more class names now that the entire conversation is loaded
    const BOT_NAME_CLASS = findClassName('BotInfoCardHeader_botName');
    const CONVERSATION_NAME_CLASS = findClassName('ChatHeader_textOverflow');
    const ATTACHMENT_CLASS = findClassName('Attachments_attachment');
    const IMAGE_ATTACHMENT_CLASS = findClassName('FileInfo_image');
    const FILE_TITLE_CLASS = findClassName('FileInfo_title');
    const FILE_TYPE_CLASS = findClassName('FileInfo_fileType');
    const MARKDOWN_CONTAINER_CLASS = findClassName('Markdown_markdownContainer');

    const messages = Array.from(document.querySelectorAll(`${HUMAN_MESSAGE_BUBBLE_CLASS}, ${BOT_MESSAGE_BUBBLE_CLASS}`));
    const botName = document.querySelector(BOT_NAME_CLASS)?.textContent.split('-')[0] || 'Bot';
    const conversationName = document.querySelector(CONVERSATION_NAME_CLASS)?.textContent;

    // Parse messages
    const output = `Conversation with ${botName} (${messages.length} messages)\n` + messages.map(msg => {
      const type = msg.classList.contains(HUMAN_MESSAGE_BUBBLE_CLASS.slice(1)) ? 'Human' : botName;
      const attachments = Array.from(msg.querySelectorAll(ATTACHMENT_CLASS)).map(attachment => {
        const isImage = attachment.classList.contains(IMAGE_ATTACHMENT_CLASS.slice(1));
        if (isImage) {
          const imageURL = attachment.getAttribute('src');
          const imageAlt = attachment.getAttribute('alt');
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

    // Create and download file
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(output);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `${conversationName.replace(/\s+/g, '_')} (${messages.length} messages).txt`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
})();
