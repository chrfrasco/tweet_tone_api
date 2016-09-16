var Twit = require('twit');
var express = require('express');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var api_keys = JSON.parse(require('./api_keys.json'));

var tone_analyzer = new ToneAnalyzerV3({
  password: api_keys.watson.password,
  username: api_keys.watson.username,
  version_date: '2016-05-19'
});

var app = express();
var T = new Twit({
    consumer_key:         api_keys.twitter.consumer_key,
    consumer_secret:      api_keys.twitter.consumer_secret,
    access_token:         api_keys.twitter.access_token,
    access_token_secret:  api_keys.twitter.access_token_secret
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => res.sendFile('index.html'))

app.get('/tweets/:userName', (req, res) => {

  getTweets(req.params.userName, (tweets) => {
    res.json(tweets);
  });

});

app.get('/tone/:text', (req, res) => {

  getTone(req.params.text, (toneScores) => {
    res.json(toneScores);
  });

});

app.get('/tweetTone/:userName', (req, res) => {

  getTweets(req.params.userName, (tweetInfo) => {

    getTone(tweetInfo.tweets.join(" ") || " ", (tone) => {
      var results = {};

      results.tone = tone;
      results.tweetInfo = tweetInfo;

      res.json(results);
    });

  });

});

function getTweets(userName, callback){

  T.get('statuses/user_timeline', { screen_name: userName, count: 50 }, function(err, data, response) {
    return data;
  }).then(function(res1){
    T.get(`users/show`, {screen_name: userName}, function(err, data, response) {
      return data
    }).then(function(res2){
      var tweetInfo = {};
      try {
        tweetInfo.tweets = res1.data.map((obj) => obj.text);
        tweetInfo.userName = userName;
        tweetInfo.profileImage = res2.data.profile_image_url;
        callback(tweetInfo);
      } catch (err){
        callback(err)
      }
      
    }, function(err){
      callback(err)
    })
  }, function(err){
    console.log('something went wrong');
    callback(err);
  });

};

function getTone(text, callback) {

  tone_analyzer.tone({ text: text }, function(err, tone) {
      if (err) {
        console.log(err);
        callback(null);
      } else {
        var toneArray = tone.document_tone.tone_categories[0].tones;
        
        var tones = toneArray.reduce(function(result, item) {
          result[item.tone_name] = item.score;
          return result;
        }, {});

        callback(tones);
      }
  });

};

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env || 'default');
});
