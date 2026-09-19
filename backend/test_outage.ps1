$ErrorActionPreference = 'Stop'

try {
    $body = @{
        email = "superadmin@dev.local"
        password = "DevPassword123!"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/admin/login' -Method Post -Body $body -ContentType 'application/json'
    $token = $login.data.accessToken

    $outage = @{
        title = "Test"
        description = "Test desc"
        areaName = "Test Area"
        severity = "MEDIUM"
        startedAt = "2026-09-19T07:23:06.000Z"
        affectedAreas = @("Test")
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/electricity/outages' -Method Post -Body $outage -ContentType 'application/json' -Headers @{Authorization="Bearer $token"}
    Write-Output "SUCCESS:"
    Write-Output ($res | ConvertTo-Json -Depth 5)
} catch {
    Write-Output "ERROR:"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Output "RESPONSE BODY:"
        Write-Output $responseBody
    }
}
