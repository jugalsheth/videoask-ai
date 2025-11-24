# Transcript Storage

This directory contains manual transcriptions for AI personas.

## How to Get Transcripts

### Option 1: YouTube Transcripts (Easiest)
1. Go to any YouTube video
2. Click the three dots (⋯) below the video
3. Click "Show transcript"
4. Copy all the text
5. Save as `.txt` file here

### Option 2: Podcast Transcripts
- Many podcasts provide transcripts on their websites
- Look for "Transcript" or "Show Notes" links
- Copy and save as `.txt`

### Option 3: Video Platforms
- Vimeo, TED Talks often have transcripts
- Look for CC (Closed Captions) or Transcript options

### Option 4: AI Transcription Services
- Use services like Otter.ai, Rev.com, or Descript
- Export as plain text

### Option 5: Manual Transcription
- For unique content, transcribe manually
- Use tools like Google Docs voice typing

## File Format

Save transcripts as:
- `persona-name.txt` - Plain text format
- One file per persona
- Include timestamps if available (optional)

## Example Structure

```
data/transcripts/
  ├── elon-musk-interview.txt
  ├── sam-altman-lex-fridman.txt
  ├── andrew-ng-lecture.txt
  └── README.md (this file)
```

## Adding a New Persona

1. Get the transcript (see methods above)
2. Save as `persona-name.txt` in this directory
3. The app will automatically detect and load it
4. Process it through the RAG pipeline

