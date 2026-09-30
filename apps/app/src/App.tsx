import { useState, useRef, useEffect } from 'react';
import './styles.css';

export default function BusAnimation() {
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 100 });
  const [busPos, setBusPos] = useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = useState(null);
  const canvasRef = useRef(null);

  // مناطق (Zones) برای کلیک
  const zones = [
    { id: 1, name: 'ایستگاه ۱', target: { x: -50, y: 0, z: 80 }, color: '#FF6B6B' },
    { id: 2, name: 'ایستگاه ۲', target: { x: -30, y: 20, z: 90 }, color: '#4ECDC4' },
    { id: 3, name: 'ایستگاه ۳', target: { x: 0, y: -30, z: 85 }, color: '#45B7D1' },
    { id: 4, name: 'ایستگاه ۴', target: { x: 30, y: 20, z: 95 }, color: '#FFA07A' },
    { id: 5, name: 'ایستگاه ۵', target: { x: 50, y: 0, z: 100 }, color: '#98D8C8' },
    { id: 6, name: 'ایستگاه ۶', target: { x: 40, y: -25, z: 88 }, color: '#F7DC6F' },
    { id: 7, name: 'ایستگاه ۷', target: { x: 20, y: -40, z: 92 }, color: '#BB8FCE' },
    { id: 8, name: 'ایستگاه ۸', target: { x: -20, y: -35, z: 87 }, color: '#85C1E9' },
    { id: 9, name: 'ایستگاه ۹', target: { x: -40, y: -20, z: 93 }, color: '#F8B88B' },
    { id: 10, name: 'ایستگاه ۱۰', target: { x: -60, y: 15, z: 82 }, color: '#ABEBC6' },
  ];

  // حرکت اتوبوس
  useEffect(() => {
    const animationId = setInterval(() => {
      setBusPos(prev => ({
        x: (prev.x + 0.5) % 100,
        y: Math.sin((prev.x + 0.5) * 0.1) * 15
      }));
    }, 50);

    return () => clearInterval(animationId);
  }, []);

  // رسم Canvas (SVG)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // پس‌زمینه
    ctx.fillStyle = '#E8F4F8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // آسمان
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    // زمین
    ctx.fillStyle = '#90CAF9';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // راه
    ctx.fillStyle = '#424242';
    ctx.fillRect(0, canvas.height * 0.45, canvas.width, 40);

    // خطوط جادّه
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.47);
    ctx.lineTo(canvas.width, canvas.height * 0.47);
    ctx.stroke();
    ctx.setLineDash([]);

    // رسم زون‌ها (دایره‌ها)
    zones.forEach((zone, index) => {
      const x = (zone.id * 40) % (canvas.width - 40) + 40;
      const y = zone.id % 2 === 0 ? canvas.height * 0.3 : canvas.height * 0.7;

      ctx.fillStyle = zone.color;
      ctx.globalAlpha = selectedZone === zone.id ? 1 : 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.id.toString(), x, y);
    });

    // رسم اتوبوس
    const busX = (busPos.x / 100) * canvas.width;
    const busY = canvas.height * 0.5;

    // بدنه اتوبوس
    ctx.fillStyle = '#E53935';
    ctx.fillRect(busX - 30, busY - 15, 60, 30);

    // پنجره‌ها
    ctx.fillStyle = '#64B5F6';
    ctx.fillRect(busX - 20, busY - 10, 12, 8);
    ctx.fillRect(busX - 3, busY - 10, 12, 8);
    ctx.fillRect(busX + 14, busY - 10, 12, 8);

    // چرخ‌ها
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(busX - 15, busY + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(busX + 15, busY + 15, 8, 0, Math.PI * 2);
    ctx.fill();
  }, [busPos, selectedZone, zones]);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone.id);
    setCameraPos(zone.target);
    
    // حرکت دوربین به سمت زون
    let steps = 0;
    const maxSteps = 20;
    const interval = setInterval(() => {
      steps++;
      setCameraPos(prev => ({
        x: prev.x + (zone.target.x - prev.x) * 0.1,
        y: prev.y + (zone.target.y - prev.y) * 0.1,
        z: prev.z + (zone.target.z - prev.z) * 0.1,
      }));
      
      if (steps >= maxSteps) clearInterval(interval);
    }, 50);
  };

  return (
    <div className="container">
      <div className="main">
        <canvas ref={canvasRef} width={800} height={600} className="canvas" />
        
        <div className="info">
          <h2>🎯 کلیک روی یک ایستگاه</h2>
          {selectedZone && (
            <p>
              ✅ دوربین به‌ سمت <strong>{zones.find(z => z.id === selectedZone)?.name}</strong> رفت!
            </p>
          )}
        </div>
      </div>

      <div className="zones">
        <h3>ایستگاه‌ها</h3>
        <div className="zone-grid">
          {zones.map(zone => (
            <button
              key={zone.id}
              className={`zone-btn ${selectedZone === zone.id ? 'active' : ''}`}
              style={{ borderColor: zone.color }}
              onClick={() => handleZoneClick(zone)}
            >
              <div className="zone-dot" style={{ backgroundColor: zone.color }}></div>
              <span>{zone.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}