const { getActiveConnections } = require("./networkCheck");
const { checkIPs } = require("./ipCheck");

async function main() {
  const activeConnections = getActiveConnections();
  console.log("Active Connections:", activeConnections);
  // await checkIPs(activeConnections);
}

main();
