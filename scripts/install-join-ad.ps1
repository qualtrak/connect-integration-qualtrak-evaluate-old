[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string[]]$ip1,
    [Parameter(Mandatory=$true)]
    [string[]]$ip2,
    [Parameter(Mandatory=$true)]
    [string[]]$adDomain,
    [Parameter(Mandatory=$true)]
    [string[]]$adAdminUser,
    [Parameter(Mandatory=$true)]
    [string[]]$adAdminPassword
)

### Join the domain
$computer = Get-WmiObject -Class Win32_ComputerSystem
if ($computer.domain -eq 'WORKGROUP') {
    $adapter = Get-NetAdapter -Name "Ethernet*"
    Set-DNSClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses ("$ip1","$ip2")
    $password = $adAdminPassword | ConvertTo-SecureString -asPlainText -Force    
    $credential = New-Object System.Management.Automation.PSCredential($adAdminUser,$password)
    Add-Computer -DomainName $adDomain -Credential $credential -restart
}
