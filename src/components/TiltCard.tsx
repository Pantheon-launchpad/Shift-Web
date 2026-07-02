import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  type HTMLMotionProps,
} from 'framer-motion';

interface TiltCardProps extends HTMLMotionProps<'div'> {
  maxTilt?: number;
  glare?: boolean;
  lift?: boolean;
}

/**
 * Wraps any glass/card surface with a mouse-tracked 3D tilt, a moving
 * specular highlight, and a slight lift toward the viewer on hover —
 * the bit that turns flat glassmorphism into something with thickness.
 */
export default function TiltCard({
  children,
  maxTilt = 9,
  glare = true,
  lift = true,
  style,
  className,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), { stiffness: 260, damping: 24 });
  const z = useSpring(0, { stiffness: 260, damping: 24 });

  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), rgba(255,255,255,0.04) 35%, transparent 60%)`;
  const shadowOpacity = useTransform(z, [0, 14], [0, 0.45]);
  const dynamicShadow = useMotionTemplate`0 ${z}px 40px -8px rgba(0,0,0,${shadowOpacity})`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function handleEnter() {
    if (lift) z.set(14);
  }
  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
    z.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        translateZ: z,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        position: 'relative',
        boxShadow: lift ? dynamicShadow : undefined,
        ...style,
      }}
      className={className}
      {...rest}
    >
      <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>{children}</div>
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg, mixBlendMode: 'overlay' }}
        />
      )}
    </motion.div>
  );
}
