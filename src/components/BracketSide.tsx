import type { SideRounds } from '../types';
import Match from './Match';
import ConnectorColumn from './ConnectorColumn';

interface Props {
  rounds: SideRounds;
  side: 'left' | 'right';
}

export default function BracketSide({ rounds, side }: Props) {
  const elements: React.ReactNode[] = [];

  // Left side: round 0 (first round) on far left → later rounds toward center
  // Right side: round 0 on far right → later rounds toward center
  // We always build elements in display order (left-to-right),
  // then use flex-row-reverse for the right side.
  //
  // For LEFT:  R0 → conn → R1 → conn → R2 ...  (displayed left-to-right)
  // For RIGHT: R0 → conn → R1 → conn → R2 ...  (displayed right-to-left via flex-row-reverse)

  rounds.forEach((round, roundIdx) => {
    // Add connector AFTER each round (except the last)
    // The connector merges pairs from this round into the next

    // Round column
    elements.push(
      <div
        key={`round-${roundIdx}`}
        className="flex flex-col justify-around"
        style={{ minHeight: rounds[0].length * 80 }}
      >
        {round.map((match, matchIdx) => (
          <Match
            key={`m-${roundIdx}-${matchIdx}`}
            slots={match}
            side={side}
            roundIndex={roundIdx}
          />
        ))}
      </div>
    );

    // Connector after this round (if there's a next round)
    if (roundIdx < rounds.length - 1) {
      elements.push(
        <div key={`conn-${roundIdx}`} className="flex items-stretch w-8">
          <ConnectorColumn
            matchCount={round.length}
            side={side}
          />
        </div>
      );
    }
  });

  return (
    <div className={`flex items-stretch ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {elements}
    </div>
  );
}
