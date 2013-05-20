"use strict";

var express = require("express"),
    app = express(),

    ONE_HOUR = 1000 * 60 * 60 * 60,
    connectTimeout = require("connect-timeout"),
    uploadTimeout = connectTimeout({ time: ONE_HOUR }),

    utils = require("./lib/utils"),
    secrets = require("./secrets"),

    admin_auth = express.basicAuth( secrets.admin_user, secrets.admin_pw ),
    auth,

    redis = require("redis"),
    db = redis.createClient(),

    controllers = {
        site: require("./controllers/site"),
        gallery: require("./controllers/gallery"),
        image: require("./controllers/image")
    },

    LISTEN_PORT = 3004;

app.set( "views", __dirname + "/views" );
app.set( "view engine", "ejs" );
app.set( "trust proxy", true );
app.use( express.bodyParser({ uploadDir: "gallery_images/" }) );
app.use( express.cookieParser() );
app.use( express.session({
    secret: "in the galleria"
}) );

// Per-gallery auth - galleries with no password don't show the auth dialog.
// Technique adapted from:
// http://stackoverflow.com/questions/16535380/http-auth-with-dynamic-urls-in-express-js

auth = function( req, res, next ) {
    var meta_key = utils.getGalleryMetaKey( req.params.name );

    db.hgetall( meta_key, function( err, gallery ) {
        if ( !gallery.password ) {
            return next();
        }

        express.basicAuth(function( user, pw, callback ) {
            callback( null, user === "visitor" && pw === gallery.password );
        })( req, res, next );
    });
};

app.get( "/galleries", controllers.gallery.index );
app.get( "/gallery/new", admin_auth, controllers.gallery.new_ );
app.post( "/gallery/create", uploadTimeout, controllers.gallery.create );

app.get( "/gallery/:name/show", auth, controllers.gallery.show );

app.get( "/gallery_image/:filename.jpg", controllers.image.fetch );
app.get( "/gallery_image/th/:filename", controllers.image.fetchThumb );

app.use( express.static( __dirname + "/public" ) );

app.listen( LISTEN_PORT );
console.log( "Listening to localhost on port " + LISTEN_PORT );
