# Deployment Guide for Vercel with GitHub Actions

This guide will help you deploy your Next.js portfolio to Vercel using GitHub Actions for automated deployments.

## Prerequisites

1. GitHub account
2. Vercel account
3. Your code pushed to a GitHub repository

## Step 1: Set up Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

## Step 2: Get Vercel Credentials

1. In your Vercel project settings, go to "Settings" → "General"
2. Note down:
   - **Project ID** (found in Project Settings)
   - **Team ID** (if you're using a team account) or **Org ID** (for personal account)

3. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
4. Create a new token with appropriate permissions
5. Copy the token

## Step 3: Set up GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token_here
ORG_ID=your_org_id_here
PROJECT_ID=your_project_id_here
```

## Step 4: Configure Environment Variables (if needed)

If your app uses environment variables:

1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add your environment variables for Production, Preview, and Development
3. Or add them to GitHub Secrets and reference them in the workflow

## Step 5: Push to GitHub

1. Commit and push your changes:
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

2. The GitHub Action will automatically trigger and deploy your app

## Step 6: Verify Deployment

1. Check the "Actions" tab in your GitHub repository
2. Monitor the deployment progress
3. Once complete, your app will be available at your Vercel URL

## Workflow Features

- ✅ Automatic deployment on push to main branch
- ✅ Build verification on pull requests
- ✅ Uses pnpm for faster installs
- ✅ Caches dependencies for faster builds
- ✅ Deploys to production environment

## Troubleshooting

### Common Issues:

1. **Build fails**: Check the build logs in GitHub Actions
2. **Environment variables missing**: Ensure they're set in Vercel dashboard
3. **Token permissions**: Make sure your Vercel token has the right permissions
4. **Project ID mismatch**: Verify the PROJECT_ID matches your Vercel project

### Manual Deployment:

If you need to deploy manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Custom Domain (Optional)

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed
4. Your app will be available at your custom domain

## Monitoring

- Check deployment status in Vercel Dashboard
- Monitor performance in Vercel Analytics
- View logs in Vercel Functions tab (if using API routes)
