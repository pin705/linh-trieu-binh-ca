# Deployment Guide

Complete guide for deploying Linh Triều Bình Ca to production.

## Prerequisites

Before deploying, ensure you have:

- [x] Production MongoDB instance (MongoDB Atlas recommended)
- [x] Node.js 20.x or higher on production server
- [x] Domain name and SSL certificate (recommended)
- [x] Environment variables configured

## Environment Setup

### Required Environment Variables

Create a `.env` file in production with these variables:

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/linh-trieu-binh-ca

# Authentication Secret (REQUIRED - Must be strong and unique)
AUTH_SECRET=generate-a-very-secure-random-64-character-secret-here

# Game Configuration (Optional - defaults shown)
ENERGY_REGEN_MINUTES=5
MAX_ENERGY_DEFAULT=50
STARTING_GOLD=1000

# Node Environment
NODE_ENV=production
```

### Generate Secure AUTH_SECRET

```bash
# Use Node.js crypto to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Configure Network Access:
   - Add your production server IP
   - Or use `0.0.0.0/0` for any IP (less secure)
4. Create database user with read/write permissions
5. Get connection string from "Connect" button
6. Replace `<username>`, `<password>`, and database name

Example:
```
mongodb+srv://gameuser:SecurePass123@cluster0.xxxxx.mongodb.net/linh-trieu-binh-ca?retryWrites=true&w=majority
```

### Option 2: Self-Hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication
3. Use connection string: `mongodb://username:password@localhost:27017/linh-trieu-binh-ca`

## Build for Production

```bash
# Install dependencies
npm install --production=false

# Build the application
npm run build

# The build output will be in .output/
```

## Deployment Options

### Option 1: Direct Node.js

```bash
# Start the production server
node .output/server/index.mjs
```

**Using PM2 (Recommended):**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start .output/server/index.mjs --name linh-trieu-binh-ca

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs linh-trieu-binh-ca
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

Build and run:
```bash
docker build -t linh-trieu-binh-ca .
docker run -p 3000:3000 --env-file .env linh-trieu-binh-ca
```

### Option 3: Vercel/Netlify

Nuxt 3 supports serverless deployment:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Note:** Configure environment variables in the platform's dashboard.

### Option 4: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. Setup Ubuntu/Debian server
2. Install Node.js 20.x
3. Clone repository
4. Install dependencies
5. Configure environment
6. Build application
7. Use PM2 to run
8. Setup Nginx as reverse proxy

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Steps

### 1. Seed the Database

```bash
curl -X POST https://yourdomain.com/api/admin/seed
```

### 2. Test All Endpoints

```bash
# Health check
curl https://yourdomain.com/api/cards/templates

# Register test user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "testuser", "password": "testpass123"}'
```

### 3. Monitor Application

**With PM2:**
```bash
pm2 monit
pm2 logs linh-trieu-binh-ca --lines 100
```

**Check MongoDB Connection:**
- Monitor connection count in MongoDB Atlas dashboard
- Check for connection errors in logs

## Security Checklist

- [ ] Strong AUTH_SECRET configured (64+ characters)
- [ ] MongoDB authentication enabled
- [ ] MongoDB network access restricted to production IPs
- [ ] HTTPS/SSL certificate installed
- [ ] Environment variables not committed to git
- [ ] CORS configured (if needed)
- [ ] Rate limiting implemented (future)
- [ ] Admin endpoints protected (future)

## Performance Optimization

### 1. Enable Compression

Add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
  }
})
```

### 2. MongoDB Indexes

Indexes are automatically created by models. Verify in MongoDB:
```javascript
db.users.getIndexes()
db.cardtemplates.getIndexes()
db.usercards.getIndexes()
db.battles.getIndexes()
```

### 3. Caching Strategy

Consider implementing:
- Redis for session storage
- CDN for static assets
- Query result caching

## Monitoring and Logging

### Application Logs

**PM2:**
```bash
pm2 logs linh-trieu-binh-ca
pm2 logs linh-trieu-binh-ca --err  # Error logs only
```

**Docker:**
```bash
docker logs container_name -f
```

### MongoDB Monitoring

- Use MongoDB Atlas built-in monitoring
- Monitor slow queries
- Track database size and performance

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for user session replay
- Google Analytics for usage metrics

## Backup Strategy

### Database Backups

**MongoDB Atlas:**
- Automatic daily backups included
- Configure backup schedule in Atlas dashboard

**Self-Hosted:**
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/linh-trieu-binh-ca" --out=/backups/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/linh-trieu-binh-ca" /backups/20240101
```

### Application Backups

```bash
# Backup application files
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/app

# Keep last 7 days of backups
find /backups -name "backup-*.tar.gz" -mtime +7 -delete
```

## Scaling Considerations

### Horizontal Scaling

- Deploy multiple instances behind load balancer
- Share MongoDB connection
- Use Redis for session storage (shared state)

### Database Scaling

- MongoDB Atlas auto-scaling
- Read replicas for read-heavy operations
- Sharding for large datasets

## Troubleshooting

### Application Won't Start

1. Check logs: `pm2 logs` or `docker logs`
2. Verify environment variables
3. Test MongoDB connection
4. Check port availability

### High Memory Usage

1. Monitor with: `pm2 monit`
2. Check for memory leaks
3. Restart application: `pm2 restart linh-trieu-binh-ca`

### Slow Response Times

1. Check MongoDB slow query log
2. Verify indexes are created
3. Monitor server resources
4. Consider caching layer

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart linh-trieu-binh-ca
```

### Database Maintenance

- Monitor collection sizes
- Archive old battle records (>30 days)
- Vacuum/compact collections periodically

## Health Checks

Create endpoint for monitoring:

```typescript
// server/api/health.get.ts
export default defineEventHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
})
```

Monitor: `curl https://yourdomain.com/api/health`

## Support

For deployment issues:
1. Check logs first
2. Review MongoDB connection
3. Verify environment variables
4. Check server resources (CPU, RAM, disk)
5. Create GitHub issue with details

## Success Metrics

Monitor these KPIs:
- Response time < 200ms for API calls
- Database query time < 50ms
- Error rate < 0.1%
- Uptime > 99.9%
- Active users
- Battle completion rate

## Next Steps

After successful deployment:
1. Setup monitoring and alerting
2. Configure automatic backups
3. Implement rate limiting
4. Add admin authentication
5. Setup CI/CD pipeline
6. Performance testing
7. Load testing

Congratulations on deploying Linh Triều Bình Ca! 🎉
