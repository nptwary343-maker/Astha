const fetch = require('node-fetch');

async function testAIChat() {
    console.log("🚀 Testing Ayesha AI v4 (Gemini)...");

    try {
        const response = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hello Ayesha, what products do you have?",
                history: []
            })
        });

        const data = await response.json();
        console.log("✅ API Response Received:");
        console.log(JSON.stringify(data, null, 2));

        if (data.reply) {
            console.log("\n✨ TEST PASSED: AI replied successfully.");
        } else {
            console.log("\n❌ TEST FAILED: No reply in response.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED: Connection error or server down.");
        console.error(error.message);
    }
}

testAIChat();
