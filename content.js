(function() {
  const messages = Array.from(document.querySelectorAll('.Message_humanMessageBubble__DtRxA, .Message_botMessageBubble__aYctV'));
  const botName = document.querySelector('.BotInfoCardHeader_botName__IPFrb')?.textContent.split('-')[0] || 'Bot';
  const conversationName = document.querySelector('.ChatHeader_textOverflow__8Kqkz')?.textContent;

  const output = `Conversation with ${botName}:\n` + messages.map(msg => {
    const type = msg.classList.contains('Message_humanMessageBubble__DtRxA') ? 'Human' : botName;
    return `\n${type}:\n\n${msg.textContent}`;
  }).join('\n');

  const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(output);
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', dataUri);
  downloadLink.setAttribute('download', `${conversationName.replace(/\s+/g, '_')}.txt`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
})();
