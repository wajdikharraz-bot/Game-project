import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './ui/Sidebar';
import { Topbar } from './ui/Topbar';
import { Bottombar } from './ui/Bottombar';
import { useStore } from './store';

function App() {
    const undo = useStore(state => state.undo);
    const redo = useStore(state => state.redo);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return (
        <>
            <Scene />

            {/* UI Overlays */}
            <Sidebar />
            <Topbar />
            <Bottombar />
        </>
    );
}

export default App;
