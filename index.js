var Twit = require('twit');
var express = require('express');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var tone_analyzer = new ToneAnalyzerV3({
  password: "w2KJEDvzYCDV",
  username: "1139fb5b-c827-46b4-aeff-a774419c23fc",
  version_date: '2016-05-19'
});

var app = express();
var T = new Twit({
    consumer_key:         'tztKPgrTWnYWtzw2nhG6NCHuq' // Your Consumer Key
  , consumer_secret:      'aq54IuJvBqsALvbdJqwtVuiu8a2UCfqIRq88dYse5shLBCilIB' // Your Consumer Secret
  , access_token:         '712458805678882816-UqnywRq03FVCEioqAHWanQDJcrcqJpQ' // Your Access Token
  , access_token_secret:  'y1fG9M2CcNOjU6NID6tSkcyOV5dS6xEcc8THsevKvCxpb' // Your Access Token Secret
});

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

  getTweets(req.params.userName, (tweets) => {

    getTone(tweets.join(" ") || " ", (tone) => {
      res.json(tone);
    });

  });

});

function getTweets(userName, callback){

  T.get('statuses/user_timeline', { screen_name: userName, count: 20 }, function(err, data, response) {
    return data
  }).then(function(res){
    tweets = res.data.map((obj) => obj.text);
    callback(tweets)
  }, function(err){
    console.log('something went wrong');
    callback(err)
  });

};

function getTone(text, callback) {

  tone_analyzer.tone({ text: text }, function(err, tone) {
      if (err) {
        console.log(err);
        callback(null);
      } else {
        callback(tone.document_tone.tone_categories[0]);
      }
  });

};

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env || 'default');
});
