$files = @()
if (Test-Path .) {
    $files += Get-ChildItem -Path . -Filter *.jsx
    $files += Get-ChildItem -Path . -Filter *.js
}
if (Test-Path .\components) {
    $files += Get-ChildItem -Path .\components -Filter *.jsx
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -like "*firebase*") {
        Write-Output "FOUND: $($file.FullName)"
    }
}
