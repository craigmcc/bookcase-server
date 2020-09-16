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
//    logging: console.log,
        logging: false,
        storage: './test/database.sqlite'
    })
;

const db = { };
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.sequelize.sync();
db.sequelize.sync({
    force: true
}).then(() => {
    console.log("Dropped and resynchronized database tables");
})

// Configure Models ----------------------------------------------------------

db.Author = require("./Author")(sequelize);
db.Library = require("./Library")(sequelize);

// Configure Associations ----------------------------------------------------

db.Author.associate(db);
db.Library.associate(db);

// Export Database Interface -------------------------------------------------

module.exports = db;