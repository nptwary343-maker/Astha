# 🚀 Cloudflare Pages Secret Setup Script
# This script will set all necessary environment variables for your new project: astharhars

$projectName = "astharhars"

$secrets = @{
    "INTERNAL_API_SECRET" = "ah_prod_secure_2026_x86_z"
    "NEXT_PUBLIC_ALGOLIA_APP_ID" = "NS1FPYWGCF"
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY" = "420d802e1b876a2a036a63846b14dbb6"
    "RESEND_API_KEY" = "re_WZwnpRCJ_9BJ4zYKBwhLDV75MM6QikDi4"
    "GMAIL_USER_1" = "astharhat310@gmail.com"
    "GMAIL_PASS_1" = "gfofjfmzuazwewtl"
    "EMAILJS_SERVICE_ID" = "service_wxxa4cf"
    "EMAILJS_PRIVATE_KEY" = "4iUrWyuyXQjcf4HPsZ9cd"
    "EMAILJS_PUBLIC_KEY" = "yv9e8aswMZrm4ptXY"
    "EMAILJS_TEMPLATE_ID" = "template_cay76pd"
}

Write-Host "🔐 Setting up secrets for project: $projectName..." -ForegroundColor Cyan

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "📤 Setting $key..." -ForegroundColor Yellow
    echo "$value" | npx wrangler pages secret put $key --project-name $projectName
}

Write-Host "✅ All secrets have been uploaded! Now you can deploy." -ForegroundColor Green
