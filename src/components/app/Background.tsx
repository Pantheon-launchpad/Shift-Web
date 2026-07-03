/**
 * Ambient background shared by every authenticated screen.
 * Reuses the exact `.shift-canvas` / `.orb` primitives defined in index.css
 * so the post-login product feels like a continuation of the landing page,
 * not a different app.
 */
export default function Background() {
  return (
    <div className="shift-canvas">
      <div
        className="orb"
        style={{
          width: 520,
          height: 520,
          top: -160,
          left: '6%',
          background: 'radial-gradient(circle, #8335FD, transparent 70%)',
        }}
      />
      <div
        className="orb"
        style={{
          width: 420,
          height: 420,
          top: '55%',
          right: '2%',
          background: 'radial-gradient(circle, #f2b84b, transparent 70%)',
          opacity: 0.12,
        }}
      />
      <div
        className="orb"
        style={{
          width: 560,
          height: 560,
          bottom: -240,
          left: '28%',
          background: 'radial-gradient(circle, #4b3fb0, transparent 70%)',
        }}
      />
    </div>
  );
}
