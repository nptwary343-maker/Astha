
const fetch = require('node-fetch');

const ACCESS_TOKEN = 'EAARcu3z4e7kBZCq1kxwSwdacE4m0qqVAQyRpy6CZBq4kNqjB61ZC7WYFgvwlIguFZAOF8L5hc8T0ewHuXJmBE3K1JZCYX2qjtuPGutUNJvuOPuq0Jj1UKqdtOJVS0Yau5eJvR5CIBD7Mi8ZCIr1e93sOSCrZBlZBfvIMYVOlvwZA3OMj6VrPUixetL1r0dmeeRsLIiWuvhhzlYn5FINSjwZA7NjVp5ZA44G2iIBweYD8WtogZDZD';

async function verifyToken() {
    console.log("🔍 Verifying Facebook Access Token...");
    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name,permissions&access_token=${ACCESS_TOKEN}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Token Verification Failed:", data.error.message);
        } else {
            console.log("✅ Token Verified!");
            console.log("👤 User/Page Name:", data.name);
            console.log("🆔 ID:", data.id);
            console.log("📜 Permissions:", data.permissions.data.map(p => p.permission).join(', '));
        }
    } catch (error) {
        console.error("❌ Error during verification:", error);
    }
}

verifyToken();
