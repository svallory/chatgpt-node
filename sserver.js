const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");

/**
 * @typedef IncomingMessage = {}
 * @typedef ServerResponse = {}
 */

// Read the certificate files
/**
 * @type {https.ServerOptions<IncomingMessage, ServerResponse>}
 */
const serverConfig = {
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.cert"),
};

// Create an HTTPS server
const server = https.createServer(serverConfig, (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Read the index.html file and serve it
    fs.readFile("./index.html", function (err, data) {
      if (err) {
        res.writeHead(500); // Internal Server Error
        return res.end("Error loading index.html");
      }

      res.writeHead(200, { "Content-Type": "text/html" }); // MIME type as text/html
      res.end(data); // Send the file data as the response
    });
  } else {
    // Handle other paths or methods
    res.writeHead(404); // Not Found
    res.end();
  }
});

// Create a WebSocket server that attaches to the HTTPS server
const wss = new WebSocket.Server({ server });

wss.on("connection", (conn) => {
  console.log("A new client connected");

  conn.send("Welcome!");

  conn.on("message", (message) => {
    console.log("Message received: %s", message);

    // Broadcast the message to all clients
    wss.clients.forEach(function each(client) {
      console.log("Sending to ", Object.keys(client));
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  conn.on("close", () => console.log("Client has disconnected."));
});

// Start the server
const port = 443;
server.listen(port, () => {
  console.log(`WebSocket server is running on wss://0.0.0.0:${port}`);
});
