const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const { getCommand, parseNetstat, parseSS } = require("./utils");
const readline = require("readline");
const logFilePath =
  process.env.SystemRoot + "\\System32\\LogFiles\\Firewall\\pfirewall.log";

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

function getPastConnections() {
  return new Promise((resolve, reject) => {
    if (os.platform() === "win32") {
      // Windows environment
      fs.access(logFilePath, fs.constants.R_OK, (err) => {
        if (err) {
          console.log(
            "Firewall log file not found or insufficient permissions. Please ensure logging is enabled and you have read access."
          );
          resolve([]); // Resolve with an empty array if the log file is not found or if there are no read permissions
          return;
        }
      });

      const entryLimit = -10; // for demo purposes we only use last few entries - AbusIpDB allowes 1000/day
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
      const grepCommand = `grep 'IPTables-ACCEPT' /var/log/syslog`;

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
          const action = parts[6].includes("ACCEPT") ? "ALLOW" : "DENY";

          const inIndex = parts.findIndex((part) => part.startsWith("IN="));

          const direction =
            parts[inIndex].split("=")[1] !== "*" ? "RECEIVE" : "SEND";

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

          if (logEntry.Action === "ALLOW") {
            connections.push(logEntry);
          }
        });
        resolve(connections.slice(-10)); // Resolve the promise with the last 10 collected connections for demo purposes
      });
    }
  });
}

module.exports = {
  getActiveConnections,
  getPastConnections,
};
