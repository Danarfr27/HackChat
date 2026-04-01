// api/chat.js - Serverless function for chat message relay (simple demo)

let messages = [];

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Return all messages
        return res.status(200).json({ messages });
    }
    if (req.method === 'POST') {
        const { username, text } = req.body;
        if (!username || !text) {
            return res.status(400).json({ error: 'Missing username or text' });
        }
        const msg = {
            username,
            text,
            time: Date.now()
        };
        messages.push(msg);
        // Limit messages in memory (demo only)
        if (messages.length > 100) messages = messages.slice(-100);
        return res.status(201).json({ success: true, message: msg });
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
