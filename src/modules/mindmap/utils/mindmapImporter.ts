import { type Mindmap } from '../../../store/useAppStore';

export const parseMindmapJsonImport = (
  rawContent: string,
  fileName: string = 'Imported Mindmap',
): Partial<Mindmap>[] => {
  const data = JSON.parse(rawContent);
  const importedMaps: Partial<Mindmap>[] = [];

  const jsonToMindmapNodes = (
    value: any,
    label: string,
    parentId: string | null,
    nodes: any[],
    links: any[],
    depth: number = 0,
    _index: number = 0,
  ): string => {
    const id = `n-${nodes.length}-${Date.now()}`;
    const COLORS = ['blue', 'purple', 'teal', 'orange', 'pink', 'indigo', 'emerald', 'rose', 'amber'];
    const color = depth === 0 ? 'blue' : COLORS[(depth - 1) % COLORS.length];

    let displayText = label;
    if (value === null || value === undefined) displayText = `${label}: null`;
    else if (typeof value === 'boolean') displayText = `${label}: ${value}`;
    else if (typeof value === 'number') displayText = `${label}: ${value}`;
    else if (typeof value === 'string') {
      const safeVal = value.length > 40 ? value.slice(0, 40) + '…' : value;
      displayText = `${label}: ${safeVal}`;
    }

    const LEVEL_SPACING_X = 200;
    const LEVEL_SPACING_Y = 70;
    const nodeX = 120 + depth * LEVEL_SPACING_X;
    const nodeY = 80 + nodes.length * LEVEL_SPACING_Y;

    nodes.push({
      id,
      text: displayText,
      x: nodeX,
      y: nodeY,
      color,
      isRoot: depth === 0 && parentId === null,
      parentId: parentId ?? undefined,
      collapsed: depth >= 3,
    });

    if (parentId) {
      links.push({ source: parentId, target: id });
    }

    if (Array.isArray(value)) {
      value.slice(0, 20).forEach((item, i) => {
        const childLabel = `[${i}]`;
        jsonToMindmapNodes(item, childLabel, id, nodes, links, depth + 1, i);
      });
      if (value.length > 20) {
        const overflowId = `n-overflow-${nodes.length}`;
        nodes.push({
          id: overflowId,
          text: `… +${value.length - 20} more`,
          x: nodeX + LEVEL_SPACING_X,
          y: nodeY + LEVEL_SPACING_Y,
          color: 'gray',
          isRoot: false,
          parentId: id,
        });
        links.push({ source: id, target: overflowId });
      }
    } else if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value).slice(0, 20);
      keys.forEach((key, i) => {
        jsonToMindmapNodes(value[key], key, id, nodes, links, depth + 1, i);
      });
      if (Object.keys(value).length > 20) {
        const overflowId = `n-overflow-${nodes.length}`;
        nodes.push({
          id: overflowId,
          text: `… +${Object.keys(value).length - 20} more keys`,
          x: nodeX + LEVEL_SPACING_X,
          y: nodeY + LEVEL_SPACING_Y,
          color: 'gray',
          isRoot: false,
          parentId: id,
        });
        links.push({ source: id, target: overflowId });
      }
    }

    return id;
  };

  const parseSingleMap = (obj: any): Partial<Mindmap> | null => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

    let nodes = obj.nodes || obj.elements || obj.vertices;
    if (!Array.isArray(nodes)) return null;

    const formattedNodes = nodes.map((node: any, index: number) => {
      const id = node.id || node.key || node.uuid || `node-${index}`;
      const text = node.text || node.label || node.title || node.name || 'Unnamed Node';
      return {
        id: id.toString(),
        text: text.toString(),
        x: typeof node.x === 'number' ? node.x : 450 + index * 20,
        y: typeof node.y === 'number' ? node.y : 250 + index * 20,
        color: node.color || 'gray',
        isRoot: node.isRoot || (index === 0 && !node.parentId),
        parentId: node.parentId ? node.parentId.toString() : undefined,
        side: node.side || undefined,
        collapsed: !!node.collapsed,
        notes: node.notes || undefined,
        links: Array.isArray(node.links) ? node.links : undefined,
        images: Array.isArray(node.images) ? node.images : undefined,
        pdfs: Array.isArray(node.pdfs) ? node.pdfs : undefined,
      };
    });

    let links = obj.links || obj.edges || obj.connections || [];
    if (!Array.isArray(links)) links = [];

    const formattedLinks = links
      .map((link: any) => {
        const source = link.source || link.from || link.start;
        const target = link.target || link.to || link.end;
        return { source: source ? source.toString() : '', target: target ? target.toString() : '' };
      })
      .filter((l: any) => l.source && l.target);

    if (formattedLinks.length === 0) {
      formattedNodes.forEach((node: any) => {
        if (node.parentId && !node.isRoot) {
          formattedLinks.push({ source: node.parentId, target: node.id });
        }
      });
    }

    const targets = new Set(formattedLinks.map((l: any) => l.target));
    const actualRoots = formattedNodes.filter((n: any) => !n.parentId && !targets.has(n.id));

    if (actualRoots.length > 1 || (actualRoots.length === 0 && formattedNodes.length > 0)) {
      const masterRootId = `n-root-${Date.now()}`;
      const masterTitle = obj.title || obj.name || fileName.replace(/\.json$/i, '') || 'Imported Mindmap';

      formattedNodes.forEach((n: any) => {
        n.isRoot = false;
      });

      formattedNodes.unshift({
        id: masterRootId,
        text: masterTitle,
        x: 450,
        y: 250,
        color: 'gray',
        isRoot: true,
        parentId: undefined,
        side: undefined,
        collapsed: false,
        notes: undefined,
        links: undefined,
        images: undefined,
        pdfs: undefined,
      });

      actualRoots.forEach((r: any, i: number) => {
        r.parentId = masterRootId;
        r.x = 450 + (i % 2 === 0 ? 200 : -200);
        r.y = 350 + i * 80;
        formattedLinks.push({ source: masterRootId, target: r.id });
      });
    }

    return {
      title: obj.title || obj.name || 'Imported Mindmap',
      nodes: formattedNodes,
      links: formattedLinks,
      edgeStyle: obj.edgeStyle || 'solid',
    };
  };

  if (data && data.mindmaps && Array.isArray(data.mindmaps)) {
    data.mindmaps.forEach((item: any) => {
      const parsed = parseSingleMap(item);
      if (parsed) importedMaps.push(parsed);
    });
  } else if (Array.isArray(data) && data.length > 0 && data[0]?.nodes) {
    data.forEach((item: any) => {
      const parsed = parseSingleMap(item);
      if (parsed) importedMaps.push(parsed);
    });
  } else if (data?.nodes && Array.isArray(data.nodes)) {
    const parsed = parseSingleMap(data);
    if (parsed) importedMaps.push(parsed);
  } else {
    const nodes: any[] = [];
    const links: any[] = [];
    const rootLabel = fileName.replace(/\.json$/i, '') || 'Imported JSON';
    jsonToMindmapNodes(data, rootLabel, null, nodes, links, 0, 0);
    if (nodes.length > 0) {
      importedMaps.push({
        title: rootLabel,
        nodes,
        links,
        edgeStyle: 'solid',
      });
    }
  }

  return importedMaps;
};
