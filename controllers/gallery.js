"use strict";

// TODO: refactor most of this code into a model.

var utils = require("../lib/utils"),
    redis = require("redis"),
    db = redis.createClient();

// Trailing _ because 'new' is a reserved word.
exports.new_ = function( req, res ) {
    res.render("gallery_new");
};

exports.create = function( req, res ) {
    var files = req.files["upload-files"],
        meta_key,
        files_key,
        gallery_url;

    if ( !req.body.name ) {
        return res.send(400);
    }

    gallery_url = utils.getGalleryURL( req.body.name );

    // meta_key is a hash containing the gallery metadata and files_key, which
    // is the set containing a list of the keys for the hashes representing each
    // individual image.
    meta_key = utils.getGalleryMetaKey( req.body.name );
    files_key = utils.getGalleryFilesKey( req.body.name );

    db.del( files_key );
    db.del( meta_key );

    db.hmset( meta_key, {
        title: req.body.name,
        category: req.body.category,
        url: gallery_url,
        files_key: files_key
    });
    db.sadd( utils.gallery_list_key, meta_key );

    files.forEach(function( file ) {
        var image_key = utils.getImageKey( file.path );

        db.sadd( files_key, image_key );
        db.hmset( image_key, {
            path: file.path,
            title: file.name,
            size: file.size
        });
    });

    res.redirect( gallery_url );
};

exports.show = function( req, res, next ) {
    var gallery_name = decodeURIComponent( req.body.name ),
        meta_key;

    meta_key = utils.getGalleryMetaKey( gallery_name );

    db.hgetall( meta_key , function( err, gallery ) {
        if ( err ) {
            console.log( err );
            return next( err );
        }

        if ( !gallery ) {
            console.log("No gallery data returned.");
            return false;
        }

        db.smembers( gallery.files_key, function( err, file_keys ) {
            var multi;

            if ( err ) {
                console.log( err );
                return next( err );
            }

            if ( !file_keys ) {
                console.log("No file keys returned.");
                return false;
            }

            multi = db.multi();

            file_keys.forEach(function( file_key ) {
                multi.hgetall( file_key );
            });

            multi.exec(function( err, gallery_files ) {
                gallery.files = gallery_files;
                res.send( gallery );
            });
        });
    });
};
