import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get active redirect URI
function getRedirectUri(req: any) {
  const host = req.get("host");
  const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${host}/auth/callback`;
}

// Spotify Auth URL route
app.get("/api/auth/spotify-url", (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  if (!client_id) {
    return res.json({ configured: false });
  }
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "playlist-read-private playlist-read-collaborative user-read-private user-read-email",
    show_dialog: "true",
  });
  res.json({
    configured: true,
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
  });
});

// Helper to obtain a server-to-server client credentials token from Spotify
async function getSpotifyClientCredentialsToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    return null;
  }
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    });
    if (response.ok) {
      const data = await response.json();
      return data.access_token as string;
    }
  } catch (err) {
    console.error("Error getting Spotify client credentials token:", err);
  }
  return null;
}

// Spotify server-side search track endpoint
app.get("/api/spotify/search-track", async (req, res) => {
  const { title, artist } = req.query;
  if (!title) {
    return res.status(400).json({ error: "Title parameter is required" });
  }

  try {
    const token = await getSpotifyClientCredentialsToken();
    if (!token) {
      return res.json({ found: false, reason: "Spotify credentials not set on server" });
    }

    const query = artist ? `${title} artist:${artist}` : `${title}`;
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      const track = data.tracks?.items?.[0];
      if (track) {
        return res.json({
          found: true,
          track: {
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(", "),
            duration_ms: track.duration_ms,
            preview_url: track.preview_url,
            artwork: track.album?.images?.[0]?.url,
            spotifyUrl: track.external_urls?.spotify,
          }
        });
      }
    }
    res.json({ found: false });
  } catch (err: any) {
    console.error("Error searching Spotify track:", err);
    res.status(500).json({ error: err.message || "Failed to search track" });
  }
});

// AI combined session analyzer for Account diagnostics
app.post("/api/review-all-sessions", async (req, res) => {
  try {
    const { sessions } = req.body;
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return res.json({ analysis: "You haven't completed any focus sessions yet. Log at least one session so the AI can analyze your progress and write a diagnostic report! 🎓" });
    }

    const client = getGeminiClient();
    const systemInstruction = `You are Dominique, the Superintendent of the Aluminum Education District, and an expert diagnostic Academic Advisor.
You will write a personalized learning diagnostic report based on the student's study logs, chat transcripts, and diagnostic quiz scores from across the entire school year.

Structure your report into the following exact sections with bold titles:
1. **Academic Overview & Momentum**
2. **Key Subject Areas Studied**
3. **Core Concepts & Struggles**: Detail exactly what specific subjects/topics they struggled with most (reference incorrect diagnostic quiz questions or conceptual questions they raised in transcripts).
4. **Acquired Accomplishments & Progress**
5. **Concrete Action Plan**: Give actionable guidance, helpful formulas, or direct methods to practice their weakest subjects.

Adopt a motivating, warm, professional, yet comforting tone. Keep it highly detailed but clearly formatted.`;

    const prompt = `Student's Study History:
${JSON.stringify(sessions.map((s, i) => ({
  topic: s.topic,
  mode: s.mode,
  duration: s.duration,
  aiAssists: s.aiCount,
  quizScores: s.testScores,
  chatSamples: s.transcript?.map((t: any) => `${t.role}: ${t.content}`).join("\n").slice(0, 400)
})))}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Review All Sessions Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate combined AI review" });
  }
});

// Spotify Callback route
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; color: #1e293b; padding: 24px; text-align: center;">
          <div style="max-width: 400px; margin: auto; background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #ef4444; font-size: 22px; margin-bottom: 8px;">Spotify Connection Cancelled</h1>
            <p style="font-size: 14px; color: #64748b;">The authentication process was cancelled or failed.</p>
            <button onclick="window.close()" style="margin-top: 24px; background-color: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = getRedirectUri(req);

    if (!client_id || !client_secret) {
      throw new Error("Spotify credentials (SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET) are not set in the container environment variables. Please configure them in AI Studio Settings.");
    }

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Spotify token exchange error: ${tokenResponse.status} ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; color: #1e293b; padding: 24px; text-align: center;">
          <div style="max-width: 400px; margin: auto; background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            <div style="width: 50px; height: 50px; background-color: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 16px;">✓</div>
            <h1 style="color: #065f46; font-size: 22px; margin-bottom: 8px;">Spotify Connected!</h1>
            <p style="font-size: 13px; color: #64748b;">Your Spotify account was successfully integrated with Study Portal.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                setTimeout(() => { window.close(); }, 1200);
              } else {
                window.location.href = '/';
              }
            </script>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">This window should close automatically.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Spotify OAuth exchange error:", err);
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; color: #1e293b; padding: 24px; text-align: center;">
          <div style="max-width: 400px; margin: auto; background: white; padding: 32px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #ef4444; font-size: 22px; margin-bottom: 8px;">Spotify Exchange Error</h1>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">${err.message || "An error occurred while exchanging tokens."}</p>
            <button onclick="window.close()" style="background-color: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Lazy-loaded Gemini instance helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Chat assistance route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, studyTopic, isHomework } = req.body;
    const client = getGeminiClient();

    // Prepare system instructions for homework/study tutor
    const topicText = studyTopic ? `Focus Topic: ${studyTopic}` : "Focus: General Study Support";
    const typeText = isHomework ? "Homework Mode: Help user understand homework assignments." : "Study Mode: General subject learning.";

    const systemInstruction = `You are a professional, helpful, and comfortable Study Portal AI tutor.
${topicText}
${typeText}

RULES:
1. NEVER give the user direct answers immediately. Challenge them to think and solve it.
2. Only explain the conceptual work, formulas, step-by-step methods, or logical flow.
3. If they ask for the answer, or if they struggle, offer multiple progressive hints (Hint 1, Hint 2, etc.).
4. If they have received multiple hints and are still completely stuck, only then provide the correct answer clearly. When doing so, encourage them to write down the steps and attempt the next one by themselves.
5. Keep your tone encouraging, comforting, neat, and highly professional.
6. LANGUAGE LEARNING SUPPORT: If the user starts speaking or asking questions in a different language (or mentions they are learning a language):
   - Actively recognize and pivot to teach them new vocabulary and grammar in that language.
   - Encourage them to "sound it out" phonic-by-phonic or syllable-by-syllable, offering pronunciation guidance.
   - Give constructive feedback and keep encouraging them to practice and grow!`;

    // Map messages to the structure expected by the GoogleGenAI chats API or standard generateContent.
    // To support a simple chat interaction, we can send the formatted conversation history.
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat response" });
  }
});

// 2. Work checker route
app.post("/api/check-work", async (req, res) => {
  try {
    const { problem, userWork } = req.body;
    const client = getGeminiClient();

    const systemInstruction = `You are a rigorous, highly accurate Homework Work Checker.
Your task is to analyze the user's problem and their suggested work or answer.
1. State clearly and honestly if their work/answer is CORRECT or INCORRECT.
2. Do NOT hold back or sugarcoat. If they made a mistake, point out exactly which step is incorrect and explain why.
3. ABSOLUTELY CRITICAL: Do NOT make up or hallucinate anything. If you are not absolutely sure of the correct answer, or if there is insufficient information, you MUST state exactly: "I do not know the answer to this scenario." and do not try to answer it.
4. Keep the evaluation highly professional, clean, and concise.`;

    const prompt = `Problem / Question:
${problem}

User's Work / Answer:
${userWork}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for high accuracy
      },
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Work Checker Error:", error);
    res.status(500).json({ error: error.message || "Failed to check work" });
  }
});

// 2b. Generate practice exam/test route
app.post("/api/generate-test", async (req, res) => {
  try {
    const { subject, topic, chatLog } = req.body;
    const client = getGeminiClient();

    const systemInstruction = `You are an expert diagnostic test generator.
Analyze the student's study subject: "${subject}" and current topic: "${topic}".
Review the past chat history if available to identify what concepts they were studying or issues they were struggling with.
Generate exactly 3 random practice questions tailored to test them on this subject.
Make one question moderate, one challenging, and one centered around any common issue or conceptual struggle.

You MUST return a JSON array of exactly 3 question objects with this schema:
[
  {
    "id": "q1",
    "question": "Clear and conceptual multiple choice question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "explanation": "Detailed explanation of the concept and why this choice is correct."
  }
]
Do not return any markdown tags or text around the JSON.`;

    const prompt = `Subject: ${subject}
Topic: ${topic}
Chat context: ${JSON.stringify(chatLog || [])}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Generate Test Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagnostic test" });
  }
});

// 2c. Generate flashcards route
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { subject, topic, learningGoals, excludedThemes, preferredSubtopics } = req.body;
    const client = getGeminiClient();

    const systemInstruction = `You are a professional flashcard designer.
Generate exactly 4 high-quality Q&A flashcards for the subject: "${subject}" and topic: "${topic}".

STRICT CONSTRAINTS:
1. EXCLUSION: Do NOT generate questions related to any of these themes or concepts: [${(excludedThemes || []).join(", ")}].
2. ALIGNMENT: Focus strongly on: [${(preferredSubtopics || []).join(", ")}] and the user's explicit learning goals: "${learningGoals || ''}".
3. Keep questions concise and answers concept-oriented and easy to commit to memory.

You MUST return a JSON array of exactly 4 objects with this schema:
[
  {
    "id": "fc-1",
    "question": "Question text",
    "answer": "Answer text"
  }
]
Do not return any markdown tags or extra text.`;

    const prompt = `Subject: ${subject}
Topic: ${topic}
Excluded Themes: ${JSON.stringify(excludedThemes || [])}
Preferred Subtopics: ${JSON.stringify(preferredSubtopics || [])}
Learning Goals: ${learningGoals || ""}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Generate Flashcards Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards" });
  }
});

// 3. Suggestions submission route (forwarding to Discord webhook)
app.post("/api/suggestion", async (req, res) => {
  try {
    const { suggestion, userEmail } = req.body;
    if (!suggestion || suggestion.trim().length === 0) {
      return res.status(400).json({ error: "Suggestion content is required" });
    }

    const discordWebhookUrl = "https://discord.com/api/webhooks/1527575741112385606/hd8MOxmRGzt96Fx1GYT8omdKblosXFhhK6_Lzc512Uih2XKxF352ZLmu_BQnkGcl2ddk";

    const payload = {
      embeds: [
        {
          title: "New Study Portal Suggestion",
          color: 3447003, // Accent blue
          fields: [
            {
              name: "Suggestion",
              value: suggestion,
            },
            {
              name: "Submitted By",
              value: userEmail || "Anonymous User",
              inline: true,
            },
            {
              name: "Date & Time",
              value: new Date().toISOString(),
              inline: true,
            },
          ],
        },
      ],
    };

    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      const responseText = await discordResponse.text();
      throw new Error(`Discord webhook responded with status ${discordResponse.status}: ${responseText}`);
    }

    res.json({ success: true, message: "Suggestion submitted successfully!" });
  } catch (error: any) {
    console.error("Discord Webhook Error:", error);
    res.status(500).json({ error: error.message || "Failed to submit suggestion to Discord" });
  }
});

// 4. Vite Dev Server and Static Assets Serving Setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

start();
