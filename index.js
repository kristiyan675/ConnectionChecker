const {
  getPastConnections,
  getActiveConnections,
  resolveHostname,
  isValidIp,
} = require("./networkCheck");
// const { checkIP } = require("./ipCheck");

async function main() {
  try {
    // Get current connections
    const currentConnections = await getActiveConnections();
    console.log("Current connections:", currentConnections);

    // Get past connections
    const pastConnections = await getPastConnections();

    console.log("Past connections:", pastConnections, pastConnections.length);

    // Combine current and past connections
    // const allConnections = [...currentConnections, ...pastConnections];
    const allConnections = [...currentConnections];

    const foreignIPs = allConnections.map((conn) => {
      const ip = conn.foreignAddress.split(":")[0].trim();
      return ip;
    });

    const filteredIPs = foreignIPs.filter((ip) => {
      const isValid =
        isValidIp(ip) &&
        ip !== "0.0.0.0" &&
        ip !== "::" &&
        !ip.startsWith("127.") &&
        !ip.startsWith("169.254.") &&
        !ip.startsWith("fe80::");
      if (!isValid) {
        // console.log("Filtered out IP:", ip); // Log each filtered out IP
      }
      return isValid;
    });

    const uniqueIPs = [...new Set(filteredIPs)];
    console.log("Unique IPs:", uniqueIPs); // Log unique IPs

    const resolvedHostnames = await Promise.all(
      uniqueIPs.map((ip) => resolveHostname(ip))
    );
    console.log("Resolved Hostnames:", resolvedHostnames);

    // for (const { ip, hostname } of resolvedHostnames) {
    //   const result = await checkIP(ip);
    //   console.log(`IP: ${ip}, Hostname: ${hostname} - Result:`, result);
    // }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
