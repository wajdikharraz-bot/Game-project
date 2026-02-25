import { create } from 'zustand';

export type PieceType = 
  | '1x1' | '1x2' | '1x3' | '1x4' 
  | '2x2' | '2x3' | '2x4' 
  | 'plate-1x1' | 'plate-1x2' | 'plate-1x4' | 'plate-2x2' | 'plate-2x4'
  | 'slope-1x2' | 'cylinder' | 'arch';

export type PieceColor = 
  | '#E3000B' // Red
  | '#0055BF' // Blue
  | '#F2CD37' // Yellow
  | '#237841' // Green
  | '#FFFFFF' // White
  | '#05131D' // Black
  | '#D67240' // Orange
  | '#81007B' // Purple
  | '#582A12' // Brown
  | '#A0A5A9' // Light Gray
  | '#6C6E68' // Dark Gray
  | '#008F9B'; // Teal

export const COLORS: PieceColor[] = [
  '#E3000B', '#0055BF', '#F2CD37', '#237841',
  '#FFFFFF', '#05131D', '#D67240', '#81007B',
  '#582A12', '#A0A5A9', '#6C6E68', '#008F9B'
];

export interface Piece {
  id: string;
  type: PieceType;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles
  color: PieceColor;
}

interface GameState {
  pieces: Piece[];
  activePiece: PieceType;
  activeColor: PieceColor;
  history: Piece[][];
  redoStack: Piece[][];
  
  // Actions
  setActivePiece: (type: PieceType) => void;
  setActiveColor: (color: PieceColor) => void;
  addPiece: (piece: Piece) => void;
  removePiece: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  importBuild: (pieces: Piece[]) => void;
}

export const useStore = create<GameState>((set) => ({
  pieces: [],
  activePiece: '2x4',
  activeColor: '#E3000B',
  history: [],
  redoStack: [],

  setActivePiece: (type) => set({ activePiece: type }),
  setActiveColor: (color) => set({ activeColor: color }),

  addPiece: (piece) => set((state) => ({
    history: [...state.history, state.pieces],
    redoStack: [],
    pieces: [...state.pieces, piece]
  })),

  removePiece: (id) => set((state) => {
    const newPieces = state.pieces.filter(p => p.id !== id);
    if (newPieces.length === state.pieces.length) return state; // No change
    return {
      history: [...state.history, state.pieces],
      redoStack: [],
      pieces: newPieces
    };
  }),

  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousPieces = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    return {
      history: newHistory,
      redoStack: [...state.redoStack, state.pieces],
      pieces: previousPieces
    };
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const nextPieces = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    return {
      history: [...state.history, state.pieces],
      redoStack: newRedoStack,
      pieces: nextPieces
    };
  }),

  clearAll: () => set((state) => {
    if (state.pieces.length === 0) return state;
    return {
      history: [...state.history, state.pieces],
      redoStack: [],
      pieces: []
    };
  }),

  importBuild: (importedPieces) => set((state) => ({
    history: [...state.history, state.pieces],
    redoStack: [],
    pieces: importedPieces
  }))
}));
