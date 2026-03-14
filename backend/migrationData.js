require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./src/models/Task');

async function migrateData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Bypass Mongoose schema — read raw user documents directly
  // so we get the deprecated tasks[] field even if removed from User model
  const rawUsers = await mongoose.connection.db
    .collection('users')
    .find({})
    .toArray();

  console.log(`Found ${rawUsers.length} users`);

  let migrated = 0, skipped = 0, empty = 0, errors = 0;

  for (const user of rawUsers) {
    try {
      const rawTasks = user.tasks || [];

      if (rawTasks.length === 0) {
        console.log(`  [${user.email}] No tasks in raw user doc — skipping`);
        empty++;
        continue;
      }

      const existingDoc = await Task.findOne({ userId: user._id, key: 'Default' });

      if (!existingDoc) {
        console.log(`  [${user.email}] No Tasks doc found — creating with ${rawTasks.length} tasks`);
        await Task.create({ userId: user._id, key: 'Default', tasks: rawTasks });
        migrated++;
        continue;
      }

      if (existingDoc.tasks.length > 0) {
        console.log(`  [${user.email}] Tasks doc already has ${existingDoc.tasks.length} tasks — skipping`);
        skipped++;
        continue;
      }

      // Doc exists but is empty — fill it
      existingDoc.tasks = rawTasks;
      await existingDoc.save();
      console.log(`  [${user.email}] Tasks doc was empty — filled with ${rawTasks.length} tasks`);
      migrated++;

    } catch (err) {
      console.error(`  [${user.email}] ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log('─'.repeat(40));
  console.log(`Done. migrated=${migrated} skipped=${skipped} empty=${empty} errors=${errors}`);
  await mongoose.disconnect();
}

migrateData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
