import { supabase } from '../supabase';

export const settingsService = {
  async fetch(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsert(userId: string, settings: any) {
    try {
      const payload: Record<string, any> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      // Theme
      let dbTheme = settings.theme;
      if (dbTheme !== undefined) {
        payload.theme = ['light', 'dark', 'system'].includes(dbTheme) ? dbTheme : 'dark';
      }

      // Map valid columns (checking snake_case first, then camelCase fallback)
      const mapCol = (snake: string, camel: string) => {
        if (settings[snake] !== undefined) payload[snake] = settings[snake];
        else if (settings[camel] !== undefined) payload[snake] = settings[camel];
      };

      mapCol('countdown_template', 'countdownTemplate');
      mapCol('accent_color', 'accentColor');
      mapCol('animation_speed', 'animationSpeed');
      mapCol('compact_mode', 'compactMode');
      mapCol('sound_enabled', 'soundEnabled');
      mapCol('initial_bank_balance', 'initialBankBalance');
      mapCol('initial_cash_balance', 'initialCashBalance');
      mapCol('currency_symbol', 'currencySymbol');
      mapCol('media_quote', 'mediaQuote');
      mapCol('reduce_blur', 'reduceBlur');
      mapCol('reduce_animations', 'reduceAnimations');
      mapCol('gemini_api_key', 'geminiApiKey');
      mapCol('gemini_model', 'geminiModel');
      mapCol('ai_persona', 'aiPersona');
      mapCol('active_focus_item', 'activeFocusItem');
      mapCol('performance_mode', 'performanceMode');
      mapCol('wavy_effect_enabled', 'wavyEffectEnabled');
      mapCol('clock_style', 'clockStyle');

      let { error } = await supabase.from('user_settings').upsert(payload);

      if (error) {
        const basePayload = { 
          user_id: payload.user_id,
          updated_at: payload.updated_at,
          ...(payload.theme && { theme: payload.theme })
        };
        const res = await supabase.from('user_settings').upsert(basePayload);
        error = res.error;
      }

      if (error) {
        console.warn('Settings sync warning (operating in local fallback):', error.message || error);
      }
    } catch (e) {
      console.warn('Settings upsert exception:', e);
    }
  }
};
