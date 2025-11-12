'use client'

import { Home, Heart, MessageCircle, Users, Target } from 'lucide-react'
import { TabType } from '@/app/page'

interface NavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'home' as TabType, icon: Home, label: 'Início' },
    { id: 'refugio' as TabType, icon: Heart, label: 'Refúgio' },
    { id: 'ai' as TabType, icon: MessageCircle, label: 'IA' },
    { id: 'community' as TabType, icon: Users, label: 'Comunidade' },
    { id: 'habits' as TabType, icon: Target, label: 'Hábitos' },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="max-w-4xl mx-auto px-2">
        <ul className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <li key={tab.id} className="flex-1">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex flex-col items-center justify-center gap-1
                    py-2 px-1 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-500 hover:text-primary-500 hover:bg-gray-50'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  `}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

