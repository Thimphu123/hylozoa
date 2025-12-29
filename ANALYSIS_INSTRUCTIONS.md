# PDF Analysis Instructions

## Quick Start

To analyze the `prototype.pdf` file and extract chapters:

### Step 1: Install Dependencies

Make sure you have Node.js 18+ installed, then run:

```bash
npm install
```

This will install all required dependencies including `tsx` for running TypeScript scripts.

### Step 2: Run Analysis

**Option A: Standard Analysis (for smaller PDFs or if you have enough memory)**
```bash
npm run analyze-pdf
```

**Option B: Chunked Analysis (recommended for large PDFs like 174MB)**
```bash
npm run analyze-pdf-chunked
```

The chunked version processes the PDF in smaller pieces to avoid memory issues.

### Step 3: Review Results

After analysis completes, check:

1. **`data/chapters/extracted.json`** - Raw chapter data from PDF
2. **`data/chapters/chapters.json`** - Formatted data ready for the website

### Step 4: Manual Review & Editing

1. Open `data/chapters/chapters.json`
2. Review each chapter:
   - Verify chapter titles are correct
   - Check sections are properly identified
   - Ensure content is complete
3. Edit as needed:
   - Fix misidentified chapters
   - Add missing sections
   - Refine descriptions
   - Update model paths when 3D models are created

## What Gets Extracted

- **Chapters**: Identified by common chapter heading patterns
- **Sections**: Numbered sections within chapters (e.g., "1.1 Introduction")
- **Content**: Text content from each section
- **3D Model Suggestions**: Concepts that would benefit from 3D visualization

## Troubleshooting

### "Module not found" error
```bash
npm install
```

### "PDF is too large" error
Use the chunked version:
```bash
npm run analyze-pdf-chunked
```

### No chapters found
- The PDF might use non-standard chapter headings
- Check `lib/pdf-parser.ts` and add more chapter patterns
- Consider manual chapter creation (see below)

### Memory errors
- Close other applications
- Use the chunked analysis script
- Process on a machine with more RAM

## Manual Chapter Creation

If automatic analysis doesn't work well, you can manually create chapters:

1. Copy `data/chapters/sample-chapter.json` as a template
2. Create entries for each chapter
3. Copy content from PDF manually
4. Add sections and model references

See `docs/CHAPTER_DESIGN.md` for the chapter structure format.

## Next Steps After Analysis

1. ✅ Review extracted chapters
2. ✅ Create or source 3D models based on suggestions
3. ✅ Place models in `public/models/` directory
4. ✅ Update model paths in `data/chapters/chapters.json`
5. ✅ Refine content for clarity and accuracy
6. ✅ Test chapter pages on the website

## Support

For detailed information, see:
- `docs/PDF_ANALYSIS_GUIDE.md` - Comprehensive analysis guide
- `docs/CHAPTER_DESIGN.md` - Chapter structure guidelines


