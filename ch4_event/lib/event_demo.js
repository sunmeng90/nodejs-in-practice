var fs = require('fs');
var events = require('events');
var util = require('util');

var event_demo = {
    'MusicPlayer': MusicPlayer
};

module.exports = event_demo;

function MusicPlayer() {
    this.is_playing = false;
    events.EventEmitter.call(this); //MusicPlayer will borrow EventEmitter constructor to create musicplayer object
}

util.inherits(MusicPlayer, events.EventEmitter);

var musicPlayer = new MusicPlayer();

function startPlayer(track) {
    this.is_playing = true;
    console.log('start playing');
}

function stopPlayer(track) {
    this.is_playing = false;
    console.log('stop playing');
}

function getTitle(track, eventname) {
    if (!track) {
        this.emit('error', 'no track');
        return false;
    }
    console.log(eventname + '-> title: ' + track.title);
}

function getLyrics(track, eventname) {
    if (!track) {
        this.emit('error', 'no track');
        return false;
    }
    console.log(eventname + '-> lyrics: ' + track.lyrics);
}

function errHandler(err) {
    console.log('something going wrong: ' + err);
}


musicPlayer.once('play', startPlayer); //startPlayer will be executed only once
musicPlayer.on('play', getTitle);
// musicPlayer.on('play', getLyrics); //add multile listeners to the event
musicPlayer.addListener('play', getLyrics); //add multile listeners to the event


var rocku = { 'title': 'We\'ll rock you', 'lyrics': 'We will we will rock you' };
var rockuNoLyrics = { 'title': 'We\'ll rock you' };


musicPlayer.on('stop', getTitle);
musicPlayer.once('stop', stopPlayer);

musicPlayer.on('error', errHandler);

// musicPlayer.emit('play', rocku, 'play');
console.log(musicPlayer.listeners('play'));

setInterval(function() {
    musicPlayer.emit('play', rocku, 'play');
}, 1000);

setTimeout(function() {
    musicPlayer.removeListener('play', getTitle); //remove listener from event, no more execution when event emitted
}, 3000);

setTimeout(function() {
    musicPlayer.emit('stop', rocku, 'stop');
}, 10000);


setTimeout(function() {
    musicPlayer.emit('play', null, 'play');
}, 12000);


