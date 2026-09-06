import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BedDouble,
    Building2,
    CreditCard,
    History,
    LayoutGrid,
    MessageCircle,
    ShieldCheck,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    if (role === 'owner') {
        mainNavItems.push(
            {
                title: 'Cabang Kos',
                url: '/properties',
                icon: Building2,
            },
            {
                title: 'Manajemen Kamar',
                url: '/rooms',
                icon: BedDouble,
            },
            {
                title: 'Tagihan & Finansial',
                url: '/payments',
                icon: CreditCard,
            },
            {
                title: 'Action Center Keamanan',
                url: '/security-logs',
                icon: ShieldCheck,
            },
            {
                title: 'Tiket Keluhan',
                url: '/complaints',
                icon: Wrench,
            },
            {
                title: 'Pengguna & Kredensial',
                url: '/users',
                icon: Users,
            },
            {
                title: 'Audit Trail Log',
                url: '/activity-logs',
                icon: History,
            }
        );
    } else if (role === 'staff') {
        mainNavItems.push(
            {
                title: 'Cabang Saya',
                url: '/properties',
                icon: Building2,
            },
            {
                title: 'Ketersediaan Kamar',
                url: '/rooms',
                icon: BedDouble,
            },
            {
                title: 'Verifikasi Pembayaran',
                url: '/payments',
                icon: CreditCard,
            },
            {
                title: 'Satpam Digital',
                url: '/security-logs',
                icon: ShieldCheck,
            },
            {
                title: 'Penanganan Keluhan',
                url: '/complaints',
                icon: Wrench,
            },
            {
                title: 'Data Penghuni',
                url: '/users',
                icon: Users,
            }
        );
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Bantuan Pengelola',
            url: 'https://wa.me/6281122334455',
            icon: MessageCircle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
