const axios = require("axios");
require("dotenv").config();

// replace API key
const key = process.env.apiKey;

async function checkIP(ip) {
  const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
    params: {
      ipAddress: ip,
    },
    headers: {
      Key: key,
      Accept: "application/json",
    },
  });
  return response.data;
}

async function checkIPs(ips) {
  for (let ip of ips) {
    const result = await checkIP(ip);
    console.log(result);
  }
}

module.exports = {
  checkIP,
  checkIPs,
};
