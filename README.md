# Nem'O Bot

A twitch and Discord bot for [Minstery](http://twitch.tv/minstery)

## Configuration file

```json
{
  "discord": {
    "OWNERID": "YOUR_ID_DISCORD",
    "PREFIX": "THE_PREFIX",
    "TOKEN": "YOUR_DISCORD_BOT_TOKEN",
    "live_notification": "https://api.twitch.tv/helix/streams?user_id=USER_ID_TWITCH"
  },
  "twitch": {
    "channels": ["#TWITCH_CHANNELS_WANTED"],
    "connection": {
      "reconnect": true
    },
    "identity": {
      "username": "TWITCH_BOT_ACCOUNT_NAME",
      "password": "oauth:TWITCH_BOT_OAUTH"
    },
    "options": {
      "clientId": "TWICHT_CLIENT_ID"
    }
  }
}
```

NB: twitch.channels is a list of channels, they must start with `#`
