// api/login.js - Vercel Serverless Function for Authentication

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const users = [
        {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD,
            accessCode: process.env.ADMIN_ACCESS_CODE,
            role: process.env.ADMIN_ROLE
        },
        {
            username: process.env.OPERATOR_USERNAME,
            password: process.env.OPERATOR_PASSWORD,
            accessCode: process.env.OPERATOR_ACCESS_CODE,
            role: process.env.OPERATOR_ROLE
        },
        {
            username: process.env.GUEST_USERNAME,
            password: process.env.GUEST_PASSWORD,
            accessCode: process.env.GUEST_ACCESS_CODE,
            role: process.env.GUEST_ROLE
        }
    ];

    const { username, password, accessCode } = req.body;
    const user = users.find(u =>
        u.username === username &&
        u.password === password &&
        u.accessCode === accessCode
    );

    if (user) {
        // Session duration from env or default 24h
        const sessionDuration = parseInt(process.env.SESSION_DURATION) || 86400000;
        const session = {
            username: user.username,
            role: user.role,
            loginTime: Date.now(),
            expiresAt: Date.now() + sessionDuration
        };
        return res.status(200).json({ success: true, session });
    } else {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
}
