# Production Deployment Guide

## 🚀 Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Domain with SSL certificate
- [ ] OpenAI API key with sufficient credits
- [ ] Redis instance (optional but recommended)
- [ ] Monitoring service (Sentry, DataDog, etc.)

### Environment Configuration

1. **Required Environment Variables**
```bash
# API Keys
OPENAI_API_KEY=sk-...                    # Required
JWT_SECRET=$(openssl rand -base64 32)    # Required for auth

# Security
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Optional but Recommended
REDIS_URL=redis://...                    # For distributed rate limiting
SENTRY_DSN=https://...                   # For error tracking
```

2. **Build and Start**
```bash
npm install --production
npm run build
npm start
```

### Deployment Options

#### Option 1: Zeabur (Recommended for simplicity)
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy with one click
4. Enable health checks at `/api/health`

#### Option 2: Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option 4: Traditional VPS
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "daily-english" -- start
pm2 save
pm2 startup
```

### Post-Deployment Verification

1. **Health Check**
```bash
curl https://yourdomain.com/api/health
```

2. **Security Headers**
```bash
curl -I https://yourdomain.com/api/realtime-session
```

3. **Rate Limiting**
```bash
# Test rate limits
for i in {1..15}; do
  curl https://yourdomain.com/api/realtime-session
done
```

### Monitoring Setup

1. **Application Monitoring**
- Set up Sentry for error tracking
- Configure custom alerts for API failures
- Monitor OpenAI API usage

2. **Infrastructure Monitoring**
- CPU and memory usage alerts
- SSL certificate expiration
- Uptime monitoring

3. **Cost Monitoring**
- OpenAI API usage dashboard
- Daily cost alerts
- User quota tracking

### Security Hardening

1. **Network Security**
```nginx
# Nginx configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;

location /api/ {
    limit_req zone=api burst=5 nodelay;
    proxy_pass http://localhost:3000;
}
```

2. **Application Security**
- Enable all security headers
- Implement CSP policy
- Regular dependency updates
- API key rotation schedule

### Backup and Recovery

1. **Data Backup**
- User session data (if using database)
- Configuration backups
- SSL certificates

2. **Disaster Recovery**
- Document recovery procedures
- Test restore process
- Keep staging environment updated

### Performance Optimization

1. **Caching Strategy**
- CDN for static assets
- Redis for session storage
- Browser caching headers

2. **Resource Optimization**
- Enable gzip compression
- Optimize images and assets
- Lazy load components

### Troubleshooting

#### Common Issues

1. **"Service Unavailable" errors**
- Check OpenAI API key validity
- Verify rate limits not exceeded
- Check server resources

2. **WebRTC Connection Failures**
- Verify HTTPS is enabled
- Check CORS configuration
- Test with different browsers

3. **High Latency**
- Check server location
- Monitor OpenAI API response times
- Consider edge deployment

#### Debug Commands
```bash
# Check application logs
pm2 logs daily-english

# Monitor real-time metrics
pm2 monit

# Test WebRTC connectivity
npm run test:webrtc
```

### Maintenance Schedule

**Daily**
- Monitor error rates
- Check API usage
- Review security alerts

**Weekly**
- Update dependencies
- Review user feedback
- Analyze performance metrics

**Monthly**
- Rotate API keys
- Security audit
- Cost analysis

**Quarterly**
- Major version updates
- Infrastructure review
- Disaster recovery test

## 📊 Scaling Considerations

When your application grows:

1. **Horizontal Scaling**
   - Implement Redis for shared state
   - Use load balancer with sticky sessions
   - Consider WebSocket clustering

2. **Database Integration**
   - Add PostgreSQL for user data
   - Implement proper migrations
   - Regular backups

3. **Multi-region Deployment**
   - Use CDN for global distribution
   - Deploy to multiple regions
   - Implement geo-routing

## 🔒 Compliance

Ensure compliance with:
- GDPR (if serving EU users)
- CCPA (if serving California users)
- OpenAI usage policies
- Local data protection laws

Remember to document all changes and maintain an audit trail for production deployments.