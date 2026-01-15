#!/bin/bash

# Script to start the React application on macOS/Linux

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Set the title of the terminal tab (optional, works in some terminals)
echo -n -e "\033]0;React Predict-O-Rama\007"

echo "React Predict-O-Rama is starting..."
echo "To stop the server, press Ctrl+C"
echo ""

# Start the application
# react-scripts start will automatically open the default browser to http://localhost:3000
npm run start
