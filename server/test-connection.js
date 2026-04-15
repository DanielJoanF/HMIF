// Test MongoDB connection
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'NOT FOUND');
console.log('Port:', process.env.PORT);

if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        console.log('Connection state:', mongoose.connection.readyState);
        process.exit(0);
    })
    .catch((error) => {
        console.error('MongoDB Connection Failed:');
        console.error('Error:', error.message);
        console.error('\nPossible issues:');
        console.error('1. Check if password is correct');
        console.error('2. Check if IP address is whitelisted in MongoDB Atlas');
        console.error('3. Check if cluster is active');
        process.exit(1);
    });
