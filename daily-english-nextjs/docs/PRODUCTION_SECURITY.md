# Production Security Guide for Realtime API

## Overview

This document outlines the security measures implemented for the OpenAI Realtime API integration in production environments.

## 🔒 Security Features Implemented

### 1. Ephemeral Token System
- **Purpose**: Prevents API key exposure in client-side code
- **Implementation**: Server-side endpoint generates short-lived tokens
- **Token Lifetime**: 1 minute (OpenAI default)
- **Endpoint**: `/api/realtime-session`

### 2. Rate Limiting
- **Default**: 10 requests per minute per IP
- **Configurable** via environment variables
- **Whitelist Support**: For monitoring services
- **Clean-up**: Automatic removal of expired entries

### 3. CORS Protection
- **Allowed Origins**: Configurable whitelist
- **Methods**: GET, POST, OPTIONS only
- **Credentials**: Supported with proper origin validation
- **Preflight**: Cached for 24 hours

### 4. Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: microphone=(self)
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### 5. Request Validation
- Content-Type validation for POST requests
- Request size limits
- IP address validation
- Request ID tracking

### 6. Error Handling
- Generic error messages to prevent information leakage
- Detailed server-side logging
- Proper HTTP status codes
- No stack traces in production

## 🚀 Production Deployment Checklist

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...

# Security Configuration
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
LOG_LEVEL=info
```

### Infrastructure Requirements

1. **HTTPS Required**
   - SSL/TLS certificate mandatory
   - HSTS header enforced
   - Secure WebRTC connections

2. **Reverse Proxy Configuration**
   ```nginx
   # Nginx example
   location /api/ {
     proxy_pass http://localhost:3000;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header Host $host;
   }
   ```

3. **Firewall Rules**
   - Allow only necessary ports (443 for HTTPS)
   - Block direct access to application port
   - Implement DDoS protection

### Monitoring & Logging

1. **Access Logs**
   - Log all API requests
   - Monitor rate limit violations
   - Track ephemeral token usage

2. **Error Monitoring**
   - Set up alerts for 5xx errors
   - Monitor OpenAI API failures
   - Track rate limit hits

3. **Security Monitoring**
   - Monitor for suspicious patterns
   - Alert on repeated auth failures
   - Track unusual request volumes

## 🔐 Best Practices

### API Key Management
1. Never commit API keys to version control
2. Rotate keys regularly (every 90 days)
3. Use separate keys for dev/staging/production
4. Monitor key usage in OpenAI dashboard

### Session Management
1. Implement user authentication before token generation
2. Track active sessions per user
3. Implement session timeouts
4. Clear expired sessions regularly

### Data Privacy
1. Don't log sensitive conversation content
2. Implement data retention policies
3. Ensure GDPR compliance if applicable
4. Provide user data export/deletion

### Scaling Considerations
1. Use Redis for distributed rate limiting
2. Implement connection pooling
3. Consider API gateway for multiple services
4. Plan for WebRTC TURN server if needed

## 🚨 Incident Response

### If API Key is Compromised
1. Immediately rotate the key in OpenAI dashboard
2. Update environment variables
3. Review access logs for unauthorized usage
4. Notify affected users if necessary

### If Rate Limits are Hit
1. Review logs for abuse patterns
2. Adjust limits if legitimate usage
3. Implement user-specific quotas
4. Consider implementing queuing

### Security Audit Checklist
- [ ] All environment variables set correctly
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting active and tested
- [ ] CORS properly configured
- [ ] Security headers present
- [ ] Error messages don't leak information
- [ ] Logging configured appropriately
- [ ] Monitoring alerts set up
- [ ] Backup API key ready
- [ ] Incident response plan documented

## 📊 Performance Considerations

### Optimization Tips
1. Cache ephemeral tokens (carefully)
2. Use connection pooling for API calls
3. Implement request queuing for bursts
4. Monitor and optimize response times

### Load Testing
```bash
# Example with Apache Bench
ab -n 100 -c 10 https://yourdomain.com/api/realtime-session
```

## 🔄 Regular Maintenance

### Weekly
- Review access logs for anomalies
- Check rate limit effectiveness
- Monitor API usage costs

### Monthly
- Review and update security headers
- Check for dependency updates
- Audit user permissions

### Quarterly
- Rotate API keys
- Review security policies
- Conduct penetration testing
- Update documentation

## 📚 Additional Resources

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Security Best Practices](https://webrtc-security.github.io/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)