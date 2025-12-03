# VTM Rumors Display

An elegant dark-themed single-page application that displays random Vampire: The Masquerade rumors with smooth GSAP animations.

## Features

- Random rumor selection from `vtm-rumors.json`
- Shuffled stack to avoid repeating entries until all have been shown
- Smooth GSAP fade-in/fade-out animations
- Dark theme optimized for readability
- Responsive design

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Static Assets

Static assets like fonts and images should be placed in the `public/` folder:

- **Fonts**: `public/fonts/` - Reference as `/VTM-Cursor/fonts/your-font.woff2`
- **Images**: `public/images/` - Reference as `/VTM-Cursor/images/your-image.jpg`
- **Other static files**: Place directly in `public/` - Reference as `/VTM-Cursor/filename.ext`

Files in `public/` are copied to the root of `dist/` during build and are served as-is.

For assets imported in JavaScript/CSS (processed by Vite), place them in `src/assets/` and import them:
```javascript
import myImage from './assets/image.jpg'
```

## GitHub Pages Deployment

The project is configured to deploy to GitHub Pages at `/VTM-Cursor/`. After building, the `dist/` folder can be deployed to the `gh-pages` branch or via GitHub Actions.
