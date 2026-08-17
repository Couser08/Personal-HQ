import React from 'react';
import {
  IconFolder,
  IconFolderOpen,
  IconFileCode,
  IconFileText,
  IconCode,
  IconBrandTypescript,
  IconBrandJavascript,
  IconBrandReact,
  IconBrandHtml5,
  IconBrandCss3,
  IconBrandPython,
  IconBrandRust,
  IconBrandGolang,
  IconBrandDocker,
  IconBrandTailwind,
  IconBrandGit,
  IconDatabase,
  IconSettings,
  IconLock,
  IconPhoto,
  IconTerminal2,
  IconPackage,
  IconFileDiff,
  IconBox,
  IconCube,
  IconShield,
  IconTool,
  IconServer,
  IconComponents,
  IconLayersLinked,
  IconTestPipe,
  IconBook
} from '@tabler/icons-react';

interface FileIconInfo {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; stroke?: number }>;
  color: string;
  badge?: string;
}

// Special exact file names map
const SPECIAL_FILE_MAP: Record<string, FileIconInfo> = {
  'package.json': { icon: IconPackage, color: '#e8274b', badge: 'pkg' },
  'package-lock.json': { icon: IconLock, color: '#e8274b' },
  'tsconfig.json': { icon: IconBrandTypescript, color: '#3178c6', badge: 'ts' },
  'tsconfig.node.json': { icon: IconBrandTypescript, color: '#3178c6' },
  'tsconfig.app.json': { icon: IconBrandTypescript, color: '#3178c6' },
  'vite.config.ts': { icon: IconBrandTypescript, color: '#646cff', badge: '⚡' },
  'vite.config.js': { icon: IconBrandJavascript, color: '#646cff', badge: '⚡' },
  'tailwind.config.js': { icon: IconBrandTailwind, color: '#06b6d4', badge: 'tw' },
  'tailwind.config.ts': { icon: IconBrandTailwind, color: '#06b6d4', badge: 'tw' },
  'postcss.config.js': { icon: IconSettings, color: '#dd3a0a' },
  '.gitignore': { icon: IconBrandGit, color: '#f05032', badge: 'git' },
  '.gitattributes': { icon: IconBrandGit, color: '#f05032' },
  '.env': { icon: IconSettings, color: '#ecd53f', badge: 'env' },
  '.env.local': { icon: IconSettings, color: '#ecd53f' },
  '.env.example': { icon: IconSettings, color: '#ecd53f' },
  '.env.production': { icon: IconSettings, color: '#ecd53f' },
  '.env.development': { icon: IconSettings, color: '#ecd53f' },
  'Dockerfile': { icon: IconBrandDocker, color: '#2496ed', badge: 'docker' },
  'docker-compose.yml': { icon: IconBrandDocker, color: '#2496ed' },
  'docker-compose.yaml': { icon: IconBrandDocker, color: '#2496ed' },
  'README.md': { icon: IconFileText, color: '#0ea5e9', badge: 'info' },
  'LICENSE': { icon: IconShield, color: '#eab308' },
  'index.html': { icon: IconBrandHtml5, color: '#e34f26' },
  '.eslintrc': { icon: IconSettings, color: '#4b32c3' },
  '.prettierrc': { icon: IconSettings, color: '#ea5e9b' },
};

// Extension based file map
const EXTENSION_MAP: Record<string, FileIconInfo> = {
  // TypeScript & React
  ts: { icon: IconBrandTypescript, color: '#3178c6' },
  tsx: { icon: IconBrandReact, color: '#22d3ee' },
  js: { icon: IconBrandJavascript, color: '#f7df1e' },
  jsx: { icon: IconBrandReact, color: '#f7df1e' },
  mjs: { icon: IconBrandJavascript, color: '#f7df1e' },
  cjs: { icon: IconBrandJavascript, color: '#f7df1e' },

  // Styling & Web
  css: { icon: IconBrandCss3, color: '#264de4' },
  scss: { icon: IconCode, color: '#c6538c' },
  sass: { icon: IconCode, color: '#c6538c' },
  less: { icon: IconCode, color: '#1d365d' },
  html: { icon: IconBrandHtml5, color: '#e34f26' },
  htm: { icon: IconBrandHtml5, color: '#e34f26' },
  vue: { icon: IconCode, color: '#42b883' },
  svelte: { icon: IconCode, color: '#ff3e00' },
  astro: { icon: IconCode, color: '#ff5d01' },

  // Languages
  py: { icon: IconBrandPython, color: '#3776ab' },
  ipynb: { icon: IconBrandPython, color: '#da5b0b' },
  rs: { icon: IconBrandRust, color: '#dea584' },
  go: { icon: IconBrandGolang, color: '#00add8' },
  java: { icon: IconCode, color: '#b07219' },
  kt: { icon: IconCode, color: '#a97bff' },
  c: { icon: IconCode, color: '#555555' },
  cpp: { icon: IconCode, color: '#f34b7d' },
  h: { icon: IconCode, color: '#a8b9cc' },
  hpp: { icon: IconCode, color: '#a8b9cc' },
  cs: { icon: IconCode, color: '#178600' },
  php: { icon: IconCode, color: '#4f5d95' },
  rb: { icon: IconCode, color: '#701516' },
  swift: { icon: IconCode, color: '#f05138' },
  sh: { icon: IconTerminal2, color: '#4eaa25' },
  bash: { icon: IconTerminal2, color: '#4eaa25' },
  zsh: { icon: IconTerminal2, color: '#4eaa25' },
  ps1: { icon: IconTerminal2, color: '#012456' },
  bat: { icon: IconTerminal2, color: '#c1c1c1' },

  // Data & Config
  json: { icon: IconCode, color: '#cbcb41' },
  jsonc: { icon: IconCode, color: '#cbcb41' },
  yaml: { icon: IconSettings, color: '#cb171e' },
  yml: { icon: IconSettings, color: '#cb171e' },
  toml: { icon: IconSettings, color: '#9c4221' },
  xml: { icon: IconCode, color: '#0060ac' },
  csv: { icon: IconFileDiff, color: '#22c55e' },
  sql: { icon: IconDatabase, color: '#e38c00' },
  prisma: { icon: IconDatabase, color: '#2d3748' },
  graphql: { icon: IconCube, color: '#e10098' },
  gql: { icon: IconCube, color: '#e10098' },
  env: { icon: IconSettings, color: '#ecd53f' },

  // Docs & Media
  md: { icon: IconFileText, color: '#4b9cd3' },
  mdx: { icon: IconFileText, color: '#fcb32c' },
  txt: { icon: IconFileText, color: '#94a3b8' },
  pdf: { icon: IconFileText, color: '#ef4444' },
  svg: { icon: IconPhoto, color: '#ffb13b' },
  png: { icon: IconPhoto, color: '#a855f7' },
  jpg: { icon: IconPhoto, color: '#a855f7' },
  jpeg: { icon: IconPhoto, color: '#a855f7' },
  gif: { icon: IconPhoto, color: '#a855f7' },
  webp: { icon: IconPhoto, color: '#a855f7' },
  ico: { icon: IconPhoto, color: '#a855f7' },
  woff: { icon: IconBox, color: '#ec4899' },
  woff2: { icon: IconBox, color: '#ec4899' },
  ttf: { icon: IconBox, color: '#ec4899' },
  eot: { icon: IconBox, color: '#ec4899' },
};

// Special folder names map
const SPECIAL_FOLDER_MAP: Record<string, { icon: React.ComponentType<any>; color: string; openColor?: string }> = {
  src: { icon: IconCode, color: '#3b82f6' },
  source: { icon: IconCode, color: '#3b82f6' },
  components: { icon: IconComponents, color: '#06b6d4' },
  ui: { icon: IconBox, color: '#8b5cf6' },
  hooks: { icon: IconLayersLinked, color: '#ec4899' },
  store: { icon: IconCube, color: '#f59e0b' },
  stores: { icon: IconCube, color: '#f59e0b' },
  state: { icon: IconCube, color: '#f59e0b' },
  utils: { icon: IconTool, color: '#10b981' },
  util: { icon: IconTool, color: '#10b981' },
  lib: { icon: IconBook, color: '#14b8a6' },
  api: { icon: IconServer, color: '#6366f1' },
  routes: { icon: IconServer, color: '#8b5cf6' },
  pages: { icon: IconFileCode, color: '#38bdf8' },
  app: { icon: IconBox, color: '#0ea5e9' },
  public: { icon: IconFolder, color: '#eab308' },
  assets: { icon: IconPhoto, color: '#f43f5e' },
  styles: { icon: IconBrandCss3, color: '#ec4899' },
  tests: { icon: IconTestPipe, color: '#22c55e' },
  test: { icon: IconTestPipe, color: '#22c55e' },
  __tests__: { icon: IconTestPipe, color: '#22c55e' },
  config: { icon: IconSettings, color: '#94a3b8' },
  docs: { icon: IconFileText, color: '#38bdf8' },
  node_modules: { icon: IconPackage, color: '#64748b' },
  dist: { icon: IconCube, color: '#64748b' },
  build: { icon: IconCube, color: '#64748b' },
  models: { icon: IconDatabase, color: '#f97316' },
  services: { icon: IconServer, color: '#0284c7' },
  controllers: { icon: IconServer, color: '#a855f7' },
};

export function getFileIconInfo(fileName: string): FileIconInfo {
  const cleanName = fileName.trim();
  if (SPECIAL_FILE_MAP[cleanName]) {
    return SPECIAL_FILE_MAP[cleanName];
  }
  const parts = cleanName.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    if (EXTENSION_MAP[ext]) {
      return EXTENSION_MAP[ext];
    }
  }
  return { icon: IconFileCode, color: '#94a3b8' };
}

export function getFolderIconInfo(folderName: string, isOpen: boolean) {
  const cleanName = folderName.trim().toLowerCase();
  const special = SPECIAL_FOLDER_MAP[cleanName];
  
  if (special) {
    return {
      Icon: isOpen ? IconFolderOpen : IconFolder,
      color: special.color,
      BadgeIcon: special.icon,
    };
  }

  return {
    Icon: isOpen ? IconFolderOpen : IconFolder,
    color: '#eab308',
    BadgeIcon: undefined,
  };
}
