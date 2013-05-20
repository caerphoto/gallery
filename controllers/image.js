"use strict";

var utils = require("../lib/utils"),
    redis = require("redis"),
    db = redis.createClient();

exports.fetch = function( req, res ) {
    var filename = req.params.filename;

    db.hgetall( utils.getImageKey( filename ), function( err, image ) {
        setTimeout(function() {
            res.set( "Content-Type", image.type );
            res.sendfile( utils.getImagePath( filename ) );
        }, 2000 );
    });
};

exports.fetchThumb = function( req, res ) {
    var filename = req.params.filename;

    db.hgetall( utils.getImageKey( filename ), function( err, image ) {
        res.set( "Content-Type", image.type );
        res.sendfile( utils.getImageThumbPath( filename ) );
    });
};
