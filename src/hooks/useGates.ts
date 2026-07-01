import { useQuery, type QueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BeGate } from '@/lib/beApi'

/** Danh sách cổng vào/ra — GET /gates. */
export function useGates() {
  return useQuery({
    queryKey: ['gates'],
    queryFn: () => api.get<BeGate[]>('/gates'),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Lấy id một cổng theo loại (Entry/Exit): ưu tiên cache ['gates'], chưa có thì fetch.
 * Fallback về 1 nếu BE chưa seed cổng nào (tránh chặn luồng demo).
 */
export async function resolveGateId(
  queryClient: QueryClient,
  type: 'Entry' | 'Exit',
): Promise<number> {
  let gates = queryClient.getQueryData<BeGate[]>(['gates'])
  if (!gates || gates.length === 0) {
    try {
      gates = await api.get<BeGate[]>('/gates')
      queryClient.setQueryData(['gates'], gates)
    } catch {
      gates = []
    }
  }
  const match = gates.find((g) => g.gateType === type) ?? gates[0]
  return match ? match.gateId : 1
}
