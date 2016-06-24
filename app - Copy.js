var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var jsdom = require('jsdom');
var $ = null;

jsdom.env("",function (err, window) {
   $ = require('jquery')(window);
 }
);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', function(req, res) {res.render('index')});


app.get('/searching', function(req, res){

 // input value from search
 var val = req.query.search;
 var city = req.query.searchCity;

// url used to search yql

 var uri = "http://www.yelp.com/search?find_desc="+val+"&find_loc="+city+"&start=0&unfold=1";
 //console.log(uri);
	request(uri, function(err, resp, body) {
		html = '';
		last_rec = 0;
		if (body) {
		
			$(body).find('.regular-search-result').each(function(){ 
				link = $(this).find('.biz-name').attr('href');
				title = $(this).find('.biz-name').html();
				address = $(this).find('.secondary-attributes address').html();
				phone = $(this).find('.secondary-attributes .biz-phone').html();
				html+=' <li> Business Name: '+title+' </li>';
				html+=' <li> Address: '+address+' </li>';
				html+=' <li> Phone: '+phone+' </li>';
				html+=' <li> Link: <a href="http://www.yelp.com'+link+'">Click Here</a> </li>';
				html+=' <li>______________________________________________________</li>';
				html+=' <li>  </li>';
			});
		
		}
		res.send(html);
	 });
 
 
// testing the route
// res.send("Working ");

});



// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
