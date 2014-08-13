/**
 * Created by hazal on 06.08.2014.
 */
var request = require("request");
var fs = require("fs");
var async = require("async");

var request_store_url = "http://kiosk.avmpanel.com/json/stores?id=";
var mkdirp = require("mkdirp");

module.exports = function (avmid, store_table, cb1) {


    function parseJson() {
        request(request_store_url + avmid, function (error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    var info2 = JSON.parse(body);

                    async.series([
                            function (cb_series) {
                                mkdirp("avm/stores", function (err) {
                                    if (!err) {
                                        console.log("store created");
                                        cb_series(null);
                                    }
                                    else {
                                        cb_series(err);
                                    }
                                });
                            },
                            function (cb_series) {
                                async.each(info2.s, function (storeitem, cb_each) {

                                    if (storeitem.u) {
                                        storeitem.t = storeitem.t.replace("/", "-");
                                        var name = "avm/stores/" + storeitem.id + " " + storeitem.t + ".jpg";
                                        var res = request(storeitem.u).pipe(fs.createWriteStream(name));
                                        res.on("finish", function () {

                                            store_table.create({
                                                id: storeitem.id,
                                                title: storeitem.t,
                                                u: name,
                                                c: storeitem.c
                                            }, function (err,store) {
                                                cb_each();
                                            });
                                        });
                                    }
                                    else {
                                        cb_each();
                                    }

                                }, function (err) {
                                    if (!err) {
                                        console.log("stores download completed");
                                        cb_series(null);
                                    }
                                    else {
                                        console.log("hata");
                                        cb_series(err);
                                    }

                                })
                            }
                        ],
                        function (err, results) {
                            console.log("2.operation completed");
                            cb1();
                        });


                }
            }
        });

    }

    parseJson();
};






