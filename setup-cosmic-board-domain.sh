#!/bin/bash

# Script to setup cosmic.board domain

echo "Setting up cosmic.board domain..."

# Check if /etc/hosts is already symlinked to zScripts
if [ -L /etc/hosts ] && [ "$(readlink /etc/hosts)" = "/Users/sammuthu/zScripts/bin/system-config/hosts" ]; then
    echo "✅ /etc/hosts is already symlinked to zScripts"
    if grep -q "cosmic.board" /etc/hosts; then
        echo "✅ cosmic.board is configured in /etc/hosts"
    else
        echo "⚠️  cosmic.board not found in hosts file"
        echo "Please add: 127.0.0.1       cosmic.board"
        echo "to /Users/sammuthu/zScripts/bin/system-config/hosts"
    fi
else
    echo "📌 Your /etc/hosts is not symlinked to zScripts"
    echo "   Run this command to set it up:"
    echo "   /Users/sammuthu/zScripts/bin/system-config/setup-hosts-symlink.sh"
    echo ""
    echo "Or manually add cosmic.board to /etc/hosts:"
    if ! grep -q "cosmic.board" /etc/hosts; then
        echo "This requires sudo permission:"
        echo "127.0.0.1       cosmic.board" | sudo tee -a /etc/hosts
        echo "✅ cosmic.board has been added to /etc/hosts"
    else
        echo "✅ cosmic.board is already configured in /etc/hosts"
    fi
fi

echo ""
echo "📌 To access CosmicBoard, make sure:"
echo "1. The app is running on port 7777 (npm run dev)"
echo "2. Nginx is running (brew services list | grep nginx)"
echo "3. Visit http://cosmic.board in your browser"
echo ""
echo "✨ Setup complete!"