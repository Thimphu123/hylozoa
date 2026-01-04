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
  // `useGLTF` must be called as a hook inside a component that is rendered
  // within a Suspense boundary. The parent component (`ModelViewer`) will
  // check whether the model file exists before rendering this component to
  // avoid runtime errors.
  const gltf: any = useGLTF(modelPath);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
      
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
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
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

  // When the viewer becomes visible, check whether the model file is reachable
  useEffect(() => {
    if (!isInView) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(modelPath, { method: "HEAD" });
        if (!cancelled) {
          setModelAvailable(res.ok);
          if (!res.ok) console.warn(`Model not found at ${modelPath} (HEAD ${res.status})`);
        }
      } catch (err) {
        try {
          const res2 = await fetch(modelPath, { method: "GET" });
          if (!cancelled) {
            setModelAvailable(res2.ok);
            if (!res2.ok) console.warn(`Model not found at ${modelPath} (GET ${res2.status})`);
          }
        } catch (err2) {
          if (!cancelled) {
            setModelAvailable(false);
            console.warn(`Model fetch failed for ${modelPath}`, err2);
          }
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, [isInView, modelPath]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 dark:bg-gray-900"
      role="img"
      aria-label="3D biological model viewer"
    >
      {isInView && modelAvailable !== false ? (
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
      ) : modelAvailable === false ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600 dark:text-gray-400 text-sm text-center">
            Model not found. If you placed the file in `public/models/`, ensure the path is `/models/your-file.glb`.
          </div>
        </div>
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

