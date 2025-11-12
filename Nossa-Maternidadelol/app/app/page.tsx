'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import HomeTab from '@/components/tabs/HomeTab'
import RefugioTab from '@/components/tabs/RefugioTab'
import AITab from '@/components/tabs/AITab'
import CommunityTab from '@/components/tabs/CommunityTab'
import HabitsTab from '@/components/tabs/HabitsTab'

export type TabType = 'home' | 'refugio' | 'ai' | 'community' | 'habits'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />
      case 'refugio':
        return <RefugioTab />
      case 'ai':
        return <AITab />
      case 'community':
        return <CommunityTab />
      case 'habits':
        return <HabitsTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {renderTab()}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  )
}

