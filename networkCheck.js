const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const dns = require("dns");
const net = require("net");
const readline = require("readline");

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
  return connections;
}

function getActiveConnections() {
  const command = getCommand();
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      const connections = parseNetstat(stdout);
      resolve(connections);
    });
  });
}

const logFilePath =
  process.env.SystemRoot + "\\System32\\LogFiles\\Firewall\\pfirewall.log";

function getPastConnections(limit = 10) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(logFilePath)) {
      console.log(
        "Firewall log file not found. Please ensure logging is enabled."
      );
      resolve([]); // Resolve with an empty array if the log file is not found
      return;
    }

    const logStream = fs.createReadStream(logFilePath);
    const rl = readline.createInterface({
      input: logStream,
      crlfDelay: Infinity,
    });

    const connections = [];

    rl.on("line", (line) => {
      // Skip lines that don't start with a date (log entries)
      if (!/^\d{4}-\d{2}-\d{2}/.test(line)) {
        return;
      }
      const columns = line.split(" ");
      const direction = columns[columns.length - 1];

      if (direction === "SEND") {
        foreignAddress = columns[5]; // Destination IP is the foreign address
      } else if (direction === "RECEIVE") {
        foreignAddress = columns[4]; // Source IP is the foreign address
      }

      // Create an object with the parsed log entry
      const logEntry = {
        Action: columns[2],
        foreignAddress,
      };

      // Collect the log entry
      if (logEntry.Action === "ALLOW") {
        connections.push(logEntry);
      }
      console.log(limit, "limit  LLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOl");
      console.log(connections.limit, "l o");
      if (connections.length >= limit) {
        rl.close();
      }
    });

    rl.on("close", () => {
      resolve(connections); // Resolve the promise with the collected connections
    });

    rl.on("error", (error) => {
      reject(error); // Reject the promise in case of an error
    });
  });
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
  getActiveConnections,
  resolveHostname,
  isValidIp,
  getPastConnections,
};
