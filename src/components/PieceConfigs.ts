import type { PieceType } from '../store';

// A standard standard brick has height = 1.0 (relative units)
// A standard plate has height = 0.33 of a brick.
export const BRICK_HEIGHT = 1.0;
export const PLATE_HEIGHT = 0.33;

// Definition of each piece type's size in studs (X = width, Z = depth)
export interface PieceConfig {
    x: number; // Width in studs
    z: number; // Depth in studs
    isPlate: boolean;
    shape: 'box' | 'cylinder' | 'slope' | 'arch';
}

export const PIECE_CONFIGS: Record<PieceType, PieceConfig> = {
    '1x1': { x: 1, z: 1, isPlate: false, shape: 'box' },
    '1x2': { x: 1, z: 2, isPlate: false, shape: 'box' },
    '1x3': { x: 1, z: 3, isPlate: false, shape: 'box' },
    '1x4': { x: 1, z: 4, isPlate: false, shape: 'box' },

    '2x2': { x: 2, z: 2, isPlate: false, shape: 'box' },
    '2x3': { x: 2, z: 3, isPlate: false, shape: 'box' },
    '2x4': { x: 2, z: 4, isPlate: false, shape: 'box' },

    'plate-1x1': { x: 1, z: 1, isPlate: true, shape: 'box' },
    'plate-1x2': { x: 1, z: 2, isPlate: true, shape: 'box' },
    'plate-1x4': { x: 1, z: 4, isPlate: true, shape: 'box' },
    'plate-2x2': { x: 2, z: 2, isPlate: true, shape: 'box' },
    'plate-2x4': { x: 2, z: 4, isPlate: true, shape: 'box' },

    'slope-1x2': { x: 1, z: 2, isPlate: false, shape: 'slope' },
    'cylinder': { x: 1, z: 1, isPlate: false, shape: 'cylinder' },
    'arch': { x: 1, z: 4, isPlate: false, shape: 'arch' },
};
