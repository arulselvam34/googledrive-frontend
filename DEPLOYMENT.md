# Frontend Deployment Guide

## Prerequisites

- Node.js v16+
- npm or yarn

## Environment Setup

### 1. Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

For production:
```
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_ENVIRONMENT=production
```

## Local Development

```bash
npm install
npm start
```

Application opens at `http://localhost:3000`

## Production Build

```bash
npm run build
```

Creates optimized build in `build/` directory

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Auto-deploy on push

### Option 2: Netlify

```bash
npm run build
netlify deploy --prod --dir=build
```

Or connect GitHub repository and auto-deploy

### Option 3: GitHub Pages

```bash
npm run build
# Deploy build/ to gh-pages branch
```

### Option 4: AWS S3 + CloudFront

```bash
npm run build
aws s3 sync build/ s3://your-bucket/
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

### Option 5: Docker

```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 6: Render/Railway

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

## Performance Optimization

### 1. Code Splitting
- Already implemented with React Router lazy loading
- Chunks are automatically split

### 2. Image Optimization
- Use next-gen formats (WebP)
- Implement lazy loading
- Compress images

### 3. Caching Strategy
```
Build files: 1 year cache
Index.html: No cache (validate always)
```

### 4. Bundle Analysis
```bash
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

## SEO Configuration

Add to `public/index.html`:
```html
<meta property="og:title" content="Google Drive">
<meta property="og:description" content="Cloud storage application">
<meta property="og:image" content="image.png">
```

## Security Headers

Configure web server to include:
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## CORS Configuration

Frontend requests should be allowed from API:

**Backend `.env`:**
```
CLIENT_URL=https://your-frontend-url.com
```

## Error Tracking

Integrate with Sentry:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: process.env.REACT_APP_ENVIRONMENT,
});
```

## Analytics

Integrate Google Analytics:
```javascript
import ReactGA from 'react-ga4';
ReactGA.initialize('GA_MEASUREMENT_ID');
```

## Monitoring

- **Lighthouse**: Check performance (target 90+)
- **WebPageTest**: Real user monitoring
- **Sentry**: Error tracking
- **Google Analytics**: User behavior

## Testing Before Deployment

```bash
npm test
npm run build
# Test build locally
npx serve -s build
```

## Deployment Checklist

- [ ] All environment variables set
- [ ] API URL correctly configured
- [ ] Build succeeds without errors
- [ ] No console warnings/errors
- [ ] Responsive design verified
- [ ] Cross-browser testing done
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Email verification works
- [ ] File upload/download works
- [ ] 404 page configured

## Post-Deployment

1. Test all user flows in production
2. Monitor error logs
3. Check analytics
4. Get user feedback
5. Plan next features

## Rollback Procedure

- Keep previous deployment ready
- Revert to previous version if issues
- Communicate with users if needed
- Post-mortem on issues

## Continuous Deployment

Use GitHub Actions:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod
```

## Version Management

- Keep `package.json` version updated
- Tag releases in Git
- Maintain CHANGELOG.md
- Document breaking changes
