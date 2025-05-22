//workspace/src/pages/DashboardPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ArrowUpRight 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { WORKSPACE_APPS } from '../config';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const renderIcon = (iconName: string) => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons] || 
                LucideIcons.FileText;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-blue-600 text-lg font-bold">Swarup Workspace</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>

              <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>

                <div className="ml-3 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="-mr-2 flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-center mb-6">
              <p className="text-lg font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            
            <div className="px-4 space-y-1">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Profile
                </div>
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  Settings
                </div>
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
  
      <main className="py-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:flex md:items-center md:justify-between mb-6"
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Access all your workspace apps from one place
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button onClick={logout} variant="outline">
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Workspace Apps section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Workspace Apps
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Active applications ready to use
              </p>
            </div>

            <div className="border-t border-gray-200">
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {WORKSPACE_APPS.filter(app =>
                  ['Swarup Drive', 'Swarup Music', 'Swarup Play'].includes(app.name)
                ).map((app) => (
                  <motion.div
                    key={app.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${app.color}20` }}
                      >
                        {app.icon === 'hard-drive' && <LucideIcons.HardDrive style={{ color: app.color }} className="h-8 w-8" />}
                        {app.icon === 'music' && <LucideIcons.Music style={{ color: app.color }} className="h-8 w-8" />}
                        {app.icon === 'play-circle' && <LucideIcons.PlayCircle style={{ color: app.color }} className="h-8 w-8" />}
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900">{app.name}</h3>
                        <div className="flex items-center justify-center mt-1 text-xs text-gray-500 group-hover:text-blue-600">
                          <span>Open</span>
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Upcoming Workspace Apps Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upcoming Workspace Apps
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Applications launching soon
              </p>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4"
              initial="hidden"
              animate="visible"
            >
              {WORKSPACE_APPS.filter(app =>
                !['Swarup Drive', 'Swarup Music', 'Swarup Play'].includes(app.name)
              ).map((app) => (
                <motion.div
                  key={app.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="relative"
                >
                  <div
                    className="flex flex-col items-center p-4 rounded-lg cursor-not-allowed"
                    title="Coming soon"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-2 opacity-50"
                      style={{ backgroundColor: `${app.color}20` }}
                    >
                      {app.icon === 'mail' && <LucideIcons.Mail className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'message-circle' && <LucideIcons.MessageCircle className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'calendar' && <LucideIcons.Calendar className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'video' && <LucideIcons.Video className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'layout' && <LucideIcons.Layout className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'file-text' && <LucideIcons.FileText className="h-8 w-8 text-gray-500" />}
                      {app.icon === 'table'  && <LucideIcons.Table  className="h-8 w-8 text-gray-500" />}
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-400">{app.name}</h3>
                      <div className="flex items-center justify-center mt-1 text-xs text-gray-400">
                        <span>Upcoming</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <motion.div
              className="bg-white overflow-hidden shadow rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Documents
                </h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <LucideIcons.FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Q2 Marketing Strategy.doc
                            </p>
                            <p className="text-sm text-gray-500">
                              Last edited: Today at 10:30 AM
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <LucideIcons.FileText className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Product Roadmap.xlsx
                            </p>
                            <p className="text-sm text-gray-500">
                              Last edited: Yesterday at 2:15 PM
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <LucideIcons.FileText className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Team Presentation.pptx
                            </p>
                            <p className="text-sm text-gray-500">
                              Last edited: June 22, 2023
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white overflow-hidden shadow rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Meetings
                </h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                              <span className="text-sm font-medium">10:00</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Weekly Team Standup
                            </p>
                            <p className="text-sm text-gray-500">
                              Today, 10:00 AM - 10:30 AM
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Join
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                              <span className="text-sm font-medium">2:00</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Product Review
                            </p>
                            <p className="text-sm text-gray-500">
                              Today, 2:00 PM - 3:00 PM
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Join
                            </a>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                              <span className="text-sm font-medium">9:30</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Client Presentation
                            </p>
                            <p className="text-sm text-gray-500">
                              Tomorrow, 9:30 AM - 11:00 AM
                            </p>
                          </div>
                          <div>
                            <a
                              href="#"
                              className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Join
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;