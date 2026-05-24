const admin = require("firebase-admin")

if (! process.env.DATABASE_API_KEY){
    throw new Error("Error: Missing Firebase Admin SDK file path")
}

const serviceAccount = JSON.parse(process.env.DATABASE_API_KEY);
    

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { db };