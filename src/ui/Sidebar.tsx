import { useStore } from '../store';
import type { PieceType } from '../store';
import { PIECE_CONFIGS } from '../components/PieceConfigs';

export const Sidebar = () => {
    const activePiece = useStore(state => state.activePiece);
    const setActivePiece = useStore(state => state.setActivePiece);

    // Group pieces for better UI layout
    const bricks: PieceType[] = ['1x1', '1x2', '1x3', '1x4', '2x2', '2x3', '2x4'];
    const plates: PieceType[] = ['plate-1x1', 'plate-1x2', 'plate-1x4', 'plate-2x2', 'plate-2x4'];
    const special: PieceType[] = ['slope-1x2', 'cylinder', 'arch'];

    const renderCategory = (title: string, items: PieceType[]) => (
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 10px 0', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {title}
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
            }}>
                {items.map(type => (
                    <button
                        key={type}
                        onClick={() => setActivePiece(type)}
                        style={{
                            padding: '10px',
                            border: `2px solid ${activePiece === type ? '#646cff' : 'transparent'}`,
                            backgroundColor: activePiece === type ? 'rgba(100, 108, 255, 0.2)' : 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            height: '60px'
                        }}
                    >
                        {/* Simple text representation since 3D thumbnails are very performance heavy */}
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{type.replace('plate-', '')}</span>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{PIECE_CONFIGS[type].isPlate ? 'Plate' : PIECE_CONFIGS[type].shape}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '280px',
            height: 'calc(100vh - 40px)',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>LEGO Builder</h2>

            {renderCategory('Bricks', bricks)}
            {renderCategory('Plates', plates)}
            {renderCategory('Special', special)}

            <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>
                Left Click: Place<br />
                Right Click / R: Rotate<br />
                Middle Mouse: Orbit
            </div>
        </div>
    );
};
