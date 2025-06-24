# OpenAI Realtime API Security Best Practices

## ⚠️ Current Implementation Warning

The current implementation directly exposes the API key to the browser, which is **NOT SECURE** for production use. This is only suitable for:
- Local development
- Proof of concept
- Demo environments with restricted access

## 🔒 Production-Ready Architecture

### Option 1: WebSocket Proxy Server (Recommended)

```
┌─────────────┐     WebSocket      ┌─────────────┐     WebSocket      ┌─────────────┐
│   Browser   │ ◄─────────────────► │ Your Server │ ◄─────────────────► │   OpenAI    │
│  (No API)   │   Authenticated     │  (Has Key)  │    Secure API      │  Realtime   │
└─────────────┘                     └─────────────┘                     └─────────────┘
```

**Implementation:**
```javascript
// server/websocket-proxy.js
const WebSocket = require('ws')
const { authenticate } = require('./auth')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', async (clientWs, request) => {
  // 1. Authenticate user
  const user = await authenticate(request)
  if (!user) {
    clientWs.close(1008, 'Unauthorized')
    return
  }

  // 2. Check user quotas/permissions
  if (!await checkUserQuota(user.id)) {
    clientWs.close(1008, 'Quota exceeded')
    return
  }

  // 3. Connect to OpenAI
  const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  })

  // 4. Proxy messages
  clientWs.on('message', (data) => {
    // Validate and forward to OpenAI
    openaiWs.send(data)
    logUsage(user.id, data)
  })

  openaiWs.on('message', (data) => {
    // Forward to client
    clientWs.send(data)
  })
})
```

### Option 2: Serverless WebSocket (AWS/Cloudflare)

**AWS API Gateway + Lambda:**
```typescript
// lambda/websocket-handler.ts
export const handler = async (event) => {
  const { routeKey, connectionId } = event.requestContext
  
  switch (routeKey) {
    case '$connect':
      // Authenticate and store connection
      return handleConnect(event)
    
    case '$disconnect':
      // Clean up connection
      return handleDisconnect(connectionId)
    
    case 'sendAudio':
      // Forward to OpenAI with server-side API key
      return handleAudioForward(event)
    
    default:
      return { statusCode: 400 }
  }
}
```

### Option 3: Server-Sent Events (SSE) Alternative

For simpler implementation without WebSocket infrastructure:

```typescript
// app/api/realtime-stream/route.ts
export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { audio } = await request.json()
  
  // Forward to OpenAI
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: createFormData(audio)
  })

  return Response.json(await response.json())
}
```

## 🛡️ Security Checklist

### 1. API Key Protection
- [ ] Never send API keys to the browser
- [ ] Store keys in environment variables
- [ ] Use server-side proxy for all API calls
- [ ] Rotate keys regularly

### 2. Authentication & Authorization
- [ ] Require user authentication
- [ ] Implement session management
- [ ] Validate permissions per request
- [ ] Use HTTPS everywhere

### 3. Rate Limiting & Quotas
```typescript
// middleware/rate-limit.ts
const rateLimiter = new Map()

export function rateLimit(userId: string): boolean {
  const key = `${userId}:${Date.now() / 60000 | 0}` // Per minute
  const count = rateLimiter.get(key) || 0
  
  if (count > MAX_REQUESTS_PER_MINUTE) {
    return false
  }
  
  rateLimiter.set(key, count + 1)
  return true
}
```

### 4. Cost Management
```typescript
// services/usage-tracker.ts
export async function trackUsage(userId: string, tokens: number) {
  const usage = await db.usage.update({
    where: { userId },
    data: {
      tokensUsed: { increment: tokens },
      lastUsed: new Date()
    }
  })

  if (usage.tokensUsed > usage.monthlyLimit) {
    throw new Error('Monthly limit exceeded')
  }
}
```

### 5. Monitoring & Logging
```typescript
// services/logger.ts
export function logRealtimeEvent(event: {
  userId: string
  action: string
  tokens?: number
  error?: string
}) {
  // Send to logging service
  logger.info('realtime_api_event', {
    ...event,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}
```

## 🚀 Deployment Options

### 1. Vercel + Custom WebSocket Server
- Deploy Next.js on Vercel
- Deploy WebSocket proxy on Railway/Render
- Use environment variables for API keys

### 2. Self-Hosted (Docker)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000 8080

CMD ["npm", "run", "start:all"]
```

### 3. Zeabur (Full-Stack)
Since Zeabur supports WebSocket, you can deploy the entire stack:
```yaml
# zeabur.yaml
services:
  web:
    build_command: npm run build
    start_command: npm run start:server
    environment:
      - OPENAI_API_KEY
    ports:
      - 3000
      - 8080
```

## 📝 Migration Path

1. **Phase 1**: Current implementation (dev only)
2. **Phase 2**: Add authentication layer
3. **Phase 3**: Implement WebSocket proxy
4. **Phase 4**: Add rate limiting & monitoring
5. **Phase 5**: Production deployment

## 🔍 Testing Security

```bash
# Check for exposed API keys
grep -r "OPENAI_API_KEY" --include="*.js" --include="*.ts" dist/

# Test rate limiting
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/realtime \
    -H "Authorization: Bearer $TOKEN"
done

# Monitor WebSocket connections
wscat -c ws://localhost:8080 -H "Authorization: Bearer $TOKEN"
```

Remember: **Security is not optional in production!**