const os = require("os");
const dns = require("dns");
const net = require("net");

function getCommand() {
  switch (os.platform()) {
    case "win32":
      return "netstat -an";
    case "linux":
      return "ss -atun";
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
  return connections;
}

function parseSS(output) {
  const lines = output.split("\n");
  const connections = lines
    .filter((line) => line.trim() !== "") // Filter out empty lines
    .slice(1) // Skip the header line
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length >= 6)
    .map((fields) => ({
      proto: fields[0],
      localAddress: fields[4],
      foreignAddress: fields[5],
      state: fields[1],
    }));

  return connections;
}

function isValidIp(ip) {
  return net.isIPv4(ip) || net.isIPv6(ip);
}

function resolveHostname(ip) {
  return new Promise((resolve) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        resolve({ ip, hostname: null });
      } else {
        resolve({ ip, hostname: hostnames[0] });
      }
    });
  });
}

module.exports = {
  getCommand,
  parseNetstat,
  parseSS,
  isValidIp,
  resolveHostname,
};
