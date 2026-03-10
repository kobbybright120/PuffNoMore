$src = 'C:\Users\KOBBY\OneDrive\Desktop\PuffNoMore\assets\animations\extracted\animations\Earkick Welcome Animation Dark Mode.lottie'
$zipCopy = 'C:\Users\KOBBY\OneDrive\Desktop\PuffNoMore\assets\animations\extracted\animations\Earkick-Welcome-Dark.zip'
$outDir = Join-Path (Split-Path $zipCopy) 'earkick-welcome-dark-unzipped'
$destJson = 'C:\Users\KOBBY\OneDrive\Desktop\PuffNoMore\assets\animations\extracted\animations\earkick-welcome-dark.json'
$imgDest = 'C:\Users\KOBBY\OneDrive\Desktop\PuffNoMore\assets\animations\extracted\images'

if (Test-Path $zipCopy) { Remove-Item -LiteralPath $zipCopy -Force -ErrorAction SilentlyContinue }
if (Test-Path $outDir) { Remove-Item -LiteralPath $outDir -Recurse -Force -ErrorAction SilentlyContinue }

Copy-Item -LiteralPath $src -Destination $zipCopy -Force

try {
    Expand-Archive -LiteralPath $zipCopy -DestinationPath $outDir -Force
} catch {
    Write-Host "Expand-Archive failed: $_"
}

# Find the first JSON that looks like a real Lottie (contains "layers" or "assets")
$candidate = Get-ChildItem -Path $outDir -Recurse -Filter '*.json' -ErrorAction SilentlyContinue | ForEach-Object {
    $text = Get-Content -Raw -LiteralPath $_.FullName -ErrorAction SilentlyContinue
    if ($null -ne $text -and ($text -match '"layers"' -or $text -match '"assets"')) {
        $_
        break
    }
}

if ($candidate) {
    Copy-Item -LiteralPath $candidate.FullName -Destination $destJson -Force
    Write-Host "COPIED_JSON_TO: $destJson"
} else {
    Write-Host "NO_LAYERS_JSON_FOUND - copying first JSON as fallback"
    $first = Get-ChildItem -Path $outDir -Recurse -Filter '*.json' | Select-Object -First 1
    if ($first) { Copy-Item -LiteralPath $first.FullName -Destination $destJson -Force; Write-Host "COPIED_JSON_TO (fallback): $destJson" }
}

# Copy image assets from known folders inside the .lottie archive
$imgSrc1 = Join-Path $outDir 'i'
$imgSrc2 = Join-Path $outDir 'images'
New-Item -ItemType Directory -Force -Path $imgDest | Out-Null
if (Test-Path $imgSrc1) {
    Get-ChildItem -Path $imgSrc1 -File -Force | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $imgDest -Force }
    Write-Host 'COPIED_IMAGES_FROM_i'
}
if (Test-Path $imgSrc2) {
    Get-ChildItem -Path $imgSrc2 -File -Force | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $imgDest -Force }
    Write-Host 'COPIED_IMAGES_FROM_images'
}

# Clean up temporary extraction
Remove-Item -LiteralPath $zipCopy -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $outDir -Recurse -Force -ErrorAction SilentlyContinue

Get-ChildItem 'C:\Users\KOBBY\OneDrive\Desktop\PuffNoMore\assets\animations\extracted\animations' | Select-Object Name | ForEach-Object { Write-Host $_.Name }
