$src = 'assets/animations/extracted/animations/gradual redutction.lottie'
$zip = 'assets/animations/extracted/gradual_redutction.zip'
$dst = 'assets/animations/extracted/gradual_redutction_unpacked'
Copy-Item -LiteralPath $src -Destination $zip -Force
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
Expand-Archive -LiteralPath $zip -DestinationPath $dst -Force
Get-ChildItem -Path $dst -Recurse -File | Select-Object -ExpandProperty FullName
