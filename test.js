const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://mincaai:baekdqNvwD20wGYE@cluster0.u30sb.mongodb.net`;
const client = new MongoClient(uri);

async function findRelatedStock(inputRaw) {
  console.log('Fetching related stock info...');

  try {
    const input = inputRaw.toUpperCase();
    const name = input.replace(/\s*\(.*?\)\s*/g, '').trim();
    const match = input.match(/\((.*?)\)/);
    const univers = match ? match[1] : '';

    await client.connect();
    const db = client.db('Vixis');
    const collection = db.collection('stock');

    // Step 1: Find the most related name
    const relatedNameDocs = await collection
      .find({ NAME: { $regex: name, $options: 'i' } })
      .sort({ SCORING: -1 })
      .limit(1)
      .toArray();

    const relatedName =
      relatedNameDocs.length > 0 ? relatedNameDocs[0].NAME : name;

    // Step 2: Find the most related univers using the found name
    const query = { NAME: relatedName };
    if (univers) {
      query.UNIVERS = { $regex: univers, $options: 'i' };
    }

    const relatedUniversDoc = await collection.findOne(query);

    return relatedUniversDoc || { message: 'No matching document found.' };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: error.message };
  } finally {
    await client.close();
  }
}

// Example usage
const inputString = 'TESLA (EV)';
findRelatedStock(inputString).then(console.log);
