import { supabase } from '../supabase';
import type { Vision, VisionBoard, VisionNode } from '../../store/types';

export const visionService = {
  async fetchAll(userId: string, limit = 50): Promise<Vision[]> {
    const { data, error } = await supabase
      .from('visions')
      .select('*')
      .eq('user_id', userId)
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      imageUrl: r.image_url,
      targetDate: r.target_date,
      whyText: r.why_text,
      status: r.status,
      progress: r.progress,
      linkedHabitIds: r.linked_habit_ids ?? [],
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },
  async create(userId: string, vision: Vision) {
    const { error } = await supabase.from('visions').insert({
      id: vision.id,
      user_id: userId,
      title: vision.title,
      category: vision.category,
      image_url: vision.imageUrl,
      target_date: vision.targetDate,
      why_text: vision.whyText,
      status: vision.status,
      progress: vision.progress,
      linked_habit_ids: vision.linkedHabitIds,
      created_at: vision.createdAt,
      updated_at: vision.updatedAt
    });
    if (error) throw error;
  },
  async update(id: string, data: Partial<Vision>) {
    const { error } = await supabase.from('visions').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.imageUrl !== undefined && { image_url: data.imageUrl }),
      ...(data.targetDate !== undefined && { target_date: data.targetDate }),
      ...(data.whyText !== undefined && { why_text: data.whyText }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.linkedHabitIds !== undefined && { linked_habit_ids: data.linkedHabitIds }),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from('visions').delete().eq('id', id);
    if (error) throw error;
  }
};

export const visionBoardService = {
  async fetchAll(userId: string, limit = 50): Promise<VisionBoard[]> {
    const { data: boardsData, error: bError } = await supabase
      .from('vision_boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (bError) {
      if (bError.code === '42P01' || bError.message?.includes('relation')) return [];
      throw bError;
    }

    const { data: nodesData, error: nError } = await supabase
      .from('vision_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit * 20);
    if (nError) {
      if (nError.code === '42P01' || nError.message?.includes('relation')) return [];
      throw nError;
    }

    const nodesByBoard: Record<string, VisionNode[]> = {};
    (nodesData ?? []).forEach((n: any) => {
      const node: VisionNode = {
        id: n.id,
        boardId: n.board_id,
        type: n.type || 'text',
        title: n.title || 'Untitled',
        subtitle: n.subtitle || '',
        content: n.content || '',
        imageUrl: n.image_url || '',
        accentColor: n.accent_color || '#3b82f6',
        tags: n.tags ?? [],
        position: { x: Number(n.position_x) || 0, y: Number(n.position_y) || 0 },
        size: { width: Number(n.width) || 320, height: Number(n.height) || 220 },
        cornerRadius: n.corner_radius ?? 20,
        hasShadow: n.has_shadow !== false,
        hasBorder: !!n.has_border,
        linkUrl: n.link_url || '',
        progress: n.progress ?? 0,
        goalTarget: n.goal_target ?? undefined,
        goalCurrent: n.goal_current ?? undefined,
        goalUnit: n.goal_unit || '',
        mapPins: n.map_pins ?? [],
        audioUrl: n.audio_url || '',
        audioDuration: n.audio_duration || '02:45',
        quoteAuthor: n.quote_author || '',
        fontFamily: n.font_family ?? 'sans',
        fontSize: n.font_size ?? 20,
        fontWeight: n.font_weight ?? 'bold',
        fontStyle: n.font_style ?? 'normal',
        isUppercase: n.is_uppercase !== false,
        letterSpacing: n.letter_spacing ?? 'tight',
        textAlign: n.text_align ?? 'left',
        bgStyle: n.bg_style ?? 'solid',
        textColor: n.text_color || undefined,
        isFavorite: !!n.is_favorite,
        createdAt: n.created_at || new Date().toISOString(),
        updatedAt: n.updated_at || new Date().toISOString(),
      };
      if (!nodesByBoard[n.board_id]) {
        nodesByBoard[n.board_id] = [];
      }
      nodesByBoard[n.board_id].push(node);
    });

    return (boardsData ?? []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      category: b.category || 'PERSONAL',
      icon: b.icon ?? '✨',
      isFavorite: !!b.is_favorite,
      theme: b.theme ?? 'dots',
      nodes: nodesByBoard[b.id] ?? [],
      createdAt: b.created_at || new Date().toISOString(),
      updatedAt: b.updated_at || new Date().toISOString(),
    }));
  },

  async upsertBoard(userId: string, board: VisionBoard) {
    const { error } = await supabase.from('vision_boards').upsert({
      id: board.id,
      user_id: userId,
      title: board.title,
      subtitle: board.subtitle || '',
      category: board.category || 'PERSONAL',
      icon: board.icon || '✨',
      is_favorite: !!board.isFavorite,
      theme: board.theme || 'dots',
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async deleteBoard(id: string) {
    const { error } = await supabase.from('vision_boards').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertNode(userId: string, node: VisionNode) {
    const payload: Record<string, any> = {
      id: node.id,
      board_id: node.boardId,
      user_id: userId,
      type: node.type || 'text',
      title: node.title || 'Untitled Node',
      subtitle: node.subtitle || null,
      content: node.content || null,
      image_url: node.imageUrl || null,
      accent_color: node.accentColor || '#3b82f6',
      tags: node.tags || [],
      position_x: node.position?.x ?? 0,
      position_y: node.position?.y ?? 0,
      width: node.size?.width || 320,
      height: node.size?.height || 220,
      corner_radius: node.cornerRadius ?? 20,
      has_shadow: node.hasShadow !== false,
      has_border: !!node.hasBorder,
      link_url: node.linkUrl || null,
      progress: node.progress ?? 0,
      goal_target: node.goalTarget ?? null,
      goal_current: node.goalCurrent ?? null,
      goal_unit: node.goalUnit || null,
      map_pins: node.mapPins || [],
      audio_url: node.audioUrl || null,
      audio_duration: node.audioDuration || null,
      quote_author: node.quoteAuthor || null,
      font_family: node.fontFamily || 'sans',
      font_size: node.fontSize || 20,
      font_weight: node.fontWeight || 'bold',
      font_style: node.fontStyle || 'normal',
      is_uppercase: node.isUppercase !== false,
      letter_spacing: node.letterSpacing || 'tight',
      text_align: node.textAlign || 'left',
      bg_style: node.bgStyle || 'solid',
      text_color: node.textColor || null,
      is_favorite: !!node.isFavorite,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('vision_nodes').upsert(payload);
    if (error) throw error;
  },

  async deleteNode(id: string) {
    const { error } = await supabase.from('vision_nodes').delete().eq('id', id);
    if (error) throw error;
  },
};
