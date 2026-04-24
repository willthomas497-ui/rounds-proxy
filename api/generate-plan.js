export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { level, goal, days } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: `You are an expert boxing coach. Create a 4-week training plan as JSON for: Level: ${level}, Goal: ${goal}, Days per week: ${days}. Return ONLY valid JSON with this structure: { "planName": "string", "weeks": [{ "weekNum": 1, "theme": "string", "sessions": [{ "day": "Monday", "type": "Bag Work", "name": "string", "rounds": 4, "roundMins": 3, "restSecs": 60, "rounds_detail": [{ "roundNum": 1, "focus": "string", "cues": ["cue 1","cue 2"] }] }] }] }` }]
    })
  });

  const data = await response.json();
  const text = data.content.map(c => c.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();
  try {
    res.status(200).json(JSON.parse(clean));
  } catch {
    res.status(500).json({ error: 'Failed to parse plan' });
  }
}
