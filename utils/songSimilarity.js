const ss = require('string-similarity')
// const songlist = require('./musicstream')
const fs = require('fs')

module.exports = {
  getSong: (song, artist, next) => {
    var songlist = JSON.parse(fs.readFileSync('./utils/musicstream.json', 'utf-8'))
    var author = ss.findBestMatch(String(artist), Object.keys(songlist)).bestMatch
    if (author.rating >= 0.8) {
        var music = ss.findBestMatch(String(song), songlist[author.target]).bestMatch
        if (music.rating >= 0.8) next(author.target, music.target)
        else next(null, null)
    } else next(null, null)
  }
}
