/**
 * Notifications Service - Sistema de Notificações Push
 *
 * Configuração e gerenciamento de notificações push para Nossa Maternidade
 * Estende o serviço de notificações existente com funcionalidades adicionais
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Verificar se expo-device está disponível
let Device: any;
try {
  Device = require('expo-device');
} catch {
  // expo-device não instalado, usar workaround
  Device = {
    isDevice: true, // Assumir dispositivo real em produção
  };
}

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicitar permissões de notificação
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      console.warn('Notificações push só funcionam em dispositivos físicos');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão de notificações não concedida');
      return false;
    }

    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DD5B9A',
      });

      await Notifications.setNotificationChannelAsync('habits', {
        name: 'Lembretes de Hábitos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DD5B9A',
      });

      await Notifications.setNotificationChannelAsync('content', {
        name: 'Novos Conteúdos',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#DD5B9A',
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissões de notificação:', error);
    return false;
  }
}

/**
 * Obter token de push notification
 */
export async function getPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Obter projectId do Expo via Constants
    const Constants = require('expo-constants').default;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId;

    if (!projectId) {
      console.warn('Expo projectId não configurado. Configure via EAS ou app.config.js');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Erro ao obter token de push:', error);
    return null;
  }
}

/**
 * Agendar notificação de hábito
 */
export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  time: { hour: number; minute: number }
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💝 Lembrete de Hábito',
        body: `Não esqueça: ${habitName}`,
        sound: true,
        data: {
          type: 'habit_reminder',
          habitId,
        },
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
        channelId: 'habits',
      },
    });

    return identifier;
  } catch (error) {
    console.error('Erro ao agendar lembrete de hábito:', error);
    return null;
  }
}

/**
 * Cancelar notificação de hábito
 */
export async function cancelHabitReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
}

/**
 * Agendar notificação de celebração de streak
 */
export async function scheduleStreakCelebration(habitName: string, streakDays: number): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Parabéns!',
        body: `Você completou ${habitName} por ${streakDays} dias seguidos! Continue assim! 💪`,
        sound: true,
        data: {
          type: 'streak_celebration',
          streakDays,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1, // Notificação imediata
      },
    });

    return identifier;
  } catch (error) {
    console.error('Erro ao agendar celebração de streak:', error);
    return null;
  }
}

/**
 * Agendar notificação de novo conteúdo
 */
export async function scheduleNewContentNotification(contentTitle: string, contentId: string): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Novo Conteúdo Disponível',
        body: contentTitle,
        sound: true,
        data: {
          type: 'new_content',
          contentId,
        },
        categoryIdentifier: 'content',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
      identifier: `content_${contentId}`,
    });

    return identifier;
  } catch (error) {
    console.error('Erro ao agendar notificação de conteúdo:', error);
    return null;
  }
}

/**
 * Configurar listener de notificações recebidas
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
): {
  received: Notifications.Subscription;
  response: Notifications.Subscription;
} {
  const receivedListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  return {
    received: receivedListener,
    response: responseListener,
  };
}

/**
 * Remover listeners de notificações
 */
export function removeNotificationListeners(listeners: {
  received: Notifications.Subscription;
  response: Notifications.Subscription;
}): void {
  listeners.received.remove();
  listeners.response.remove();
}

/**
 * Cancelar todas as notificações agendadas
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erro ao cancelar todas as notificações:', error);
  }
}

/**
 * Obter todas as notificações agendadas
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erro ao obter notificações agendadas:', error);
    return [];
  }
}

/**
 * Salvar token de push no Supabase
 */
export async function savePushTokenToSupabase(token: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Atualizar perfil com token de push
    await supabase
      .from('user_profiles')
      .update({
        push_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  } catch (error) {
    console.error('Erro ao salvar token de push:', error);
  }
}
