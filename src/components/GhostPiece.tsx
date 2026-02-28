import { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { LegoGeometry } from './LegoGeometry';
import { PIECE_CONFIGS, BRICK_HEIGHT, PLATE_HEIGHT } from './PieceConfigs';
import { playSnapSound, playThudSound } from '../utils/audio';

export const GhostPiece = () => {
    const activePiece = useStore((state) => state.activePiece);
    const activeColor = useStore((state) => state.activeColor);
    const addPiece = useStore((state) => state.addPiece);

    // Track current snapped position and rotation
    const [position, setPosition] = useState<[number, number, number] | null>(null);
    const [rotationY, setRotationY] = useState(0); // in radians
    const [isValid, setIsValid] = useState(true);

    const groupRef = useRef<THREE.Group>(null);
    const { pointer, camera, scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const startPosRef = useRef({ x: 0, y: 0 });

    // Handle Rotation Input (R key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'r' || e.key === 'R') {
                setRotationY((prev) => prev + Math.PI / 2); // Rotate 90 degrees
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Use RequestAnimationFrame for smooth Raycasting and Snapping
    useEffect(() => {
        let animationFrameId: number;

        // We do exact pointer events manually because attaching onPointerMove to every single piece causes immense React overhead when 1000s of pieces are on screen.
        // Standard ThreeJS raycasting is much faster.
        const updatePosition = () => {
            raycaster.current.setFromCamera(pointer, camera);

            // Raycast against the baseplate (which should have name "baseplate") and placed pieces ("piece")
            const intersects = raycaster.current.intersectObjects(scene.children, true);

            // Filter out utility meshes (like grid, ghost piece itself, sky, lights)
            const validHits = intersects.filter((hit) => {
                let current: THREE.Object3D | null = hit.object;
                while (current) {
                    if (current.userData.isBaseplate || current.userData.isPiece) return true;
                    current = current.parent;
                }
                return false;
            });

            if (validHits.length > 0) {
                const hit = validHits[0];
                const point = hit.point;

                const config = PIECE_CONFIGS[activePiece];
                const isRotated = Math.abs(rotationY % Math.PI) > 0.1;
                const effX = isRotated ? config.z : config.x;
                const effZ = isRotated ? config.x : config.z;

                // --- 1. Horizontal Snapping (X and Z) ---
                // If the width in studs is odd, the center must be on a half-integer (e.g. 0.5) to align with grid lines.
                // If the width in studs is even, the center must be on an integer (e.g. 1.0) to align with grid lines.
                const finalX = (effX % 2 !== 0) ? Math.floor(point.x) + 0.5 : Math.round(point.x);
                const finalZ = (effZ % 2 !== 0) ? Math.floor(point.z) + 0.5 : Math.round(point.z);

                const minX = finalX - effX / 2;
                const maxX = finalX + effX / 2;
                const minZ = finalZ - effZ / 2;
                const maxZ = finalZ + effZ / 2;

                const eps = 0.05;

                // --- 2. Vertical Snapping (Find max height in footprint) ---
                const pieces = useStore.getState().pieces;
                let highestY = 0.2; // Baseplate height surface

                for (const p of pieces) {
                    const pConf = PIECE_CONFIGS[p.type];
                    const pRot = Math.abs(p.rotation[1] % Math.PI) > 0.1;
                    const pw = pRot ? pConf.z : pConf.x;
                    const pd = pRot ? pConf.x : pConf.z;
                    const ph = pConf.isPlate ? PLATE_HEIGHT : BRICK_HEIGHT;

                    const pMinX = p.position[0] - pw / 2;
                    const pMaxX = p.position[0] + pw / 2;
                    const pMaxY = p.position[1] + ph;
                    const pMinZ = p.position[2] - pd / 2;
                    const pMaxZ = p.position[2] + pd / 2;

                    // Check horizontal overlap
                    if (
                        minX < pMaxX - eps && maxX > pMinX + eps &&
                        minZ < pMaxZ - eps && maxZ > pMinZ + eps
                    ) {
                        // There is horizontal overlap, so the new piece must rest ON TOP of this piece
                        // Update the highestY found so far
                        if (pMaxY > highestY) {
                            highestY = pMaxY;
                        }
                    }
                }

                const finalPos: [number, number, number] = [finalX, highestY, finalZ];

                // Because it automatically stacks on top of whatever it overlaps with,
                // it natively prevents clipping. There is practically no invalid state.
                setIsValid(true);
                setPosition(finalPos);
            } else {
                setIsValid(false);
                setPosition(null);
            }

            animationFrameId = requestAnimationFrame(updatePosition);
        };

        updatePosition();
        return () => cancelAnimationFrame(animationFrameId);
    }, [pointer, camera, scene, activePiece, rotationY]);

    // Handle Click Placement
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                startPosRef.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            // Only place on left click, ignore if dragging over UI, or middle click
            if (e.button !== 0 || position === null || !isValid) return;
            // Prevent placing if clicking over HTML UI (glass-panel)
            if ((e.target as HTMLElement).closest('.glass-panel')) return;

            // Prevent placement if the user was dragging the camera
            const dx = e.clientX - startPosRef.current.x;
            const dy = e.clientY - startPosRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 5) return;

            addPiece({
                id: crypto.randomUUID(),
                type: activePiece,
                position: position,
                rotation: [0, rotationY, 0],
                color: activeColor
            });

            // Play the appropriate physics sound
            // 0.2 is the baseplate height. Anything slightly higher means we stacked on a brick.
            if (position[1] <= 0.25) {
                playThudSound();
            } else {
                playSnapSound();
            }
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [position, rotationY, activePiece, activeColor, addPiece]);


    if (!position) return null;

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={[0, rotationY, 0]}
            // Give GhostPiece a slightly higher render order to always see it clearly
            renderOrder={100}
        >
            <LegoGeometry type={activePiece} color={isValid ? activeColor : '#ff0000'} isGhost={true} />
        </group>
    );
};
