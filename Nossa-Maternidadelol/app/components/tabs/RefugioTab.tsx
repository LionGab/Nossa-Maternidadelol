'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Heart } from 'lucide-react'

// Dados fictícios de profissionais do refúgio
const profissionais = [
  {
    id: '1',
    nome: 'Dra. Ana Silva',
    especialidade: 'Ginecologista e Obstetra',
    foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    descricao: 'Especialista em gestação de alto risco com mais de 15 anos de experiência.',
  },
  {
    id: '2',
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Pediatra Neonatal',
    foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    descricao: 'Atendimento especializado em recém-nascidos e primeiros meses de vida.',
  },
  {
    id: '3',
    nome: 'Dra. Mariana Costa',
    especialidade: 'Psicóloga Perinatal',
    foto: 'https://images.unsplash.com/photo-1594824476968-48dfc28945b8?w=400&h=400&fit=crop',
    descricao: 'Apoio emocional durante gestação, parto e pós-parto.',
  },
  {
    id: '4',
    nome: 'Dra. Juliana Santos',
    especialidade: 'Nutricionista Materno-Infantil',
    foto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    descricao: 'Alimentação saudável durante gestação e amamentação.',
  },
  {
    id: '5',
    nome: 'Dr. Roberto Alves',
    especialidade: 'Fisioterapeuta Obstétrico',
    foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    descricao: 'Exercícios e preparação física para gestação e parto.',
  },
  {
    id: '6',
    nome: 'Dra. Fernanda Lima',
    especialidade: 'Doula e Educadora Perinatal',
    foto: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop',
    descricao: 'Acompanhamento humanizado durante gestação e parto.',
  },
]

export default function RefugioTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredProfissionais = profissionais.filter(prof =>
    prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Refúgio Nath
        </h1>
        <p className="text-gray-600">
          Encontre profissionais especializados em maternidade
        </p>
      </header>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="search"
          placeholder="Buscar por nome ou especialidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
          aria-label="Buscar profissionais"
        />
      </div>

      {/* Lista de profissionais */}
      <div className="space-y-4">
        {filteredProfissionais.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum profissional encontrado.</p>
            <p className="text-sm mt-2">Tente buscar com outros termos.</p>
          </div>
        ) : (
          filteredProfissionais.map((prof) => (
            <article
              key={prof.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Foto */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 ring-2 ring-primary-100">
                    <Image
                      src={prof.foto}
                      alt={`Foto de ${prof.nome}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <button
                    onClick={() => toggleFavorite(prof.id)}
                    className={`
                      absolute -top-1 -right-1 p-1.5 rounded-full
                      ${favorites.has(prof.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-400 shadow-md'
                      }
                      transition-all hover:scale-110
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                    `}
                    aria-label={favorites.has(prof.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.has(prof.id) ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {prof.nome}
                    </h3>
                    <p className="text-sm text-primary-600 font-medium">
                      {prof.especialidade}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {prof.descricao}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-primary-600">{profissionais.length}</span> profissionais disponíveis
          {favorites.size > 0 && (
            <> · <span className="font-semibold text-primary-600">{favorites.size}</span> favoritos</>
          )}
        </p>
      </div>
    </div>
  )
}

