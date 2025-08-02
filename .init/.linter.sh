#!/bin/bash
cd /home/kavia/workspace/code-generation/medbook-appointment-system-17676-17699/appointment_frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

