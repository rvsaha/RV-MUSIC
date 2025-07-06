# RV MUSIC Deployment Guide

## Frontend (Netlify)
1. Push your code to GitHub.
2. Go to [Netlify](https://app.netlify.com/) and create a new site from GitHub.
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variable:
   - `REACT_APP_API_URL=https://your-backend.onrender.com`
6. (Optional) Use the provided `netlify.toml` for redirects.
7. Deploy!

## Backend (Render)
1. Push your backend code to GitHub.
2. Go to [Render](https://dashboard.render.com/) and create a new Web Service from your repo.
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables (see `.env.example`):
   - `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FB_CLIENT_ID`, `FB_CLIENT_SECRET`, `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`, `CORS_ORIGIN`
6. (Optional) Use the provided `render.yaml` for infrastructure-as-code setup.
7. Deploy!

## Notes
- Make sure CORS_ORIGIN in backend matches your Netlify frontend URL.
- For VAPT, follow the security checklist in the main README.
