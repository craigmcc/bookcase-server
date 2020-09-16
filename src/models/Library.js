"use strict";

// Internal Modules ----------------------------------------------------------

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Library Model ---------------------------------------------------------

    class Library extends Model {
    }

    Library.init({

        // TODO - has many authors;

        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isUnique: function(value, next) {
                    let conditions = {
                        where: {
                            name: value
                        }
                    };
                    if (this.id) {
                        conditions.where["id"] = { [Op.ne]: this.id };
                    }
                    Library.count(conditions)
                        .then(found => {
                            return (found !== 0)
                                ? next(`name: Name '${value}' is already in use`)
                                : next();
                        })
                        .catch(next);
                }
            }
        },

        notes: {
            allowNull: true,
            type: DataTypes.STRING,
        },

    }, {

        createdAt: "published",
        modelName: "library",
        tableName: "library",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: true,

        sequelize

    });

    // Library Associations --------------------------------------------------

    Library.associate = (models) => {

/*
        models.Library.hasMany(models.Author);

        models.Library.hasMany(models.Series);

        models.Library.hasMany(models.Volume);
*/

    }

    // Export Model ----------------------------------------------------------

    return Library;

}
