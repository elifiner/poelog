(function() {
  // Class name constants
  const HUMAN_MESSAGE_BUBBLE_CLASS = 'Message_humanMessageBubble__DtRxA';
  const BOT_MESSAGE_BUBBLE_CLASS = 'Message_botMessageBubble__aYctV';
  const BOT_NAME_CLASS = 'BotInfoCardHeader_botName__IPFrb';
  const CONVERSATION_NAME_CLASS = 'ChatHeader_textOverflow__8Kqkz';
  const ATTACHMENT_CLASS = 'Attachments_attachment___L7ZA';
  const IMAGE_ATTACHMENT_CLASS = 'FileInfo_image__M_cAh';
  const FILE_TITLE_CLASS = 'FileInfo_title__sUM2l';
  const FILE_TYPE_CLASS = 'FileInfo_fileType__KZDVV';
  const FILE_METADATA_CLASS = 'FileInfo_metadata__Wu4uZ';
  const MARKDOWN_CONTAINER_CLASS = 'Markdown_markdownContainer__Tz3HQ';

  // scroll the conversation into view and then export it
  let topBubble = getTopBubble();
  topBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const loadingInterval = setInterval(() => {
    const newTopBubble = getTopBubble();
    if (topBubble === newTopBubble) {
      console.log('Loading complete!');
      clearInterval(loadingInterval);
      exportConversation();
    }
    topBubble = newTopBubble;
  }, 2000);

  function getTopBubble() {
    return document.querySelectorAll(`.${HUMAN_MESSAGE_BUBBLE_CLASS}, .${BOT_MESSAGE_BUBBLE_CLASS}`)[0];
  }

  function exportConversation() {
    const messages = Array.from(document.querySelectorAll(`.${HUMAN_MESSAGE_BUBBLE_CLASS}, .${BOT_MESSAGE_BUBBLE_CLASS}`));
    const botName = document.querySelector(`.${BOT_NAME_CLASS}`)?.textContent.split('-')[0] || 'Bot';
    const conversationName = document.querySelector(`.${CONVERSATION_NAME_CLASS}`)?.textContent;

    const output = `Conversation with ${botName} (${messages.length} messages)\n` + messages.map(msg => {
      const type = msg.classList.contains(HUMAN_MESSAGE_BUBBLE_CLASS) ? 'Human' : botName;
      const attachments = Array.from(msg.querySelectorAll(`.${ATTACHMENT_CLASS}`)).map(attachment => {
        const isImage = attachment.classList.contains(IMAGE_ATTACHMENT_CLASS);
        if (isImage) {
          const imageURL = attachment.getAttribute('src');
          const imageAlt = attachment.getAttribute('alt');
          return `- [Image] [${imageURL}]`;
        } else {
          const fileInfo = attachment.querySelector(`.${FILE_TITLE_CLASS}`)?.textContent;
          const fileType = attachment.querySelector(`.${FILE_TYPE_CLASS}`)?.textContent;
          const fileSize = attachment.querySelector(`.${FILE_METADATA_CLASS}`)?.textContent.split('Â·')[1]?.trim();
          const fileURL = attachment.getAttribute('href');
          return `- [${fileInfo}](${fileURL}) (${fileType}, ${fileSize})`;
        }
      });
      const attachmentsList = attachments.length > 0 ? `\nAttached files:\n${attachments.join('\n')}\n` : '';
      const messageContent = msg.querySelector(`.${MARKDOWN_CONTAINER_CLASS}`)?.textContent;
      return `\n${type}:\n\n${messageContent}${attachmentsList}`;
    }).join('\n');

    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(output);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `${conversationName.replace(/\s+/g, '_')} (${messages.length} messages).txt`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
})();
