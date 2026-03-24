const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Gemini Import

console.log("Starting WhatsApp AI Bot with Gemini...");

// ⚠️ Nayi FRESH Gemini API Key (Verified)
const GEMINI_API_KEY = "AIzaSyAZpRajM5qSd5S9PaYnxEu9_WST5wqwCZM"; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Ye instructions Gemini AI ko batayengi ki usko kya bankar baat karni hai
const botInstructions = `
You are the official WhatsApp AI assistant for 'E-Vision India' / 'Evision Smart Cameras' (Official Websites: https://evisionindia.com and online store: https://shopevision.com/).
Location: Faridabad, India.
You should talk politely in Hinglish (Hindi + English mix). You are an expert salesperson for CCTV and Security products.

Company Info: 
E-Vision is a leading Manufacturer, Exporter, and Supplier of Security Surveillance and Customized Security Solutions.
Our core strengths: Advanced Technology, Industry Expertise, Comprehensive Support, and a Customer-Centric Approach.
We provide CCTV Cameras, Smart Home Systems, Finger Print Access, and complete security solutions.

Product Categories available on ShopEvision.com: 
AI Smart Cameras, Indoor WiFi Series, Outdoor 4G Series, Solar Powered Series, IP Cameras Setup (Dome/Bullet 4MP/8MP), PoE Switches & SFP Modules.

Our Specific Top Models to recommend:
1. Basic Guard (WiFi Camera) - URL: https://shopevision.com/product/ev-q208-single-lens-wifi-camera/
2. Smart Guard (Dual Lens 4G) - URL: https://shopevision.com/product/dual-lens-wifi-4g-model/
3. 4G Watch Pro / Max - URL: https://shopevision.com/product/dual-lens-wifi-4g-model-ev-a408-wifi-ev-a408-4g/
4. Solar Sentinel (Black Light) - URL: https://shopevision.com/product/ev-g6w-black-light-full-colour/
5. Solar Sentinel AI (Always on 24/7) - URL: https://shopevision.com/product/ev-always-on-video-solar-camera-724h/
6. IP Camera Setups NVR (4MP/8MP) - URL: https://shopevision.com/product/4-set-ip-4mp-dome-setup/
7. PoE Switches - URL: https://shopevision.com/product/42-port-manageable-poe-switch/

Rules:
- Keep the WhatsApp message very well formatted, short (max 2-3 sentences), use spacing, and be conversational.
- Use emojis appropriately.
- If users ask for broad CCTV solutions, tell them we offer "Customized Solutions & Complete Installation" under E-Vision India.
- If they ask about exact prices or anything not in the list, tell them to visit our websites or contact support.
- If they say Hi/Hello, introduce yourself as the Evision Assistant and ask what kind of security solution or camera they are looking for.
`;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Background me chalega
        executablePath: process.env.RENDER || process.env.PUPPETEER_EXECUTABLE_PATH 
            ? process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
            : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// Jab QR code generate ho, toh usko terminal mein dikhao
client.on('qr', (qr) => {
    console.log('\n======================================================');
    console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP NUMBER');
    console.log('======================================================\n');
    qrcode.generate(qr, { small: true });
});

// Jab bot successfully connect ho jaye
client.on('ready', () => {
    console.log('\n✅ SUCCESS: Evision Gemini Bot is Ready!');
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        console.log('⚠️ WARNING: Gemini API Key missing! Bot will not reply properly until you paste it in index.js');
    }
    console.log('Waiting for incoming messages...\n');
});

// Jab koi naya message aaye
client.on('message', async (message) => {
    const text = message.body;
    const sender = message.from;

    console.log(`📩 New Message received from ${sender}: ${text}`);

    // Ignore status updates and group messages to save API quota
    if (sender === "status@broadcast" || sender.includes("@g.us")) {
        console.log("-> Ignoring status/group message.");
        return;
    }

    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        await message.reply("Opps! Bot me abhi AI Key nahi dali hui. Developer please index.js mein Gemini API key update karein.");
        return;
    }

    try {
        console.log("-> Thinking (Asking Gemini AI)...");
        
        // Gemini model ko call karna
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: botInstructions 
        });
        
        const result = await model.generateContent(text);
        const responseText = result.response.text();

        await message.reply(responseText);
        console.log("-> Sent Gemini AI response");

    } catch (error) {
        console.error("❌ Gemini Error:", error);
        await message.reply("Sorry, hamara AI server abhi thoda busy hai. Thodi der baad try karein.");
    }
});

client.on('auth_failure', () => {
    console.error('❌ Authentication failed! Please restart and scan QR code again.');
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Disconnected:', reason);
});

// Client ko start karo
client.initialize();
