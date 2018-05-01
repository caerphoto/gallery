'use strict';

var utils = require('../lib/utils'),
  redis = require('redis'),
  db = redis.createClient();

exports.fetch = function( req, res ) {
  var filename = req.params.filename;

  db.hgetall( utils.getImageKey( filename ), function( err, image ) {
    if ( err ) {
      return res.send( 500, 'Error retrieving image metadata.' );
    }

    if ( !image ) {
      return res.send( 404, 'Image not found.' );
    }

    res.set( 'Content-Type', image.type );
    res.set( 'Cache-Control', 'public, max-age=604800' ); // 1 week
    res.sendfile( utils.getImagePath( filename ) );
  });
};

exports.fetchThumb = function( req, res ) {
  var filename = req.params.filename;

  db.hgetall( utils.getImageKey( filename ), function( err, image ) {
    if ( err ) {
      return res.send( 500, 'Error retrieving thumbnail metadata.' );
    }

    if ( !image ) {
      return res.send( 404, 'Thumbnail not found.' );
    }

    res.set( 'Content-Type', image.type );
    res.set( 'Cache-Control', 'public, max-age=604800' ); // 1 week
    res.sendfile( utils.getImageThumbPath( filename ) );
  });
};
