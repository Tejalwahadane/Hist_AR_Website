module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, systemPrompt } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + "\n\nUser Question: " + question }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Gemini API Error', details: errorText });
    }

    const data = await response.json();
    const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate an answer.";

    // Maintain the same response structure so the frontend doesn't break
    return res.status(200).json({
      choices: [
        {
          message: {
            content: aiAnswer
          }
        }
      ]
    });

  } catch (error) {
    console.error("Vercel Function Error (chat.js):", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
