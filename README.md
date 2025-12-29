# Hylozoa - Interactive Biology Learning Website

A Next.js website that transforms complex biology textbook content into an interactive learning experience using 3D models.

## Features

- **Interactive 3D Models**: Explore biological structures with React Three Fiber
- **Easy to Understand**: Complex concepts broken down with visual aids
- **Comprehensive Coverage**: All textbook content explained
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technology Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **3D Graphics**: React Three Fiber + Three.js + Drei
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-parse

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hylozoa/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── chapters/          # Chapter pages
│   └── components/        # React components
├── lib/                    # Utility functions
│   ├── pdf-parser.ts      # PDF content extraction
│   ├── chapter-data.ts    # Chapter data management
│   └── models.ts          # 3D model configurations
├── public/                 # Static assets
│   └── models/            # 3D model files (GLB/GLTF)
└── data/                   # Extracted content
    └── chapters/          # Chapter JSON files
```

## Development Workflow

1. **Skeleton**: ✅ Complete - Basic website structure with navigation and routing
2. **PDF Analysis**: ✅ Complete - Tools created for extracting and analyzing PDF content
3. **Content Design**: ✅ Complete - Chapter structure and design patterns established
4. **3D Models**: ✅ Complete - ModelViewer component with interactive controls
5. **Integration**: ✅ Complete - Chapter pages with integrated 3D models
6. **Polish**: ✅ Complete - Search, progress tracking, accessibility, and performance optimizations
7. **Deployment**: ✅ Ready - Configured for Vercel deployment

## Next Steps

### 1. Analyze the PDF

Run the PDF analysis script to extract chapters:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the analysis script
npx tsx scripts/analyze-pdf-full.ts
```

This will:
- Extract all chapters from `prototype.pdf`
- Identify sections within each chapter
- Suggest 3D models needed
- Save chapter data to `data/chapters/chapters.json`

### 2. Create or Source 3D Models

Based on the analysis, create or source 3D models in GLB/GLTF format:
- Place models in `public/models/`
- Update model paths in chapter data
- Add annotations for interactive labels

### 3. Review and Refine Content

- Review extracted chapter content
- Edit for clarity and accuracy
- Ensure all concepts are explained
- Add more 3D models as needed

### 4. Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Deploy automatically

## Features Implemented

- ✅ Next.js 14 with App Router and TypeScript
- ✅ Interactive 3D model viewer with React Three Fiber
- ✅ Chapter navigation and section tracking
- ✅ Search functionality across all chapters
- ✅ Progress tracking per chapter
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ Performance optimizations (lazy loading, code splitting)
- ✅ SEO optimization (sitemap, robots.txt, metadata)

## Project Status

The website skeleton is complete and ready for content. The structure supports:
- Dynamic chapter pages
- Interactive 3D models
- Search and navigation
- Progress tracking
- Responsive design

**Ready for**: PDF analysis, 3D model creation, and content refinement.

## Deployment

The website is configured for deployment on Vercel. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

Quick deploy:
- Connect your Git repository to Vercel
- Vercel will auto-detect Next.js
- Deploy with one click

## License

MIT

