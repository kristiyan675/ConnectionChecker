const axios = require("axios");

// replace API key
const key =
  "5bced20af08836f249e834d2e2da350b844fbddd3f9d00dc084bdf47fecba24b994f80412c72babb";

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
