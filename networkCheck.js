const os = require("os");

function getActiveConnections() {
  const networkInterfaces = os.networkInterfaces();
  let connections = [];
  console.log(os.platform());
  for (let inter in networkInterfaces) {
    networkInterfaces[inter].forEach((connection) => {
      if (connection.family === "IPv4" || connection.family === "IPv6") {
        connections.push(connection.address);
      }
    });
  }
  return connections;
}

module.exports = {
  getActiveConnections,
};
