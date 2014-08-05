var request = require("request");
var fs = require("fs");
var async = require("async");

var avmid = 23;
var request_avm_url = "http://kiosk.avmpanel.com/json/mobile_avm?id=";
var request_store_url = "http://kiosk.avmpanel.com/json/stores?id=";
var mkdirp = require("mkdirp");

/*
 "id": 3262,
 "t": "Accessorize",

 id + "_" + t +".jpg"
 */
function parseJson() {
    request(request_avm_url+avmid, function (error, response, body) {
        if (!error) {
            if (response.statusCode == 200) {
                var info = JSON.parse(body);


                async.series([
                        function(cb_series){
                            // do some stuff ...

                            mkdirp("avm", function(err) {
                                if (!err) {
                                    console.log("directory created");
                                    cb_series(null);
                                }
                                else {
                                    cb_series(err);
                                }
                            });
                        },
                        function(cb_series){
                            async.parallel([
                                    function(cb_parallel){
                                        var logo1 = request(info.a.l).pipe(fs.createWriteStream("avm/logo1.jpg"));
                                        logo1.on("finish",cb_parallel);
                                    },
                                    function(cb_parallel){
                                        var logo2 = request(info.a.h).pipe(fs.createWriteStream("avm/logo2.jpg"));
                                        logo2.on("finish",cb_parallel);

                                    }
                                ],
                                function(err){
                                    if(!err){
                                        cb_series(null);
                                    }
                                    else
                                        cb_series(err);
                                })


                        },

                        function(cb_series){
                            mkdirp("avm/floorplans",function(err){
                                if(!err){
                                    console.log("floorplan created");
                                    cb_series(null);
                                }
                                else{
                                    console.log("hata");
                                    cb_series(err);
                                }
                            });
                        },

                        function(cb_series){
                            async.each(info.a.f, function(flooritem, cb_each) {
                                var name = "avm/floorplans/" + flooritem.n + ".jpg";
                                var r = request(flooritem.i).pipe(fs.createWriteStream(name));
                                r.on("finish", cb_each);
                            }, function(err) {
                                if (!err) {
                                    console.log("image downloads completed!");
                                    cb_series(null);
                                }
                                else {
                                    cb_series(err);
                                }
                            });
                        }
                    ],
// optional callback
                    function(err, results){
                        console.log("operation completed");
                    });
            }
        }
    });
    request(request_store_url+avmid, function (error,response,body){
        if(!error){
            if(response.statusCode == 200){
                var info2 = JSON.parse(body);

                async.series([
                        function(cb_series){
                            mkdirp("avm/stores",function(err)
                            {
                                if(!err){
                                    console.log("store created");
                                    cb_series(null);
                                }
                                else{
                                    cb_series(err);
                                }
                            });
                        },
                        function(cb_series){
                            async.each(info2.s, function(flooritem, cb_each) {
                                console.log(flooritem.u);
                                var name = "avm/stores/"+ flooritem.id + " " + flooritem.t + ".jpg";
                                var res = request(flooritem.u).pipe(fs.createWriteStream(name));
                                res.on("finish",cb_each);

                            }, function(err){
                                if(!err){
                                    console.log("resimler indi");
                                    cb_series(null);
                                }
                                else{
                                    cb_series(err);
                                }

                            })
                        }
                    ],
                    function(err, results){
                        console.log("2.operation completed");
                    });


            }
        }
    });

}

parseJson();
console.log("operation continue");
