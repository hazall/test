var async = require("async");
var avmid = 23;
var avm_getter = require("./avm_getter");
var store_getter = require("./store_getter");
var database = require("./database");

var store_table;
var avm_table;
async.series([
        function (cb_series) {
            database(function (_store_table,_avm_table) {
                store_table = _store_table;
                avm_table = _avm_table;
                cb_series();
            });
        },

        function (cb_series) {
            avm_getter(avmid, avm_table, function () {
                console.log("avm_getter");
                cb_series();
            });

        },
        function (cb_series) {
            store_getter(avmid, store_table, function () {
                cb_series();
            });

        }

    ],
    function (err, results) {

    });


console.log("operation continue");
