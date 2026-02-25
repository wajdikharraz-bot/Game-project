import { useStore } from '../store';
import { LegoGeometry } from './LegoGeometry';
import * as THREE from 'three';

export const PieceRenderer = () => {
    const pieces = useStore((state) => state.pieces);

    return (
        <group>
            {pieces.map((piece) => (
                <group
                    key={piece.id}
                    position={piece.position}
                    rotation={new THREE.Euler(...piece.rotation)}
                    userData={{ isPiece: true, isPlate: piece.type.includes('plate') }}
                >
                    <LegoGeometry type={piece.type} color={piece.color} />
                </group>
            ))}
        </group>
    );
};
