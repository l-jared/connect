socket = new WebSocket("ws://127.0.0.1:1337");

socket.addEventListener("open", event => {
  makeBoard(7, 6);

  const username = document.getElementById("username");
  const chatlog = document.getElementById("chatlog");
  const escape = document.createElement("p");
  document.getElementById("message").addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.value.trim()) {
      socket.send("message," + event.target.value);
      if (event.target.value.startsWith("/nick ")) {
        const nick = event.target.value.substring(6).trim();
        if (nick) {
          username.innerText = nick;
          event.target.value = "";
          return;
        }
      }
      escape.innerText = event.target.value;
      chatlog.innerHTML = "<b>" + username.innerText + "</b> " + escape.innerHTML + "<br>" + chatlog.innerHTML; // TODO: remove last n elements
      // TODO: display uuid when hovering username
      event.target.value = "";
    }
  });
});

socket.addEventListener("message", event => {
  const [action, ...more] = event.data.split(",");
  switch (action) {
    case "playercount":
      document.getElementById("playercount").innerText = `${more[0]} player${more[0] == 1 ? "" : "s"} online`;
      break;
    case "todo":
      console.log("TODO.");
      break;
    default:
      console.log("Unknown action.");
  }
  console.log("Message from server ", event.data);
});

function makeBoard(columns, rows) {
  const board = document.getElementById("board");
  board.innerHTML = "<span onclick='placeAt(this)' style='border-left:solid 1px transparent'>•</span>".repeat(rows) + "<span onclick='placeAt(this)'>•</span>".repeat((columns - 1) * rows);
  board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  board.dataset.columns = columns;
  board.dataset.rows = rows;
}

function placeAt(el) {
  const board = document.getElementById("board");
  place(Math.floor(Array.from(board.children).indexOf(el) / board.dataset.rows) + 1, "cyan", board)
}

function place(column, color, board) {
  for (var i = board.dataset.rows - 1; i >= 0; i--) {
    if (board.children[board.dataset.rows * (column - 1) + i].innerText == "•") {
      board.children[board.dataset.rows * (column - 1) + i].innerText = "o";
      board.children[board.dataset.rows * (column - 1) + i].style.color = color;
      socket.send("place," + column)
      return true;
    }
  }
  return false;
}
