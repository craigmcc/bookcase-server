"use strict"

// Internal Modules ----------------------------------------------------------

const dbConfig = require("../config/DbConfig");

// External Modules ----------------------------------------------------------

const Sequelize = require("sequelize");

// Configure Database Interface ----------------------------------------------

const sequelize = (process.env.NODE_ENV === "production")
    ? new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
//        logging: console.log,
        logging: false,
        pool: {
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle,
            max: dbConfig.pool.max,
            min: dbConfig.pool.min
        }
    })
    : new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
//    logging: console.info,
        logging: false,
        storage: './test/database.sqlite'
    })
;

const db = { };
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sequelize.sync({
    logging: false
}).then(() => {
    console.info("Resynchronized database tables (no drop)");
});
/*
db.sequelize.sync({
    force: true,
    logging: false
}).then(() => {
    console.log("Dropped and resynchronized database tables");
})
*/

// Configure Models ----------------------------------------------------------

db.Author = require("./Author")(sequelize);
db.AuthorSeries = require("./AuthorSeries")(sequelize);
db.AuthorStory = require("./AuthorStory")(sequelize);
db.AuthorVolume = require("./AuthorVolume")(sequelize);
db.Library = require("./Library")(sequelize);
db.Series = require("./Series")(sequelize);
db.SeriesStory = require("./SeriesStory")(sequelize);
db.Story = require("./Story")(sequelize);
db.Volume = require("./Volume")(sequelize);
db.VolumeStory = require("./VolumeStory")(sequelize);

// Configure Associations ----------------------------------------------------

db.Author.associate(db);
db.AuthorSeries.associate(db);
db.AuthorStory.associate(db);
db.AuthorVolume.associate(db);
db.Library.associate(db);
db.Series.associate(db);
db.SeriesStory.associate(db);
db.Story.associate(db);
db.Volume.associate(db);
db.VolumeStory.associate(db);

// Export Database Interface -------------------------------------------------

module.exports = db;
