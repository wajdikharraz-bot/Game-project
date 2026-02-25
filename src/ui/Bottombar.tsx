import { useStore } from '../store';
import { Undo2, Redo2, Trash2, Download, Upload } from 'lucide-react';

export const Bottombar = () => {
    const pieces = useStore(state => state.pieces);
    const undo = useStore(state => state.undo);
    const redo = useStore(state => state.redo);
    const clearAll = useStore(state => state.clearAll);
    const importBuild = useStore(state => state.importBuild);
    const history = useStore(state => state.history);
    const redoStack = useStore(state => state.redoStack);

    const handleSave = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pieces));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "lego_build.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (Array.isArray(json)) {
                    importBuild(json);
                } else {
                    alert('Invalid build file format.');
                }
            } catch (err) {
                console.error("Failed to parse JSON", err);
                alert('Could not read file. Is it valid JSON?');
            }
        };
        reader.readAsText(file);

        // Reset file input so same file can be loaded again if needed
        event.target.value = '';
    };

    const btnStyle = {
        padding: '10px 15px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.2s',
    };

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '20px',
            left: '320px', // Just right of the sidebar
            right: '20px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            justifyContent: 'space-between'
        }}>
            {/* Left side actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={undo}
                    disabled={history.length === 0}
                    style={{ ...btnStyle, opacity: history.length === 0 ? 0.5 : 1, cursor: history.length === 0 ? 'not-allowed' : 'pointer' }}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={18} /> Undo
                </button>
                <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    style={{ ...btnStyle, opacity: redoStack.length === 0 ? 0.5 : 1, cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer' }}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 size={18} /> Redo
                </button>
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear the entire build?")) {
                            clearAll();
                        }
                    }}
                    style={{ ...btnStyle, backgroundColor: 'rgba(220, 53, 69, 0.2)' }}
                >
                    <Trash2 size={18} /> Clear All
                </button>
            </div>

            {/* Stats center */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', opacity: 0.8 }}>
                    {pieces.length} Pieces
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                    Press 'R' to Rotate Piece | Right-Click to move Camera
                </div>
            </div>

            {/* Right side actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} style={btnStyle}>
                    <Download size={18} /> Save Build
                </button>

                {/* Hidden file input wrapped in a label styled like a button */}
                <label style={{ ...btnStyle, margin: 0 }}>
                    <Upload size={18} /> Load Build
                    <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleLoad}
                    />
                </label>
            </div>
        </div>
    );
};
