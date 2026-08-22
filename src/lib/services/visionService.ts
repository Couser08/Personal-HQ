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
    if (bError) throw bError;

    const { data: nodesData, error: nError } = await supabase
      .from('vision_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit * 10);
    if (nError) throw nError;

    const nodesByBoard: Record<string, VisionNode[]> = {};
    (nodesData ?? []).forEach((n: any) => {
      const node: VisionNode = {
        id: n.id,
        boardId: n.board_id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        content: n.content,
        imageUrl: n.image_url,
        accentColor: n.accent_color,
        tags: n.tags ?? [],
        position: { x: Number(n.position_x) || 0, y: Number(n.position_y) || 0 },
        size: { width: Number(n.width) || 320, height: Number(n.height) || 220 },
        cornerRadius: n.corner_radius ?? 20,
        hasShadow: n.has_shadow !== false,
        hasBorder: !!n.has_border,
        linkUrl: n.link_url,
        progress: n.progress ?? 0,
        goalTarget: n.goal_target,
        goalCurrent: n.goal_current,
        goalUnit: n.goal_unit,
        mapPins: n.map_pins ?? [],
        audioUrl: n.audio_url,
        audioDuration: n.audio_duration,
        quoteAuthor: n.quote_author,
        fontFamily: n.font_family ?? 'sans',
        fontSize: n.font_size ?? 16,
        fontWeight: n.font_weight ?? 'bold',
        fontStyle: n.font_style ?? 'normal',
        isUppercase: n.is_uppercase !== false,
        letterSpacing: n.letter_spacing ?? 'tight',
        textAlign: n.text_align ?? 'left',
        bgStyle: n.bg_style ?? 'solid',
        textColor: n.text_color,
        isFavorite: !!n.is_favorite,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      };
      if (!nodesByBoard[n.board_id]) {
        nodesByBoard[n.board_id] = [];
      }
      nodesByBoard[n.board_id].push(node);
    });

    return (boardsData ?? []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      category: b.category,
      icon: b.icon ?? '✨',
      isFavorite: !!b.is_favorite,
      theme: b.theme ?? 'dots',
      nodes: nodesByBoard[b.id] ?? [],
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
  },

  async upsertBoard(userId: string, board: VisionBoard) {
    const { error } = await supabase.from('vision_boards').upsert({
      id: board.id,
      user_id: userId,
      title: board.title,
      subtitle: board.subtitle,
      category: board.category,
      icon: board.icon,
      is_favorite: board.isFavorite,
      theme: board.theme,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async deleteBoard(id: string) {
    const { error } = await supabase.from('vision_boards').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertNode(userId: string, node: VisionNode) {
    const { error } = await supabase.from('vision_nodes').upsert({
      id: node.id,
      board_id: node.boardId,
      user_id: userId,
      type: node.type,
      title: node.title,
      subtitle: node.subtitle,
      content: node.content,
      image_url: node.imageUrl,
      accent_color: node.accentColor,
      tags: node.tags,
      position_x: node.position.x,
      position_y: node.position.y,
      width: node.size?.width || 320,
      height: node.size?.height || 220,
      corner_radius: node.cornerRadius ?? 20,
      has_shadow: node.hasShadow !== false,
      has_border: !!node.hasBorder,
      link_url: node.linkUrl,
      progress: node.progress,
      goalTarget: node.goalTarget,
      goalCurrent: node.goalCurrent,
      goalUnit: node.goalUnit,
      map_pins: node.mapPins,
      audio_url: node.audioUrl,
      audio_duration: node.audioDuration,
      quote_author: node.quoteAuthor,
      font_family: node.fontFamily,
      font_size: node.fontSize,
      font_weight: node.fontWeight,
      font_style: node.fontStyle,
      is_uppercase: node.isUppercase,
      letter_spacing: node.letterSpacing,
      text_align: node.textAlign,
      bg_style: node.bgStyle,
      text_color: node.textColor,
      is_favorite: node.isFavorite,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async deleteNode(id: string) {
    const { error } = await supabase.from('vision_nodes').delete().eq('id', id);
    if (error) throw error;
  },
};
