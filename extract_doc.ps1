Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "C:\Users\Rohit\OneDrive\Desktop\blueprint-for-selectt-s-top-ranking-seo-content (1).docx"

$fileStream = [System.IO.File]::Open($docxPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$zip = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Read)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$fileStream.Close()

$cleaned = $xml -replace '<w:p[^>]*>', "`r`n" -replace '<[^>]+>', ''
[System.IO.File]::WriteAllText("d:\selectt\full_extracted_docx.txt", $cleaned)
Write-Output "Extracted successfully! Length: $($cleaned.Length)"
