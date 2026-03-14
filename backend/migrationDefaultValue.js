require('dotenv').config();
const mongoose = require('mongoose');

async function migrateDefaultValue() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.db
    .collection('users')
    .updateMany(
      { $or: [{ currentKey: { $exists: false } }, { currentKey: null }, { currentKey: '' }] },
      { $set: { currentKey: 'Default' } }
    );

  console.log(`Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

migrateDefaultValue().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
