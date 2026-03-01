# 🚀 Cloudflare Pages Secret Setup Script
# This script will set all necessary environment variables for your new project: astharhars

$projectName = "astharhars"

$secrets = @{
    "INTERNAL_API_SECRET"                  = ""
    "NEXT_PUBLIC_ALGOLIA_APP_ID"           = ""
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY"       = ""
    "RESEND_API_KEY"                       = ""
    "GMAIL_USER_1"                         = ""
    "GMAIL_PASS_1"                         = ""
    "EMAILJS_SERVICE_ID"                   = ""
    "EMAILJS_PRIVATE_KEY"                  = ""
    "EMAILJS_PUBLIC_KEY"                   = ""
    "EMAILJS_TEMPLATE_ID"                  = ""
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"    = ""
    "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET" = ""
}

Write-Host "🔐 Setting up secrets for project: $projectName..." -ForegroundColor Cyan

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "📤 Setting $key..." -ForegroundColor Yellow
    Write-Output "$value" | npx wrangler pages secret put $key --project-name $projectName
}

Write-Host "✅ All secrets have been uploaded! Now you can deploy." -ForegroundColor Green
