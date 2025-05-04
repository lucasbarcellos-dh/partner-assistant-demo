const path = require('path');
const fs = require('fs');
/**
 * Sets up the vector store and uploads the sales.md file.
 * @param {OpenAI} openai - The OpenAI client instance.
 * @returns {Promise<string>} The created vector store ID.
 */
async function setupVectorStore(openai) {
  try {
    // 1. Create vector store
    const vectorStore = await openai.vectorStores.create({ name: 'sales_knowledge_base' });
    const vectorStoreId = vectorStore.id;

    // 2. Upload sales.md file using a readable stream
    const filePath = path.join(__dirname, '../files/sales.md');
    const fileStream = fs.createReadStream(filePath);
    const file = await openai.files.create({
      file: fileStream,
      purpose: 'assistants',
    });

    // 3. Add file to vector store
    await openai.vectorStores.files.create(vectorStoreId, { file_id: file.id });

    console.log('Vector store and file setup complete:', vectorStoreId);
    return vectorStoreId;
  } catch (err) {
    console.error('Error setting up vector store:', err);
    throw err;
  }
}

module.exports = { setupVectorStore };