const ss = require('string-similarity')
const songlist = require('./musicstream')

module.exports = {
  getSong: (song, artist, next) => {
    var author = ss.findBestMatch(artist, Object.keys(songlist)).bestMatch
    console.log(author)
    if (author.rating >= 0.8) {
        console.log(ss.findBestMatch(song, songlist[author.target]))
        var music = ss.findBestMatch(song, songlist[author.target]).bestMatch
        console.log(music)
        if (music.rating >= 0.8) next(author.target, music.target)
        else next(null, null)
    } else next(null, null)
  }
}
