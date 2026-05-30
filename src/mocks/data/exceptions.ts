import { Exception } from '@/types'

export const mockExceptions: Exception[] = [
  {
    id: 'exception-1',
    session_id: 'session-1',
    exception_type: 'WrongSlot',
    description: 'Xe đỗ sai vị trí đã đặt. Đã đặt F1-A-05 nhưng đỗ tại F1-A-08',
    resolved_by: undefined,
    resolved_at: undefined,
    status: 'Open',
  },
  {
    id: 'exception-2',
    session_id: 'session-2',
    exception_type: 'AIFailure',
    description: 'Camera AI không đọc được biển số xe. Nhân viên đã nhập thủ công.',
    resolved_by: 'staff-1',
    resolved_at: '2026-05-30T10:20:00Z',
    status: 'Resolved',
  },
  {
    id: 'exception-3',
    session_id: 'session-3',
    exception_type: 'Overtime',
    description: 'Xe ở quá thời gian đặt. Đặt 2 giờ nhưng đã ở 3 giờ.',
    resolved_by: undefined,
    resolved_at: undefined,
    status: 'Open',
  },
]
