#!/bin/bash

# Add prism.ai to /etc/hosts
echo "Adding prism.ai to /etc/hosts..."

# Check if already exists
if grep -q "prism.ai" /etc/hosts; then
    echo "prism.ai already exists in /etc/hosts"
    grep prism.ai /etc/hosts
else
    # Add it (same format as other domains)
    echo "192.168.0.18 prism.ai" >> /etc/hosts
    echo "✅ Added: 192.168.0.18 prism.ai"
fi

echo ""
echo "Current entries for 192.168.0.18:"
grep "192.168.0.18" /etc/hosts