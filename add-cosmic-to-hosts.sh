#!/bin/bash

# Add cosmic.board to /etc/hosts (same as loopify.sam)
echo "Adding cosmic.board to /etc/hosts..."

# Check if already exists
if grep -q "cosmic.board" /etc/hosts; then
    echo "cosmic.board already exists in /etc/hosts"
    grep cosmic.board /etc/hosts
else
    # Add it (same format as loopify.sam)
    echo "192.168.0.18 cosmic.board" >> /etc/hosts
    echo "✅ Added: 192.168.0.18 cosmic.board"
fi

echo ""
echo "Current entries for 192.168.0.18:"
grep "192.168.0.18" /etc/hosts