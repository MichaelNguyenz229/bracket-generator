interface Props {
  matchCount: number; // number of matches in the current round
  side: 'left' | 'right';
}

/**
 * Draws bracket connector lines between two adjacent rounds.
 * Each pair of matches feeds into one match in the next round.
 *
 * Left side connector:
 *   ───┐
 *      ├───
 *   ───┘
 *
 * Right side connector (mirrored):
 *   ┌───
 *   ─┤
 *   └───
 */
export default function ConnectorColumn({ matchCount, side }: Props) {
  const pairs = matchCount / 2;
  const isLeft = side === 'left';

  return (
    <div className="flex flex-col justify-around w-full h-full">
      {Array.from({ length: pairs }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-center">
          {/* Top arm */}
          <div
            className="flex-1"
            style={{
              [isLeft ? 'borderRight' : 'borderLeft']: '2px solid #64748b',
              borderBottom: '2px solid #64748b',
            }}
          />
          {/* Horizontal mid-line going outward to next round */}
          <div
            style={{
              height: 0,
              [isLeft ? 'borderRight' : 'borderLeft']: 'none',
              borderTop: '2px solid #64748b',
              width: '100%',
              marginLeft: isLeft ? 'auto' : 0,
              marginRight: isLeft ? 0 : 'auto',
            }}
          />
          {/* Bottom arm */}
          <div
            className="flex-1"
            style={{
              [isLeft ? 'borderRight' : 'borderLeft']: '2px solid #64748b',
              borderTop: '2px solid #64748b',
            }}
          />
        </div>
      ))}
    </div>
  );
}
