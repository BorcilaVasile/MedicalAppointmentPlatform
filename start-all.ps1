# Script pentru a porni MongoDB, backend-ul și frontend-ul

# Write-Host "Pornesc MongoDB..."
# Start-Process -FilePath "mongod" -ArgumentList "--dbpath D:\data\db" -WindowStyle Minimized

# Write-Host "Aștept 5 secunde pentru ca MongoDB să pornească..."
# Start-Sleep -Seconds 1

Write-Host "Pornesc backend-ul..."
Set-Location -Path ".\backend"
Start-Process -FilePath "powershell" -ArgumentList "-Command npm run dev" -WindowStyle Minimized
Set-Location -Path ".."

Write-Host "Aștept 5 secunde pentru ca backend-ul să pornească..."
Start-Sleep -Seconds 1

Write-Host "Pornesc frontend-ul..."
Set-Location -Path ".\frontend"
Start-Process -FilePath "powershell" -ArgumentList "-Command npm run dev" -WindowStyle Minimized
Set-Location -Path ".."

Write-Host "Toate componentele au fost pornite!"