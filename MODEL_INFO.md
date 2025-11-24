# Groq Model Configuration

## Current Model
The app is configured to use: **`llama-3.3-70b-versatile`**

This corresponds to **"Llama 3.3 70B"** shown in the Groq console.

## Available Free Models (from your Groq console)

Based on the Groq Models page, these TEXT TO TEXT models are available:

1. **Llama 3.3 70B** ✅ (Currently configured)
   - Model ID: `llama-3.3-70b-versatile`
   - High quality, good for RAG

2. **Llama 4 Scout**
   - Model ID: `llama-4-scout` or similar
   - Latest model with enhanced capabilities

3. **GPT OSS 20B**
   - Model ID: `gpt-oss-20b` or similar
   - Open source GPT model

4. **GPT OSS 120B**
   - Model ID: `gpt-oss-120b` or similar
   - Larger, more powerful GPT model

5. **Kimi K2**
   - Model ID: `kimi-k2` or similar
   - Multilingual capabilities

## How to Change the Model

To use a different model, update the model name in `/lib/groq.ts`:

```typescript
model: 'llama-3.3-70b-versatile',  // Change this to your preferred model
```

Then update all 6 instances in the file (use search & replace).

## Free Tier Limits

All these models are available on Groq's free tier with:
- 14,400 requests/day limit
- Fast GPU-accelerated inference
- Streaming support

## Model ID Format

The model ID format in code might differ from the display name:
- Console shows: "Llama 3.3 70B"
- API uses: `llama-3.3-70b-versatile`

Check the Groq API docs if `llama-3.3-70b-versatile` doesn't work and try:
- `llama-3-3-70b-versatile`
- `llama3.3-70b`
- Or check the exact ID in Groq's API documentation

