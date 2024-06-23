#!/bin/bash

# Update package list and install rsyslog and iptables
sudo apt-get update
sudo apt-get install -y rsyslog iptables

# Start and enable rsyslog service
sudo systemctl start rsyslog
sudo systemctl enable rsyslog

# Ensure /var/log/syslog file exists
sudo touch /var/log/syslog

# Clear existing iptables rules
sudo iptables -F

# Log and accept incoming packets
sudo iptables -A INPUT -j LOG --log-prefix "IPTables-ACCEPT: " --log-level 4
sudo iptables -A INPUT -j ACCEPT

# Log and accept outgoing packets
sudo iptables -A OUTPUT -j LOG --log-prefix "IPTables-ACCEPT: " --log-level 4
sudo iptables -A OUTPUT -j ACCEPT


node ./index.js