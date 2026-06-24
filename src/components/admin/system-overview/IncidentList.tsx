interface Incident {
  level: 'high' | 'warning';
  title: string;
  desc: string;
  ago: string;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    level: 'high',
    title: 'Lỗi Camera ANPR Lối vào 2',
    desc: 'Bãi đỗ Vincom Center - Không nhận diện được biển số liên tục 5 xe.',
    ago: '10p trước',
  },
  {
    level: 'warning',
    title: 'Mất kết nối Barrier Ra',
    desc: 'Bãi đỗ Aeon Mall - Thiết bị offline không rõ nguyên nhân.',
    ago: '25p trước',
  },
  {
    level: 'warning',
    title: 'Quá tải hệ thống thanh toán',
    desc: 'Bãi đỗ Sân bay QT - Delay giao dịch MOMO > 15s.',
    ago: '1h trước',
  },
];

export function IncidentList() {
  return (
    <div className="flex flex-col gap-md">
      <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-xs">
        <span className="material-symbols-outlined text-error" style={{ fontSize: 20 }}>gpp_maybe</span>
        Top sự cố cần xử lý
      </h2>
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col flex-1">
        {MOCK_INCIDENTS.map((inc, i) => (
          <div
            key={i}
            className="p-md border-b border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-xs">
              {inc.level === 'high' ? (
                <span className="font-label-mono text-label-mono text-error bg-error/10 px-2 py-0.5 rounded border border-error/20">
                  MỨC CAO
                </span>
              ) : (
                <span className="font-label-mono text-label-mono text-tertiary bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
                  CẢNH BÁO
                </span>
              )}
              <span className="font-label-mono text-label-mono text-outline">{inc.ago}</span>
            </div>
            <h3 className="font-body-lg text-body-lg font-bold text-on-surface">{inc.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{inc.desc}</p>
          </div>
        ))}
        <div className="p-md bg-surface-container flex items-center justify-center mt-auto">
          <button className="font-body-md text-body-md font-bold text-primary hover:underline">
            Xem tất cả {MOCK_INCIDENTS.length + 9} sự cố
          </button>
        </div>
      </div>
    </div>
  );
}
