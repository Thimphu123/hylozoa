# PDF Analysis Guide

This guide explains how to analyze the `prototype.pdf` file to extract chapters and prepare content for the website.

## Prerequisites

1. **Node.js 18+** installed on your system
2. **npm** or **yarn** package manager
3. All dependencies installed: `npm install`

## Running the Analysis

### Option 1: Using npm script (Recommended)

```bash
npm run analyze-pdf
```

### Option 2: Using tsx directly

```bash
npx tsx scripts/analyze-pdf-full.ts
```

## What the Analysis Does

The analysis script will:

1. **Parse the PDF** (`prototype.pdf`)
   - Extracts text content from all pages
   - Handles large PDFs (174MB) with chunked processing if needed

2. **Extract Chapters**
   - Identifies chapter headings using pattern matching
   - Groups pages by chapter
   - Creates chapter metadata

3. **Identify Sections**
   - Finds numbered sections within chapters
   - Extracts section titles and content

4. **Suggest 3D Models**
   - Analyzes content for biological concepts
   - Identifies structures that would benefit from 3D visualization
   - Creates model suggestions with priorities

5. **Generate Output Files**
   - `data/chapters/extracted.json` - Raw PDF chapter data
   - `data/chapters/chapters.json` - Formatted chapter data for website

## Output Structure

### extracted.json
Raw chapter data from PDF:
```json
{
  "title": "Chapter 1: Introduction",
  "pages": [...],
  "startPage": 1,
  "endPage": 25
}
```

### chapters.json
Website-ready chapter data:
```json
{
  "slug": "chapter-1-introduction",
  "title": "Chapter 1: Introduction",
  "description": "...",
  "order": 1,
  "sections": [
    {
      "title": "1.1 Overview",
      "content": "...",
      "models": [...]
    }
  ]
}
```

## Handling Large PDFs

If the PDF is too large to process at once:

1. The script will automatically try to parse the first 100 pages as a sample
2. For full analysis, you may need to:
   - Process in chunks (modify the script)
   - Use a more powerful machine
   - Consider using a cloud service

## Manual Review Required

After running the analysis:

1. **Review `data/chapters/chapters.json`**
   - Check chapter titles are correct
   - Verify sections are properly identified
   - Ensure content is complete

2. **Edit Chapter Data**
   - Fix any misidentified chapters
   - Add missing sections
   - Refine descriptions
   - Update model paths when models are created

3. **Create 3D Models**
   - Based on suggested models from analysis
   - Place in `public/models/` directory
   - Update model paths in chapter data

## Troubleshooting

### Error: "PDF is too large"
- The script will automatically try a sample (first 100 pages)
- For full analysis, consider processing in chunks

### Error: "Module not found"
- Run `npm install` to install all dependencies
- Ensure `tsx` is installed: `npm install -D tsx`

### No chapters found
- Check PDF structure - chapters may use different heading patterns
- Modify `lib/pdf-parser.ts` to add more chapter patterns
- Consider manual chapter identification

### Memory errors
- Close other applications
- Process PDF in smaller chunks
- Use a machine with more RAM

## Next Steps After Analysis

1. Review extracted chapters
2. Create or source 3D models
3. Update chapter data with model paths
4. Refine content for clarity
5. Test chapter pages on the website

## Alternative: Manual Chapter Creation

If automatic analysis doesn't work well, you can manually create chapter data:

1. Open `data/chapters/chapters.json`
2. Create chapter entries following the structure in `data/chapters/sample-chapter.json`
3. Copy content from PDF manually
4. Add sections and model references

See `docs/CHAPTER_DESIGN.md` for chapter structure guidelines.


