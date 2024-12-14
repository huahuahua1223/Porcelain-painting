"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Environment } from "@react-three/drei";

const ThreeDModel = ({ modelPath }: { modelPath: string }) => {
    const [gltf, setGltf] = useState<any>(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (loadedGltf) => {
                // 遍历模型节点，调整材质属性
                loadedGltf.scene.traverse((node) => {
                    if (node.isMesh) {
                        const material = node.material;
                        if (material) {
                            material.metalness = 0.1; // 设置金属感
                            material.roughness = 0.5; // 设置粗糙度
                        }
                    }
                });
                setGltf(loadedGltf);
            },
            undefined,
            (error) => console.error("Error loading model:", error)
        );
    }, [modelPath]);

    if (!gltf) {
        return <div>Loading...</div>; // 加载状态
    }

    return (
        <Canvas 
            style={{ height: "100vh" }}
            gl={{ physicallyCorrectLights: true }} // 启用物理光照
        >
            {/* 环境光 */}
            <ambientLight intensity={0.3} />
            {/* 点光源 */}
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            {/* 方向光 */}
            <directionalLight position={[-10, 10, 5]} intensity={1.2} />

            {/* 加载的 3D 模型 */}
            <primitive object={gltf.scene} scale={1} />

            {/* 控制器 */}
            <OrbitControls />

            {/* 环境贴图 */}
            <Environment preset="sunset" />
        </Canvas>
    );
};

export default function ModelPage() {
    const modelPath = "/models/labixiaoxin.glb"; // 请确保将模型文件放在 public/models 目录下

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <ThreeDModel modelPath={modelPath} />
        </div>
    );
}
