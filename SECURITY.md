# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within MylarMobile, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Instead, please email the maintainer directly or use GitHub's private vulnerability reporting feature
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## What to Expect

- You will receive acknowledgment of your report within 48 hours
- We will investigate and provide updates on the progress
- Once fixed, we will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices for Users

When deploying MylarMobile:

1. **Use HTTPS** - Always deploy behind a reverse proxy with SSL/TLS
2. **Protect your API key** - Never expose your Mylar API key publicly
3. **Network isolation** - Keep MylarMobile on the same network as Mylar when possible
4. **Keep updated** - Regularly update to the latest version
5. **Docker security** - Use read-only mounts where possible (`:ro`)

## Known Security Considerations

- The app stores the Mylar API key in browser localStorage
- The Express backend has direct read access to the Mylar SQLite database
- API requests are proxied through nginx/Vite to avoid CORS issues
