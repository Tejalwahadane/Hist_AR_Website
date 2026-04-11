const fs = require('fs');

async function test() {
  try {
    const envData = fs.readFileSync('.env', 'utf8');
    const keyMatch = envData.match(/GEMINI_API_KEY=(.*)/);
    if (!keyMatch) {
      console.log("No GEMINI_API_KEY found in .env");
      return;
    }
    const key = keyMatch[1].trim();
    console.log("Key starts with:", key.substring(0, 10));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "hi" }]
          }
        ]
      })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
