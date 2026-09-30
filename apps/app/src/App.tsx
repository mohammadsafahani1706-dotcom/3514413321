import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// 1. مدل اتوبوس 3D
// ============================================
const BusModel = React.forwardRef(({ position, rotation }: any, ref: any) => {
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* بدنه اصلی */}
      <mesh castShadow>
        <boxGeometry args={[2.6, 2.5, 10]} />
        <meshStandardMaterial color="#E53935" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* کابین رانندگی */}
      <mesh position={[0, 0.3, 3.5]} castShadow>
        <boxGeometry args={[2.4, 1.8, 2]} />
        <meshStandardMaterial color="#C62828" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* پنجره‌های کابین */}
      <mesh position={[-0.9, 0.6, 3.5]}>
        <planeGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#4FC3F7" metalness={0.8} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.9, 0.6, 3.5]}>
        <planeGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#4FC3F7" metalness={0.8} roughness={0.1} transparent opacity={0.6} />
      </mesh>

      {/* چرخ‌ها */}
      {[-1.1, 1.1].map((x, idx) => (
        <group key={`wheel-set-${idx}`}>
          {/* جلو */}
          <mesh position={[x, -0.8, 2.5]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#212121" metalness={0.5} roughness={0.6} />
          </mesh>
          {/* عقب اول */}
          <mesh position={[x, -0.8, -2.5]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#212121" metalness={0.5} roughness={0.6} />
          </mesh>
          {/* عقب دوم */}
          <mesh position={[x, -0.85, -4.2]} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.35, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#212121" metalness={0.5} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* بمپر جلو */}
      <mesh position={[0, -0.7, 5.2]}>
        <boxGeometry args={[2.8, 0.4, 0.2]} />
        <meshStandardMaterial color="#424242" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* چراغ‌های جلو */}
      <mesh position={[-1.2, 0.2, 5.1]}>
        <boxGeometry args={[0.3, 0.3, 0.15]} />
        <meshStandardMaterial color="#FFD54F" emissive="#FFD54F" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.2, 0.2, 5.1]}>
        <boxGeometry args={[0.3, 0.3, 0.15]} />
        <meshStandardMaterial color="#FFD54F" emissive="#FFD54F" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
});

BusModel.displayName = 'BusModel';

// ============================================
// 2. زون‌های آزمایشی
// ============================================
interface Zone {
  id: string;
  name: string;
  color: string;
  position: [number, number];
  size: [number, number];
  description: string;
}

const zones: Zone[] = [
  {
    id: 'A',
    name: 'زون A: دینامیکی و هندلینگ',
    color: '#FF6B6B',
    position: [-100, 50],
    size: [250, 300],
    description: 'مسیر حلقه‌ای با پیچ‌های متنوع'
  },
  {
    id: 'B',
    name: 'زون B: تست ترمز',
    color: '#4ECDC4',
    position: [50, -150],
    size: [200, 50],
    description: 'مسیر مستقیم و یکنواخت'
  },
  {
    id: 'C',
    name: 'زون C: ناهموار و دوام',
    color: '#FFE66D',
    position: [120, 50],
    size: [150, 80],
    description: 'سطوح با ناهمواری کنترل‌شده'
  },
  {
    id: 'D',
    name: 'زون D: شیب و رمپ',
    color: '#95E1D3',
    position: [120, 150],
    size: [100, 80],
    description: 'رمپ‌های شیب‌دار و پیچشی'
  },
  {
    id: 'E',
    name: 'زون E: اسکیدپد',
    color: '#A8E6CF',
    position: [-80, -120],
    size: [80, 80],
    description: 'دایره بزرگ و مسیر مخروط‌گذاری'
  },
  {
    id: 'F',
    name: 'زون F: NVH',
    color: '#FFB3BA',
    position: [120, -120],
    size: [150, 40],
    description: 'مسیر آسفالتی برای صدا و لرزش'
  },
  {
    id: 'G',
    name: 'سالن تهویه مطبوع',
    color: '#C7CEEA',
    position: [200, 150],
    size: [30, 15],
    description: 'سازه برای تست تهویه'
  }
];

// ============================================
// 3. صحنه 3D
// ============================================
function TestCenterScene({ selectedZone, onZoneClick }: any) {
  const busRef = useRef<THREE.Group>(null);
  const [busState, setBusState] = useState({ x: 0, z: 0, angle: 0, progress: 0 });

  // مسیرهای انیمیشن
  const getAnimationPath = (zoneId: string): [number, number][] => {
    const paths: { [key: string]: [number, number][] } = {
      A: [
        [-150, 0], [-150, 80], [-50, 80], [-50, -80], [50, -80], [50, 0], [-150, 0]
      ],
      B: [
        [-50, -150], [100, -150], [100, -120], [-50, -120], [-50, -150]
      ],
      C: [
        [50, 20], [150, 20], [150, 80], [50, 80], [50, 20]
      ],
      D: [
        [80, 120], [140, 120], [140, 180], [80, 180], [80, 120]
      ],
      E: [
        [-80, -150], [-120, -120], [-140, -80], [-120, -50], [-80, -120], [-40, -150], [-80, -150]
      ],
      F: [
        [50, -120], [180, -120], [180, -100], [50, -100], [50, -120]
      ],
      G: [
        [180, 130], [210, 130], [210, 160], [180, 160], [180, 130]
      ]
    };
    return paths[zoneId] || [];
  };

  // انیمیشن حرکت
  useFrame(() => {
    if (selectedZone && busRef.current) {
      const path = getAnimationPath(selectedZone);
      if (path.length === 0) return;

      setBusState(prev => {
        let newProgress = (prev.progress + 0.005) % 1;
        
        // محاسبه موقعیت روی مسیر
        const totalLength = path.length - 1;
        const segmentLength = 1 / totalLength;
        const segment = Math.floor(newProgress / segmentLength);
        const localProgress = (newProgress - segment * segmentLength) / segmentLength;

        const p1 = path[Math.min(segment, path.length - 1)];
        const p2 = path[Math.min(segment + 1, path.length - 1)];

        const x = p1[0] + (p2[0] - p1[0]) * localProgress;
        const z = p1[1] + (p2[1] - p1[1]) * localProgress;

        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

        return { x, z, angle, progress: newProgress };
      });
    }
  });

  useEffect(() => {
    if (busRef.current) {
      busRef.current.position.set(busState.x, 0, busState.z);
      busRef.current.rotation.y = busState.angle;
    }
  }, [busState]);

  return (
    <group>
      {/* آسمان */}
      <mesh position={[0, 200, 0]}>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* زمین */}
      <mesh receiveShadow>
        <planeGeometry args={[600, 500]} />
        <meshStandardMaterial color="#90EE90" metalness={0} roughness={0.8} />
      </mesh>

      {/* خطوط شطرنجی */}
      <gridHelper args={[600, 60, 0x000000, 0x999999]} />

      {/* روشنایی */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-100, 100, -100]} intensity={0.8} />

      {/* زون‌های آزمایشی */}
      {zones.map((zone) => (
        <group 
          key={zone.id} 
          onClick={() => onZoneClick(zone.id)}
          style={{ cursor: 'pointer' } as any}
        >
          {/* سطح زون */}
          <mesh
            position={[zone.position[0], 0.05, zone.position[1]]}
            receiveShadow
          >
            <planeGeometry args={zone.size} />
            <meshStandardMaterial
              color={zone.color}
              transparent
              opacity={selectedZone === zone.id ? 0.8 : 0.5}
              emissive={zone.color}
              emissiveIntensity={selectedZone === zone.id ? 0.4 : 0.1}
            />
          </mesh>

          {/* برچسب */}
          {selectedZone === zone.id && (
            <Text 
              position={[zone.position[0], 8, zone.position[1]]} 
              fontSize={6} 
              color="#000"
              anchorX="center"
            >
              {zone.name}
            </Text>
          )}

          {/* خطوط حاشیه - ساده */}
        </group>
      ))}

      {/* اتوبوس */}
      {selectedZone && (
        <BusModel ref={busRef} position={[busState.x, 0, busState.z]} rotation={[0, busState.angle, 0]} />
      )}

      {/* درختان */}
      {[-200, -100, 0, 100, 200].map((x) =>
        [-200, -100, 100, 200].map((z) => (
          <group key={`tree-${x}-${z}`} position={[x, 0, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 12, 0]} castShadow>
              <sphereGeometry args={[4, 8, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// ============================================
// 4. رابط کاربری
// ============================================
function UI({ selectedZone, onZoneClick }: any) {
  return (
    <>
      {/* هدر */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          direction: 'rtl',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px' }}>🏭 مرکز تست و تجزیه‌تحلیل خودرو</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          صحنه سه‌بعدی تعاملی از ۷ مناطق آزمایشی
        </p>
      </div>

      {/* پنل کنترل */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '320px',
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
          🚗 زون‌های تست
        </h2>
        <div style={{ marginBottom: '15px', fontSize: '12px', color: '#AAA' }}>
          {selectedZone ? `زون فعلی: ${selectedZone}` : 'لطفا یک زون را انتخاب کنید'}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone.id)}
              style={{
                padding: '12px',
                background: selectedZone === zone.id ? zone.color : '#222',
                color: selectedZone === zone.id ? '#000' : '#fff',
                border: `2px solid ${zone.color}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                if (selectedZone !== zone.id) {
                  (e.currentTarget as any).style.background = zone.color;
                  (e.currentTarget as any).style.color = '#000';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedZone !== zone.id) {
                  (e.currentTarget as any).style.background = '#222';
                  (e.currentTarget as any).style.color = '#fff';
                }
              }}
            >
              {zone.id}
            </button>
          ))}
        </div>

        {selectedZone && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '12px', 
            borderRadius: '6px',
            marginBottom: '12px',
            borderLeft: `4px solid ${zones.find(z => z.id === selectedZone)?.color}`
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
              {zones.find(z => z.id === selectedZone)?.name}
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#BBB', lineHeight: '1.4' }}>
              {zones.find(z => z.id === selectedZone)?.description}
            </p>
          </div>
        )}

        <div style={{ fontSize: '11px', color: '#AAA', lineHeight: '1.6', borderTop: '1px solid #444', paddingTop: '12px' }}>
          <div>💡 <strong>راهنما:</strong></div>
          <div>• دکمه زون را کلیک کنید</div>
          <div>• ماوس: کشیدن برای چرخش</div>
          <div>• اسکرول: بزرگ‌نمایی صحنه</div>
        </div>
      </div>

      {/* راهنمای بالا */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          direction: 'ltr',
          minWidth: '180px',
          zIndex: 10,
        }}
      >
        <div>↔ : چرخش</div>
        <div>↕ : بالا/پایین</div>
        <div>⊙ : بزرگ‌نمایی</div>
      </div>
    </>
  );
}

// ============================================
// 5. کامپوننت اصلی
// ============================================
export default function App() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{ position: [0, 150, 200], fov: 60, near: 0.1, far: 1000 }}
      >
        <PerspectiveCamera makeDefault position={[0, 150, 200]} fov={60} />
        <OrbitControls autoRotate={false} />
        <TestCenterScene selectedZone={selectedZone} onZoneClick={setSelectedZone} />
      </Canvas>
      <UI selectedZone={selectedZone} onZoneClick={setSelectedZone} />
    </div>
  );
}
