'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gauge,
  Map,
  Car,
  Calendar,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  HelpCircle,
  LogOut,
  Plus,
  Sliders,
  CreditCard,
  Cctv,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types/model';

interface SidebarProps {
  userRole: UserRole;
  onNewEntry?: () => void;
  onLogout?: () => void;
}

const managerNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', filled: true },
  { href: '/capacity', icon: Gauge, label: 'Sức chứa' },
  { href: '/slots', icon: Map, label: 'Sơ đồ vị trí' },
  { href: '/sessions', icon: Car, label: 'Phiên hoạt động' },
  { href: '/bookings', icon: Calendar, label: 'Đặt chỗ' },
  { href: '/incidents', icon: AlertTriangle, label: 'Sự cố' },
  { href: '/occupancy', icon: TrendingUp, label: 'Lưu lượng' },
  { href: '/quota', icon: Sliders, label: 'Hạn mức đặt chỗ' },
  { href: '/reports', icon: BarChart3, label: 'Báo cáo' },
];

const staffNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', filled: true },
  { href: '/slots', icon: Map, label: 'Sơ đồ vị trí' },
  { href: '/sessions', icon: Car, label: 'Phiên hoạt động' },
  { href: '/exit-payment', icon: CreditCard, label: 'Thanh toán' },
  { href: '/simulator', icon: Cctv, label: 'Mô phỏng Cổng' },
  { href: '/incidents', icon: AlertTriangle, label: 'Sự cố' },
];

export function Sidebar({ userRole, onNewEntry, onLogout }: SidebarProps) {
  const pathname = usePathname();
  // Staff get the operational nav; Manager and Admin (superset) get the full manager nav.
  const navItems = userRole === 'Staff' ? staffNavItems : managerNavItems;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full flex-col p-4 z-40 w-[280px] bg-gray-50 border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <span className="text-xl font-bold text-gray-900">ParkFlow Pro</span>
      </div>

      {/* New Entry Button (Staff only) */}
      {userRole === 'Staff' && onNewEntry && (
        <Button
          onClick={onNewEntry}
          className="w-full mb-4 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nhập thủ công
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-1 pr-2">
        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-all rounded-lg text-sm"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Trợ giúp</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-all rounded-lg text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
