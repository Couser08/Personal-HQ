export interface CommandHelpItem {
  command: string;
  syntax: string;
  description: string;
  example: string;
  category: 'Structure' | 'Project' | 'Inspection' | 'Utility';
}

export const COMMAND_DOCS: CommandHelpItem[] = [
  {
    command: 'mkdir',
    syntax: 'mkdir <path> or folder <path>',
    description: 'Creates a new folder or nested directory path automatically.',
    example: 'mkdir src/components/ui/modals',
    category: 'Structure',
  },
  {
    command: 'touch',
    syntax: 'touch <path> [content] or file <path> [content]',
    description:
      'Creates a new file with optional starter code/content and creates missing parent folders.',
    example: 'touch src/components/Button.tsx "export const Button = () => <button>Click</button>;"',
    category: 'Structure',
  },
  {
    command: 'rm',
    syntax: 'rm <path> or delete <path>',
    description: 'Removes a file or directory along with all nested children.',
    example: 'rm src/legacy-utils',
    category: 'Structure',
  },
  {
    command: 'mv',
    syntax: 'mv <source_path> <target_path> or move <source> <target>',
    description: 'Moves a file or folder to a new path in the project tree.',
    example: 'mv src/Button.tsx src/components/ui/Button.tsx',
    category: 'Structure',
  },
  {
    command: 'rename',
    syntax: 'rename <path> <new_name>',
    description: 'Renames a specific file or folder.',
    example: 'rename src/OldApp.tsx App.tsx',
    category: 'Structure',
  },
  {
    command: 'content',
    syntax: 'content <path> "<code or text>"',
    description: 'Sets or updates the code boilerplate/notes for a file.',
    example: 'content src/types.ts "export interface User { id: string; }"',
    category: 'Structure',
  },
  {
    command: 'tree',
    syntax: 'tree or ls',
    description: 'Renders the entire visual ASCII folder/file tree directly in the console.',
    example: 'tree',
    category: 'Inspection',
  },
  {
    command: 'stats',
    syntax: 'stats or info',
    description:
      'Displays comprehensive architecture metrics (total files, folders, depth, extensions breakdown).',
    example: 'stats',
    category: 'Inspection',
  },
  {
    command: 'find',
    syntax: 'find <query> or search <query>',
    description: 'Searches for files or directories matching the query string.',
    example: 'find .tsx',
    category: 'Inspection',
  },
  {
    command: 'init',
    syntax: 'init <project_name> or project new <name>',
    description: 'Initializes a new project workspace with the given name.',
    example: 'init nextjs-ecommerce',
    category: 'Project',
  },
  {
    command: 'template',
    syntax: 'template <preset_name>',
    description:
      'Instantly applies an industry-standard architecture blueprint (react-vite, nextjs-app, fastapi, express-clean, rust-workspace, monorepo, go-gin).',
    example: 'template react-vite',
    category: 'Project',
  },
  {
    command: 'export',
    syntax: 'export <bash | powershell | tree | markdown | json | zip>',
    description: 'Exports the project structure into the specified format.',
    example: 'export bash',
    category: 'Utility',
  },
  {
    command: 'clear',
    syntax: 'clear',
    description: 'Clears the terminal output history.',
    example: 'clear',
    category: 'Utility',
  },
  {
    command: 'help',
    syntax: 'help [command]',
    description: 'Displays the command reference cheatsheet or detailed help for a command.',
    example: 'help touch',
    category: 'Utility',
  },
];
