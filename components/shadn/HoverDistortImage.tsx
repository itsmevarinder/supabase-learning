"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

import { cn } from "@/lib/utils";

// Generic hexagon displacement map — the same one used across countless
// "hover-effect" demos (Robin Delaporte's original included it inline).
const DEFAULT_DISPLACEMENT =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="28" height="49" viewBox="0 0 28 49"%3E%3Cg fill-rule="evenodd"%3E%3Cg id="hexagons" fill="%239C92AC" fill-opacity="0.4" fill-rule="nonzero"%3E%3Cpath d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E';

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform float dispFactor;
uniform sampler2D disp;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float angle1;
uniform float angle2;
uniform float intensity1;
uniform float intensity2;

mat2 getRotM(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec4 disp = texture2D(disp, vUv);
  vec2 dispVec = vec2(disp.r, disp.g);

  vec2 distortedPosition1 = vUv + getRotM(angle1) * dispVec * intensity1 * dispFactor;
  vec2 distortedPosition2 = vUv + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
  vec4 _texture1 = texture2D(texture1, distortedPosition1);
  vec4 _texture2 = texture2D(texture2, distortedPosition2);
  gl_FragColor = mix(_texture1, _texture2, dispFactor);
}
`;

interface HoverDistortImageProps {
  image: string;
  image2?: string;
  alt: string;
  className?: string;
  intensity?: number;
  angle?: number;
  speedIn?: number;
  speedOut?: number;
}

interface GLResources {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  material: THREE.ShaderMaterial;
  geometry: THREE.PlaneGeometry;
  texture1: THREE.Texture;
  texture2: THREE.Texture;
  dispTexture: THREE.Texture;
}

export default function HoverDistortImage({
  image,
  image2,
  alt,
  className,
  intensity = 1,
  angle = Math.PI / 4,
  speedIn = 1.2,
  speedOut = 0.9,
}: HoverDistortImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Skip WebGL entirely on touch devices / reduced motion — the plain
    // <img> underneath stays visible as the fallback.
    if (!isFinePointer || prefersReducedMotion) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;

    // WebGL context is created lazily, on the first real hover — not
    // eagerly for every instance on mount. Browsers cap concurrent WebGL
    // contexts (commonly ~8-16); with several of these on one page,
    // creating them all up front risks the browser silently evicting the
    // oldest ones. Only cards the user actually hovers ever spend one.
    let gl: GLResources | null = null;
    const dispState = { value: 0 };

    const render = () => {
      if (gl) gl.renderer.render(gl.scene, gl.camera);
    };

    const setupWebGL = () => {
      if (gl || width === 0 || height === 0) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        // WebGL unavailable in this context — the plain <img> stays visible.
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        1,
        1000
      );
      camera.position.z = 1;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 0);
      renderer.setSize(width, height);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);

      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";
      const texture1 = loader.load(image, render);
      const texture2 = loader.load(image2 ?? image, render);
      const dispTexture = loader.load(DEFAULT_DISPLACEMENT, render);
      texture1.magFilter = texture1.minFilter = THREE.LinearFilter;
      texture2.magFilter = texture2.minFilter = THREE.LinearFilter;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          intensity1: { value: intensity },
          intensity2: { value: intensity },
          dispFactor: { value: dispState.value },
          angle1: { value: angle },
          angle2: { value: -3 * angle },
          texture1: { value: texture1 },
          texture2: { value: texture2 },
          disp: { value: dispTexture },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      });

      const geometry = new THREE.PlaneGeometry(width, height, 1);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      gl = { scene, camera, renderer, material, geometry, texture1, texture2, dispTexture };
      img.style.opacity = "0";
      render();
    };

    const setDisp = () => {
      if (gl) gl.material.uniforms.dispFactor.value = dispState.value;
      render();
    };

    const playIn = () => {
      setupWebGL();
      gsap.to(dispState, { value: 1, duration: speedIn, ease: "expo.out", onUpdate: setDisp });
    };
    const playOut = () =>
      gsap.to(dispState, { value: 0, duration: speedOut, ease: "expo.out", onUpdate: setDisp });

    container.addEventListener("mouseenter", playIn);
    container.addEventListener("mouseleave", playOut);

    const resizeObserver = new ResizeObserver(() => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      if (!gl || width === 0 || height === 0) return;
      gl.camera.left = width / -2;
      gl.camera.right = width / 2;
      gl.camera.top = height / 2;
      gl.camera.bottom = height / -2;
      gl.camera.updateProjectionMatrix();
      gl.renderer.setSize(width, height);
      render();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("mouseenter", playIn);
      container.removeEventListener("mouseleave", playOut);
      resizeObserver.disconnect();
      gsap.killTweensOf(dispState);
      if (gl) {
        gl.geometry.dispose();
        gl.material.dispose();
        gl.texture1.dispose();
        gl.texture2.dispose();
        gl.dispTexture.dispose();
        gl.renderer.dispose();
        if (gl.renderer.domElement.parentNode === container) {
          container.removeChild(gl.renderer.domElement);
        }
      }
      img.style.opacity = "1";
    };
  }, [image, image2, intensity, angle, speedIn, speedOut]);

  return (
    <div ref={containerRef} className={cn("relative isolate overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={image} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
