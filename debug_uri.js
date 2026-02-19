const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/MONGODB_URI=(.*)/);
if (match) {
    const uri = match[1];
    console.log("URI Length:", uri.length);
    console.log("Ends with &appName=:", uri.endsWith('&appName='));
    console.log("Includes &appName=:", uri.includes('&appName='));
    if (uri.includes('&appName=')) {
        const parts = uri.split('&appName=');
        console.log("Value after appName:", parts[1]);
    }
} else {
    console.log("MONGODB_URI not found");
}
