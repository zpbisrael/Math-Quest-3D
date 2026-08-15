import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, OrbitControls, Html, useTexture } from "@react-three/drei";
import { useRef, useState } from "react";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { useGameState } from "./store/useGameState";

const SPEED = 7;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();

function SpriteAvatar({ src, meshRef, positionRef }) {
  const texture = useTexture(src);
  
  useFrame(() => {
    if (positionRef.current && meshRef.current) {
      const pos = positionRef.current.translation();
      meshRef.current.position.set(pos.x, pos.y - 0.5, pos.z);
    }
  });

  return (
    <sprite ref={meshRef} position={[0, 0.5, 0]} scale={[3, 3, 1]}>
      <spriteMaterial map={texture} blending={THREE.MultiplyBlending} transparent depthWrite={false} />
    </sprite>
  );
}

export function Player({ skinColor = "hotpink", skinSprite = null }) {
  const ref = useRef();
  const meshRef = useRef();
  const orbitRef = useRef();
  const [, get] = useKeyboardControls();
  const [target] = useState(() => new THREE.Vector3());
  const { triggerMathBlock, isAnsweringMath, worldObjects, inventory, mineStone, feedAnimal, buildFence } = useGameState();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [showRockPrompt, setShowRockPrompt] = useState(false);
  const [showAnimalPrompt, setShowAnimalPrompt] = useState(false);
  const [lastMineTime, setLastMineTime] = useState(0);
  const [eReleased, setEReleased] = useState(true);

  useFrame((state) => {
    if (!ref.current || isAnsweringMath) return;
    const { forward, backward, left, right, jump, interact } = get();
    
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction.subVectors(frontVector, sideVector);
    
    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(SPEED);
      const angle = orbitRef.current ? orbitRef.current.getAzimuthalAngle() : 0;
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      const moveAngle = Math.atan2(direction.x, direction.z);
      if (meshRef.current && meshRef.current.type !== 'Sprite') {
         meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, moveAngle, 0.15);
      }
      if (meshRef.current) {
         meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.2;
      }
      ref.current.wakeUp();
    } else {
      if (meshRef.current) {
         meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1);
      }
    }
    
    const currentLinvel = ref.current.linvel();
    let nextVelY = currentLinvel.y;
    
    // Jump logic
    if (jump && Math.abs(currentLinvel.y) < 0.1) {
      nextVelY = 8;
    }
    
    ref.current.setLinvel({ x: direction.x, y: nextVelY, z: direction.z }, true);
    
    const pos = ref.current.translation();
    
    // Fall protection
    if (pos.y < -5) {
      ref.current.setTranslation({ x: 0, y: 10, z: 0 }, true);
      ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    
    cameraPosition.set(pos.x, pos.y + 3, pos.z + 8);
    state.camera.position.lerp(cameraPosition, 0.1);
    target.lerp(currentPos, 0.1);
    if (orbitRef.current) orbitRef.current.target.copy(target);
    
    let nearBlock = false;
    for (let block of worldObjects.blocks) {
      if (currentPos.distanceTo(new THREE.Vector3(block.x, 3, block.z)) < 3.5) {
        nearBlock = true;
        break;
      }
    }

    let nearRock = false;
    for (let rock of worldObjects.rocks) {
      if (currentPos.distanceTo(new THREE.Vector3(rock.x, 1, rock.z)) < 3.5) {
        nearRock = true;
        break;
      }
    }

    let nearAnimal = false;
    for (let animal of worldObjects.animals) {
      if (currentPos.distanceTo(new THREE.Vector3(animal.x, 1, animal.z)) < 3.5) {
        nearAnimal = true;
        break;
      }
    }

    if (nearBlock !== showPrompt) setShowPrompt(nearBlock);
    if (nearRock !== showRockPrompt) setShowRockPrompt(nearRock);
    if (nearAnimal !== showAnimalPrompt) setShowAnimalPrompt(nearAnimal);

    if (interact) {
      if (eReleased && !isAnsweringMath) {
        setEReleased(false);
        const now = Date.now();
        if (now - lastMineTime > 500) { // small cooldown
          setLastMineTime(now);
          if (nearBlock) {
            triggerMathBlock();
          } else if (nearAnimal && inventory.food > 0) {
            const fed = feedAnimal();
            if (fed) alert("האכלת חיה וקיבלת 15 יהלומים!");
          } else if (nearRock && inventory.sword > 0) {
            const keyFound = mineStone();
            if (keyFound) alert("מצאת מפתח זהב בתוך הסלע!");
          } else if (!nearBlock && !nearRock && !nearAnimal && inventory.wood > 0) {
            buildFence(pos.x, pos.z);
          }
        }
      }
    } else {
      if (!eReleased) setEReleased(true);
    }
  });

  return (
    <>
      <OrbitControls ref={orbitRef} makeDefault minDistance={3} maxDistance={20} maxPolarAngle={Math.PI / 2.1} />
      {skinSprite ? (
         <>
           <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 10, 0]} enabledRotations={[false, false, false]}>
             <CapsuleCollider args={[0.5, 0.5]} />
             {/* Invisible mesh to act as a placeholder for the rigid body */}
             <mesh visible={false}><boxGeometry args={[1, 1.5, 1]} /></mesh>
             {showPrompt && !isAnsweringMath && (
               <Html position={[0, 2, 0]} center>
                  <div style={{
                    background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 16px', 
                    borderRadius: '8px', fontWeight: 'bold', fontSize: '18px',
                    whiteSpace: 'nowrap', pointerEvents: 'none', border: '2px solid white'
                  }}>
                     לחץ [E] כדי לפתור
                  </div>
               </Html>
             )}
             {showAnimalPrompt && !isAnsweringMath && !showPrompt && (
               <Html position={[0, 2.5, 0]} center>
                  <div style={{
                    background: 'rgba(0,128,0,0.9)', color: 'white', padding: '8px 16px', 
                    borderRadius: '8px', fontWeight: 'bold', fontSize: '14px',
                    whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid white'
                  }}>
                     {inventory.food > 0 ? "לחץ [E] להאכיל" : "חסר אוכל לחיות"}
                  </div>
               </Html>
             )}
             {showRockPrompt && !isAnsweringMath && !showPrompt && !showAnimalPrompt && (
               <Html position={[0, 2.5, 0]} center>
                  <div style={{
                    background: 'rgba(50,50,50,0.9)', color: 'white', padding: '8px 16px', 
                    borderRadius: '8px', fontWeight: 'bold', fontSize: '14px',
                    whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid gray'
                  }}>
                     {inventory.sword > 0 ? "לחץ [E] לחצוב סלע" : "דרושה חרב לחציבה"}
                  </div>
               </Html>
             )}
             {!showPrompt && !showRockPrompt && !showAnimalPrompt && inventory.wood > 0 && !isAnsweringMath && (
               <Html position={[0, 2.5, 0]} center>
                  <div style={{
                    background: 'rgba(139,69,19,0.8)', color: 'white', padding: '4px 8px', 
                    borderRadius: '4px', fontWeight: 'bold', fontSize: '12px',
                    whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid #5D4037'
                  }}>
                     [E] בנה גדר
                  </div>
               </Html>
             )}
           </RigidBody>
           <SpriteAvatar src={skinSprite} meshRef={meshRef} positionRef={ref} />
         </>
      ) : (
        <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 10, 0]} enabledRotations={[false, false, false]}>
          <CapsuleCollider args={[0.5, 0.5]} />
          <group ref={meshRef}>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[1, 1.5, 1]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[0.2, 0.3, 0.51]}>
               <boxGeometry args={[0.2, 0.2, 0.05]} />
               <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.2, 0.3, 0.51]}>
               <boxGeometry args={[0.2, 0.2, 0.05]} />
               <meshStandardMaterial color="white" />
            </mesh>
          </group>
          {showPrompt && !isAnsweringMath && (
            <Html position={[0, 2, 0]} center>
               <div style={{
                 background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 16px', 
                 borderRadius: '8px', fontWeight: 'bold', fontSize: '18px',
                 whiteSpace: 'nowrap', pointerEvents: 'none', border: '2px solid white'
               }}>
                  לחץ [E] כדי לפתור
               </div>
            </Html>
          )}
          {showRockPrompt && !isAnsweringMath && !showPrompt && (
            <Html position={[0, 2.5, 0]} center>
               <div style={{
                 background: 'rgba(50,50,50,0.9)', color: 'white', padding: '8px 16px', 
                 borderRadius: '8px', fontWeight: 'bold', fontSize: '14px',
                 whiteSpace: 'nowrap', pointerEvents: 'none', border: '1px solid gray'
               }}>
                  {inventory.sword > 0 ? "לחץ [E] לחצוב סלע" : "דרושה חרב לחציבה"}
               </div>
            </Html>
          )}
        </RigidBody>
      )}
    </>
  );
}
