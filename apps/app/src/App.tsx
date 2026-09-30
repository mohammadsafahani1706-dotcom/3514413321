import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './styles.css';

// کامپوننت صحنه 3D
function FacilityScene() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // تعریف مناطق تست اتوبوس
  const zones = [
    {
      id: 'zone-speed',
      name: 'ترک تست سرعت',
      position: [-8, 0.5, -5] as [number, number, number],
      size: [6, 1, 4] as [number, number, number],
      color: '#FF6B6B',
      description: 'آزمایش‌های سرعت و شتاب‌گیری',
      stats: { capacity: '۱۰ km/h - ۱۰۰ km/h', duration: '۲۰ دقیقه' }
    },
    {
      id: 'zone-brake',
      name: 'بلاک ترمز',
      position: [0, 0.5, -8] as [number, number, number],
      size: [5, 1, 3] as [number, number, number],
      color: '#4ECDC4',
      description: 'تست سیستم ترمزی و ایمنی',
      stats: { capacity: 'فشار ۰-۱۰ bar', duration: '۱۵ دقیقه' }
    },
    {
      id: 'zone-weather',
      name: 'محفظه آب و هوایی',
      position: [8, 0.5, -5] as [number, number, number],
      size: [5, 2, 4] as [number, number, number],
      color: '#FFE66D',
      description: 'شرایط آب و هوایی و دما',
      stats: { capacity: '-۲۰ تا ۵۰°C', duration: '۳۰ دقیقه' }
    },
    {
      id: 'zone-obstacle',
      name: 'آزمایش مانع‌پیمایی',
      position: [-5, 0.5, 4] as [number, number, number],
      size: [4, 1, 3] as [number, number, number],
      color: '#95E1D3',
      description: 'تست عملکرد در شرایط ناهموار',
      stats: { capacity: '۰-۳۰% شیب', duration: '۲۵ دقیقه' }
    },
    {
      id: 'zone-control',
      name: 'اتاق کنترل',
      position: [6, 2, 6] as [number, number, number],
      size: [4, 2, 3] as [number, number, number],
      color: '#A8E6CF',
      description: 'مرکز کنترل و نظارت آزمایش‌ها',
      stats: { capacity: '۵ اپراتور', duration: 'مداوم' }
    },
  ];

  return (
    <>
      {/* روشنایی */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* کف */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>

      {/* دیوارهای محفظه */}
      {[
        { pos: [0, 1.5, -15], size: [30, 3, 1] },
        { pos: [0, 1.5, 15], size: [30, 3, 1] },
        { pos: [-15, 1.5, 0], size: [1, 3, 30] },
        { pos: [15, 1.5, 0], size: [1, 3, 30] },
      ].map((wall, idx) => (
        <mesh 
          key={`wall-${idx}`} 
          position={wall.pos as [number, number, number]} 
          castShadow
        >
          <boxGeometry args={wall.size as [number, number, number]} />
          <meshStandardMaterial color="#D3D3D3" />
        </mesh>
      ))}

      {/* مناطق 3D */}
      {zones.map((zone) => (
        <mesh
          key={zone.id}
          position={zone.position}
          castShadow
          receiveShadow
          onPointerEnter={() => setHoveredZone(zone.id)}
          onPointerLeave={() => setHoveredZone(null)}
          onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
        >
          <boxGeometry args={zone.size} />
          <meshStandardMaterial
            color={zone.color}
            opacity={hoveredZone === zone.id || selectedZone === zone.id ? 0.9 : 0.7}
            transparent
            emissive={hoveredZone === zone.id ? zone.color : '#000000'}
            emissiveIntensity={hoveredZone === zone.id ? 0.3 : 0}
          />
        </mesh>
      ))}
    </>
  );
}

// کامپوننت اصلی
export default function App() {
  const [selectedInfo, setSelectedInfo] = useState<{
    name: string;
    description: string;
    stats: { capacity: string; duration: string };
  } | null>(null);

  const zones = [
    {
      id: 'zone-speed',
      name: 'ترک تست سرعت',
      description: 'آزمایش‌های سرعت و شتاب‌گیری',
      stats: { capacity: '۱۰ km/h - ۱۰۰ km/h', duration: '۲۰ دقیقه' }
    },
    {
      id: 'zone-brake',
      name: 'بلاک ترمز',
      description: 'تست سیستم ترمزی و ایمنی',
      stats: { capacity: 'فشار ۰-۱۰ bar', duration: '۱۵ دقیقه' }
    },
    {
      id: 'zone-weather',
      name: 'محفظه آب و هوایی',
      description: 'شرایط آب و هوایی و دما',
      stats: { capacity: '-۲۰ تا ۵۰°C', duration: '۳۰ دقیقه' }
    },
    {
      id: 'zone-obstacle',
      name: 'آزمایش مانع‌پیمایی',
      description: 'تست عملکرد در شرایط ناهموار',
      stats: { capacity: '۰-۳۰% شیب', duration: '۲۵ دقیقه' }
    },
    {
      id: 'zone-control',
      name: 'اتاق کنترل',
      description: 'مرکز کنترل و نظارت آزمایش‌ها',
      stats: { capacity: '۵ اپراتور', duration: 'مداوم' }
    },
  ];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* هدر */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: '0', fontSize: '24px' }}>🚌 مرکز تست و تجزیه‌تحلیل اتوبوس</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
          تصور سه‌بعدی تعاملی از مناطق آزمایش
        </p>
      </div>

      {/* محتوای اصلی */}
      <div style={{ flex: 1, display: 'flex', gap: '0' }}>
        {/* صحنه 3D */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
            <OrbitControls autoRotate={false} />
            <FacilityScene />
          </Canvas>

          {/* راهنما داخل صحنه */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              textAlign: 'right',
              direction: 'rtl',
              zIndex: 5,
            }}
          >
            <div>🖱️ کلیک: انتخاب</div>
            <div>🔄 موس: چرخش</div>
            <div>🔍 اسکرول: بزرگ‌نمایی</div>
          </div>
        </div>

        {/* پانل اطلاعات */}
        <div
          style={{
            width: '300px',
            background: '#F5F5F5',
            borderLeft: '1px solid #DDD',
            padding: '16px',
            overflowY: 'auto',
            direction: 'rtl',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
            🏢 مناطق آزمایشی
          </h3>

          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedInfo(zone)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                textAlign: 'right',
                direction: 'rtl',
                border: '2px solid #DDD',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                color: '#333',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = '#667eea';
                (e.target as HTMLElement).style.background = '#F0F0FF';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = '#DDD';
                (e.target as HTMLElement).style.background = '#fff';
              }}
            >
              {zone.name}
            </button>
          ))}

          {/* جزئیات منطقه انتخاب‌شده */}
          {selectedInfo && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fff',
                borderRadius: '6px',
                border: '2px solid #667eea',
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '16px' }}>
                {selectedInfo.name}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                {selectedInfo.description}
              </p>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📊 ظرفیت:</strong> {selectedInfo.stats.capacity}
                </div>
                <div>
                  <strong>⏱️ مدت:</strong> {selectedInfo.stats.duration}
                </div>
              </div>
              <button
                onClick={() => setSelectedInfo(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                بستن
              </button>
            </div>
          )}
        </div>
      </div>

      {/* فوتر */}
      <div
        style={{
          background: '#F5F5F5',
          padding: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          borderTop: '1px solid #DDD',
          direction: 'rtl',
          zIndex: 10,
        }}
      >
        💡 روی هر منطقه بروید یا کلیک کنید برای مشاهده جزئیات
      </div>
    </div>
  );
}
