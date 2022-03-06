const WebSocket = require("ws");
const randomstring = require("randomstring");
const uu = require("uuid");

const wss = new WebSocket.Server({
  port: 1337
});

let playerCount = 0;

const rooms = {
  "classic": {
    "columns": 69,
    "rows": 69,
    "connect": 4,
    "plays": 1,
    "counters": false,
    "board": Array(69 * 69).fill(0)
  }
}
const games = {}
const invites = {}

// for messages https://github.com/jsdom/jsdom

// TODO: prevent player from joining match twice

wss.on("connection", ws => {
  const uuid = uu.v4();
  playerCount += 1;
  ws.send(`playercount,${playerCount-1}`);
  const owned = []; // list of rooms owned by the user
  ws.on("message", message => {
    const index = message.indexOf(",");
    const [action, rules] = [message.slice(0, index), message.slice(index + 1)];
    actions:
      switch (action) {
        case "join":
          if (invites[rules]) {
            games[invites[rules]][rules].players.push(uuid);
            ws.send(`game,${rules},${JSON.stringify(games[invites[rules]][rules])}`);
            break actions;
          }
          if (!games[rules]) games[rules] = {};
          for (const [invite, game] of Object.entries(games[rules])) {
            if (game.players.length < 2) {
              game.players.push(uuid); // not sure if this actually works, will have to look into it
              ws.send(`game,${invite},${JSON.stringify(game)}`);
              break actions;
            }
          };
          const invite = randomstring.generate(7); //TODO: make sure it's unique
          invites[invite] = rules;
          games[rules][invite] = {
            players: [uuid]
          };
          ws.send(`game,${invite},${JSON.stringify(games[rules][invite])}`);
          break;
        case "todo":
          console.log("TODO.");
          break;
        default:
          console.log("Unknown action.");
      }
    console.log("received:", message);
  });
  ws.on("close", ws => {
    playerCount -= 1;
  });

  ws.send("something");
});
