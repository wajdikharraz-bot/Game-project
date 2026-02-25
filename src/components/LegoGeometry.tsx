import * as THREE from 'three';
import { useMemo } from 'react';
import { PIECE_CONFIGS, BRICK_HEIGHT, PLATE_HEIGHT } from './PieceConfigs';
import type { PieceType } from '../store';

interface LegoGeometryProps {
    type: PieceType;
    color: string;
    isGhost?: boolean;
}

const STUD_RADIUS = 0.25;
const STUD_HEIGHT = 0.15;
const STUD_SPACING = 1.0;

export const LegoGeometry = ({ type, color, isGhost = false }: LegoGeometryProps) => {
    const config = PIECE_CONFIGS[type];
    const height = config.isPlate ? PLATE_HEIGHT : BRICK_HEIGHT;

    // A slightly lighter/more saturated plastic material for real pieces
    // A transparent ghost material for the hover preview
    const material = useMemo(() => {
        if (isGhost) {
            return new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.5,
                roughness: 0.2,
                depthWrite: false,
            });
        }
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,   // Plastic is fairly smooth
            metalness: 0.05,  // Slight shine
        });
    }, [color, isGhost]);

    // Render standard box bricks/plates
    if (config.shape === 'box') {
        return (
            <group>
                {/* Main Body */}
                <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[config.x, height, config.z]} />
                    <primitive object={material} attach="material" />
                </mesh>

                {/* Studs on top */}
                <Studs x={config.x} z={config.z} height={height} material={material} />
            </group>
        );
    }

    // Render the 1x1 cylinder block
    if (config.shape === 'cylinder') {
        return (
            <group>
                <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.45, 0.45, height, 32]} />
                    <primitive object={material} attach="material" />
                </mesh>
                <Studs x={1} z={1} height={height} material={material} />
            </group>
        );
    }

    // Render a 45 degree slope
    // Since Three.js doesn't have a built-in wedge/slope, we use a Custom Box and rotate vertices, 
    // or a Cylinder with 3 segments (Prism). Let's use a prism approach for simplicity:
    if (config.shape === 'slope') {
        // A 1x2 slope. The back has studs, descending to the front.
        return (
            <group>
                {/* The slanted body */}
                <mesh position={[0, height / 2, 0]} castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
                    {/* Using a cone with 4 radial segments to create a pyramid/wedge, then scaling it */}
                    <cylinderGeometry args={[0, 0.5 * Math.sqrt(2), height, 4, 1]} />
                    {/* Rotate the geometry to lay it flat */}
                    <primitive object={material} attach="material" />
                </mesh>

                {/* Just add a solid box for the base so it's not simply a triangle */}
                <mesh position={[0, height / 4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[config.x, height / 2, config.z]} />
                    <primitive object={material} attach="material" />
                </mesh>
            </group>
        );
    }

    // Fallback for Arch (using a simple box with a hole would require CSG or complex shapes, 
    // for this prototype we'll render a simplified bridge)
    if (config.shape === 'arch') {
        return (
            <group>
                <mesh position={[0, height / 2, -1.5]} castShadow receiveShadow>
                    <boxGeometry args={[1, height, 1]} />
                    <primitive object={material} attach="material" />
                </mesh>
                <mesh position={[0, height / 2, 1.5]} castShadow receiveShadow>
                    <boxGeometry args={[1, height, 1]} />
                    <primitive object={material} attach="material" />
                </mesh>
                <mesh position={[0, height - 0.25, 0]} castShadow receiveShadow>
                    <boxGeometry args={[1, 0.5, 4]} />
                    <primitive object={material} attach="material" />
                </mesh>
                <Studs x={1} z={4} height={height} material={material} />
            </group>
        );
    }

    return null;
};

// Generates the grid of cylinders (studs) on top of a single piece
const Studs = ({ x, z, height, material }: { x: number, z: number, height: number, material: THREE.Material }) => {
    const studs = [];
    const offsetX = (x - 1) / 2;
    const offsetZ = (z - 1) / 2;

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < z; j++) {
            studs.push(
                <mesh
                    key={`${i}-${j}`}
                    position={[
                        (i - offsetX) * STUD_SPACING,
                        height + (STUD_HEIGHT / 2),
                        (j - offsetZ) * STUD_SPACING
                    ]}
                    castShadow
                    receiveShadow
                >
                    <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
                    <primitive object={material} attach="material" />
                </mesh>
            );
        }
    }

    return <>{studs}</>;
};
