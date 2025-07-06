# PowerShell script for automated security checks (Windows)

Write-Host "=== RV MUSIC Automated Security Audit ==="

# Backend dependency audit
Write-Host "\n[1/6] Backend: npm audit --production"
cd ../backend
npm audit --production

# Frontend dependency audit
Write-Host "\n[2/6] Frontend: npm audit --production"
cd ../frontend
npm audit --production

# Retire.js scan (if installed)
Write-Host "\n[3/6] Retire.js scan (frontend)"
try {
    npx retire
} catch {
    Write-Host "Retire.js not installed. Skipping."
}

# NodeJsScan (if installed)
Write-Host "\n[4/6] NodeJsScan (backend)"
try {
    npx nodejsscan -d ../backend
} catch {
    Write-Host "NodeJsScan not installed. Skipping."
}

# Autocannon DoS test (replace URLs)
Write-Host "\n[5/6] Autocannon DoS test (backend)"
try {
    npx autocannon -c 50 -d 30 https://your-backend-url
} catch {
    Write-Host "Autocannon not installed or URL not set. Skipping."
}

Write-Host "\n[6/6] Autocannon DoS test (frontend)"
try {
    npx autocannon -c 50 -d 30 https://your-frontend-url
} catch {
    Write-Host "Autocannon not installed or URL not set. Skipping."
}

Write-Host "\n=== Security Audit Complete ==="
