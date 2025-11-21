# Test Ownership Transfer Script

Write-Host "=== STEP 1: LOGIN VIP ===" -ForegroundColor Cyan
$loginBody = @{ email = "vip@test.com"; password = "Password123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "http://localhost:3003/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$tokenVIP = $loginResp.access_token
Write-Host "VIP logged in"

Write-Host "`n=== STEP 2: CREATE REQUEST ===" -ForegroundColor Cyan
$requestBody = @{ 
    receiver_id = "55555555-5555-5555-5555-555555555555"
    offered_book_ids = @("book-vip-5")
    requested_book_ids = @("book-disp-5")
    message = "Test ownership transfer"
} | ConvertTo-Json

$request = Invoke-RestMethod -Uri "http://localhost:3003/exchanges/requests" `
    -Headers @{"Authorization"="Bearer $tokenVIP"} `
    -Method POST `
    -Body $requestBody `
    -ContentType "application/json"

$requestId = $request.request_id
Write-Host "Request ID: $requestId"

Write-Host "`n=== STEP 3: LOGIN DISPUTER ===" -ForegroundColor Cyan
$loginBody2 = @{ email = "disputer@test.com"; password = "Password123" } | ConvertTo-Json
$loginResp2 = Invoke-RestMethod -Uri "http://localhost:3003/auth/login" -Method POST -Body $loginBody2 -ContentType "application/json"
$tokenDISPUTER = $loginResp2.access_token
Write-Host "DISPUTER logged in"

Write-Host "`n=== STEP 4: ACCEPT REQUEST ===" -ForegroundColor Cyan
$acceptBody = @{ action = "accept" } | ConvertTo-Json
$accept = Invoke-RestMethod -Uri "http://localhost:3003/exchanges/requests/$requestId/respond" `
    -Headers @{"Authorization"="Bearer $tokenDISPUTER"} `
    -Method PATCH `
    -Body $acceptBody `
    -ContentType "application/json"

$exchangeId = $accept.exchange.exchange_id
Write-Host "Exchange ID: $exchangeId"

Write-Host "`n=== STEP 5: VIP CONFIRMS ===" -ForegroundColor Cyan
$confirm1 = Invoke-RestMethod -Uri "http://localhost:3003/exchanges/$exchangeId/confirm" `
    -Headers @{"Authorization"="Bearer $tokenVIP"} `
    -Method PATCH
Write-Host "VIP confirmed: A=$($confirm1.member_a_confirmed), B=$($confirm1.member_b_confirmed)"

Write-Host "`n=== STEP 6: DISPUTER CONFIRMS ===" -ForegroundColor Cyan
$confirm2 = Invoke-RestMethod -Uri "http://localhost:3003/exchanges/$exchangeId/confirm" `
    -Headers @{"Authorization"="Bearer $tokenDISPUTER"} `
    -Method PATCH
Write-Host "DISPUTER confirmed: Status=$($confirm2.status), A=$($confirm2.member_a_confirmed), B=$($confirm2.member_b_confirmed)"

Write-Host "`n=== STEP 7: CHECK BOOKS IN DB ===" -ForegroundColor Cyan
docker exec -i bookswap_mysql mysql -uroot -proot bookswap_db -e @"
SELECT 
    title, 
    CASE 
        WHEN owner_id='44444444-4444-4444-4444-444444444444' THEN 'VIP'
        WHEN owner_id='55555555-5555-5555-5555-555555555555' THEN 'DISPUTER'
    END as owner, 
    status, 
    deleted_at 
FROM books 
WHERE book_id IN ('book-vip-5', 'book-disp-5');
"@

Write-Host "`n=== STEP 8: CHECK VIP MY LIBRARY API ===" -ForegroundColor Cyan
$vipBooks = Invoke-RestMethod -Uri "http://localhost:3003/books/my-library" `
    -Headers @{"Authorization"="Bearer $tokenVIP"} `
    -Method GET
Write-Host "Total books: $($vipBooks.length)"
$vipBooks | Select-Object title, status | Format-Table

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green
