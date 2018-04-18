const songsAvailable = require('./utils/musicstream.json')
const stringSimilarity = require('string-similarity')
module.exports = {
  requested: (username, song, author) => {
    var bestMatchAuthor = stringSimilarity.findBestMatch(author, Object.keys(songsAvailable)).bestMatch
    if (bestMatchAuthor.rating >= 0.5) {
      var bestMatchSong = stringSimilarity.findBestMatch(song, songsAvailable[bestMatchAuthor.target]).bestMatch
      if (bestMatchSong.rating >= 0.5) {
        var requestSong = {
          username: username,
          song: song,
          author: author,
          played: false,
          requested: 1
        }
        for (var i = 0, len = songRequested.length; i < len; i++) {
          if (contain(requestSong, songRequested[i])) {
            if (!songRequested[i].played) {
              songRequested[i].requested += 1
              return true
            } else {
              return false
            }
          }
        }
        songRequested.push(requestSong)
        return true
      }
      return false
    }
  },
  next: () => {
    var mostRequest = null
    for (var i = 0, len = songRequested.length; i < len; i++) {
      if (!songRequested[i].played) {
        if (mostRequest === null) {
          mostRequest = songRequested[i]
        } else if (mostRequest.requested < songRequested[i].requested) {
          mostRequest = songRequested[i]
        }
      }
    }
    if (mostRequest !== null) {
      mostRequest.played = true
      console.log(mostRequest)
      return mostRequest
    }
    return null
  },
  proposed: () => {

  },
  listProposed: () => {

  }
}

var songRequested = []
var songProposed = []

function contain(newSong, song) {
  return (newSong.song === song.song && newSong.author === song.author)
}
