#!/bin/bash

# Preferred ports
PORT_PRIMARY=4000
PORT_FALLBACK=3960

# Function to check if a port is in use
is_port_in_use() {
  lsof -i :"$1" >/dev/null 2>&1
}

# Select port
if is_port_in_use $PORT_PRIMARY; then
  echo "Port $PORT_PRIMARY is in use."
  if is_port_in_use $PORT_FALLBACK; then
    echo "Port $PORT_FALLBACK is also in use."
    echo "No available ports."
    exit 1
  else
    PORT=$PORT_FALLBACK
  fi
else
  PORT=$PORT_PRIMARY
fi

echo "Server starting on port $PORT"

# Simple static server example (Python, can be replaced)
python3 -m http.server $PORT
