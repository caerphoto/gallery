'use strict';

var express = require('express'),
  app = express(),
  swig = require('swig'),

  ONE_HOUR = 1000 * 60 * 60 * 60,
  connectTimeout = require('connect-timeout'),
  uploadTimeout = connectTimeout({ time: ONE_HOUR }),

  utils = require('./lib/utils'),
  secrets = require('./secrets'),

  admin_auth = express.basicAuth( secrets.admin_user, secrets.admin_pw ),
  auth,

  redis = require('redis'),
  db = redis.createClient(),
  RedisStore = require('connect-redis')(express),
  sessionStore = new RedisStore(),

  controllers = {
    site: require('./controllers/site'),
    gallery: require('./controllers/gallery'),
    image: require('./controllers/image')
  },

  LISTEN_PORT = 3004;

if ( process.env.NODE_ENV !== 'production' ){
  swig.setDefaults({ cache: false });
  console.log('View cache disabled.');
}

app.engine( 'html', swig.renderFile );
app.set( 'view engine', 'html' );
app.set( 'views', __dirname + '/views' );
app.set( 'trust proxy', true );

app.use( express.bodyParser({ uploadDir: 'gallery_images/' }) );
app.use( express.cookieParser() );
app.use( express.session({
  secret: 'in the galleria',
  store: sessionStore,
  key: 'session:gallery'
}) );

// Per-gallery auth - galleries with no password don't show the auth dialog.
// Technique adapted from:
// http://stackoverflow.com/questions/16535380/http-auth-with-dynamic-urls-in-express-js

auth = function( req, res, next ) {
  var meta_key = utils.getGalleryMetaKey( req.params.name );

  db.hgetall( meta_key, function( err, gallery ) {
    if ( !gallery || !gallery.password ) {
      return next();
    }

    express.basicAuth(function( user, pw, callback ) {
      callback( null, user === 'visitor' && pw === gallery.password );
    })( req, res, next );
  });
};

app.get( '/', controllers.gallery.index );
app.get( '/gallery/new', admin_auth, controllers.gallery.new_ );
app.post( '/gallery/create', uploadTimeout, controllers.gallery.create );

// Same controller for both, since functionality is almost identical.
app.get( '/gallery/:name/edit', admin_auth, controllers.gallery.show );
app.get( '/gallery/:name', auth, controllers.gallery.show );

app.post( '/gallery/:name/update', admin_auth, controllers.gallery.update );

app.get( '/gallery_image/:filename.jpg', controllers.image.fetch );
app.get( '/gallery_image/th/:filename', controllers.image.fetchThumb );

app.use( express.static( __dirname + '/public' ) );

app.listen( LISTEN_PORT );
console.log( 'Listening to localhost on port ' + LISTEN_PORT );
