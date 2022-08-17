function AppServer(port, options) {
  this.port = port || 80;
  this.page = options.page;
  this.onMessage = options.onMessage || null;
  this.clients = [];
}

AppServer.prototype.init = function() {
  const server = require("modules-noncompressed/ws").createServer(this.server_handler.bind(this));

  server.on("websocket", this.socket_handler.bind(this));
  server.listen(this.port);
};

AppServer.prototype.broadcast = function(broadcast) {
  this.clients.forEach((client) => client.send(JSON.stringify({ broadcast })));
};

AppServer.prototype.server_handler = function(request, response) {
  response.writeHead(200, {
    "Content-Type": "text/html",
  });

  response.end(this.page);
};

AppServer.prototype.socket_handler = function(client) {
  this.clients.push(client);
  console.log("Client connected");

  client.on("message", (message) => {
    message = JSON.parse(message);
    console.log(message);

    try {
      if (this.onMessage) {
        this.onMessage(message);
      }

      this.broadcast(message);
    } catch (e) {
      console.log("Message from client error: " + e.toString());
    }
  });

  client.on("close", () => {
    const index = this.clients.indexOf(client);
    if (index > -1) {
      this.clients.splice(index, 1);
      console.log("Client disconnected");
    }
  });
};

exports.create = function (port, options) {
  const app_server = new AppServer(port, options);
  app_server.init();

  return app_server;
};