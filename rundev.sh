# Start the email worker in the background
tsx watch app/workers/emailProcessor.ts > /var/log/email-worker.log 2>&1 &

# Start the main application
exec npm run dev