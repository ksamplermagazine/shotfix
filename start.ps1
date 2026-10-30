$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$shotfixNode=(Get-Command node -ErrorAction SilentlyContinue).Source
if(-not $shotfixNode){$shotfixNode=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'}
if(-not(Test-Path -LiteralPath $shotfixNode)){throw 'Install Node.js 22.12 or later, then run npm install and npm start.'}
if(-not(Test-Path -LiteralPath 'node_modules/@comfyorg/sdk')){throw 'Run npm install in this folder first.'}
& $shotfixNode --env-file-if-exists=.env server.mjs
