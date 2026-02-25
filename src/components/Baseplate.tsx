import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';

const BASEPLATE_SIZE = 32;
const BASEPLATE_HEIGHT = 0.2;
const STUD_RADIUS = 0.25;
const STUD_HEIGHT = 0.15;

export const Baseplate = () => {
    const groupRef = useRef<THREE.Group>(null);
    const color = '#237841'; // Classic Lego Green

    return (
        <group ref={groupRef}>
            {/* Main Baseplate Box */}
            <mesh position={[0, BASEPLATE_HEIGHT / 2, 0]} receiveShadow userData={{ isBaseplate: true }}>
                <boxGeometry args={[BASEPLATE_SIZE, BASEPLATE_HEIGHT, BASEPLATE_SIZE]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Grid Lines for Guidance */}
            <gridHelper
                args={[BASEPLATE_SIZE, BASEPLATE_SIZE, 0x000000, 0x000000]}
                position={[0, BASEPLATE_HEIGHT + 0.01, 0]}
                material-opacity={0.1}
                material-transparent
            />

            {/* Instanced Studs on Top */}
            <BaseplateStuds color={color} />
        </group>
    );
};

// Use InstancedMesh for the 1024 studs on the baseplate for performance
const BaseplateStuds = ({ color }: { color: string }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Set positions for all 32x32 studs once
    useLayoutEffect(() => {
        if (meshRef.current) {
            const dummy = new THREE.Object3D();
            let count = 0;
            const offset = BASEPLATE_SIZE / 2 - 0.5;

            for (let x = 0; x < BASEPLATE_SIZE; x++) {
                for (let z = 0; z < BASEPLATE_SIZE; z++) {
                    dummy.position.set(
                        x - offset,
                        BASEPLATE_HEIGHT + STUD_HEIGHT / 2,
                        z - offset
                    );
                    dummy.updateMatrix();
                    meshRef.current.setMatrixAt(count++, dummy.matrix);
                }
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, []);

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, BASEPLATE_SIZE * BASEPLATE_SIZE]}
            receiveShadow
        >
            <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </instancedMesh>
    );
};
