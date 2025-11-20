const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const email = process.argv[2];
if (!email) {
  console.error("Please provide the user email: node make-admin.js user@example.com");
  process.exit(1);
}
admin.auth().getUserByEmail(email)
  .then(userRecord => {
    const uid = userRecord.uid;
    return admin.auth().setCustomUserClaims(uid, { admin: true });
  })
  .then(() => {
    console.log(` ${email} is now an admin!`);
    process.exit(0);
  })
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });