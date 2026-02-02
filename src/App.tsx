import { useState, useEffect, useCallback } from 'react';
import './styles.css';

interface CameraFeed {
  id: string;
  location: string;
  status: 'active' | 'offline' | 'signal-lost';
  type: 'indoor' | 'outdoor' | 'night-vision';
}

const cameras: CameraFeed[] = [
  { id: 'CAM-01', location: 'PARKING LOT A - NORTH', status: 'active', type: 'outdoor' },
  { id: 'CAM-02', location: 'MAIN ENTRANCE', status: 'active', type: 'indoor' },
  { id: 'CAM-03', location: 'STAIRWELL B', status: 'signal-lost', type: 'indoor' },
  { id: 'CAM-04', location: 'LOADING DOCK', status: 'active', type: 'night-vision' },
  { id: 'CAM-05', location: 'LOBBY - RECEPTION', status: 'active', type: 'indoor' },
  { id: 'CAM-06', location: 'REAR ALLEY', status: 'offline', type: 'night-vision' },
  { id: 'CAM-07', location: 'ELEVATOR 1', status: 'active', type: 'indoor' },
  { id: 'CAM-08', location: 'ROOFTOP ACCESS', status: 'active', type: 'outdoor' },
  { id: 'CAM-09', location: 'SERVER ROOM', status: 'active', type: 'indoor' },
];

function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function Timestamp() {
  const time = useCurrentTime();

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  return <span className="timestamp">{formatDate(time)}</span>;
}

function CameraPanel({ camera, index }: { camera: CameraFeed; index: number }) {
  const [glitching, setGlitching] = useState(false);
  const time = useCurrentTime();

  const triggerGlitch = useCallback(() => {
    if (Math.random() > 0.95 && camera.status === 'active') {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150 + Math.random() * 200);
    }
  }, [camera.status]);

  useEffect(() => {
    const interval = setInterval(triggerGlitch, 2000);
    return () => clearInterval(interval);
  }, [triggerGlitch]);

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      className={`camera-panel ${camera.status} ${camera.type} ${glitching ? 'glitch' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="scanlines" />
      <div className="vignette" />
      <div className="noise" />

      {camera.status === 'active' && (
        <div className="feed-content">
          <div className="scene-placeholder">
            {camera.type === 'night-vision' && <div className="night-vision-overlay" />}
            <div className="motion-dots">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="motion-dot" style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${30 + Math.random() * 40}%`,
                  animationDelay: `${i * 0.5}s`
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {camera.status === 'signal-lost' && (
        <div className="signal-lost">
          <div className="static-noise" />
          <span>SIGNAL LOST</span>
        </div>
      )}

      {camera.status === 'offline' && (
        <div className="offline">
          <span>NO SIGNAL</span>
          <span className="offline-sub">CHECK CONNECTION</span>
        </div>
      )}

      <div className="camera-overlay">
        <div className="camera-id">{camera.id}</div>
        <div className="camera-location">{camera.location}</div>
        <div className="camera-time">{formatTime(time)}</div>
        <div className={`rec-indicator ${camera.status === 'active' ? 'recording' : ''}`}>
          <span className="rec-dot" />
          REC
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const [diskUsage] = useState(67);
  const [alerts] = useState(3);

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">SYSTEM</span>
        <span className="status-value online">ONLINE</span>
      </div>
      <div className="status-item">
        <span className="status-label">ACTIVE FEEDS</span>
        <span className="status-value">{cameras.filter(c => c.status === 'active').length}/{cameras.length}</span>
      </div>
      <div className="status-item">
        <span className="status-label">DISK USAGE</span>
        <div className="disk-bar">
          <div className="disk-fill" style={{ width: `${diskUsage}%` }} />
        </div>
        <span className="status-value">{diskUsage}%</span>
      </div>
      <div className="status-item">
        <span className="status-label">ALERTS</span>
        <span className="status-value alert">{alerts}</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <div className="crt-overlay" />
      <div className="global-scanlines" />

      <header className="header">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">◉</span>
            <span className="logo-text">JOLUP</span>
            <span className="logo-suffix">CCTV</span>
          </div>
          <div className="logo-sub">SURVEILLANCE NETWORK v2.4.1</div>
        </div>
        <div className="header-center">
          <Timestamp />
        </div>
        <StatusBar />
      </header>

      <main className="main">
        <div className="camera-grid">
          {cameras.map((camera, index) => (
            <CameraPanel key={camera.id} camera={camera} index={index} />
          ))}
        </div>
      </main>

      <footer className="footer">
        <span>Requested by @JolupCCTV · Built by @clonkbot</span>
      </footer>
    </div>
  );
}

export default App;
