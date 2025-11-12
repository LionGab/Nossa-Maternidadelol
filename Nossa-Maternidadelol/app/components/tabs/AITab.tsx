'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AITab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou sua assistente virtual de maternidade. Como posso ajudar você hoje?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Chamar API do backend
      const response = await fetch('http://localhost:5000/api/ai/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'default-session',
          content: userMessage.content,
          role: 'user',
        }),
      })

      // Simular resposta da IA (substituir pela resposta real da API)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: await generateAIResponse(userMessage.content),
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // Simulação de resposta da IA - substituir pela chamada real ao Gemini/Perplexity
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('gravidez') || lowerInput.includes('gestação')) {
      return 'Durante a gravidez, é importante manter uma alimentação equilibrada, fazer exercícios leves recomendados pelo médico, e fazer acompanhamento pré-natal regular. Como está se sentindo?'
    }
    
    if (lowerInput.includes('parto')) {
      return 'O parto é um momento único! Existem diferentes tipos: parto normal, cesárea, parto humanizado. O importante é estar bem informada e ter uma equipe de confiança. Você já escolheu o tipo de parto?'
    }
    
    if (lowerInput.includes('amamentação') || lowerInput.includes('amamentar')) {
      return 'A amamentação traz muitos benefícios para você e o bebê. É normal ter dúvidas no início. Posso ajudar com técnicas de pega correta, posições confortáveis e como lidar com dificuldades comuns.'
    }
    
    if (lowerInput.includes('bebê') || lowerInput.includes('recém-nascido')) {
      return 'Recém-nascidos precisam de muito cuidado e atenção. Sono, alimentação e higiene são fundamentais. Você tem alguma dúvida específica sobre cuidados com o bebê?'
    }
    
    return 'Entendo sua preocupação. Como sua assistente de maternidade, posso ajudar com questões sobre gravidez, parto, amamentação, cuidados com o bebê e muito mais. O que você gostaria de saber?'
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[600px] animate-fade-in">
      {/* Header */}
      <header className="text-center space-y-2 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Assistente Virtual
        </h1>
        <p className="text-gray-600 text-sm">
          Tire suas dúvidas sobre maternidade
        </p>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-600" aria-hidden="true" />
              </div>
            )}
            
            <div
              className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-600" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" aria-hidden="true" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Digite sua mensagem"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Enviar mensagem"
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

