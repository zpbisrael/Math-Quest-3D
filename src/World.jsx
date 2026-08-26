import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Player } from './Player';
import { useGameState } from './store/useGameState';
import * as THREE from 'three';

function Animal({ position, type }) {
  const meshRef = React.useRef();
  const origin = React.useMemo(() => new THREE.Vector3(...position), [position]);
  const color = type === 'pig' ? '#FFC0CB' : '#FFFFFF';
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      // Simple roaming logic: figure 8 around origin
      meshRef.current.position.x = origin.x + Math.sin(t + origin.x) * 2;
      meshRef.current.position.z = origin.z + Math.cos(t * 0.8 + origin.z) * 2;
      meshRef.current.position.y = origin.y + Math.abs(Math.sin(t * 5)) * 0.2; // hopping
      meshRef.current.rotation.y = Math.atan2(Math.cos(t + origin.x), -Math.sin(t * 0.8 + origin.z));
    }
  });

  return (
    <RigidBody type="kinematicPosition" colliders="cuboid" position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={type === 'pig' ? [0.6, 0.4, 0.8] : [0.8, 0.6, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export function World({ skinColor, skinSprite }) {
  const { triggerMathBlock, currentBiome, worldObjects } = useGameState();
  
  // Define biome palettes
  const biomes = {
    0: { grass: '#4CAF50', dirt: '#795548', wood: '#5D4037', leaves: '#2E7D32' }, // Forest
    1: { grass: '#EDC9AF', dirt: '#C2B280', wood: '#8B5A2B', leaves: '#DAA520' }, // Desert
    2: { grass: '#4A4A4A', dirt: '#212121', wood: '#8B0000', leaves: '#FF4500' }, // Volcano
    3: { grass: '#E0F7FA', dirt: '#B2EBF2', wood: '#4DD0E1', leaves: '#00BCD4' }, // Ice/Snow
    4: { grass: '#E1BEE7', dirt: '#CE93D8', wood: '#AB47BC', leaves: '#8E24AA' }, // Crystal/Purple
    5: { grass: '#F0F4C3', dirt: '#DCE775', wood: '#C0CA33', leaves: '#9E9D24' }, // Swamp
    6: { grass: '#FFCC80', dirt: '#FFB74D', wood: '#FF9800', leaves: '#F57C00' }, // Autumn
    7: { grass: '#BCAAA4', dirt: '#A1887F', wood: '#795548', leaves: '#5D4037' }, // Badlands
    8: { grass: '#C5CAE9', dirt: '#9FA8DA', wood: '#7986CB', leaves: '#5C6BC0' }, // Twilight/Blue
    9: { grass: '#FFCDD2', dirt: '#EF9A9A', wood: '#E57373', leaves: '#EF5350' }, // Cherry Blossom
    10: { grass: '#CFD8DC', dirt: '#B0BEC5', wood: '#90A4AE', leaves: '#78909C' }, // Stone Peaks
    11: { grass: '#F8BBD0', dirt: '#F48FB1', wood: '#F06292', leaves: '#EC407A' }, // Candy Land
    12: { grass: '#B2DFDB', dirt: '#80CBC4', wood: '#4DB6AC', leaves: '#26A69A' }, // Toxic Jungle
    13: { grass: '#D7CCC8', dirt: '#BCAAA4', wood: '#A1887F', leaves: '#8D6E63' }, // Dead Woods
    14: { grass: '#FFF9C4', dirt: '#FFF59D', wood: '#FFF176', leaves: '#FFEE58' }  // Golden Realm
  };
  const palette = biomes[currentBiome] || biomes[0];

  // Generate a voxel landscape (simple hills and trees)
  const blocks = useMemo(() => {
    const arr = [];
    const size = 20;
    
    // Terrain
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const y = Math.floor(Math.sin(x / 4) * Math.cos(z / 4) * 2);
        arr.push({ position: [x, y, z], type: 'grass' });
        // Fill underneath so no holes
        arr.push({ position: [x, y - 1, z], type: 'dirt' });
      }
    }
    
    // Add some Trees
    for(let i=0; i<10; i++) {
       const tx = Math.floor(Math.random() * size * 2) - size;
       const tz = Math.floor(Math.random() * size * 2) - size;
       const ty = Math.floor(Math.sin(tx / 4) * Math.cos(tz / 4) * 2) + 1;
       
       // Trunk
       arr.push({ position: [tx, ty, tz], type: 'wood' });
       arr.push({ position: [tx, ty+1, tz], type: 'wood' });
       
       // Leaves
       arr.push({ position: [tx, ty+2, tz], type: 'leaves' });
       arr.push({ position: [tx+1, ty+2, tz], type: 'leaves' });
       arr.push({ position: [tx-1, ty+2, tz], type: 'leaves' });
       arr.push({ position: [tx, ty+2, tz+1], type: 'leaves' });
       arr.push({ position: [tx, ty+2, tz-1], type: 'leaves' });
       arr.push({ position: [tx, ty+3, tz], type: 'leaves' });
    }
    
    return arr;
  }, []); // Blocks positions remain same, colors change dynamically

  const getColor = (type) => palette[type] || 'white';

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.5} castShadow />
      
      <Physics>
        <Player skinColor={skinColor} skinSprite={skinSprite} />
        
        {/* Render the Voxel World */}
        <RigidBody type="fixed" colliders="cuboid">
           {blocks.filter(b => b.type !== 'leaves').map((b, i) => (
             <mesh key={`solid-${i}`} position={b.position} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={getColor(b.type)} />
             </mesh>
           ))}
        </RigidBody>

        {/* Visual-only blocks (Leaves) */}
        {blocks.filter(b => b.type === 'leaves').map((b, i) => (
           <mesh key={`visual-${i}`} position={b.position} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={getColor(b.type)} />
           </mesh>
        ))}

        {/* The Interactive Math Blocks */}
        {worldObjects.blocks.map(b => (
          <RigidBody key={`block-${b.id}`} type="fixed" position={[b.x, 3, b.z]}>
            <mesh castShadow receiveShadow onClick={(e) => { e.stopPropagation(); triggerMathBlock(); }}>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <meshStandardMaterial 
                 color={b.difficulty === 'hard' ? '#f44336' : (b.difficulty === 'medium' ? '#ffeb3b' : '#4caf50')} 
                 emissive={b.difficulty === 'hard' ? '#d32f2f' : (b.difficulty === 'medium' ? '#fbc02d' : '#388e3c')} 
                 emissiveIntensity={0.5} 
              />
            </mesh>
          </RigidBody>
        ))}

        {/* Mineable Rocks */}
        {worldObjects.rocks.map(r => (
          <RigidBody key={`rock-${r.id}`} type="fixed" position={[r.x, 1, r.z]}>
            <mesh castShadow receiveShadow>
              <dodecahedronGeometry args={[1.5, 0]} />
              <meshStandardMaterial color="#757575" roughness={0.9} metalness={0.1} />
            </mesh>
          </RigidBody>
        ))}

        {/* Animals */}
        {worldObjects.animals.map(a => (
          <Animal key={`animal-${a.id}`} position={[a.x, 1, a.z]} type={a.type} />
        ))}

        {/* Fences */}
        {worldObjects.fences.map(f => (
          <RigidBody key={`fence-${f.id}`} type="fixed" position={[f.x, 0.5, f.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 0.2]} />
              <meshStandardMaterial color="#8B5A2B" />
            </mesh>
          </RigidBody>
        ))}
      </Physics>
    </>
  );
}
