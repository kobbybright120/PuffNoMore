$src = 'assets/animations/extracted/animations/gradual redutction.lottie'
$dst = 'assets/animations/extracted/gradual_redutction_unpacked'
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
Expand-Archive -LiteralPath $src -DestinationPath $dst -Force
Get-ChildItem -Path $dst -Recurse -File | Select-Object -ExpandProperty FullName
