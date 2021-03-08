function createTextMessage(text) {
  return {
    type: "text",
    text: text,
  };
}

function createImageMessage(originalContentUrl, previewImageUrl) {
  return {
    type: "image",
    originalContentUrl: originalContentUrl,
    previewImageUrl: previewImageUrl,
  };
}

module.exports = {
  createTextMessage: createTextMessage,
  createImageMessage: createImageMessage,
};
