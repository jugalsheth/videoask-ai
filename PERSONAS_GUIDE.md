# AI Personas Guide

## Overview

This app now supports **AI Personas** - chat with AI agents created from transcripts. Each persona uses RAG (Retrieval-Augmented Generation) to answer questions based on their knowledge base.

## How to Get Transcripts

### Method 1: YouTube Transcripts (Easiest) ⭐
1. Go to any YouTube video
2. Click the **three dots (⋯)** below the video
3. Click **"Show transcript"**
4. Click **"..."** → **"Toggle timestamps"** (optional)
5. **Copy all the text**
6. Save as `persona-name.txt` in `data/transcripts/`

### Method 2: Podcast Transcripts
- Many podcasts provide transcripts:
  - **Lex Fridman Podcast**: Full transcripts on website
  - **The Tim Ferriss Show**: Transcripts available
  - **Joe Rogan Experience**: Some episodes have transcripts
- Look for "Transcript" or "Show Notes" links
- Copy and save as `.txt` file

### Method 3: Video Platforms
- **TED Talks**: Full transcripts on TED.com
- **Vimeo**: Some videos have transcripts
- **Educational platforms**: Coursera, edX often have transcripts

### Method 4: AI Transcription Services
- **Otter.ai**: Free tier available
- **Rev.com**: Paid but accurate
- **Descript**: Great for editing
- **Whisper**: Use Groq API (already in your app!)

### Method 5: Manual Transcription
- For unique content
- Use **Google Docs voice typing** (free)
- Or transcribe manually

## Adding a Persona

1. **Get the transcript** (use any method above)
2. **Save it** as `persona-name.txt` in `data/transcripts/`
   - Example: `elon-musk-interview.txt`
   - Example: `sam-altman-lex-fridman.txt`
3. **Restart your dev server** (or the app will auto-detect)
4. **Go to** `/personas` page
5. **Click "Process"** to create embeddings
6. **Click "Chat"** to start asking questions!

## Example Transcript Sources

### Great for Learning:
- **Lex Fridman Podcast** - Deep technical discussions
- **TED Talks** - Educational content
- **Andrew Ng's lectures** - ML/AI education
- **Sam Altman interviews** - AI industry insights

### Popular Transcripts Available:
- Many YouTube videos with CC enabled
- Podcast show notes websites
- Academic lecture transcripts
- Conference talk transcripts

## File Format

Save transcripts as plain text (`.txt`):

```
This is the transcript text.
It can be multiple paragraphs.
Timestamps are optional but helpful.

[00:00] Speaker 1: Hello, welcome to the podcast.
[00:05] Speaker 2: Thanks for having me.
```

## Processing Flow

When you click "Process":

1. **Parse Transcript** → Split into segments
2. **Chunk with Overlap** → Create ~500 word chunks
3. **Generate Embeddings** → 384-dimensional vectors
4. **Store in Vector DB** → Ready for search
5. **Ready to Chat!** → Ask questions

## Asking Questions

Once processed, you can ask:

- "What are the main topics discussed?"
- "Summarize the key points"
- "What did they say about [topic]?"
- "Explain [concept] in detail"
- "What's their opinion on [subject]?"

## Educational Features

The app shows you **exactly how AI works**:

- **RAG (Retrieval-Augmented Generation)**: See how context is retrieved
- **Vector Search**: Watch similarity scores
- **Embeddings**: See how text becomes numbers
- **Chunking**: Understand why we break text apart
- **LLM**: Learn how Groq generates answers

Click **"Learn AI Concepts"** button in chat to see detailed explanations!

## Tips

1. **Longer transcripts = better personas** (more knowledge)
2. **Clear transcripts = better answers** (avoid noisy data)
3. **Multiple personas** = compare different perspectives
4. **Process once, chat forever** (embeddings are cached)

## Troubleshooting

**No personas showing?**
- Check `data/transcripts/` directory exists
- Ensure files are `.txt` format
- Restart dev server

**Processing fails?**
- Check transcript isn't empty
- Ensure file is readable
- Check console for errors

**Chat not working?**
- Make sure persona is processed (shows "Ready")
- Check GROQ_API_KEY is set
- Verify embeddings were created

