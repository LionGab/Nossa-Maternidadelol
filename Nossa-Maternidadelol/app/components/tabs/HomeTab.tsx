'use client'

import { Calendar, BookOpen, Heart, TrendingUp } from 'lucide-react'

export default function HomeTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vinda!
        </h1>
        <p className="text-gray-600">
          Sua jornada de maternidade começa aqui
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg mb-1">Semana 24</h3>
          <p className="text-sm opacity-90">Sua gestação</p>
        </div>

        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white shadow-lg">
          <Heart className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg mb-1">12 dias</h3>
          <p className="text-sm opacity-90">Sequência</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Acesso Rápido</h2>
        
        <div className="grid gap-3">
          <button className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Artigos e Dicas</h3>
              <p className="text-sm text-gray-600">Conteúdo sobre maternidade</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Seu Progresso</h3>
              <p className="text-sm text-gray-600">Acompanhe sua evolução</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

