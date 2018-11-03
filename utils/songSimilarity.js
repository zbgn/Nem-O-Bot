const ss = require('string-similarity')
const songlist = require('./musicstream')

module.exports = {
  getSong: (song, artist, next) => {
    var author = ss.findBestMatch(artist, Object.keys(songlist)).bestMatch
    if (author.rating >= 0.8) {
      if (typeof song !== String && typeof songlist[author.target] !== Array(String)) next(null, null)
      else {
        var music = ss.findBestMatch(song, songlist[author.target]).bestMatch
        if (music.rating >= 0.8) next(author.target, music.target)
        else next(null, null)
      }
    } else next(null, null)
  }
}
