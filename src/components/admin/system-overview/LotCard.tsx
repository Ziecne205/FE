import type { LotSummary } from './types';

interface Props {
  readonly lot: LotSummary;
  readonly onDrillDown?: (lotId: string) => void;
}

function statusIcon(rate: number, incidents: number) {
  if (incidents > 0 || rate >= 90) return { icon: 'cancel', color: 'text-error', ring: 'ring-1 ring-error/30' };
  if (rate >= 75) return { icon: 'warning', color: 'text-tertiary', ring: 'ring-1 ring-tertiary/30' };
  return { icon: 'check_circle', color: 'text-green-600', ring: '' };
}

function barColor(rate: number) {
  if (rate >= 90) return 'bg-error';
  if (rate >= 75) return 'bg-tertiary';
  return 'bg-primary';
}

export function LotCard({ lot, onDrillDown }: Props) {
  const { icon, color, ring } = statusIcon(lot.occupancyRate, lot.openIncidents);
  const free = lot.capacity - lot.inside;

  return (
    <div
      className={`bg-white p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-sm group relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors ${ring}`}
      onClick={() => onDrillDown?.(lot.parkingLotId)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-body-lg text-body-lg font-bold text-on-surface truncate">{lot.name}</h3>
        <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="flex flex-col gap-1 mt-auto">
        <div className="flex justify-between font-label-mono text-label-mono text-on-surface-variant">
          <span>Sức chứa: {lot.inside}/{lot.capacity}</span>
          <span className={lot.occupancyRate >= 90 ? 'text-error font-bold' : ''}>{lot.occupancyRate}%</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
          <div className={`${barColor(lot.occupancyRate)} h-full rounded-full`} style={{ width: `${lot.occupancyRate}%` }} />
        </div>
      </div>
      <button className="font-body-md text-body-md text-primary font-medium hover:text-surface-tint text-left flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Xem chi tiết <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
      </button>
    </div>
  );
}
