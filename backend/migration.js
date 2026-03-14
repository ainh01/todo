require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Key  = require('./src/models/Key');
const Task = require('./src/models/Task');

// NOTE: After migration, User.tasks[] is left in place but considered deprecated.
// It will not be removed automatically to allow rollback.
// Remove manually once migration is verified.

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const users = await User.find({});
  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    try {
      // Idempotent: upsert Key doc
      await Key.updateOne(
        { userId: user._id, key: 'Default' },
        { $setOnInsert: { userId: user._id, key: 'Default' } },
        { upsert: true }
      );

      // Idempotent: upsert Tasks doc (only set tasks if inserting fresh)
      const existingTaskDoc = await Task.findOne({ userId: user._id, key: 'Default' });
      if (!existingTaskDoc) {
        await Task.create({ userId: user._id, key: 'Default', tasks: user.tasks || [] });
        console.log(`  [${user.email}] Tasks doc created (${user.tasks?.length || 0} tasks)`);
      } else {
        console.log(`  [${user.email}] Tasks doc already exists — skipped`);
      }

      // Set currentKey if not already set
      if (!user.currentKey || user.currentKey !== 'Default') {
        user.currentKey = 'Default';
        await user.save();
        console.log(`  [${user.email}] currentKey set to Default`);
      } else {
        console.log(`  [${user.email}] currentKey already Default — skipped`);
      }

    } catch (err) {
      console.error(`  [${user.email}] ERROR: ${err.message}`);
    }
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
