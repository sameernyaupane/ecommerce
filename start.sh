#!/bin/sh
mkdir -p /var/log
touch /var/log/email-worker.log
chmod 666 /var/log/email-worker.log

# Start the email worker in the background
tsx watch app/workers/emailProcessor.ts > /var/log/email-worker.log 2>&1 &

# Start the main application
exec npm run dev 