"use strict";

var utils = require("../lib/utils"),
    redis = require("redis"),
    db = redis.createClient();

exports.fetch = function( req, res ) {
    var filename = req.params.filename;

    db.hgetall( utils.getImageKey( filename ), function( err, image ) {
        res.set( "Content-Type", image.type );
        res.sendfile( utils.getImagePath( filename ) );
    });
};
