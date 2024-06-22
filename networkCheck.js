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
      return "netstat -an";
    case "linux":
      return "ss -atun";
    default:
      throw new Error("Unsupported OS");
  }
}

function parseNetstat(output) {
  const lines = output.split("\n");
  console.log(lines, "---------------------------1");
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
  console.log(connections, "-------------------------2");
  return connections;
}

function parseSS(output) {
  const lines = output.split("\n");
  console.log(lines, "---------------------------1");
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

  console.log(connections, "-------------------------2");
  return connections;
}

function getActiveConnections() {
  const command = getCommand();
  let connections;
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (command.startsWith("netstat")) {
        connections = parseNetstat(stdout);
      } else {
        connections = parseSS(stdout);
      }
      resolve(connections);
    });
  });
}

const logFilePath =
  process.env.SystemRoot + "\\System32\\LogFiles\\Firewall\\pfirewall.log";

function getPastConnections() {
  return new Promise((resolve, reject) => {
    if (os.platform() === "win32") {
      // Windows environment
      if (!fs.existsSync(logFilePath)) {
        console.log(
          "Firewall log file not found. Please ensure logging is enabled."
        );
        resolve([]); // Resolve with an empty array if the log file is not found
        return;
      }
      const entryLimit = -10; // for demo purposes we only use last few entries
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

        let foreignAddress;
        if (direction === "SEND") {
          foreignAddress = columns[5]; // Destination IP is the foreign address
        } else if (direction === "RECEIVE") {
          foreignAddress = columns[4]; // Source IP is the foreign address
        }

        // Create an object with the parsed log entry
        const logEntry = {
          Date: columns[0],
          Time: columns[1],
          Action: columns[2],
          foreignAddress,
        };

        // Collect the log entry
        if (logEntry.Action === "ALLOW") {
          connections.push(logEntry);
        }
      });

      rl.on("close", () => {
        resolve(connections.slice(entryLimit)); // Resolve the promise with the last (limit) collected connections
      });

      rl.on("error", (error) => {
        reject(error); // Reject the promise in case of an error
      });
    } else {
      // Linux environment
      const grepCommand = `grep 'IPTables-INPUT\\|IPTables-OUTPUT' /var/log/syslog`;

      exec(grepCommand, (error, stdout, stderr) => {
        if (error) {
          reject(`Error executing grep command: ${error.message}`);
          return;
        }

        const lines = stdout.trim().split("\n");
        const connections = [];
        console.log(lines, " here lines----------------");
        lines.forEach((line) => {
          const parts = line.split(" ");
          const date = `${parts[0]} ${parts[1]}`;
          const time = parts[2];
          const action = parts.includes("ACCEPT") ? "ALLOW" : "DENY";
          const direction = parts[5].includes("IPTables-INPUT")
            ? "RECEIVE"
            : "SEND";
          const ipIndex =
            direction === "RECEIVE"
              ? parts.findIndex((part) => part.startsWith("SRC="))
              : parts.findIndex((part) => part.startsWith("DST="));
          const foreignAddress = parts[ipIndex].split("=")[1];

          const logEntry = {
            Date: date,
            Time: time,
            Action: action,
            foreignAddress,
          };

          connections.push(logEntry);
        });

        resolve(connections.slice(-10)); // Resolve the promise with the last 10 collected connections
      });
    }
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
