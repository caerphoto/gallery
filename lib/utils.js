"use strict";

var path = require("path");

exports.getGalleryFilesKey = function( galleryname ) {
    return "gallery:files:" + galleryname;
};

exports.getGalleryMetaKey = function( galleryname ) {
    return "gallery:meta:" + galleryname;
};

exports.getImageKey = function ( filename ) {
    return "image:" + filename;
};

exports.getGalleryURL = function( galleryname ) {
    if ( !galleryname ) {
        return false;
    }

    return "gallery/" + encodeURIComponent( galleryname ) + "/show";
};

exports.getImagePath = function( filename ) {
    return path.join( "gallery_images/", filename );
};

exports.getImageThumbPath = function( filename ) {
    return path.join( "gallery_images/th/", filename );
};

exports.getImageURL = function( filename ) {
    return path.join( "/gallery_image/", filename );
};

exports.getImageThumbURL = function( filename ) {
    return path.join( "/gallery_image/th/", filename );
};

exports.gallery_list_key = "gallery-list";
