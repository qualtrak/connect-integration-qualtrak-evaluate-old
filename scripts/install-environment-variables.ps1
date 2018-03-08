[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$bucket,
    [Parameter(Mandatory=$true)]
    [string]$attachmentBucket,
    [Parameter(Mandatory=$true)]
    [string]$dns,
    [Parameter(Mandatory=$true)]
    [string]$dbAdminUser,
    [Parameter(Mandatory=$true)]
    [string]$dbAdminPassword,
    [Parameter(Mandatory=$true)]
    [string]$dbUser,
    [Parameter(Mandatory=$true)]
    [string]$dbUserPassword,
    [Parameter(Mandatory=$true)]
    [string]$dbDns,
    [Parameter(Mandatory=$true)]
    [string]$dbPort,
    [Parameter(Mandatory=$true)]
    [string]$accountId,
    [Parameter(Mandatory=$true)]
    [string]$region,
    [Parameter(Mandatory=$true)]
    [string]$adDomain,
    [Parameter(Mandatory=$true)]
    [string]$esUrl
    
)

### Create environment variables
[Environment]::SetEnvironmentVariable("q-sku", "E4AC", "Machine")
[Environment]::SetEnvironmentVariable("q-version", "1.0", "Machine")
[Environment]::SetEnvironmentVariable("q-product-name", "Evaluate for Amazon Connect", "Machine")
[Environment]::SetEnvironmentVariable("q-root-path", "evaluate", "Machine")
[Environment]::SetEnvironmentVariable("q-deployment-id", $([guid]::NewGuid().Guid),"Machine")
[Environment]::SetEnvironmentVariable("q-connect-s3", $bucket,"Machine")
[Environment]::SetEnvironmentVariable("q-evaluate-s3", $attachmentBucket,"Machine")
[Environment]::SetEnvironmentVariable("q-dns", $dns, "Machine")
[Environment]::SetEnvironmentVariable("q-db-sys-username", $dbAdminUser, "Machine")
[Environment]::SetEnvironmentVariable("q-db-username", $dbUser, "Machine")
[Environment]::SetEnvironmentVariable("q-db-dns", $dbDns, "Machine")
[Environment]::SetEnvironmentVariable("q-db-port", $dbPort, "Machine")
[Environment]::SetEnvironmentVariable("q-account-id", $accountId, "Machine")
[Environment]::SetEnvironmentVariable("q-region", $region, "Machine")
[Environment]::SetEnvironmentVariable("q-ad-domain", $adDomain, "Machine")
[Environment]::SetEnvironmentVariable("q-es-url", $esUrl, "Machine")

# encrypt passwords before saving on server. This PS script is pre-backed into AMI
c:\temp\EncryptPassAndSetAsEnvVar.ps1 -Var q-db-password -Value $dbUserPassword
c:\temp\EncryptPassAndSetAsEnvVar.ps1 -Var q-db-sys-password -Value $dbAdminPassword

# build env vars to hold domain parts
$adList = $adDomain -Split ".", 0, "simplematch"
if (($adList.Count -lt 2) -or ($adList.Count -gt 6)) { 
    Write-Error "Domain: '$adDomain' must be at least 'domainname.tld' or supports up to 6 DC's e.g. 'dc6.dc5.dc4.dc3.dc2.dc1"
} 
else 
{ 
    [array]::Reverse($adList)
    $output = ""
    for ($i=0; $i -lt $adList.Length; $i++) { 
       $key = "q-ad-part-$($i + 1)"
       $value = $adList[$i]
       [Environment]::SetEnvironmentVariable("$key", "$value" , "Machine")
       Write-Host "Key: '$key', Value = '$value'"
       $output = "DC=$($value),$($output)"
    } 
    Write-Host $output.Substring(0, $output.Length - 1)
}
