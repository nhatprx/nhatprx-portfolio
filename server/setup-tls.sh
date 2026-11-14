#!/usr/bin/env bash
# Issue the Let's Encrypt certificate for nhatprx.com and enable HTTPS.
#
# Run on the EC2 host AFTER the DNS A records for nhatprx.com and
# www.nhatprx.com point at this instance's public IP:
#
#   bash setup-tls.sh
#
# Requires the two vhost files to already be installed in
# /etc/nginx/sites-available/:
#   nhatprx.com.conf      -> HTTP vhost
#   nhatprx.com.ssl.conf  -> HTTPS vhost (certs filled in by this script)
set -euo pipefail

SITE="nhatprx.com"
AVAIL="/etc/nginx/sites-available"
DOMAINS=(-d nhatprx.com -d www.nhatprx.com)

sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y certbot

# --certonly leaves the vhost alone; the HTTPS block is our own file, so
# certbot must not rewrite it.
sudo certbot certonly --non-interactive --agree-tos --no-eff-email \
  --register-unsafely-without-email --webroot -w /var/www/html \
  "${DOMAINS[@]}"

# Enable the HTTPS vhost now that the certificate exists.
sudo ln -sf "$AVAIL/$SITE.ssl.conf" "/etc/nginx/sites-enabled/$SITE.ssl.conf"

# Redirect plain HTTP to HTTPS once TLS is live.
sudo tee "$AVAIL/$SITE.redirect.conf" >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name nhatprx.com www.nhatprx.com;
    return 301 https://$host$request_uri;
}
EOF
sudo ln -sf "$AVAIL/$SITE.redirect.conf" "/etc/nginx/sites-enabled/$SITE.redirect.conf"
sudo rm -f "/etc/nginx/sites-enabled/$SITE.conf"

sudo nginx -t
sudo systemctl reload nginx

# Renewal only reloads nginx when a certificate actually changes.
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'HOOK'
#!/bin/sh
systemctl reload nginx
HOOK
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "TLS ready for ${DOMAINS[*]}"
sudo certbot certificates
