# Connection Checker

## Description

Connection Checker is a Node.js application designed to gather network connection information, both active and past connectivity, from system logs. It utilizes system commands to fetch active connections and reads log files to gather past connections. The gathered IP addresses and host information can then be run over a threat intelligence platform such as AbuseIPDB to check for any potential threats.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- Bash (for running the setup script)
- Administrative privileges (for setting up iptables and accessing log files)

## Setup

### 1. Clone the Repository

First, clone the repository to your local machine:

    git clone https://github.com/your-repo/connection-checker.git

### 2. Move to folder

    cd connection-checker

### 3. Instal dependencies

    npm install

**Note:** If you are using Linux, you need to run the bash script first. If you are on Windows, you can run `node index.js` directly.

### 4. Update Package List and Install Dependencies

The setup script will update the package list and install necessary packages such as `iptables`. It will also ensure the existence of the log file and set up iptables rules to log and accept incoming and outgoing packets.

### 5. Running the Setup Script

Execute the following command to run the setup script:

    ```bash
    sudo ./env_setup.sh

### The application will:

- Gather active network connections using system commands (`netstat` or `ss`).
- Gather past network connections from system logs (Firewall logs on Windows and syslog on Linux).

## Main Functions

### getActiveConnections()

Gathers active network connections using system commands (`netstat` or `ss`).

### getPastConnections()

Gathers past network connections from system logs. For Windows, it reads Firewall logs. For Linux, it reads syslog logs using iptables.

## Using Threat Intelligence Platform

The unique public network information collected by the application can be run over a threat intelligence platform like AbuseIPDB for threat analysis.

## Troubleshooting

- Ensure that you have administrative privileges to run the setup script.
- Verify that logging is enabled and you have read access to the log files.
- Check if the required packages (`iptables`) are installed properly.
