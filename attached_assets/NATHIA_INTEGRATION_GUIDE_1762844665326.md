# Guia de Integração - NAT-IA (React Native Client)

## Visão Geral

Este documento descreve a implementação completa do cliente React Native para NAT-IA, a assistente de maternidade da Nossa Maternidade.

## Arquitetura

```
src/
├── services/
│   └── nathia-client.ts          # Cliente HTTP para Edge Functions
├── hooks/
│   ├── useNathia.ts               # Hook principal de chat
│   └── useNathiaActions.ts        # Processamento de actions
├── contexts/
│   └── NathiaContext.tsx          # Contexto global
├── components/nathia/
│   ├── ChatMessage.tsx            # Mensagem individual
│   ├── SOSButton.tsx              # Botão de emergência
│   ├── QuickReplies.tsx           # Sugestões rápidas
│   ├── OnboardingFlow.tsx         # Fluxo inicial
│   └── RecommendationCard.tsx     # Card de recomendação
└── screens/
    ├── NathiaChat.tsx             # Tela principal de chat
    ├── NathiaOnboarding.tsx       # Onboarding inicial
    └── NathiaRecommendations.tsx  # Recomendações personalizadas
```

## Componentes Criados

### 1. nathia-client.ts

**Caminho:** `src/services/nathia-client.ts`

Cliente HTTP para todas as Edge Functions da NAT-IA:

- `nathia-chat`: Conversação principal
- `nathia-onboarding`: Fluxo inicial
- `nathia-recommendations`: Sugestões personalizadas

**Features:**

- Retry logic com exponential backoff (2 tentativas)
- Timeout de 5s
- Error handling gracioso
- Fallback offline

**Exemplo de uso:**

```typescript
import { nathiaClient } from '@/services/nathia-client';

const response = await nathiaClient.sendMessage({
  message: 'Estou me sentindo ansiosa',
  userId: 'user123',
  context: {
    stage: 'gestante',
    pregnancyWeek: 20,
    mood: 'anxious',
  },
});
```

### 2. useNathia.ts

**Caminho:** `src/hooks/useNathia.ts`

Hook principal para gerenciamento de chat.

**Features:**

- Gerencia estado de mensagens
- Persistência local (AsyncStorage)
- Sincronização com Supabase
- Contexto automático
- Typing indicator

**Exemplo de uso:**

```typescript
const { sendMessage, messages, loading, isTyping } = useNathia({
  userId: 'user123',
  stage: 'gestante',
  pregnancyWeek: 20,
});

await sendMessage('Como está meu bebê?');
```

### 3. useNathiaActions.ts

**Caminho:** `src/hooks/useNathiaActions.ts`

Processa actions contextuais retornadas pelo Claude.

**Actions suportadas:**

- `openScreen`: Navega para tela
- `joinCircle`: Entra em círculo
- `startHabit`: Inicia hábito
- `showContent`: Exibe conteúdo
- `sos`: Aciona emergência

**Exemplo de uso:**

```typescript
const { processAction } = useNathiaActions();

await processAction({
  type: 'openScreen',
  label: 'Ver plano diário',
  data: { screenName: 'dailyPlan' },
});
```

### 4. NathiaContext.tsx

**Caminho:** `src/contexts/NathiaContext.tsx`

Contexto global da NAT-IA.

**Gerencia:**

- Estado do usuário (stage, mood, concerns)
- Persistência entre sessões
- Onboarding status
- Preferências

**Exemplo de uso:**

```typescript
// No App.tsx
<NathiaProvider userId={userId}>
  <App />
</NathiaProvider>

// Em qualquer componente
const { context, updateContext } = useNathiaContext();
```

### 5. ChatMessage.tsx

**Caminho:** `src/components/nathia/ChatMessage.tsx`

Renderiza mensagem individual no chat.

**Features:**

- Diferenciação visual user/assistant
- Suporte a markdown básico
- Actions como botões
- Feedback (thumbs up/down)
- Acessibilidade completa

### 6. SOSButton.tsx

**Caminho:** `src/components/nathia/SOSButton.tsx`

Botão de emergência sempre visível.

**Features:**

- Modal com CVV (188) e SAMU (192)
- Opção "conversar com humano"
- Analytics de uso
- Design destacado

### 7. QuickReplies.tsx

**Caminho:** `src/components/nathia/QuickReplies.tsx`

Sugestões rápidas contextuais.

**Features:**

- Chips horizontais
- Atualização baseada em contexto
- Helper `getContextualSuggestions()`

### 8. OnboardingFlow.tsx

**Caminho:** `src/components/nathia/OnboardingFlow.tsx`

Fluxo de integração inicial (4-6 perguntas).

**Coleta:**

- Estágio (gestante, mãe, tentante, puerpério)
- Semana de gestação (se aplicável)
- Preocupações principais
- Expectativas

### 9. RecommendationCard.tsx

**Caminho:** `src/components/nathia/RecommendationCard.tsx`

Card de recomendação personalizada.

**Features:**

- Exibe: círculo, hábito ou conteúdo
- Justificativa (por que é relevante)
- CTA claro
- Tracking de impressão e clique

### 10. NathiaChat.tsx

**Caminho:** `src/screens/NathiaChat.tsx`

Tela principal de conversação.

**Features:**

- Interface de chat completa
- Input com sugestões
- Botão SOS sempre visível
- Typing indicator
- Scroll automático
- Performance otimizada (60fps)

### 11. NathiaOnboarding.tsx

**Caminho:** `src/screens/NathiaOnboarding.tsx`

Tela de onboarding inicial.

**Fluxo:**

1. OnboardingFlow (perguntas)
2. Starter Pack (recomendações iniciais)
3. CTA para começar chat

### 12. NathiaRecommendations.tsx

**Caminho:** `src/screens/NathiaRecommendations.tsx`

Tela de recomendações personalizadas.

**Features:**

- Lista de recomendações
- Filtros (todos, círculos, hábitos, conteúdos)
- Pull-to-refresh
- Empty state

## Fluxos Principais

### Fluxo 1: Onboarding → Chat → Ação

```
1. Usuário abre app pela primeira vez
2. NathiaOnboarding.tsx
   - OnboardingFlow coleta dados
   - Chama nathia-onboarding Edge Function
   - Exibe Starter Pack
3. Usuário clica "Começar a conversar"
4. Navega para NathiaChat.tsx
5. Usuário envia mensagem
6. NAT-IA responde com action
7. useNathiaActions processa action
8. Navega para tela contextual
```

### Fluxo 2: SOS → Modal → Moderação

```
1. Usuário pressiona botão SOS
2. SOSButton abre modal
3. Usuário escolhe:
   - CVV (188) → Linking.openURL
   - SAMU (192) → Linking.openURL
   - "Conversar com humano" → Fila moderação
4. Analytics registra evento
```

### Fluxo 3: Chat → Recomendação → Conversão

```
1. NAT-IA identifica oportunidade
2. Retorna action "showContent"
3. useNathiaActions processa
4. Navega para ContentDetail
5. Analytics registra conversão
```

## Integração com Navegação

### Adicionar rotas no AppNavigator

**Arquivo:** `src/navigation/index.tsx`

```typescript
import NathiaChat from '@/screens/NathiaChat';
import NathiaOnboarding from '@/screens/NathiaOnboarding';
import NathiaRecommendations from '@/screens/NathiaRecommendations';

// Dentro do Stack.Navigator
<Stack.Screen
  name="NathiaOnboarding"
  component={NathiaOnboarding}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="NathiaChat"
  component={NathiaChat}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="NathiaRecommendations"
  component={NathiaRecommendations}
  options={{
    headerShown: true,
    title: 'Recomendações',
  }}
/>
```

### Adicionar ao TabNavigator

**Arquivo:** `src/navigation/TabNavigator.tsx`

```typescript
<Tab.Screen
  name="Nathia"
  component={NathiaChat}
  options={{
    tabBarLabel: 'NAT-IA',
    tabBarIcon: ({ color, size }) => (
      <Icon name="chat-bubble" size={size} color={color} />
    ),
  }}
/>
```

## Integração com Analytics

### Tracking de eventos

```typescript
// Em src/services/analytics.ts
export const trackNathiaEvent = (eventName: string, properties: Record<string, any>) => {
  // Analytics implementation
  console.log('NAT-IA Event:', eventName, properties);
};

// Eventos importantes:
// - nathia_onboarding_completed
// - nathia_message_sent
// - nathia_action_clicked
// - nathia_sos_activated
// - nathia_recommendation_viewed
// - nathia_recommendation_converted
```

## Como Testar

### 1. Testar Chat Básico

```bash
# Terminal 1: Iniciar app
npm run dev

# Terminal 2: Rodar testes
npm test tests/nathia/
```

**Passos:**

1. Abra o app
2. Navegue para NathiaChat
3. Digite "Olá"
4. Verifique:
   - Mensagem aparece à direita
   - Typing indicator aparece
   - Resposta aparece à esquerda
   - Sugestões rápidas atualizam

### 2. Testar Onboarding

**Passos:**

1. Limpe AsyncStorage: `await AsyncStorage.clear()`
2. Reabra o app
3. Deve mostrar NathiaOnboarding
4. Responda as perguntas
5. Verifique Starter Pack
6. Clique "Começar a conversar"
7. Deve navegar para chat

### 3. Testar Actions

**Passos:**

1. No chat, digite: "Quero ver meu plano diário"
2. NAT-IA deve responder com action
3. Clique no botão da action
4. Deve navegar para DailyPlan

### 4. Testar SOS

**Passos:**

1. Pressione botão SOS
2. Modal deve abrir
3. Verifique acessibilidade:
   - VoiceOver/TalkBack anuncia "Modal de emergência aberto"
4. Teste cada opção:
   - CVV → Deve abrir dialer
   - SAMU → Deve abrir dialer
   - "Conversar com humano" → Deve mostrar alerta

### 5. Testar Recomendações

**Passos:**

1. Navegue para NathiaRecommendations
2. Deve carregar recomendações
3. Teste filtros (Todos, Círculos, Hábitos, Conteúdos)
4. Pull-to-refresh
5. Clique em card
6. Deve navegar para item

### 6. Testar Offline

**Passos:**

1. Desative rede
2. Envie mensagem no chat
3. Deve mostrar mensagem offline
4. Reative rede
5. Envie nova mensagem
6. Deve funcionar normalmente

### 7. Testar Acessibilidade

**iOS:**

```bash
# Ativar VoiceOver
Settings > Accessibility > VoiceOver
```

**Android:**

```bash
# Ativar TalkBack
Settings > Accessibility > TalkBack
```

**Verificar:**

- Todas as interações são anunciadas
- Botões têm labels claros
- Formulários têm hints
- Estados são comunicados (disabled, selected)

### 8. Testar Performance

```bash
# Monitor FPS
# React Native DevTools > Performance
```

**Verificar:**

- Scroll do chat mantém 60fps
- Input não causa lag
- Animações são suaves
- Sem memory leaks

## Troubleshooting

### Erro: "NAT-IA não responde"

**Causa:** Edge Function offline ou timeout

**Solução:**

1. Verifique se Edge Functions estão deployadas
2. Teste com `curl`:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/nathia-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"test"}'
```

### Erro: "Histórico não carrega"

**Causa:** Supabase não configurado ou tabelas faltando

**Solução:**

1. Verifique `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Rode migrations:

```bash
supabase migration up
```

### Erro: "Actions não funcionam"

**Causa:** Navegação não configurada

**Solução:**

1. Verifique se telas estão registradas no AppNavigator
2. Verifique `screenMap` em `useNathiaActions.ts`

## Performance Guidelines

### Otimizações Implementadas

1. **Lazy loading** de mensagens (FlatList)
2. **Debounce** no input (300ms)
3. **AsyncStorage** para cache offline
4. **Memoization** de components pesados
5. **Retry logic** com exponential backoff

### Métricas Alvo

- **First Paint:** < 1s
- **Input Lag:** < 100ms
- **API Response:** < 2s (média)
- **Scroll FPS:** 60fps constante
- **Memory:** < 100MB

## Próximos Passos

### P0 (Crítico)

- [ ] Implementar Edge Functions no Supabase
- [ ] Configurar RLS policies
- [ ] Adicionar monitoring (Sentry)

### P1 (Importante)

- [ ] Implementar markdown parser completo
- [ ] Adicionar suporte a imagens
- [ ] Voice input (Speech-to-Text)
- [ ] Push notifications contextuais

### P2 (Desejável)

- [ ] Modo offline completo
- [ ] Sync queue quando voltar online
- [ ] Themes (light/dark)
- [ ] Animações avançadas

## Recursos Adicionais

- [Design System v1](./DESIGN_SYSTEM_V1.md)
- [Edge Functions Setup](./EDGE_FUNCTIONS.md)
- [Analytics Integration](./ANALYTICS.md)
- [Accessibility Guide](./ACCESSIBILITY.md)

## Suporte

Para dúvidas ou issues:

- Email: dev@nossamaternidade.com
- Slack: #nathia-dev
- Issues: GitHub repository
