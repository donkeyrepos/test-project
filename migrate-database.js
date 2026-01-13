/**
 * Database Migration Script
 * Copies all data from 'recipe-directory' database to 'cookit' database
 *
 * Usage: node migrate-database.js
 */

const mongoose = require('mongoose');

const OLD_DB = 'mongodb://localhost:27017/recipe-directory';
const NEW_DB = 'mongodb://localhost:27017/cookit';

async function migrateDatabase() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Connect to old database
    console.log('📂 Connecting to old database: recipe-directory');
    const oldConnection = mongoose.createConnection(OLD_DB);

    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      oldConnection.once('open', resolve);
      oldConnection.once('error', reject);
    });
    console.log('✅ Connected to old database\n');

    // Connect to new database
    console.log('📂 Connecting to new database: cookit');
    const newConnection = mongoose.createConnection(NEW_DB);

    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      newConnection.once('open', resolve);
      newConnection.once('error', reject);
    });
    console.log('✅ Connected to new database\n');

    // Get all collections from old database
    const collections = await oldConnection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections to migrate:\n`);

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`📦 Migrating collection: ${collectionName}`);

      // Get data from old collection
      const oldCollection = oldConnection.db.collection(collectionName);
      const documents = await oldCollection.find({}).toArray();
      
      console.log(`   Found ${documents.length} documents`);

      if (documents.length > 0) {
        // Insert into new collection
        const newCollection = newConnection.db.collection(collectionName);
        await newCollection.insertMany(documents);
        console.log(`   ✅ Migrated ${documents.length} documents\n`);
      } else {
        console.log(`   ⚠️  No documents to migrate\n`);
      }
    }

    // Close connections
    await oldConnection.close();
    await newConnection.close();

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Old database: recipe-directory`);
    console.log(`   New database: cookit`);
    console.log(`   Collections migrated: ${collections.length}`);
    console.log('\n✅ All data has been copied to the new database.');
    console.log('\n⚠️  IMPORTANT: The old database "recipe-directory" still exists.');
    console.log('   You can delete it manually if you want to free up space.');
    console.log('\n💡 To delete the old database, run:');
    console.log('   mongosh');
    console.log('   use recipe-directory');
    console.log('   db.dropDatabase()');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
migrateDatabase();

