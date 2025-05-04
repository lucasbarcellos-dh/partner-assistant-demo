const path = require('path');
const fs = require('fs');

/**
 * Sets up the vector store and uploads all files in the files folder.
 * @param {OpenAI} openai - The OpenAI client instance.
 * @returns {Promise<string>} The created vector store ID.
 */
async function setupVectorStore(openai) {
  try {
    // 1. Create vector store
    const vectorStore = await openai.vectorStores.create({ name: 'partner_knowledge_base' });
    const vectorStoreId = vectorStore.id;

    // 2. Read all files in the files directory
    const filesDir = path.join(__dirname, '../files');
    const fileNames = fs.readdirSync(filesDir);

    for (const fileName of fileNames) {
      const filePath = path.join(filesDir, fileName);
      const fileStream = fs.createReadStream(filePath);
      const file = await openai.files.create({
        file: fileStream,
        purpose: 'assistants',
      });
      // 3. Add file to vector store
      await openai.vectorStores.files.create(vectorStoreId, { file_id: file.id });
      console.log(`Added file to vector store: ${fileName}`);
    }

    console.log('Vector store and all files setup complete:', vectorStoreId);
    return vectorStoreId;
  } catch (err) {
    console.error('Error setting up vector store:', err);
    throw err;
  }
}

module.exports = { setupVectorStore };