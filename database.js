/**
 * Created by hazal on 11.08.2014.
 */
var request = require("request");
var fs = require("fs");
var async = require("async");
var mkdirp = require("mkdirp");

module.exports = function (cb_) {
    var Sequelize = require('sequelize')
        , sequelize = new Sequelize('avmdb', 'a', 'b', {
            dialect: 'sqlite',
            storage: "./db/avm.sqlite",
            define: {
                underscored: true,
                synconassociation: true,
                charset: 'utf8',
                collate: 'utf8',
                timestamps: true
            }
        });

    sequelize
        .authenticate()
        .complete(function (err) {
            if (!!err) {
                console.log('Unable to connect to the database:', err)
            } else {
                console.log('Connection has been established successfully.');
            var store = sequelize.define('Store', {
                    id: Sequelize.STRING,
                    title: Sequelize.STRING,
                    u: Sequelize.STRING,
                    c: Sequelize.INTEGER
                });
           var avm = sequelize.define('Avm',{
                    name: Sequelize.STRING,
                    v: Sequelize.STRING,
                    tel: Sequelize.STRING
                });
                sequelize
                    .sync({ force: true })
                    .complete(function (err) {
                        if (!!err) {
                            console.log('An error occurred while creating the table:', err)
                        } else {
                            console.log("ok");
                            cb_(store,avm);


                        }
                    });
            }
        })

};
