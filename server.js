"use strict";

var express = require("express"),
    app = express(),

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
app.use( express.static( __dirname + "/gallery_images" ) );

app.get( "/", controllers.site.index );

app.get( "/galleries", controllers.gallery.index );
app.get( "/gallery/new", controllers.gallery.new_ );
app.post( "/gallery/create", controllers.gallery.create );

app.get( "/gallery/:name/show", controllers.gallery.show );

app.get( "/gallery_image/:filename", controllers.image.fetch );

app.listen( LISTEN_PORT );
console.log( "Listening to localhost on port " + LISTEN_PORT );
