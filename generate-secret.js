const crypto = require('crypto');
const fs = require('fs');

const secret = crypto.randomBytes(32).toString('hex');

console.log('Secret Key Anda:');
console.log(secret);
console.log('\nSilakan tambahkan key ini ke dalam file .env sebagai SESSION_SECRET');