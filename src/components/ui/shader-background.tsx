import { MeshGradient } from '@paper-design/shaders-react';

export default function ShaderBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <svg className="absolute inset-0 h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="shader-text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={['#000000', '#06b6d4', '#0891b2', '#164e63', '#f97316']}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-55"
        colors={['#000000', '#ffffff', '#06b6d4', '#f97316']}
        speed={0.2}
        wireframe
        backgroundColor="transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(249,115,22,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.48),rgba(0,0,0,0.74))]" />
    </div>
  );
}
