# NAT-IA - Exemplos de Código

Exemplos práticos de uso do cliente React Native da NAT-IA.

## Índice

1. [Setup Básico](#setup-básico)
2. [Chat Simples](#chat-simples)
3. [Processamento de Actions](#processamento-de-actions)
4. [Onboarding Customizado](#onboarding-customizado)
5. [Recomendações](#recomendações)
6. [Componentes Isolados](#componentes-isolados)
7. [Error Handling](#error-handling)
8. [Analytics](#analytics)
9. [Testes](#testes)

## Setup Básico

### 1. Configurar Provider

```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { NathiaProvider } from '@/contexts/NathiaContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavigator } from '@/navigation';

export default function App() {
  const { user } = useAuth();

  return (
    <NathiaProvider userId={user?.id || 'anonymous'}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </NathiaProvider>
  );
}
```

### 2. Adicionar Rotas

```typescript
// src/navigation/index.tsx
import { createStackNavigator } from '@react-navigation/stack';
import NathiaChat from '@/screens/NathiaChat';
import NathiaOnboarding from '@/screens/NathiaOnboarding';
import NathiaRecommendations from '@/screens/NathiaRecommendations';

const Stack = createStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator>
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
          title: 'Recomendações para Você',
        }}
      />
    </Stack.Navigator>
  );
}
```

## Chat Simples

### Exemplo: Tela de Chat Mínima

```typescript
// src/screens/SimpleChatExample.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { useNathia } from '@/hooks/useNathia';
import { useNathiaContext } from '@/contexts/NathiaContext';

export default function SimpleChatExample() {
  const { context } = useNathiaContext();
  const { sendMessage, messages, loading } = useNathia({
    userId: context?.userId || '',
    stage: context?.stage,
  });

  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>
            {item.role === 'user' ? '👤' : '🤖'} {item.content}
          </Text>
        )}
      />

      <View style={{ flexDirection: 'row' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1, borderWidth: 1, padding: 10 }}
        />
        <Button title="Enviar" onPress={handleSend} disabled={loading} />
      </View>
    </View>
  );
}
```

### Exemplo: Chat com Typing Indicator

```typescript
import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useNathia } from '@/hooks/useNathia';

function ChatWithTyping() {
  const { messages, isTyping, sendMessage } = useNathia({ userId: 'user-123' });

  return (
    <View>
      {/* Mensagens */}
      <FlatList data={messages} renderItem={...} />

      {/* Typing indicator */}
      {isTyping && (
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <ActivityIndicator />
          <Text>NAT-IA está digitando...</Text>
        </View>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </View>
  );
}
```

## Processamento de Actions

### Exemplo: Processar Action Manualmente

```typescript
import { useNathiaActions } from '@/hooks/useNathiaActions';

function MyComponent() {
  const { processAction, isProcessing } = useNathiaActions();

  const handleButtonPress = async () => {
    const action = {
      type: 'openScreen',
      label: 'Ver plano diário',
      data: { screenName: 'dailyPlan' },
    };

    await processAction(action);
  };

  return (
    <Button
      onPress={handleButtonPress}
      disabled={isProcessing}
      title="Ver Plano Diário"
    />
  );
}
```

### Exemplo: Custom Action Handler

```typescript
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NathiaAction } from '@/services/nathia-client';

function useCustomActions() {
  const navigation = useNavigation();

  const processCustomAction = useCallback(
    async (action: NathiaAction) => {
      switch (action.type) {
        case 'openScreen':
          // Custom screen mapping
          const screenMap = {
            myCustomScreen: 'CustomScreen',
            anotherScreen: 'AnotherScreen',
          };

          const screen = screenMap[action.data?.screenName || ''];
          if (screen) {
            navigation.navigate(screen, action.data);
          }
          break;

        case 'showContent':
          // Open in WebView
          navigation.navigate('WebView', {
            url: action.data?.url,
            title: action.label,
          });
          break;

        default:
          console.warn('Unknown action type:', action.type);
      }
    },
    [navigation]
  );

  return { processCustomAction };
}
```

## Onboarding Customizado

### Exemplo: Onboarding com Steps Customizados

```typescript
import React from 'react';
import { OnboardingFlow } from '@/components/nathia/OnboardingFlow';
import { useNathiaContext } from '@/contexts/NathiaContext';

// Adicione steps customizados antes do OnboardingFlow
const CUSTOM_STEPS = [
  {
    id: 'customQuestion',
    question: 'Como você se sente hoje?',
    type: 'single',
    options: [
      { value: 'great', label: 'Ótima!' },
      { value: 'good', label: 'Bem' },
      { value: 'tired', label: 'Cansada' },
      { value: 'anxious', label: 'Ansiosa' },
    ],
  },
];

function CustomOnboarding() {
  const { context, updateContext } = useNathiaContext();
  const [answers, setAnswers] = useState({});

  const handleComplete = async (response) => {
    // Salva respostas customizadas
    await updateContext({
      mood: answers.customQuestion,
    });

    // Continua com fluxo normal
    console.log('Onboarding complete:', response);
  };

  return (
    <OnboardingFlow
      userId={context?.userId || ''}
      onComplete={handleComplete}
      // customSteps={CUSTOM_STEPS} // TODO: Adicionar prop
    />
  );
}
```

### Exemplo: Skip Onboarding para Usuários Existentes

```typescript
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useNathiaContext } from '@/contexts/NathiaContext';

function OnboardingOrChat() {
  const navigation = useNavigation();
  const { context, loading } = useNathiaContext();

  useEffect(() => {
    if (loading) return;

    if (context?.onboardingCompleted) {
      navigation.replace('NathiaChat');
    } else {
      navigation.replace('NathiaOnboarding');
    }
  }, [context, loading]);

  return <Loading />;
}
```

## Recomendações

### Exemplo: Buscar Recomendações

```typescript
import { nathiaClient } from '@/services/nathia-client';

async function fetchRecommendations(userId: string) {
  const response = await nathiaClient.getRecommendations({
    userId,
    context: {
      stage: 'gestante',
      pregnancyWeek: 20,
      interests: ['anxiety', 'breastfeeding'],
    },
  });

  console.log('Recommendations:', response.recommendations);
  return response.recommendations;
}
```

### Exemplo: Card de Recomendação Custom

```typescript
import { RecommendationCard } from '@/components/nathia/RecommendationCard';
import { NathiaRecommendation } from '@/services/nathia-client';

function MyRecommendations() {
  const recommendations: NathiaRecommendation[] = [
    {
      type: 'circle',
      id: '1',
      title: 'Gestantes 2º Trimestre',
      description: 'Conecte-se com outras mães na mesma fase',
      reason: 'Você está no 2º trimestre e pode se beneficiar...',
      priority: 10,
    },
  ];

  const handlePress = (rec) => {
    console.log('Recommendation pressed:', rec);
    // Navigate or open modal
  };

  const trackImpression = (id) => {
    console.log('Impression:', id);
    // Send to analytics
  };

  return (
    <View>
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onPress={handlePress}
          onImpression={trackImpression}
        />
      ))}
    </View>
  );
}
```

## Componentes Isolados

### Exemplo: ChatMessage Standalone

```typescript
import { ChatMessage } from '@/components/nathia/ChatMessage';
import { Message } from '@/hooks/useNathia';

const mockMessage: Message = {
  id: '1',
  role: 'assistant',
  content: 'Olá! Como posso ajudar?',
  timestamp: new Date(),
  actions: [
    {
      type: 'openScreen',
      label: 'Ver dicas',
      data: { screenName: 'tips' },
    },
  ],
};

function MessageExample() {
  return (
    <ChatMessage
      message={mockMessage}
      onActionPress={(action) => console.log('Action:', action)}
      onFeedback={(id, feedback) => console.log('Feedback:', id, feedback)}
    />
  );
}
```

### Exemplo: QuickReplies Standalone

```typescript
import { QuickReplies, getContextualSuggestions } from '@/components/nathia/QuickReplies';

function QuickRepliesExample() {
  const suggestions = getContextualSuggestions({
    stage: 'gestante',
    pregnancyWeek: 20,
  });

  return (
    <QuickReplies
      suggestions={suggestions}
      onSelect={(suggestion) => console.log('Selected:', suggestion)}
      disabled={false}
    />
  );
}
```

### Exemplo: SOSButton Standalone

```typescript
import { SOSButton } from '@/components/nathia/SOSButton';

function SOSExample() {
  return (
    <SOSButton
      onHumanSupportRequest={() => {
        console.log('User requested human support');
        // Queue for moderation
      }}
      style={{ position: 'absolute', top: 20, right: 20 }}
    />
  );
}
```

## Error Handling

### Exemplo: Error Boundary

```typescript
import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class NathiaErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('NAT-IA Error:', error, errorInfo);
    // Send to monitoring service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            Algo deu errado com a NAT-IA
          </Text>
          <Text style={{ marginBottom: 20 }}>
            {this.state.error?.message}
          </Text>
          <Button title="Tentar novamente" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

// Uso:
<NathiaErrorBoundary>
  <NathiaChat />
</NathiaErrorBoundary>
```

### Exemplo: Tratamento de Erro no Chat

```typescript
import { useNathia } from '@/hooks/useNathia';
import { Alert } from 'react-native';

function ChatWithErrorHandling() {
  const { sendMessage, error } = useNathia({ userId: 'user-123' });

  const handleSend = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (err) {
      Alert.alert(
        'Erro ao enviar mensagem',
        'Não foi possível enviar sua mensagem. Tente novamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tentar novamente', onPress: () => handleSend(message) },
        ]
      );
    }
  };

  // Show error banner
  if (error) {
    return (
      <View style={{ backgroundColor: 'red', padding: 10 }}>
        <Text style={{ color: 'white' }}>{error}</Text>
      </View>
    );
  }

  return <ChatInput onSend={handleSend} />;
}
```

## Analytics

### Exemplo: Tracking de Eventos

```typescript
import { logger } from '@/lib/logger';

// Track message sent
function trackMessageSent(message: string, context: any) {
  logger.info('NAT-IA Message Sent', {
    messageLength: message.length,
    stage: context.stage,
    hasContext: !!context.mood,
  });

  // Send to analytics service
  analytics.track('nathia_message_sent', {
    messageLength: message.length,
    stage: context.stage,
  });
}

// Track action clicked
function trackActionClicked(action: NathiaAction) {
  logger.info('NAT-IA Action Clicked', {
    actionType: action.type,
    actionLabel: action.label,
  });

  analytics.track('nathia_action_clicked', {
    actionType: action.type,
    actionLabel: action.label,
  });
}

// Track recommendation conversion
function trackRecommendationConversion(recommendation: NathiaRecommendation) {
  logger.info('NAT-IA Recommendation Converted', {
    type: recommendation.type,
    id: recommendation.id,
  });

  analytics.track('nathia_recommendation_converted', {
    type: recommendation.type,
    id: recommendation.id,
    priority: recommendation.priority,
  });
}
```

### Exemplo: Custom Analytics Hook

```typescript
import { useEffect } from 'react';
import { useNathiaContext } from '@/contexts/NathiaContext';

function useNathiaAnalytics() {
  const { context } = useNathiaContext();

  useEffect(() => {
    // Track context changes
    if (context?.mood) {
      analytics.track('nathia_mood_updated', {
        mood: context.mood,
        stage: context.stage,
      });
    }
  }, [context?.mood]);

  const trackEvent = (eventName: string, properties: any) => {
    analytics.track(eventName, {
      ...properties,
      userId: context?.userId,
      stage: context?.stage,
      timestamp: new Date().toISOString(),
    });
  };

  return { trackEvent };
}
```

## Testes

### Exemplo: Testar Hook useNathia

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNathia } from '@/hooks/useNathia';

describe('useNathia', () => {
  it('should send message and receive response', async () => {
    const { result } = renderHook(() => useNathia({ userId: 'test-user' }));

    expect(result.current.messages).toEqual([]);

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[1].role).toBe('assistant');
    });
  });
});
```

### Exemplo: Testar Componente ChatMessage

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { ChatMessage } from '@/components/nathia/ChatMessage';

describe('ChatMessage', () => {
  const mockMessage = {
    id: '1',
    role: 'assistant',
    content: 'Hello',
    timestamp: new Date(),
    actions: [
      {
        type: 'openScreen',
        label: 'Ver mais',
        data: { screenName: 'details' },
      },
    ],
  };

  it('should render action button', () => {
    const { getByText } = render(<ChatMessage message={mockMessage} />);
    expect(getByText('Ver mais')).toBeTruthy();
  });

  it('should call onActionPress when button pressed', () => {
    const onActionPress = jest.fn();
    const { getByText } = render(
      <ChatMessage message={mockMessage} onActionPress={onActionPress} />
    );

    fireEvent.press(getByText('Ver mais'));
    expect(onActionPress).toHaveBeenCalledWith(mockMessage.actions[0]);
  });
});
```

### Exemplo: Mock nathiaClient

```typescript
import { nathiaClient } from '@/services/nathia-client';

jest.mock('@/services/nathia-client', () => ({
  nathiaClient: {
    sendMessage: jest.fn(),
    processOnboarding: jest.fn(),
    getRecommendations: jest.fn(),
  },
}));

describe('Chat with mocked client', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (nathiaClient.sendMessage as jest.Mock).mockResolvedValue({
      response: 'Mocked response',
      actions: [],
      suggestedReplies: [],
    });
  });

  it('should call sendMessage', async () => {
    const { result } = renderHook(() => useNathia({ userId: 'test' }));

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(nathiaClient.sendMessage).toHaveBeenCalledWith({
      message: 'Test',
      userId: 'test',
      context: expect.any(Object),
    });
  });
});
```

## Exemplos Avançados

### Exemplo: Debounce Input

```typescript
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

function ChatInputWithDebounce() {
  const [input, setInput] = useState('');
  const { sendMessage } = useNathia({ userId: 'user-123' });

  // Debounce typing indicator
  const handleTyping = useCallback(
    debounce(() => {
      console.log('User is typing...');
      // Send typing event to backend
    }, 300),
    []
  );

  return (
    <TextInput
      value={input}
      onChangeText={(text) => {
        setInput(text);
        handleTyping();
      }}
      onSubmitEditing={() => sendMessage(input)}
    />
  );
}
```

### Exemplo: Pagination de Mensagens

```typescript
import { useState, useEffect } from 'react';
import { getChatHistory } from '@/services/supabase';

function PaginatedChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;

    setLoading(true);
    const newMessages = await getChatHistory(userId, 20);
    setMessages([...messages, ...newMessages]);
    setPage(page + 1);
    setLoading(false);
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatMessage message={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
    />
  );
}
```

### Exemplo: Voice Input

```typescript
import Voice from '@react-native-voice/voice';

function VoiceInputButton() {
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage } = useNathia({ userId: 'user-123' });

  const startRecording = async () => {
    try {
      await Voice.start('pt-BR');
      setIsRecording(true);
    } catch (error) {
      console.error('Voice start error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value[0];
      sendMessage(text);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <Button
      title={isRecording ? '🎤 Gravando...' : '🎤 Falar'}
      onPress={isRecording ? stopRecording : startRecording}
    />
  );
}
```

## Recursos

- [Guia de Integração](./NATHIA_INTEGRATION_GUIDE.md)
- [Quick Start](./NATHIA_QUICK_START.md)
- [Arquitetura](./NATHIA_ARCHITECTURE.md)
- [README Componentes](../src/components/nathia/README.md)

---

**Última atualização:** 2025-11-07
