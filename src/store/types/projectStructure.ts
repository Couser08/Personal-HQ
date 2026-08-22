export type ProjectNodeType = 'file' | 'folder';

export interface ProjectNode {
  id: string;
  name: string;
  type: ProjectNodeType;
  path: string;
  parentId: string | null;
  content?: string;
  extension?: string;
  isExpanded?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectStructure {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  rootName: string;
  nodes: ProjectNode[];
  tags: string[];
  templateType?: string;
  createdAt: string;
  updatedAt: string;
}
