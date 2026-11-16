// SEED SCRIPT — development data only. Wipes ALL collections, then inserts 5 sample agents.
// Run with: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import Agent from '../models/Agent.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

const agents = [
  { name: 'Swiggy AI Agent', company: 'Swiggy',
    interests: ['food delivery', 'offers', 'discounts', 'restaurants'] },
  { name: 'PhonePe AI Agent', company: 'PhonePe',
    interests: ['payments', 'UPI', 'cashback', 'banking'] },
  { name: 'HDFC AI Agent', company: 'HDFC Bank',
    interests: ['banking', 'cards', 'payments', 'loans'] },
  { name: 'Flipkart AI Agent', company: 'Flipkart',
    interests: ['ecommerce', 'offers', 'shopping', 'delivery'] },
  { name: 'Bajaj Auto Agent', company: 'Bajaj Auto',
    interests: ['vehicles', 'automobile', 'bikes', 'cars'] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-agent-net', {
    serverSelectionTimeoutMS: 5000,
  });
  await Promise.all([Agent.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({}), Notification.deleteMany({})]);
  await Notification.syncIndexes();

  const inserted = await Agent.insertMany(agents);
  inserted.forEach((a) => console.log(`${a.company.padEnd(10)} ${a._id}`));
  console.log(`Seeded ${inserted.length} agents.`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
