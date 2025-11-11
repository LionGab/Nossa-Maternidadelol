# NAT-IA - Arquitetura do Cliente React Native

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    App.tsx (Root)                        │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │         NathiaProvider (Context)                 │    │   │
│  │  │                                                   │    │   │
│  │  │  ┌──────────────────────────────────────────┐   │    │   │
│  │  │  │     NavigationContainer                   │   │    │   │
│  │  │  │                                            │   │    │   │
│  │  │  │  Screens:                                  │   │    │   │
│  │  │  │  - NathiaOnboarding                        │   │    │   │
│  │  │  │  - NathiaChat                              │   │    │   │
│  │  │  │  - NathiaRecommendations                   │   │    │   │
│  │  │  │                                            │   │    │   │
│  │  │  └──────────────────────────────────────────┘   │    │   │
│  │  │                                                   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Camadas da Aplicação

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
│                         (Screens)                             │
│                                                               │
│  NathiaChat.tsx  │  NathiaOnboarding.tsx  │  NathiaRecommendations.tsx
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                     COMPONENT LAYER                           │
│                      (Components)                             │
│                                                               │
│  ChatMessage  │  SOSButton  │  QuickReplies  │  OnboardingFlow
│  RecommendationCard                                           │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                           │
│                       (Hooks)                                 │
│                                                               │
│  useNathia  │  useNathiaActions                              │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                         │
│                       (Context)                               │
│                                                               │
│  NathiaContext (global state)                                │
│  - userId, stage, mood, concerns                             │
│  - onboardingCompleted, preferences                          │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                       DATA LAYER                              │
│                    (Services)                                 │
│                                                               │
│  nathiaClient (HTTP)  │  AsyncStorage (Cache)  │  Supabase (DB)
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                         │
│                                                               │
│  Edge Functions:                                              │
│  - nathia-chat                                                │
│  - nathia-onboarding                                          │
│  - nathia-recommendations                                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados Detalhado

### 1. Onboarding Flow

```
User opens app
     │
     ↓
┌──────────────────┐
│ Check onboarding │ (NathiaContext)
│    completed?    │
└────────┬─────────┘
         │
    NO   │   YES
    ┌────┴────┐
    ↓         ↓
┌────────┐  ┌──────────┐
│ Onboard│  │   Chat   │
│ Screen │  │  Screen  │
└────┬───┘  └──────────┘
     │
     ↓
┌─────────────────┐
│ OnboardingFlow  │
│   Component     │
└────────┬────────┘
         │
         ↓ (user answers questions)
         │
┌────────┴─────────┐
│  nathiaClient    │
│ .processOnboard()│
└────────┬─────────┘
         │
         ↓ (HTTP POST)
         │
┌────────┴──────────┐
│  Edge Function:   │
│ nathia-onboarding │
└────────┬──────────┘
         │
         ↓ (returns Starter Pack)
         │
┌────────┴──────────┐
│  Show Starter     │
│     Pack          │
└────────┬──────────┘
         │
         ↓ (user clicks CTA)
         │
┌────────┴──────────┐
│  Navigate to      │
│  NathiaChat       │
└───────────────────┘
```

### 2. Chat Message Flow

```
User types message
       │
       ↓
┌──────────────┐
│ Input field  │
│  onChange    │
└──────┬───────┘
       │
       ↓ (user presses send)
       │
┌──────┴───────┐
│ useNathia    │
│ .sendMessage │
└──────┬───────┘
       │
       ↓ (adds user message to state)
       │
┌──────┴────────────┐
│  Local State      │
│ messages.push()   │
└──────┬────────────┘
       │
       ↓ (save to AsyncStorage)
       │
┌──────┴──────────────┐
│  AsyncStorage       │
│ setItem(messages)   │
└──────┬──────────────┘
       │
       ↓ (call API)
       │
┌──────┴─────────┐
│  nathiaClient  │
│ .sendMessage() │
└──────┬─────────┘
       │
       ↓ (HTTP POST with retry)
       │
┌──────┴────────────┐
│  Edge Function:   │
│   nathia-chat     │
└──────┬────────────┘
       │
       ↓ (Claude processes)
       │
┌──────┴────────────┐
│  Response:        │
│  - text           │
│  - actions[]      │
│  - suggestions[]  │
└──────┬────────────┘
       │
       ↓ (adds assistant message)
       │
┌──────┴────────────┐
│  Local State      │
│ messages.push()   │
└──────┬────────────┘
       │
       ↓ (save to Supabase async)
       │
┌──────┴────────────┐
│    Supabase       │
│ saveChatMessage() │
└──────┬────────────┘
       │
       ↓ (UI updates)
       │
┌──────┴────────────┐
│  ChatMessage      │
│   Component       │
│  (renders)        │
└───────────────────┘
```

### 3. Action Processing Flow

```
Assistant message with action
       │
       ↓
┌──────────────────┐
│  ChatMessage     │
│  Component       │
└──────┬───────────┘
       │
       ↓ (user clicks action button)
       │
┌──────┴─────────────┐
│ useNathiaActions   │
│  .processAction()  │
└──────┬─────────────┘
       │
       ↓ (switch on action.type)
       │
  ┌────┴────┐
  │         │
  ↓         ↓
┌─────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌────┐
│open │  │ join │  │start │  │ show │  │sos │
│Screen  │Circle│  │Habit │  │Content│ │    │
└──┬──┘  └───┬──┘  └───┬──┘  └───┬──┘  └─┬──┘
   │         │          │          │        │
   ↓         ↓          ↓          ↓        ↓
┌──────────────────────────────────────────────┐
│          React Navigation                     │
│        .navigate(screen, params)              │
└──────────────────────────────────────────────┘
       │
       ↓ (track analytics)
       │
┌──────┴──────────────┐
│   Analytics         │
│  trackConversion()  │
└─────────────────────┘
```

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      NathiaChat Screen                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Header (with SOS)                      │    │
│  │  ┌──────┐  NAT-IA              ┌──────────┐        │    │
│  │  │Avatar│  Sua assistente       │ SOSButton│        │    │
│  │  └──────┘                       └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              FlatList (Messages)                    │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │  ChatMessage (user)                         │    │    │
│  │  │    [content]                          [time]│    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │  ChatMessage (assistant)                    │    │    │
│  │  │  [avatar] [content]                    [time]│   │    │
│  │  │           [Action Button 1]                 │    │    │
│  │  │           [Action Button 2]                 │    │    │
│  │  │           👍 👎                              │    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │  TypingIndicator (if isTyping)             │    │    │
│  │  │  ⏳ NAT-IA está digitando...               │    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            QuickReplies                             │    │
│  │  [Chip 1] [Chip 2] [Chip 3] [Chip 4] →             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │               Input Bar                             │    │
│  │  ┌────────────────────────────┐  ┌──────────┐      │    │
│  │  │  TextInput (message)       │  │ Send Btn │      │    │
│  │  └────────────────────────────┘  └──────────┘      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Estado e Props

### NathiaContext State

```typescript
{
  userId: string;
  stage?: 'gestante' | 'mae' | 'tentante' | 'puerperio';
  pregnancyWeek?: number;
  babyAge?: number;
  mood?: string;
  concerns?: string[];
  lastInteraction?: Date;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  preferences: {
    suggestionsEnabled: boolean;
    autoRecommendations: boolean;
  };
}
```

### useNathia State

```typescript
{
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  lastActions: NathiaAction[];
  suggestedReplies: string[];
  contextUpdate: {
    mood?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    needsModeration?: boolean;
  } | null;
}
```

### Message Object

```typescript
{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: NathiaAction[];
  suggestedReplies?: string[];
}
```

### NathiaAction Object

```typescript
{
  type: 'openScreen' | 'joinCircle' | 'startHabit' | 'showContent' | 'sos';
  label: string;
  data?: {
    screenName?: string;
    circleId?: string;
    habitId?: string;
    contentId?: string;
    url?: string;
  };
}
```

## Data Persistence

### AsyncStorage Keys

```
@nathia_messages          → Message[]
@nathia_context           → NathiaContextState
@onboarded                → boolean (legacy, não usado)
```

### Supabase Tables

```
user_profiles
├── id (UUID, PK)
├── email (TEXT)
├── name (TEXT)
├── type (TEXT) → 'gestante' | 'mae' | etc
├── pregnancy_week (INTEGER)
├── preferences (JSONB)
└── created_at (TIMESTAMPTZ)

chat_messages
├── id (UUID, PK)
├── user_id (UUID, FK → user_profiles)
├── message (TEXT)
├── response (TEXT)
├── context_data (JSONB)
└── created_at (TIMESTAMPTZ)
```

## API Endpoints (Edge Functions)

### POST /functions/v1/nathia-chat

**Request:**

```json
{
  "message": "Estou me sentindo ansiosa",
  "userId": "user-123",
  "context": {
    "stage": "gestante",
    "pregnancyWeek": 20,
    "mood": "anxious",
    "concerns": ["anxiety", "sleep"],
    "previousMessages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
}
```

**Response:**

```json
{
  "response": "Entendo sua ansiedade...",
  "actions": [
    {
      "type": "openScreen",
      "label": "Ver exercícios de respiração",
      "data": { "screenName": "breathingExercises" }
    }
  ],
  "suggestedReplies": ["Me conte mais", "Quero ver dicas de relaxamento"],
  "contextUpdate": {
    "mood": "anxious",
    "riskLevel": "low"
  }
}
```

### POST /functions/v1/nathia-onboarding

**Request:**

```json
{
  "userId": "user-123",
  "answers": {
    "stage": "gestante",
    "pregnancyWeek": 20,
    "concerns": ["anxiety", "breastfeeding"],
    "expectations": ["info", "support", "community"]
  }
}
```

**Response:**

```json
{
  "welcomeMessage": "Bem-vinda! Estou muito feliz...",
  "starterPack": {
    "circles": [
      {
        "id": "circle-1",
        "name": "Gestantes 2º Trimestre",
        "reason": "Você está no 2º trimestre..."
      }
    ],
    "habits": [...],
    "content": [...]
  }
}
```

### POST /functions/v1/nathia-recommendations

**Request:**

```json
{
  "userId": "user-123",
  "context": {
    "stage": "gestante",
    "pregnancyWeek": 20,
    "interests": ["anxiety", "breastfeeding"]
  }
}
```

**Response:**

```json
{
  "recommendations": [
    {
      "type": "circle",
      "id": "circle-1",
      "title": "Gestantes 2º Trimestre",
      "description": "Conecte-se com outras mães...",
      "reason": "Você está no 2º trimestre...",
      "priority": 10
    },
    {
      "type": "habit",
      "id": "habit-1",
      "title": "Meditação diária",
      "description": "5 minutos de meditação...",
      "reason": "Pode ajudar com sua ansiedade...",
      "priority": 8
    }
  ]
}
```

## Error Handling

### Camadas de Erro

```
1. Network Error
   └→ Retry (2x) com exponential backoff
      └→ Timeout (5s)
         └→ Offline Fallback
            └→ Show cached message

2. API Error (4xx, 5xx)
   └→ Parse error message
      └→ Show user-friendly message
         └→ Log to monitoring

3. Parsing Error
   └→ Validate response schema
      └→ Show generic error
         └→ Log to monitoring

4. State Error
   └→ Error boundary catches
      └→ Show error screen
         └→ Option to retry/reset
```

### Error Messages

```typescript
const ERROR_MESSAGES = {
  NETWORK: 'Parece que você está offline. Verifique sua conexão.',
  TIMEOUT: 'A resposta está demorando. Tente novamente.',
  API_ERROR: 'Algo deu errado. Tente novamente.',
  UNKNOWN: 'Erro inesperado. Recarregue o app.',
};
```

## Analytics Events

```typescript
// Onboarding
'nathia_onboarding_started'
'nathia_onboarding_step_completed' { step: 1-4 }
'nathia_onboarding_completed'

// Chat
'nathia_message_sent' { messageLength, hasContext }
'nathia_message_received' { hasActions, hasSuggestions }
'nathia_typing_started'

// Actions
'nathia_action_displayed' { actionType, actionLabel }
'nathia_action_clicked' { actionType, actionLabel }
'nathia_action_converted' { actionType, actionLabel }

// SOS
'nathia_sos_opened'
'nathia_sos_cvv_called'
'nathia_sos_samu_called'
'nathia_sos_human_requested'

// Recommendations
'nathia_recommendations_viewed'
'nathia_recommendation_clicked' { type, id }
'nathia_recommendation_converted' { type, id }

// Feedback
'nathia_feedback_positive' { messageId }
'nathia_feedback_negative' { messageId }
```

## Performance Metrics

### Target Metrics

```
First Paint:           < 1s
Time to Interactive:   < 2s
Input Lag:             < 100ms
API Response:          < 2s (avg), < 5s (p99)
Scroll FPS:            60fps
Memory Usage:          < 100MB
Bundle Size:           < 5MB
```

### Monitoring Points

```
1. Screen Load Time
   - NathiaChat first paint
   - NathiaOnboarding first paint

2. API Performance
   - nathia-chat response time
   - nathia-onboarding response time
   - Retry rate
   - Timeout rate

3. User Interactions
   - Message send latency
   - Scroll performance
   - Input lag

4. Errors
   - API errors (4xx, 5xx)
   - Network errors
   - Crash rate
```

## Security Considerations

### 1. API Keys

- ✅ Supabase anon key stored in env
- ✅ RLS policies enforce user isolation
- ❌ Never log sensitive data

### 2. User Data

- ✅ All chat messages encrypted in transit (HTTPS)
- ✅ Local storage encrypted (platform-level)
- ✅ RLS policies prevent cross-user access

### 3. Input Validation

- ✅ Message length limited (1000 chars)
- ✅ XSS prevention in markdown rendering
- ✅ SQL injection prevented (Supabase client handles)

### 4. Rate Limiting

- ⚠️ TODO: Implement rate limiting in Edge Functions
- ⚠️ TODO: Implement client-side throttling

## Scalability

### Current Design Supports:

- **Users:** 100k+ (Supabase scales automatically)
- **Messages/day:** 1M+ (Edge Functions scale automatically)
- **Concurrent users:** 10k+ (Supabase connection pooling)

### Bottlenecks to Monitor:

1. **AsyncStorage:** Limited to ~10MB per app
   - Solution: Implement pagination + cleanup old messages

2. **FlatList:** Performance degrades with 1000+ items
   - Solution: Already using FlatList (virtualizes)

3. **Claude API:** Rate limits apply
   - Solution: Implement queue + backoff

## Deployment Checklist

- [ ] Environment variables set
- [ ] Edge Functions deployed
- [ ] Database migrations run
- [ ] RLS policies configured
- [ ] Analytics integrated
- [ ] Error monitoring (Sentry)
- [ ] Beta testers invited
- [ ] Performance profiling done
- [ ] Security audit passed
- [ ] App store assets prepared

## References

- [NAT-IA Integration Guide](./NATHIA_INTEGRATION_GUIDE.md)
- [Quick Start Guide](./NATHIA_QUICK_START.md)
- [Implementation Report](./NATHIA_IMPLEMENTATION_REPORT.md)
- [Component README](../src/components/nathia/README.md)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-07
**Maintained by:** Development Team
