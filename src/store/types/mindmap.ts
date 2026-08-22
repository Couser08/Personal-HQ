export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isRoot?: boolean;
  parentId?: string;
  side?: any;
  icon?: string;
  linkUrl?: string;
  imageUrl?: string;
  pdfs?: any[];
  notes?: string;
  links?: string[];
  images?: string[];
  collapsed?: boolean;
}

export interface MindmapLink {
  source: string;
  target: string;
}

export interface Mindmap {
  id: string;
  title: string;
  nodes: MindmapNode[];
  links: MindmapLink[];
  edgeStyle?: string;
  createdAt: string;
}
