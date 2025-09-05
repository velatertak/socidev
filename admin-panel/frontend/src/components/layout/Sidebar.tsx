import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, useLocation } from 'react-router-dom'
import {
    BarChart3,
    Settings,
    Shield,
    ShoppingCart,
    Users,
    CheckSquare,
    X,
    Zap,
    ChevronDown,
    ChevronRight,
    ListChecks,
    DollarSign
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

// Navigation structure with role-based access
const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR']
    },
    {
        name: 'User Management',
        href: '/users',
        icon: Users,
        roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR']
    },
    {
        name: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
        roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
        children: [
            { name: 'Order Management', href: '/orders', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
            { name: 'Task Approvals', href: '/orders/approvals', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
            { name: 'Task Management', href: '/orders/tasks', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] }
        ]
    },
    {
        name: 'Balance Management',
        href: '/balance',
        icon: DollarSign,
        roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
        children: [
            { name: 'Requests', href: '/balance/requests', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
            { name: 'History', href: '/balance/history', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] }
        ]
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
        name: 'Security',
        href: '/security',
        icon: Shield,
        roles: ['SUPER_ADMIN']
    }
]

interface SidebarContentProps {
    className?: string
}

const SidebarContent = ({ className }: SidebarContentProps) => {
    const location = useLocation()
    const { admin } = useAuthStore()
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        '/orders': true
    })

    const isActive = (href: string) => {
        return location.pathname === href || location.pathname.startsWith(href + '/')
    }

    const hasRole = (requiredRole: string | string[]) => {
        if (!admin?.role) return false
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(admin.role)
        }
        return admin?.role === requiredRole
    }

    const toggleSection = (href: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [href]: !prev[href]
        }))
    }

    return (
        <div className={cn('flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4', className)}>
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900">Social Admin</h1>
                        <p className="text-xs text-gray-500">Management Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => {
                                if (!hasRole(item.roles)) return null

                                const hasChildren = item.children && item.children.length > 0
                                const isExpanded = expandedSections[item.href] || false
                                const isCurrentSection = isActive(item.href) && item.href !== '/orders'

                                if (hasChildren) {
                                    return (
                                        <li key={item.name}>
                                            <button
                                                onClick={() => toggleSection(item.href)}
                                                className={cn(
                                                    'group flex items-center justify-between w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                                                    isActive(item.href)
                                                        ? 'bg-primary-50 text-primary-700'
                                                        : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                                                )}
                                            >
                                                <div className="flex items-center gap-x-3">
                                                    <item.icon
                                                        className={cn(
                                                            'h-6 w-6 shrink-0',
                                                            isActive(item.href)
                                                                ? 'text-primary-700'
                                                                : 'text-gray-400 group-hover:text-primary-700'
                                                        )}
                                                    />
                                                    {item.name}
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            {isExpanded && (
                                                <ul className="mt-1 px-2 space-y-1">
                                                    {item.children.map((child) => {
                                                        if (!hasRole(child.roles)) return null
                                                        return (
                                                            <li key={child.name}>
                                                                <Link
                                                                    to={child.href}
                                                                    className={cn(
                                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors ml-8',
                                                                        isActive(child.href)
                                                                            ? 'bg-primary-50 text-primary-700'
                                                                            : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                                                                    )}
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    )
                                }

                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={cn(
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                                                isCurrentSection
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    'h-6 w-6 shrink-0',
                                                    isCurrentSection
                                                        ? 'text-primary-700'
                                                        : 'text-gray-400 group-hover:text-primary-700'
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>

                    {/* Bottom section */}
                    <li className="mt-auto">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                                    admin?.role === 'SUPER_ADMIN' ? 'bg-purple-500' :
                                        admin?.role === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'
                                )}>
                                    {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {admin?.firstName} {admin?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {admin?.role?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
    return (
        <>
            {/* Mobile sidebar */}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button
                                            type="button"
                                            className="-m-2.5 p-2.5"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <X className="h-6 w-6 text-white" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <SidebarContent className="border-r border-gray-200" />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <SidebarContent className="border-r border-gray-200" />
            </div>
        </>
    )
}

export default Sidebar