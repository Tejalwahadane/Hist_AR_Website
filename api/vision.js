export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageDataUrl, validMonumentIds } = req.body;

    const promptString = `You are a strict architectural classifier. Look at this image closely. Which of these EXACT monument IDs is present in the image? Choose ONLY ONE from this comma separated list: [${validMonumentIds.join(', ')}]. If you are absolutely certain it is one of them, reply with ONLY the exact ID (e.g. 'taj-mahal'). Do not include any punctuation. If you cannot identify any of these monuments in the image, reply precisely with the word 'unknown'.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptString },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ],
        max_tokens: 15,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'OpenAI API Error', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Vercel Function Error (vision.js):", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
