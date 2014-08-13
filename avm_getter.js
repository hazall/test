/**
 * Created by hazal on 06.08.2014.
 */
var request = require("request");
var fs = require("fs");
var async = require("async");
var mkdirp = require("mkdirp");
var request_avm_url = "http://kiosk.avmpanel.com/json/mobile_avm?id=";

module.exports = function (avmid, avm_table, cb) {

    request(request_avm_url + avmid, function (error, response, body) {
        if (!error) {
            if (response.statusCode == 200) {
                var info = JSON.parse(body);
                async.series([
                    function (cb_series) {
                        // do some stuff ...

                        mkdirp("avm", function (err) {
                            console.log("1");
                            if (!err) {
                                console.log("directory created");
                                cb_series(null);
                            }
                            else {
                                cb_series(err);
                            }
                        });
                    },

                    function (cb_series) {
                        async.parallel([
                                function (cb_parallel) {
                                    var logo1 = request(info.a.l).pipe(fs.createWriteStream("avm/logo1.jpg"));
                                    logo1.on("finish", cb_parallel);
                                },
                                function (cb_parallel) {
                                    var logo2 = request(info.a.h).pipe(fs.createWriteStream("avm/logo2.jpg"));
                                    logo2.on("finish", cb_parallel);

                                }
                            ],
                            function (err) {
                                console.log("2");
                                if (!err) {
                                    cb_series(null);
                                }
                                else
                                    cb_series(err);
                            })


                    },

                    function (cb_series) {

                        mkdirp("avm/floorplans", function (err) {
                            console.log("3");
                            if (!err) {
                                console.log("floorplan created");
                                cb_series(null);
                            }
                            else {
                                console.log("hata");
                                cb_series(err);
                            }
                        });
                    },

                    function (cb_series) {
                        async.each(info.a.f, function (flooritem, cb_each) {
                            var name = "avm/floorplans/" + flooritem.n + ".jpg";
                            var r = request(flooritem.i).pipe(fs.createWriteStream(name));
                            r.on("finish", cb_each);
                        }, function (err) {
                            console.log("4");
                            if (!err) {
                                console.log("image downloads completed!");
                                cb_series(null);
                            }
                            else {
                                cb_series(err);
                            }
                        });
                    },
                    function (cb_series) {
                        console.log("a");
                        avm_table.create({
                            name: info.a.n,
                            v: info.v,
                            tel: info.a.p
                        }, function (err, avm) {

                            cb_series();

                        });
                    }
                ], function (err, results) {

                    console.log("operation completed");
                    cb();
                });
            }
        }
    });

};
