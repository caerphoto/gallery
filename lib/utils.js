'use strict';

var path = require('path');

exports.getGalleryFilesKey = function( galleryname ) {
  return 'gallery:files:' + galleryname;
};

exports.getGalleryMetaKey = function( galleryname ) {
  return 'gallery:meta:' + galleryname;
};

exports.getImageKey = function ( filename ) {
  return 'image:' + filename;
};

exports.getImagePath = function( filename ) {
  return path.join( 'gallery_images/', filename );
};

exports.getImageThumbPath = function( filename ) {
  return path.join( 'gallery_images/th/', filename );
};

exports.getGalleryURL = function( galleryname, edit ) {
  if ( !galleryname ) {
    return false;
  }

  if ( edit ) {
    return '/gallery/' + encodeURIComponent( galleryname ) + '/edit';
  } else {
    return '/gallery/' + encodeURIComponent( galleryname );
  }
};

exports.getImageURL = function( filename ) {
  return path.join( '/gallery_image/', filename + '.jpg' );
};

exports.getImageThumbURL = function( filename ) {
  return path.join( '/gallery_image/th/', filename );
};

exports.gallery_list_key = 'gallery-list';
