module.exports = {
    requested: (username,song,author) => {
        songRequested.push({
            username: username,
            song: song,
            author: author,
            played: false
        })
    },
    next: () => {
        for (var i = 0, len = songRequested.length; i < len; i++) {
            if (!songRequested[i].played) {
                songRequested[i].played = true;
                console.log(songRequested[i])
                return songRequested[i]
            }
        }
        return ""
    },
    proposed: () => {

    },
    listProposed: () => {

    }
}

var songRequested = []
var songsAvailable = []
var songProposed = []