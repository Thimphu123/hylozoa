# Deployment Guide for Hylozoa

This guide covers deploying the Hylozoa website to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js 18+ installed locally (for testing)

## Pre-Deployment Checklist

- [ ] All dependencies are listed in `package.json`
- [ ] Environment variables are documented
- [ ] Build command works locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] All routes are working
- [ ] 3D models are optimized (if applicable)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect Next.js

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Environment Variables** (if needed)
   - Add any required environment variables in Vercel dashboard
   - Example: `NEXT_PUBLIC_BASE_URL` if you need a custom domain

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **For Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

1. **Verify Deployment**
   - Check all pages load correctly
   - Test 3D model loading
   - Verify search functionality
   - Test on mobile devices

2. **Set Custom Domain** (Optional)
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor build times
   - Watch for errors in logs

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18+)
- Check for TypeScript errors locally first

### 3D Models Not Loading

- Verify model files are in `public/models/`
- Check file paths in chapter data
- Ensure models are in GLB/GLTF format
- Check browser console for errors

### Large PDF Processing

- PDF analysis should be done locally
- Generated JSON files should be committed to repo
- Don't process PDF during build (too large)

## Environment Variables

Currently, no environment variables are required. If you need to set a custom base URL:

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Performance Optimization

- Models are lazy-loaded (only when in viewport)
- Images are optimized by Next.js
- Code is automatically split
- Static pages are pre-rendered

## Continuous Deployment

Once connected to Vercel:
- Every push to `main` branch = production deployment
- Every push to other branches = preview deployment
- Pull requests get preview URLs automatically

## Support

For issues:
1. Check Vercel deployment logs
2. Test locally first
3. Check Next.js documentation
4. Review React Three Fiber docs for 3D issues

