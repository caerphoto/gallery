"use strict";

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

exports.gallery_list_key = "gallery-list";
