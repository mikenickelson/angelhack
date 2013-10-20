/**
 * app.js
 *
 */

var express = require('express'),
    routes = require('./routes/routes'),
    http = require('http'),
    path = require('path'),
    db = require('./libs/db'),
    port = process.env.PORT || 8005;

// create the server
app = express();

app.configure(function () {
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'keikovader', cookie: { maxAge: 60 * 60 * 1000 }}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function () {
    app.use(express.errorHandler()); 
});

// routes
app.get('/', routes.welcome);
app.get('/app/login', routes.login);
app.get('/app/alike', routes.profiles);

app.get('/oauth/authorize', routes.authorize);
app.get('/oauth/redirect', routes.redirect);

app.get('/tags/aggregate', routes.aggregate);
app.get('/tags/results', routes.results);

app.get('/geo/:ll', routes.scrapeByGeo);


app.start = function () {

    // step 2: start up server
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
}

// step 1: start db
db.connect(app.start);