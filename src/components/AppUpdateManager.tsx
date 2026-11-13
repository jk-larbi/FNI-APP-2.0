import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Download, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';
import './AppUpdateManager.css';

type UpdateManifest = {
  version: string;
  versionCode: number;
  minSupportedVersion?: string;
  apkUrl?: string;
  releaseNotes?: string[];
  publishedAt?: string;
};

const MANIFEST_URL = 'https://raw.githubusercontent.com/jk-larbi/FNI-APP-2.0/main/public/fni-update.json';
const FALLBACK_VERSION = '1.0.0';

function compareVersions(left: string, right: string) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] || 0) - (b[i] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export default function AppUpdateManager() {
  const [manifest, setManifest] = useState<UpdateManifest | null>(null);
  const [currentVersion, setCurrentVersion] = useState(FALLBACK_VERSION);
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [installing, setInstalling] = useState(false);
  const checkingRef = useRef(false);

  const checkForUpdates = useCallback(async (showUpToDate = false) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    setError('');
    try {
      let installedVersion = FALLBACK_VERSION;
      if (Capacitor.isNativePlatform()) {
        const info = await CapacitorApp.getInfo();
        installedVersion = info.version || FALLBACK_VERSION;
      }
      setCurrentVersion(installedVersion);
      const response = await fetch(MANIFEST_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Update service returned HTTP ' + response.status);
      const latest: UpdateManifest = await response.json();
      if (!latest.version || !latest.apkUrl) throw new Error('The update information is incomplete.');
      setManifest(latest);
      setChecked(true);
      if (compareVersions(latest.version, installedVersion) > 0) {
        setVisible(true);
      } else if (showUpToDate) {
        setVisible(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check for updates.');
      setChecked(true);
      if (showUpToDate) setVisible(true);
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkForUpdates(false);
    const manualCheck = () => void checkForUpdates(true);
    window.addEventListener('fni-check-for-updates', manualCheck);
    let listener: { remove: () => Promise<void> } | undefined;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', state => {
        if (state.isActive) void checkForUpdates(false);
      }).then(handle => { listener = handle; });
    }
    return () => {
      window.removeEventListener('fni-check-for-updates', manualCheck);
      void listener?.remove();
    };
  }, [checkForUpdates]);

  const isUpdate = Boolean(manifest && compareVersions(manifest.version, currentVersion) > 0);
  const mandatory = Boolean(isUpdate && manifest?.minSupportedVersion && compareVersions(currentVersion, manifest.minSupportedVersion) < 0);

  const openDownload = async () => {
    if (!manifest?.apkUrl) return;
    setInstalling(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: manifest.apkUrl, presentationStyle: 'fullscreen' });
      } else {
        window.open(manifest.apkUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setError('Unable to open the download. Please try again.');
    } finally {
      setInstalling(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fni-update-backdrop" role="presentation">
      <section className="fni-update-dialog" role="dialog" aria-modal="true" aria-labelledby="fni-update-title">
        {!mandatory && <button className="fni-update-close" type="button" aria-label="Close" onClick={() => setVisible(false)}><X size={19}/></button>}
        <div className="fni-update-brand">
          <img src="/FNI-APP-2.0/fni-logo.jpg" alt="FNI"/>
        </div>
        {checking ? (
          <>
            <RefreshCw className="fni-update-icon fni-update-spin" size={28}/>
            <h2 id="fni-update-title">Checking for updates</h2>
            <p>FNI is checking whether a newer version is available.</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="fni-update-icon" size={28}/>
            <h2 id="fni-update-title">Update check unavailable</h2>
            <p>{error}</p>
            <button className="fni-update-primary" type="button" onClick={() => void checkForUpdates(true)}>Try again</button>
          </>
        ) : isUpdate ? (
          <>
            <span className="fni-update-eyebrow">{mandatory ? 'Required update' : 'Update available'}</span>
            <h2 id="fni-update-title">A new FNI version is ready</h2>
            <p>Version {manifest?.version} is available. You're currently using version {currentVersion}.</p>
            {manifest?.releaseNotes?.length ? <div className="fni-update-notes"><strong>What's new</strong><ul>{manifest.releaseNotes.map((note, index) => <li key={index}>{note}</li>)}</ul></div> : null}
            <button className="fni-update-primary" type="button" onClick={() => void openDownload()} disabled={installing}>
              <Download size={17}/>{installing ? 'Opening download…' : 'Download update'}
            </button>
            <small className="fni-update-footnote">After downloading, Android will ask you to approve installation. Your FNI data is preserved when the update is signed with the same release key.</small>
            {!mandatory && <button className="fni-update-later" type="button" onClick={() => setVisible(false)}>Update later</button>}
          </>
        ) : checked ? (
          <>
            <CheckCircle2 className="fni-update-icon fni-update-success" size={30}/>
            <h2 id="fni-update-title">You're up to date</h2>
            <p>FNI version {currentVersion} is the latest available version.</p>
            <button className="fni-update-primary" type="button" onClick={() => setVisible(false)}>Done</button>
          </>
        ) : null}
      </section>
    </div>
  );
}
