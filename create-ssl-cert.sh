#!/bin/bash

echo "🔒 Creating SSL Certificate for cosmic.board"
echo "=========================================="

# Create SSL directory if it doesn't exist
SSL_DIR="/usr/local/etc/nginx/ssl"
echo "Creating SSL directory: $SSL_DIR"
sudo mkdir -p $SSL_DIR

# Generate private key
echo "Generating private key..."
sudo openssl genrsa -out $SSL_DIR/cosmic.board.key 2048

# Generate certificate signing request
echo "Generating certificate signing request..."
sudo openssl req -new -key $SSL_DIR/cosmic.board.key \
  -out $SSL_DIR/cosmic.board.csr \
  -subj "/C=US/ST=State/L=City/O=CosmicBoard/CN=cosmic.board"

# Generate self-signed certificate (valid for 365 days)
echo "Generating self-signed certificate..."
sudo openssl x509 -req -days 365 \
  -in $SSL_DIR/cosmic.board.csr \
  -signkey $SSL_DIR/cosmic.board.key \
  -out $SSL_DIR/cosmic.board.crt

# Set proper permissions
echo "Setting permissions..."
sudo chmod 600 $SSL_DIR/cosmic.board.key
sudo chmod 644 $SSL_DIR/cosmic.board.crt

echo ""
echo "✅ SSL Certificate created successfully!"
echo ""
echo "Certificate location: $SSL_DIR/cosmic.board.crt"
echo "Private key location: $SSL_DIR/cosmic.board.key"
echo ""
echo "Note: This is a self-signed certificate for local development."
echo "Your browser will show a security warning which you can bypass."
echo ""
echo "To use HTTPS:"
echo "1. Copy nginx-cosmic-board.conf to nginx config directory"
echo "2. Restart nginx: brew services restart nginx"
echo "3. Access the site at: https://cosmic.board"