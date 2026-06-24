import type { LotSummary } from './types';
import { LotCard } from './LotCard';

interface Props {
  readonly lots: LotSummary[];
  readonly onDrillDown?: (lotId: string) => void;
}

export function LotHeatmapGrid({ lots, onDrillDown }: Props) {
  return (
    <div className="flex flex-col gap-md flex-1">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>grid_view</span>
          Tổng quan mạng lưới bãi xe
        </h2>
        <div className="flex gap-xs">
          <button className="p-xs bg-white border border-outline-variant rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>filter_list</span>
          </button>
          <button className="p-xs bg-white border border-outline-variant rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>refresh</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-md">
        {lots.map((lot) => (
          <LotCard key={lot.parkingLotId} lot={lot} onDrillDown={onDrillDown} />
        ))}
        <div className="bg-white p-md rounded-xl border border-outline-variant border-dashed shadow-sm flex flex-col items-center justify-center gap-xs cursor-pointer hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: 32 }}>add_circle</span>
          <span className="font-body-md text-body-md font-medium text-on-surface-variant">Mở rộng mạng lưới</span>
        </div>
      </div>
    </div>
  );
}
