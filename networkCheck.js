const os = require("os");

function getActiveConnections() {
  const networkInterfaces = os.networkInterfaces();
  let connections = [];
  for (let inter in networkInterfaces) {
    networkInterfaces[inter].forEach((connection) => {
      if (connection.family === "IPv4") {
        connections.push(connection.address);
      }
    });
  }
  return connections;
}

module.exports = {
  getActiveConnections,
};
