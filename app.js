var express = require('express');
var http = require('http');
var cheerio = require('cheerio');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require("async");
var request = require('request');
var fs = require('fs');
var jsdom = require('jsdom');
var $ = null;

jsdom.env("",function (err, window) {
   $ = require('jquery')(window);
 }
);
var app = express();

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


app.get('/:bizname/:bizloc', function(req, res) {

 //console.log(req.params.bizname);
// console.log(req.params.bizloc);
	var val = req.params.bizname;
	var city = req.params.bizloc;
	var uri = "http://www.yelp.com/search?find_desc="+val+"&find_loc="+city+"&start=0&unfold=1";
	request(uri, function(err, resp, body) {

		if (body) {
			link = $(body).find('.regular-search-result .biz-name').attr('href');
			//console.log($(body).find('.regular-search-result .biz-name').length);
			//console.log(link);
			if(link===undefined){
				data = {result:'No Result Found'}
				res.send(data);
			}
			profileUrl = 'http://www.yelp.com'+link;
			//lookup_list.push(profileUrl);
		}
	
		callProfile(profileUrl);
	 });
		
	function callProfile(profileUrl){
		console.log('------------------------------');
		console.log(profileUrl);
			
		request(profileUrl, function (error, response, body) {
			data = '';
			if (!error && response.statusCode == 200) {
				
				var images = [];
				$(body).find('.showcase-photos img').each(function(){
					//html+=' <li><img src="'+$(this).attr('src')+'"/></li>';
					images.push($(this).attr('src'));
				});
				Biz_title = $(body).find('.biz-page-title').text().trim();
				Biz_address = $(body).find('.map-box-address').text().trim();
				Biz_phone = $(body).find('.biz-phone').text().trim();
				Biz_webiste = 'http://'+$(body).find('.biz-website a').text().trim();
				
				star_title = $(body).find('.biz-page-header .rating-very-large .star-img').attr('title');
				star_title = star_title.split(' ');
				star_title = star_title[0];
				
				reviews = [];
					$(body).find('.review').each(function(){
						author = $(this).find('.review-sidebar .media-story .user-name a').text();
						review = $(this).find('.review-wrapper .review-content p').text();
						rating = $(this).find('.review-wrapper .biz-rating meta').attr('content');
						t = {author:author,review:review,rating:rating};
						if(author!=''){
							reviews.push(t);
						}
					})
				
				
				
				
				data = { profile:profileUrl, title: Biz_title, address:Biz_address, phone:Biz_phone, website:Biz_webiste , reviews: $(body).find('.review-count span').html(), stars:star_title, images:images, user_reviews:reviews}
				console.log('------------------------------');
				//console.log(data);
			}
			res.send(data);
		});
	}
	
//res.render('api')
});


app.get('/searching', function(req, res){

 // input value from search
 var val = req.query.search;
 var city = req.query.searchCity;

// url used to search yql
//var lookup_list = ["http://www.yelp.com/search?find_desc="+val+"&find_loc="+city+"&start=0&unfold=1"];
var lookup_list = [];
 var uri = "http://www.yelp.com/search?find_desc="+val+"&find_loc="+city+"&start=0&unfold=1";
 //console.log(uri);
	request(uri, function(err, resp, body) {
		html = '';
		last_rec = 0;
		if (body) {
		
			$(body).find('.regular-search-result').each(function(){ 
				link = $(this).find('.biz-name').attr('href');
				/*title = $(this).find('.biz-name').html();
				address = $(this).find('.secondary-attributes address').html();
				phone = $(this).find('.secondary-attributes .biz-phone').html();
				html+=' <li> Business Name: '+title+' </li>';
				html+=' <li> Address: '+address+' </li>';
				html+=' <li> phone: '+phone+' </li>';*/
				profileUrl = 'http://www.yelp.com'+link;
				lookup_list.push(profileUrl);
			
			});
		
		}
	
		callsubko(lookup_list);
	 });
		function callsubko(list){
		console.log('------------------------------');
		console.log(list);
			async.map(list, function(url, callback) {
				
			request(url, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						
						data = '';
					
						var images = [];
						$(body).find('.showcase-photos img').each(function(){
							html+=' <li><img src="'+$(this).attr('src')+'"/></li>';
							images.push($(this).attr('src'));
						});
						data = {reviews: $(body).find('.review-count').html(),stars:$(body).find('.biz-page-header .rating-very-large .star-img').attr('title'),images:{images}}
						console.log('------------------------------');
						console.log(url);
						console.log(data);
						
						
						fs.writeFile("data/details.txt", data, function(err) {
							if(err) {
							// console.log(err);
							}

						//	console.log("The file was saved!");
						}); 
						console.log('------------------------------');
					} else {
						//callback(error || response.statusCode);
					}
					//console.log(url);
					
				});
				
				

				
				
				
				
			});
		 
		}
res.send('Please Check Command panel');
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
