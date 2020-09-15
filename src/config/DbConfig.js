"use strict";

// TODO - Use environment variables for sensitive information
module.exports = {
    HOST: "localhost",
    USER: "bookcase",
    PASSWORD: "bookcase",
    DB: "bookcase",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
