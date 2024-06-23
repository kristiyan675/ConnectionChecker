#!/bin/bash

# Update package list
echo "Updating package list..."
sudo apt-get update
if [ $? -ne 0 ]; then
  echo "Failed to update package list. Exiting."
  exit 1
fi

# Install rsyslog and iptables
echo "Installing iptables..."
sudo apt-get install -y iptables
if [ $? -ne 0 ]; then
  echo "Failed to install iptables. Exiting."
  exit 1
fi

# Ensure /var/log/syslog file exists
echo "Ensuring /var/log/syslog file exists..."
sudo touch /var/log/syslog
if [ $? -ne 0 ]; then
  echo "Failed to ensure /var/log/syslog file exists. Exiting."
  exit 1
fi

# Clear existing iptables rules
echo "Clearing existing iptables rules..."
sudo iptables -F
if [ $? -ne 0 ]; then
  echo "Failed to clear iptables rules. Exiting."
  exit 1
fi

# Log and accept incoming packets
echo "Setting iptables rules to log and accept incoming packets..."
sudo iptables -A INPUT -j LOG --log-prefix "IPTables-ACCEPT: " --log-level 4
if [ $? -ne 0 ]; then
  echo "Failed to set iptables rule for logging incoming packets. Exiting."
  exit 1
fi
sudo iptables -A INPUT -j ACCEPT
if [ $? -ne 0 ]; then
  echo "Failed to set iptables rule for accepting incoming packets. Exiting."
  exit 1
fi

# Log and accept outgoing packets
echo "Setting iptables rules to log and accept outgoing packets..."
sudo iptables -A OUTPUT -j LOG --log-prefix "IPTables-ACCEPT: " --log-level 4
if [ $? -ne 0 ]; then
  echo "Failed to set iptables rule for logging outgoing packets. Exiting."
  exit 1
fi
sudo iptables -A OUTPUT -j ACCEPT
if [ $? -ne 0 ]; then
  echo "Failed to set iptables rule for accepting outgoing packets. Exiting."
  exit 1
fi

echo "Setup completed successfully."


node index.js