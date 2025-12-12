# Test API with PowerShell

# Test Registration
$registerData = @{
    email = "test@krishisahayak.com"
    password = "TestPass123"
    name = "Test Farmer"
    phone = "9876543210"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration Success:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Registration Error: $($_.Exception.Message)"
}

# Test Login
$loginData = @{
    email = "test@krishisahayak.com"
    password = "TestPass123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login Success:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Login Error: $($_.Exception.Message)"
}