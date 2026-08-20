import { describe, it, expect, beforeEach } from 'vitest';
import { createMockClient, MockClient } from '../MockClient';
import { mockStore } from '../mockStore';
import {
  setMockEnabled,
  isMockEnabled,
  setLatencyRange,
  setForceErrorRate,
  getForceErrorRate,
  setMockUser,
} from '../mockConfig';

describe('In-App Mock Supabase Client', () => {
  let client: MockClient;

  beforeEach(async () => {
    // Reset store and disable latency & errors during tests for fast deterministic runs
    setLatencyRange(0, 0);
    setForceErrorRate(0);
    setMockUser('tungariyarahul08@gmail.com');
    await mockStore.reset();
    client = createMockClient();
  });

  describe('Query Builder: SELECT & Filters', () => {
    it('fetches all seeded notes with wildcard select', async () => {
      const { data, error } = await client.from('notes').select('*');
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(25);
    });

    it('filters rows using .eq()', async () => {
      const { data, error } = await client
        .from('notes')
        .select('id, title, pinned')
        .eq('pinned', true);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((note: any) => {
        expect(note.pinned).toBe(true);
        expect(note.title).toBeDefined();
      });
    });

    it('filters rows using .neq()', async () => {
      const { data, error } = await client
        .from('notes')
        .select('id, pinned')
        .neq('pinned', true);

      expect(error).toBeNull();
      data.forEach((note: any) => {
        expect(note.pinned).toBe(false);
      });
    });

    it('supports numeric comparisons: .gt(), .gte(), .lt(), .lte()', async () => {
      const { data: stocksGt } = await client.from('stocks').select('*').gt('entry_price', 150);
      expect(stocksGt.length).toBeGreaterThan(0);
      stocksGt.forEach((s: any) => expect(s.entry_price).toBeGreaterThan(150));

      const { data: stocksLte } = await client.from('stocks').select('*').lte('entry_price', 150);
      expect(stocksLte.length).toBeGreaterThan(0);
      stocksLte.forEach((s: any) => expect(s.entry_price).toBeLessThanOrEqual(150));
    });

    it('supports array matching with .in()', async () => {
      const { data } = await client
        .from('notes')
        .select('id')
        .in('id', ['note-01', 'note-02']);

      expect(data.length).toBe(2);
      expect(data.map((n: any) => n.id).sort()).toEqual(['note-01', 'note-02']);
    });

    it('supports case-insensitive pattern matching with .ilike()', async () => {
      const { data } = await client
        .from('notes')
        .select('title')
        .ilike('title', '%architecture%');

      expect(data.length).toBeGreaterThan(0);
      data.forEach((n: any) => {
        expect(n.title.toLowerCase()).toContain('architecture');
      });
    });

    it('supports sorting with .order()', async () => {
      const { data: descNotes } = await client
        .from('notes')
        .select('created_at')
        .order('created_at', { ascending: false });

      for (let i = 0; i < descNotes.length - 1; i++) {
        expect(new Date(descNotes[i].created_at).getTime()).toBeGreaterThanOrEqual(
          new Date(descNotes[i + 1].created_at).getTime()
        );
      }
    });

    it('supports pagination with .range() and .limit()', async () => {
      const { data: page1 } = await client.from('notes').select('id').range(0, 4);
      expect(page1.length).toBe(5);

      const { data: limited } = await client.from('notes').select('id').limit(3);
      expect(limited.length).toBe(3);
    });

    it('supports .single() and returns error when multiple or zero rows found', async () => {
      const { data, error } = await client
        .from('notes')
        .select('*')
        .eq('id', 'note-01')
        .single();

      expect(error).toBeNull();
      expect(data.id).toBe('note-01');

      const { data: missing, error: missingError } = await client
        .from('notes')
        .select('*')
        .eq('id', 'non-existent-id')
        .single();

      expect(missing).toBeNull();
      expect(missingError).not.toBeNull();
      expect(missingError.code).toBe('PGRST116');
    });

    it('supports .maybeSingle() returning null without error when no rows found', async () => {
      const { data, error } = await client
        .from('notes')
        .select('*')
        .eq('id', 'non-existent-id')
        .maybeSingle();

      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('Write Operations: INSERT / UPDATE / UPSERT / DELETE', () => {
    it('inserts a new row and sets automatic id, created_at, and updated_at', async () => {
      const newNote = {
        user_id: 'usr_admin_mock_001',
        title: 'Fresh Test Note',
        content: 'Testing automatic timestamps',
        tags: ['Test'],
        pinned: true,
      };

      const { data, error } = await client.from('notes').insert(newNote);
      expect(error).toBeNull();
      expect(data.id).toBeDefined();
      expect(data.title).toBe('Fresh Test Note');
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();

      // Verify row now exists in store
      const { data: fetched } = await client.from('notes').select('*').eq('id', data.id).single();
      expect(fetched.title).toBe('Fresh Test Note');
    });

    it('updates existing row and updates updated_at timestamp', async () => {
      const initialTimestamp = '2020-01-01T00:00:00.000Z';
      await client.from('notes').insert({
        id: 'update-target-note',
        user_id: 'usr_admin_mock_001',
        title: 'Original Title',
        content: 'Original Content',
        created_at: initialTimestamp,
        updated_at: initialTimestamp,
      });

      const { data: updatedRows, error } = await client
        .from('notes')
        .update({ title: 'Updated Title' })
        .eq('id', 'update-target-note');

      expect(error).toBeNull();
      expect(updatedRows[0].title).toBe('Updated Title');
      expect(updatedRows[0].updated_at).not.toBe(initialTimestamp);

      const { data: verifyRow } = await client
        .from('notes')
        .select('*')
        .eq('id', 'update-target-note')
        .single();
      expect(verifyRow.title).toBe('Updated Title');
    });

    it('upserts a record (creates if new, updates if exists)', async () => {
      // 1. Insert via upsert
      const { data: upsertNew } = await client.from('notes').upsert({
        id: 'upsert-note-1',
        user_id: 'usr_admin_mock_001',
        title: 'Initial Upsert',
        content: 'Version 1',
      });
      expect(upsertNew.title).toBe('Initial Upsert');

      // 2. Update via upsert
      const { data: upsertExisting } = await client.from('notes').upsert({
        id: 'upsert-note-1',
        title: 'Updated Upsert',
        content: 'Version 2',
      });
      expect(upsertExisting.title).toBe('Updated Upsert');
      expect(upsertExisting.content).toBe('Version 2');
    });

    it('deletes a row matching filter', async () => {
      await client.from('notes').insert({
        id: 'delete-target-note',
        user_id: 'usr_admin_mock_001',
        title: 'Will Be Deleted',
      });

      const { error: deleteError } = await client
        .from('notes')
        .delete()
        .eq('id', 'delete-target-note');
      expect(deleteError).toBeNull();

      const { data } = await client
        .from('notes')
        .select('*')
        .eq('id', 'delete-target-note')
        .maybeSingle();
      expect(data).toBeNull();
    });
  });

  describe('Mock Auth & Storage', () => {
    it('returns session and current user', async () => {
      const { data } = await client.auth.getSession();
      expect(data.session).toBeDefined();
      expect(data.session.user.email).toBe('tungariyarahul08@gmail.com');

      const { data: userData } = await client.auth.getUser();
      expect(userData.user.email).toBe('tungariyarahul08@gmail.com');
    });

    it('allows sign in and fires auth listener', async () => {
      let eventFired = '';
      client.auth.onAuthStateChange((event) => {
        eventFired = event;
      });

      const { data, error } = await client.auth.signInWithPassword({
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(error).toBeNull();
      expect(data.user.email).toBe('newuser@example.com');
      expect(eventFired).toBe('SIGNED_IN');
    });

    it('supports storage getPublicUrl, upload and remove', async () => {
      const urlResult = client.storage.from('avatars').getPublicUrl('test-avatar.png');
      expect(urlResult.data.publicUrl).toBeDefined();

      const fakeFile = new Blob(['mock-content'], { type: 'image/png' });
      const uploadResult = await client.storage.from('avatars').upload('custom.png', fakeFile);
      expect(uploadResult.error).toBeNull();
      expect(uploadResult.data?.path).toBe('custom.png');

      const removeResult = await client.storage.from('avatars').remove(['custom.png']);
      expect(removeResult.error).toBeNull();
    });
  });

  describe('Mock Configuration, Latency & Error Injection', () => {
    it('simulates network error when forceErrorRate is 1.0', async () => {
      setForceErrorRate(1.0);
      expect(getForceErrorRate()).toBe(1.0);

      const { data, error } = await client.from('notes').select('*');
      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error.code).toBe('SIMULATED_NETWORK_ERROR');
    });

    it('toggles mock mode status', () => {
      setMockEnabled(true);
      expect(isMockEnabled()).toBe(true);

      setMockEnabled(false);
      expect(isMockEnabled()).toBe(false);

      setMockEnabled(true);
    });

    it('exports and imports database snapshot', async () => {
      const initialStats = mockStore.getStats();
      expect(initialStats.notes).toBeGreaterThan(0);

      const snapshot = mockStore.exportSnapshot();
      expect(typeof snapshot).toBe('string');

      // Clear notes
      await mockStore.setRows('notes', []);
      expect(mockStore.getRows('notes').length).toBe(0);

      // Restore snapshot
      const restored = await mockStore.importSnapshot(snapshot);
      expect(restored).toBe(true);
      expect(mockStore.getRows('notes').length).toBe(initialStats.notes);
    });
  });
});
