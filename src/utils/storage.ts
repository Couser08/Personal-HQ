export function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn(`[Storage Persist] Quota exceeded for key: ${key}. Attempting storage optimization...`);
      
      // If we failed to write notes, prune excalidraw markup.
      if (key === 'phq_notes') {
        try {
          const notes = JSON.parse(value);
          const optimized = notes.map((n: any) => {
            if (n.content && (n.content.includes('"elements"') || n.title?.toLowerCase().includes('sketch') || n.title?.toLowerCase().includes('drawing'))) {
              return { ...n, content: '{"elements":[],"appState":{}}' };
            }
            return n;
          });
          localStorage.setItem(key, JSON.stringify(optimized));
          console.log('[Storage Persist] Successfully optimized notes storage by clearing drawing elements cache.');
          return;
        } catch (err) {
          console.error('[Storage Persist] Failed to optimize notes storage:', err);
        }
      }
      
      // If another key failed, clear drawings cache from phq_notes to free up space.
      try {
        const rawNotes = localStorage.getItem('phq_notes');
        if (rawNotes) {
          const notes = JSON.parse(rawNotes);
          let optimizedAny = false;
          const optimized = notes.map((n: any) => {
            if (n.content && n.content.includes('"elements"')) {
              optimizedAny = true;
              return { ...n, content: '{"elements":[],"appState":{}}' };
            }
            return n;
          });
          if (optimizedAny) {
            localStorage.setItem('phq_notes', JSON.stringify(optimized));
            // Retry the original write operation
            localStorage.setItem(key, value);
            console.log(`[Storage Persist] Made room by pruning drawings cache and successfully saved key: ${key}`);
            return;
          }
        }
      } catch (err) {
        console.error('[Storage Persist] Failed to clear notes cache to make room:', err);
      }
    }
    console.warn(`[Storage Persist] Could not save key: ${key} due to quota constraint:`, e);
  }
}
