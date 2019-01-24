const ss = require('string-similarity');
// const songlist = require('./musicstream')
const fs = require('fs');

module.exports = {
  getSong: (song, artist, next) => {
    const songlist = JSON.parse(
        fs.readFileSync('./utils/musicstream.json', 'utf-8')
    );
    let author = ss.findBestMatch(
        String(artist),
        Object.keys(songlist)
    ).bestMatch;
    console.log(author);
    if (author.rating < 0.8) {
      const swap = song;
      song = artist;
      artist = swap;
      author = ss.findBestMatch(
          String(artist),
          Object.keys(songlist)
      ).bestMatch;
    }
    console.log(author);
    if (author.rating >= 0.8) {
      const music = ss.findBestMatch(
          String(song),
          songlist[author.target]
      ).bestMatch;
      if (music.rating >= 0.8) next(author.target, music.target, null);
      else {
        next(null, null,
            ' song not found. '
        + 'Make sure the song is in the list (!musicstream).');
      }
    } else {
      next(null, null,
          ' artist not found.'
      + ' Make sure the artist is in the list (!musicstream).');
    }
  },
};
