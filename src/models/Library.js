"use strict";

// Internal Modules ----------------------------------------------------------

let Author;    // Filled in by associate()
let Series;    // Filled in by associate()
let Story;     // Filled in by associate()
let Volume;    // Filled in by associate()

// External Modules ----------------------------------------------------------

const { DataTypes, Model, Op } = require("sequelize");

module.exports = (sequelize) => {

    // Library Model ---------------------------------------------------------

    class Library extends Model {
    }

    Library.init({

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },

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
                },
                notNull: {
                    msg: "name: Is required"
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
        tableName: "libraries",
        timestamps: true,
        updatedAt: "updated",
        validate: { }, // TODO - class level validations
        version: true,

        sequelize

    });

    // Library Associations --------------------------------------------------

    Library.associate = (models) => {

        Author = models.Author;
        Series = models.Series;
        Story = models.Story;
        Volume = models.Volume;

        Library.hasMany(Author);

        Library.hasMany(Series);

//        Library.hasMany(Story);

//        Library.hasMany(Volume);

    }

    // Export Model ----------------------------------------------------------

    return Library;

}
