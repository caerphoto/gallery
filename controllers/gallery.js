"use strict";

// TODO: refactor most of this code into a model.

var utils = require("../lib/utils"),
    redis = require("redis"),
    path = require("path"),
    im = require("imagemagick"),
    db = redis.createClient();

// Trailing _ because 'new' is a reserved word.
exports.new_ = function( req, res ) {
    res.render( "gallery_new" );
};

exports.index = function( req, res ) {
    db.smembers( utils.gallery_list_key, function( err, meta_keys ) {
        var multi;

        if ( err || !meta_keys ) {
            return res.send( 500, "Unable to retrieve gallery list." );
        }

        multi = db.multi();
        meta_keys.forEach(function( meta_key ) {
            multi.hgetall( meta_key );
        });

        multi.exec(function( err, galleries ) {
            galleries.sort(function( a, b ) {
                var t1 = a.title.toLowerCase(),
                    t2 = b.title.toLowerCase();
                return t1 < t2 ? -1 : t1 > t2 ? 1 : 0;
            });

            if ( req.query.format === "json" ) {
                res.send( galleries );
            } else {
                res.render( "galleries", {
                    galleries: galleries
                });
            }
        });

    });
};

exports.create = function( req, res ) {
    var files = req.files.files,
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
        category: req.body.category || "",
        url: gallery_url,
        password: req.body.password,
        files_key: files_key
    });
    db.sadd( utils.gallery_list_key, meta_key );

    files.forEach(function( file ) {
        var filename = path.basename( file.path ),
            thumb_path = utils.getImageThumbPath( filename ),
            image_key = utils.getImageKey( filename );

        db.sadd( files_key, image_key );
        db.hmset( image_key, {
            filename: filename,
            title: file.name,
            type: file.type,
            size: file.size
        });

        im.resize({
            srcPath: file.path,
            dstPath: thumb_path,
            quality: 0.7,
            format: "jpg",
            progressive: true,
            width: 200,
            height: 200,
            strip: true,
            sharpening: 0.2
        }, function( err ) {
            if ( err ) {
                console.log( err );
            }
        });
    });

    res.redirect( gallery_url );
};

exports.show = function( req, res, next ) {
    var gallery_name = decodeURIComponent( req.params.name ),
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

        if ( gallery.private && !req.session.logged_in ) {
            return res.redirect( 401, "/galleries" );
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
                gallery_files.forEach(function( f ) {
                    f.thumb_url = utils.getImageThumbURL( f.filename );
                });

                if ( req.query.format === "json" ) {
                    res.send( gallery );
                } else {
                    res.render( "gallery", {
                        title: gallery.title,
                        files: gallery_files
                    });
                }
            });
        });
    });
};
