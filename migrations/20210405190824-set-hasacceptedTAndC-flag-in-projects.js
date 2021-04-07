module.exports = {
  async up(db) {
    global.migrationMsg = "Add hasAcceptedTAndC as false for old projects"

    await db.collection("projects").updateMany({}, { $set : { hasAcceptedTAndC : false }});
    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
