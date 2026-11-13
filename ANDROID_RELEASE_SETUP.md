# FNI Android release signing and updates

FNI checks the public update manifest at:

`public/fni-update.json`

The app checks automatically on launch/resume and also exposes **Settings → Help → App updates → Check now**. When a newer version is published, it shows release notes and opens the APK download in the device browser. Android still asks the member to approve installation; the app cannot silently install APKs on ordinary Android devices.

## One-time signing key setup (Windows PowerShell)

Use a permanent key. Keep the keystore and passwords private and backed up. Never commit the keystore or passwords to GitHub.

Run this in PowerShell (replace the example passwords with strong private values):

```powershell
keytool -genkeypair -v -keystore fni-release-key.jks -alias fni-release -keyalg RSA -keysize 2048 -validity 10000
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path .\fni-release-key.jks))
[Convert]::ToBase64String($bytes) | Set-Clipboard
```

In GitHub, open **jk-larbi/FNI-APP-2.0 → Settings → Secrets and variables → Actions → New repository secret** and create:

- `FNI_ANDROID_KEYSTORE_BASE64`: the Base64 text copied to clipboard
- `FNI_ANDROID_KEY_ALIAS`: the alias used above (example: `fni-release`)
- `FNI_ANDROID_KEY_PASSWORD`: the private key password
- `FNI_ANDROID_STORE_PASSWORD`: the keystore password

The release workflow uses the repository's built-in `GITHUB_TOKEN`; allow Actions to read and write repository contents under **Settings → Actions → General → Workflow permissions**. To make a release mandatory for older installations, set `minSupportedVersion` in `public/fni-update.json` to the new version before publishing; members on older versions will not be offered the later option.

## Publishing an update

After the one-time secrets are configured, create and push a semantic version tag from the code you want to release:

```powershell
git tag v1.0.1
git push origin v1.0.1
```

That runs **Build signed FNI Android release**, creates a GitHub Release with `FNI-Android-release.apk`, and updates `public/fni-update.json`. The next app check will detect the newer version.

Every subsequent release must use the exact same keystore, alias and passwords. If the signing key is lost or changed, Android will not accept the new APK as an in-place update; members may need to uninstall first, which can remove local app data.

## Current limitation

The update checker and release automation are committed, but the first signed release is not published until the four repository secrets are configured and a version tag is pushed. A GitHub Release APK download is an assisted update flow, not a silent/background installation. A Google Play release can later use Play's native in-app update API for a smoother installation experience.
