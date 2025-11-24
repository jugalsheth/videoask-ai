# VideoAsk AI - Learn AI by Using AI 🚀

A Next.js 14 app that teaches you about RAG (Retrieval-Augmented Generation) by actually using it! Create AI personas from transcripts and chat with them to see exactly how RAG finds answers in real-time.

## Features

- 🤖 **AI Personas** - Create and chat with AI personas from transcripts
- 💬 **Interactive Q&A** - Ask questions and get answers with source citations
- 📚 **Educational Focus** - Learn about embeddings, RAG, and vector search
- 🎨 **Beautiful UI** - Modern design with animations and glassmorphism
- ⚡ **Fast & Free** - Uses Groq API (free tier) for super-fast responses
- 🔄 **Real-time Processing** - See RAG pipeline in action with streaming updates

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS** + **Framer Motion** (animations)
- **Groq API** (free tier: 14,400 req/day)
- **@xenova/transformers** (free embeddings in browser/Node.js)
- **In-memory vector storage** (no external DB needed)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Groq API key (get one for free at https://console.groq.com/)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd VideoAsk/my-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Add your Groq API key to `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Create Personas**: Add transcripts (from YouTube, podcasts, etc.) to create AI personas
   - Transcripts are stored in `data/transcripts/` folder
   - Or create personas via the UI (stored in browser localStorage)

2. **Process Personas**: Click "Process" to run the RAG pipeline:
   - Chunks the transcript into manageable pieces
   - Creates embeddings (numbers that capture meaning) using Xenova transformers
   - Stores them in an in-memory vector database

3. **Chat with Personas**: Ask questions and see:
   - Your question converted to an embedding
   - Vector search through transcript chunks
   - Relevant segments found with similarity scores
   - An answer generated using Groq API with RAG context

4. **Learn as You Go**: Every feature includes educational explanations showing how RAG works!

## Project Structure

```
app/
├── page.tsx                 # Home/landing page
├── process/[videoId]/page.tsx  # Processing view
├── chat/[videoId]/page.tsx     # Chat interface
├── api/
│   ├── process/route.ts     # Process video API
│   └── ask/route.ts         # Answer questions API
components/
├── ProcessingPipeline.tsx
├── EducationalPanel.tsx
├── ChatInterface.tsx
├── EmbeddingVisualizer.tsx
├── HowItWorksModal.tsx
└── LearningLab.tsx
lib/
├── embeddings.ts        # Xenova transformers
├── vectorStore.ts       # In-memory storage
├── transcript.ts        # Transcript processing
├── chunking.ts          # Text chunking
└── groq.ts              # Groq integration
```

## Deployment

### Deploy to Vercel (Recommended)

This app is designed to run on Vercel and cannot run on GitHub Pages (requires server-side API routes).

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (public or private repository)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Verify `.gitignore`** excludes sensitive files:
   - `.env*` files are ignored
   - `node_modules/` is ignored

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-app` (if your repo has a root folder structure)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

#### Step 3: Set Environment Variables

1. In Vercel project settings, go to **"Environment Variables"**
2. Add the following variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key (get one at https://console.groq.com/)
   - **Environment**: Production, Preview, and Development (select all)

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

#### Automatic Deployments

- Every push to `main` branch = Production deployment
- Every pull request = Preview deployment
- You can also trigger manual deployments from Vercel dashboard

### Known Limitations & Considerations

#### 1. Ephemeral Vector Store ⚠️

**Issue**: Processed embeddings are stored in-memory and reset when the server restarts.

**Impact**: 
- Users need to reprocess personas after server restarts (common on free tier)
- Processing is fast (2-3 minutes), so this is acceptable for a demo/educational app

**Why**: This keeps the app simple with no database dependency. For production, you'd want persistent storage (Pinecone, Weaviate, or database).

#### 2. User-Created Personas

**Storage**: User-created personas are stored in browser's localStorage (client-side only).

**Limitations**:
- Private to each user's device
- Lost if browser data is cleared
- Cannot be shared between devices or users

**Why**: Serverless platforms like Vercel don't allow file system writes. This is a reasonable trade-off for a free deployment.

#### 3. Shared Processing

All users share the same processed personas. When one user processes a persona, it's available to all users (until server restart).

**Why**: This is actually beneficial for a demo/educational app - reduces redundant processing.

#### 4. Rate Limits

- **Groq API**: 14,400 requests/day (free tier)
- No built-in rate limiting on API routes
- Monitor usage in Groq dashboard

For 10-20 users, the free tier should be sufficient.

### Troubleshooting

**Build fails**: 
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (18+)
- Check build logs in Vercel dashboard

**API errors**:
- Verify `GROQ_API_KEY` is set correctly in Vercel
- Check Groq API dashboard for rate limits
- Review server logs in Vercel dashboard

**Personas not loading**:
- Ensure `data/transcripts/` folder exists in your repo
- Check that transcript files have `.txt` extension
- Verify file permissions

**User-created personas not working**:
- Check browser console for localStorage errors
- Ensure browser allows localStorage
- Try in incognito/private mode to test

## Learning Resources

The app includes:
- **Interactive Glossary** - Hover over any technical term to learn
- **How It Works Modal** - See embeddings, similarity scores, and the RAG process
- **Learning Lab** - Live stats and mini-quizzes
- **Visual Explanations** - Animations showing each step of the process

## Free Tier Limits

- Groq API: 14,400 requests/day
- Videos: Max 30 minutes of transcript
- Rate limiting: 3 videos/hour per IP, 20 questions/video

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
