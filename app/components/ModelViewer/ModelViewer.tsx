"use client";

import { Suspense, useRef, useState, useEffect, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, Html } from "@react-three/drei";
import { Group } from "three";

interface Annotation {
  position: [number, number, number];
  label: string;
  description?: string;
}

interface ModelViewerProps {
  modelPath: string;
  annotations?: Annotation[];
}

function Model({ modelPath, annotations }: ModelViewerProps) {
  const groupRef = useRef<Group>(null);
  const [hasError, setHasError] = useState(false);
  
  // Load model with error handling
  let gltf: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gltf = useGLTF(modelPath);
  } catch (error) {
    if (!hasError) {
      setHasError(true);
      console.warn(`Model not found at ${modelPath}, using placeholder`);
    }
  }

  return (
    <group ref={groupRef}>
      {gltf && !hasError ? (
        <primitive object={gltf.scene} />
      ) : (
        // Placeholder geometry when model is not available
        <group>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="orange" wireframe />
          </mesh>
          <Html center>
            <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
              Model placeholder
            </div>
          </Html>
        </group>
      )}
      
      {/* Render annotations */}
      {annotations?.map((annotation, index) => (
        <group key={index} position={annotation.position}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="red" />
          </mesh>
          <Html>
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs pointer-events-none">
              {annotation.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function ModelViewer({ modelPath, annotations }: ModelViewerProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 dark:bg-gray-900"
      role="img"
      aria-label="3D biological model viewer"
    >
      {isInView ? (
        <Canvas
          className="w-full h-full"
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]} // Limit pixel ratio for performance
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense
            fallback={
              <Html center>
                <div className="text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
                  Loading model...
                </div>
              </Html>
            }
          >
            <Model modelPath={modelPath} annotations={annotations} />
          </Suspense>
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600 dark:text-gray-400" role="status">
            Model will load when visible
          </div>
        </div>
      )}
    </div>
  );
}

