const os = require("os");

function getCommand() {
  switch (os.platform()) {
    case "win32":
      return "netstat -an";
    case "darwin":
    case "linux":
      return "netstat -anp tcp";
    default:
      throw new Error("Unsupported OS");
  }
}

function parseNetstat(output) {
  const lines = output.split("\n");
  const connections = lines
    .slice(4) // Skip the header lines
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length >= 4)
    .map((fields) => ({
      proto: fields[0],
      localAddress: fields[1],
      foreignAddress: fields[2],
      state: fields[3] || "UNKNOWN",
    }));
  console.log(connections);
  return connections;
}

module.exports = {
  getCommand,
  parseNetstat,
};
