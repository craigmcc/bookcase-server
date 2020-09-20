"use strict"

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

require("custom-env").env(true);
const Sequelize = require("sequelize");

// Configure Database Interface ----------------------------------------------

console.info(`Configuring database for ${process.env.NODE_ENV} mode`);

const sequelize = (process.env.NODE_ENV === "production")
    ? new Sequelize(process.env.DB_DB, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
//        logging: console.log,
        logging: false,
        pool: {
            acquire: parseInt(process.env.DB_POOL_ACQUIRE),
            idle: parseInt(process.env.DB_POOL_IDLE),
            max: parseInt(process.env.DB_POOL_MAX),
            min: parseInt(process.env.DB_POOL_MIN),
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
