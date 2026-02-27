import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sky } from '@react-three/drei';
import { Baseplate } from './Baseplate';
import { GhostPiece } from './GhostPiece';
import { PieceRenderer } from './PieceRenderer';

export const Scene = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas
                shadows
                camera={{ position: [15, 15, 15], fov: 45 }}
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#d4e5ff']} />

                {/* Beautiful Sky Background */}
                <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} turbidity={5} rayleigh={2} />

                {/* Soft Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight
                    castShadow
                    position={[10, 20, 10]}
                    intensity={1.5}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-near={1}
                    shadow-camera-far={50}
                    shadow-camera-left={-20}
                    shadow-camera-right={20}
                    shadow-camera-top={20}
                    shadow-camera-bottom={-20}
                />

                {/* Soft realistic generic environment reflections */}
                <Environment preset="city" />

                {/* Ground Baseplate */}
                <Baseplate />

                <OrbitControls
                    makeDefault
                    minDistance={3}
                    maxDistance={150}
                    maxPolarAngle={Math.PI / 2 - 0.05} /* Don't allow camera to go underneath the baseplate */
                    mouseButtons={{
                        LEFT: undefined, /* Left click will be for placing blocks */
                        MIDDLE: 2,       /* Pan with middle mouse */
                        RIGHT: 0         /* Orbit with right mouse (THREE.MOUSE.ROTATE = 0) */
                    }}
                />

                {/* Soft contact shadows directly under blocks on the baseplate */}
                <ContactShadows
                    position={[0, 0.21, 0]}
                    opacity={0.4}
                    scale={35}
                    blur={1.5}
                    far={4}
                />

                {/* Dynamic Placed Pieces */}
                <PieceRenderer />

                {/* Hover/Preview Block */}
                <GhostPiece />

            </Canvas>
        </div>
    );
};
