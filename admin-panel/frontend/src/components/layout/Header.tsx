import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
    Menu as MenuIcon,
    Bell,
    User,
    Settings,
    LogOut,
    ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useNavigate } from 'react-router-dom'
import { cn, formatRelativeTime } from '../../lib/utils'

interface HeaderProps {
    onMenuClick: () => void
}

// Mock notifications data
const notifications = [
    {
        id: 1,
        title: 'New user registered',
        message: 'John Doe has created a new account',
        time: '2024-01-15T10:30:00Z',
        read: false,
        type: 'user',
    },
    {
        id: 2,
        title: 'Order completed',
        message: 'Order #12345 has been completed successfully',
        time: '2024-01-15T09:15:00Z',
        read: false,
        type: 'order',
    },
    {
        id: 3,
        title: 'System update',
        message: 'Admin panel updated to version 2.1.0',
        time: '2024-01-14T16:45:00Z',
        read: true,
        type: 'system',
    },
]

const Header = ({ onMenuClick }: HeaderProps) => {
    const { admin, logout } = useAuthStore()
    const navigate = useNavigate()
    const [notificationOpen, setNotificationOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const unreadCount = notifications.filter(n => !n.read).length

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'user':
                return '👤'
            case 'order':
                return '📦'
            case 'system':
                return '⚙️'
            default:
                return '📢'
        }
    }

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={onMenuClick}
            >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                {/* Search */}
                <div className="relative flex flex-1">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Dashboard
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications dropdown */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <Menu.Item key={notification.id}>
                                                {({ active }) => (
                                                    <div
                                                        className={cn(
                                                            'block px-4 py-3 text-sm',
                                                            active ? 'bg-gray-50' : '',
                                                            !notification.read ? 'bg-blue-50' : ''
                                                        )}
                                                    >
                                                        <div className="flex gap-3">
                                                            <span className="text-lg">
                                                                {getNotificationIcon(notification.type)}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 truncate">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-gray-500 truncate">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {formatRelativeTime(notification.time)}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Menu.Item>
                                        ))
                                    ) : (
                                        <div className="px-4 py-6 text-center text-gray-500">
                                            No notifications
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 px-4 py-2">
                                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    {/* Separator */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                            <span className="sr-only">Open user menu</span>
                            {admin?.profileImage ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={admin.profileImage}
                                    alt={`${admin.firstName} ${admin.lastName}`}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {admin?.firstName?.charAt(0)}{admin?.lastName?.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <span className="hidden lg:flex lg:items-center">
                                <span className="ml-3 text-sm font-semibold leading-6 text-gray-900">
                                    {admin?.firstName} {admin?.lastName}
                                </span>
                                <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                            </span>
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {admin?.firstName} {admin?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{admin?.email}</p>
                                    <span className={cn(
                                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1',
                                        admin?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            admin?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                    )}>
                                        {admin?.role?.replace('_', ' ')}
                                    </span>
                                </div>

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className={cn(
                                                'flex w-full items-center px-3 py-2 text-sm text-gray-700',
                                                active ? 'bg-gray-50' : ''
                                            )}
                                        >
                                            <User className="mr-3 h-5 w-5 text-gray-400" />
                                            Your profile
                                        </button>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/settings')}
                                            className={cn(
                                                'flex w-full items-center px-3 py-2 text-sm text-gray-700',
                                                active ? 'bg-gray-50' : ''
                                            )}
                                        >
                                            <Settings className="mr-3 h-5 w-5 text-gray-400" />
                                            Settings
                                        </button>
                                    )}
                                </Menu.Item>

                                <div className="border-t border-gray-100 my-1" />

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={cn(
                                                'flex w-full items-center px-3 py-2 text-sm text-gray-700',
                                                active ? 'bg-gray-50' : ''
                                            )}
                                        >
                                            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                                            Sign out
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </div>
    )
}

export default Header