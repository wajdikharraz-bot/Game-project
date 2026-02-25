import { useStore, COLORS } from '../store';

export const Topbar = () => {
    const activeColor = useStore(state => state.activeColor);
    const setActiveColor = useStore(state => state.setActiveColor);

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '20px',
            left: '320px', // Just right of the sidebar
            right: '20px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            justifyContent: 'center', // Center the colors
            gap: '20px'
        }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', opacity: 0.8 }}>Color</span>

            <div style={{ display: 'flex', gap: '8px' }}>
                {COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => setActiveColor(color)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: `3px solid ${activeColor === color ? '#ffffff' : 'transparent'}`,
                            boxShadow: activeColor === color ? '0 0 10px rgba(255,255,255,0.5)' : '0 2px 5px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease',
                            transform: activeColor === color ? 'scale(1.1)' : 'scale(1)'
                        }}
                        title={color}
                    />
                ))}
            </div>
        </div>
    );
};
