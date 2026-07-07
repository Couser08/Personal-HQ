import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPalette, IconBrandPhp, IconCopy, IconCheck, IconSearch, IconSparkles, IconEye, IconFilter
} from '@tabler/icons-react';

interface ReferenceItem {
  id: string;
  category: string;
  name: string;
  syntax: string;
  desc: string;
  example: string;
}

const TAILWIND_REF: ReferenceItem[] = [
  {
    id: 'tw-1',
    category: 'Layout & Spacing',
    name: 'Flexbox Alignment Row',
    syntax: 'flex items-center justify-between gap-4',
    desc: 'Aligns items vertically centered along the cross-axis, distributes them evenly along the main-axis, and sets responsive spacing gaps.',
    example: '<div className="flex items-center justify-between gap-4">\n  <span>Left Info</span>\n  <button>Action</button>\n</div>'
  },
  {
    id: 'tw-2',
    category: 'Layout & Spacing',
    name: 'Responsive Grid Columns',
    syntax: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    desc: 'Switches columns dynamically. Creates a 1-column layout on mobile, scaling up to 3 equal-width columns on tablet and desktop viewports.',
    example: '<div className="grid grid-cols-1 md:grid-cols-3 gap-6">\n  <div>Card A</div>\n  <div>Card B</div>\n  <div>Card C</div>\n</div>'
  },
  {
    id: 'tw-3',
    category: 'Design Systems',
    name: 'Frosted Glass Card',
    syntax: 'bg-surface/85 border border-border/50 backdrop-blur-md shadow-lg rounded-2xl',
    desc: 'Combines translucency, semi-transparent border borders, glassmorphic backdrop-blur, and soft drop shadows for cards.',
    example: '<div className="bg-surface/85 border border-border/50 backdrop-blur-md shadow-lg rounded-2xl p-5">\n  <p>Glassmorphism Card</p>\n</div>'
  },
  {
    id: 'tw-4',
    category: 'Interactions & Effects',
    name: 'Micro-hover Scale Animation',
    syntax: 'transition-all duration-200 hover:scale-105 active:scale-95',
    desc: 'Applies premium feedback scale animations when a user hovers over or clicks/presses interactive cards and buttons.',
    example: '<button className="transition-all duration-200 hover:scale-105 active:scale-95">\n  Press Me\n</button>'
  },
  {
    id: 'tw-5',
    category: 'Layout & Spacing',
    name: 'Absolute Centering Overlay',
    syntax: 'absolute inset-0 flex items-center justify-center',
    desc: 'Sizes a container to cover its relative parent completely, centering all child elements vertically and horizontally.',
    example: '<div className="relative w-32 h-32">\n  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">\n    Centered\n  </div>\n</div>'
  },
  {
    id: 'tw-6',
    category: 'Typography',
    name: 'Text Overflow Truncation',
    syntax: 'truncate max-w-[120px]',
    desc: 'Ensures long strings are truncated with a trailing ellipsis (...) when they exceed the defined maximum boundary limit.',
    example: '<p className="truncate max-w-[120px]">\n  ExtremelyLongTextThatWillTruncate\n</p>'
  },
  {
    id: 'tw-7',
    category: 'Interactions & Effects',
    name: 'Pulsing Status Bulb',
    syntax: 'animate-pulse bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    desc: 'Fades opacity in and out continuously. Great for indicating live servers, database connections, and active user counters.',
    example: '<span className="animate-pulse bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">\n  Live Sync\n</span>'
  },
  {
    id: 'tw-8',
    category: 'Design Systems',
    name: 'Gradient Clip Text',
    syntax: 'bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent',
    desc: 'Clips a linear gradient background into the text glyphs, creating modern, beautiful header typography.',
    example: '<h1 className="bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent font-black">\n  Gradients\n</h1>'
  },
  {
    id: 'tw-9',
    category: 'Layout & Spacing',
    name: 'Sticky Header Navbar',
    syntax: 'sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/40',
    desc: 'Locks a navigation header block to the top of the viewport during scrolls, adding translucent glass backing.',
    example: '<header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/40">\n  <nav>Navbar Links</nav>\n</header>'
  },
  {
    id: 'tw-10',
    category: 'Design Systems',
    name: 'Circular Profile Picture Frame',
    syntax: 'w-10 h-10 rounded-full object-cover border-2 border-primary/30 bg-primary/10',
    desc: 'Shapes square images into perfect round profile avatars, clipping contents and wrapping borders evenly.',
    example: '<div className="w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center">\n  User\n</div>'
  },
  {
    id: 'tw-11',
    category: 'Interactions & Effects',
    name: 'Interactive Glowing Shadow',
    syntax: 'shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-shadow hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    desc: 'Adds a soft colored outer glow shadow that deepens dynamically on hover for cards.',
    example: '<div className="shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-shadow hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]">\n  Glow\n</div>'
  }
];

const PHP_REF: ReferenceItem[] = [
  {
    id: 'php-1',
    category: 'Input Sanitization',
    name: 'Email Format Validation',
    syntax: 'filter_var($email, FILTER_VALIDATE_EMAIL)',
    desc: 'Checks if the input string represents a standard formatted email address. Returns the email if valid, otherwise returns FALSE.',
    example: '$email = "user@example.com";\nif (filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    // Valid email address\n} else {\n    // Invalid email format\n}'
  },
  {
    id: 'php-2',
    category: 'Input Sanitization',
    name: 'XSS Prevention Encoding',
    syntax: "htmlspecialchars($input, ENT_QUOTES, 'UTF-8')",
    desc: 'Converts special characters (like < and >) to HTML entities. Crucial for safely outputting user strings on web pages.',
    example: '$unsafe_input = "<script>alert(1)</script>";\n$safe_html = htmlspecialchars($unsafe_input, ENT_QUOTES, \'UTF-8\');\n// Outputs: &lt;script&gt;alert(1)&lt;/script&gt;'
  },
  {
    id: 'php-3',
    category: 'Security',
    name: 'Secure Password Hashing',
    syntax: 'password_hash($plainPassword, PASSWORD_BCRYPT)',
    desc: 'Creates a cryptographically secure, one-way bcrypt password hash with automatic dynamic salt generation. Recommended for user databases.',
    example: '$hash = password_hash("secret_password", PASSWORD_BCRYPT);\n// Store $hash (60 chars) in the password column'
  },
  {
    id: 'php-4',
    category: 'Security',
    name: 'Verify Password Hash',
    syntax: 'password_verify($password, $storedHash)',
    desc: 'Verifies that a raw text password matched the stored hash value generated by password_hash. Returns a boolean outcome.',
    example: 'if (password_verify("secret_password", $storedHash)) {\n    // Password matches, log user in\n} else {\n    // Login credentials incorrect\n}'
  },
  {
    id: 'php-5',
    category: 'Database (PDO)',
    name: 'Prepared SQL Bindings (PDO)',
    syntax: '$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");\n$stmt->execute([\'email\' => $email]);',
    desc: 'Sanitizes variables inside database queries. Protects your college project databases from malicious SQL Injection attacks.',
    example: '$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :user");\n$stmt->execute([\'user\' => $username]);\n$user = $stmt->fetch(PDO::FETCH_ASSOC);'
  },
  {
    id: 'php-6',
    category: 'Utilities & Formats',
    name: 'Safe JSON Serialization',
    syntax: 'json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)',
    desc: 'Converts PHP associative arrays/objects to JSON strings. Use json_decode($json, true) to parse JSON back into PHP arrays.',
    example: '$response = [\'status\' => \'success\', \'code\' => 200];\necho json_encode($response, JSON_PRETTY_PRINT);'
  },
  {
    id: 'php-7',
    category: 'Math Operations',
    name: 'Round Decimal Float',
    syntax: 'round($value, $decimals = 0)',
    desc: 'Rounds a floating-point number value to a specified number of decimal places (precision).',
    example: '$price = 19.9953;\necho round($price, 2);\n// Outputs: 20.00'
  },
  {
    id: 'php-8',
    category: 'Security',
    name: 'Secure Token Generation',
    syntax: 'bin2hex(random_bytes(16))',
    desc: 'Generates cryptographically secure, random bytes converted to hex. Highly useful for reset tokens or sessions.',
    example: '$token = bin2hex(random_bytes(16));\n// Outputs e.g.,: 4e9d8c3b4a2f8c1e7a...'
  },
  {
    id: 'php-9',
    category: 'Security',
    name: 'Secure Session Initialization',
    syntax: "session_start([\n    'cookie_secure' => true,\n    'cookie_httponly' => true\n]);",
    desc: 'Starts a session securely by forcing HTTPS transmission cookies and blocking JavaScript client access to the session ID.',
    example: "session_start([\n    'cookie_lifetime' => 86400,\n    'cookie_secure' => true,\n    'cookie_httponly' => true,\n    'samesite' => 'Strict'\n]);"
  },
  {
    id: 'php-10',
    category: 'Input Sanitization',
    name: 'Standard Text String Sanitizer',
    syntax: 'trim(htmlspecialchars(strip_tags($data)))',
    desc: 'Trims leading/trailing whitespace, strips raw HTML tags, and converts special characters. The gold standard for cleaning basic text inputs.',
    example: '$raw_input = "  <b>Hello & World</b>  ";\n$clean = trim(htmlspecialchars(strip_tags($raw_input)));\n// Outputs: "Hello &amp; World"'
  },
  {
    id: 'php-11',
    category: 'Input Sanitization',
    name: 'Secure File Upload Type Check',
    syntax: "in_array(mime_content_type(\$_FILES['file']['tmp_name']), ['image/jpeg', 'image/png'])",
    desc: 'Evaluates the actual binary mime-type of an uploaded file instead of trusting user-supplied extensions. Essential to block uploaded malware scripts.',
    example: "$uploaded = \$_FILES['avatar']['tmp_name'];\n$allowed = ['image/png', 'image/jpeg'];\nif (in_array(mime_content_type($uploaded), $allowed)) {\n    // Safe to upload\n}"
  },
  {
    id: 'php-12',
    category: 'Security',
    name: 'CSRF Protection Setup',
    syntax: "\$_SESSION['csrf_token'] = bin2hex(random_bytes(32));",
    desc: 'Initializes a secure random token in user session to validate incoming post forms against Cross-Site Request Forgeries.',
    example: "// Generate in PHP\n\$_SESSION['csrf_token'] = bin2hex(random_bytes(32));\n// Insert in HTML\n// <input type='hidden' name='csrf' value='<?php echo \$_SESSION[\"csrf_token\"]; ?>' />"
  },
  {
    id: 'php-13',
    category: 'Security',
    name: 'CSRF Token Validation Check',
    syntax: "hash_equals(\$_SESSION['csrf_token'], \$_POST['csrf_token'])",
    desc: 'Uses a timing-attack safe comparison operator to verify that the form token matches the initialized session token.',
    example: "if (hash_equals(\$_SESSION['csrf_token'], \$_POST['csrf'])) {\n    // Request is authorized\n} else {\n    // Unauthorized CSRF submission\n}"
  },
  {
    id: 'php-14',
    category: 'Database (PDO)',
    name: 'Establish PDO Connection',
    syntax: '$conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);',
    desc: 'Connects to a MySQL database securely using PDO. Enables modern exception-based error reporting and prepared query capabilities.',
    example: '$host = "localhost";\n$db = "college_project";\ntry {\n    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", "root", "", [\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC\n    ]);\n} catch (PDOException $e) {\n    die("Connection failed: " . $e->getMessage());\n}'
  },
  {
    id: 'php-15',
    category: 'Database (PDO)',
    name: 'Secure SQL Transaction Commit',
    syntax: '$pdo->beginTransaction();\n// queries...\n$pdo->commit();',
    desc: 'Enforces database consistency. If any query fails, you can perform a rollback to undo changes to prevent corrupted records.',
    example: "try {\n    $pdo->beginTransaction();\n    $pdo->exec(\"INSERT INTO logs (action) VALUES ('deduct')\");\n    $pdo->exec(\"UPDATE accounts SET balance = balance - 100 WHERE id = 1\");\n    $pdo->commit();\n} catch (Exception $e) {\n    $pdo->rollBack();\n    echo \"Failed: \" . $e->getMessage();\n}"
  },
  {
    id: 'php-16',
    category: 'String & Formatting',
    name: 'URL Slug Generator',
    syntax: "strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', \$text), '-'))",
    desc: 'Converts titles and headers into search-engine-friendly (SEO) slugs by stripping punctuation and inserting hyphens.',
    example: '$title = "My PHP Code reference 101!";\n$slug = strtolower(trim(preg_replace(\'/[^A-Za-z0-9-]+/\', \'-\', $title), \'-\'));\n// Outputs: "my-php-code-reference-101"'
  },
  {
    id: 'php-17',
    category: 'Date & Time',
    name: 'Unix Relative Time Ago Formatter',
    syntax: '$diff = time() - $timestamp;\n// minutes/hours logic...',
    desc: 'Calculates the difference between the current time and a past timestamp, returning a clean relative text value.',
    example: "function time_ago($timestamp) {\n    $diff = time() - $timestamp;\n    if ($diff < 60) return 'Just now';\n    if ($diff < 3600) return round($diff / 60) . ' mins ago';\n    if ($diff < 86400) return round($diff / 3600) . ' hours ago';\n    return date('Y-m-d', $timestamp);\n}"
  },
  {
    id: 'php-18',
    category: 'Utilities & Formats',
    name: 'Fetch External JSON API Payload',
    syntax: '$json = file_get_contents($url);\n$data = json_decode($json, true);',
    desc: 'Queries a web server URL endpoint directly, retrieves the raw JSON string, and parses it into a native PHP associative array.',
    example: '$url = "https://api.github.com/users/octocat";\n$opts = ["http" => ["header" => "User-Agent: PHP-Script"]];\n$context = stream_context_create($opts);\n$json = file_get_contents($url, false, $context);\n$userData = json_decode($json, true);\necho $userData["name"];'
  },
  {
    id: 'php-19',
    category: 'Security',
    name: 'CORS Headers Authorization',
    syntax: "header('Access-Control-Allow-Origin: *');\nheader('Content-Type: application/json');",
    desc: 'Sets outgoing HTTP headers to authorize frontend clients from different domains to request and read API endpoints.',
    example: "header('Access-Control-Allow-Origin: *');\nheader('Access-Control-Allow-Methods: GET, POST, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type, Authorization');\nheader('Content-Type: application/json; charset=utf-8');\n\necho json_encode(['status' => 'authorized']);"
  },
  {
    id: 'php-20',
    category: 'Security',
    name: 'HTTPS Encrypted Link Validator',
    syntax: "!empty(\$_SERVER['HTTPS']) && \$_SERVER['HTTPS'] !== 'off'",
    desc: 'Detects if the incoming browser request is encrypted securely over SSL/TLS protocol layers.',
    example: "if (!(!empty(\$_SERVER['HTTPS']) && \$_SERVER['HTTPS'] !== 'off')) {\n    // Force SSL Redirect\n    header('Location: https://' . \$_SERVER['HTTP_HOST'] . \$_SERVER['REQUEST_URI']);\n    exit;\n}"
  },
  {
    id: 'php-21',
    category: 'Arrays & Collections',
    name: 'Array Search by Value Key',
    syntax: 'array_search($needle, array_column($array, $key))',
    desc: 'Searches a multidimensional array for a specific key value and returns the parent index if located.',
    example: "$users = [\n    ['id' => 101, 'name' => 'Alice'],\n    ['id' => 202, 'name' => 'Bob']\n];\n$index = array_search(202, array_column($users, 'id'));\n// $index evaluates to 1 (Bob's entry)"
  }
];

export default function ReferenceModule() {
  const [activeTab, setActiveTab] = useState<'tailwind' | 'php'>('tailwind');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute categories based on active tab
  const categoriesList = useMemo(() => {
    const list = activeTab === 'tailwind' ? TAILWIND_REF : PHP_REF;
    const uniq = Array.from(new Set(list.map(item => item.category)));
    return ['All', ...uniq.sort()];
  }, [activeTab]);

  const activeItems = useMemo(() => {
    let list = activeTab === 'tailwind' ? TAILWIND_REF : PHP_REF;
    
    // Filter by Category
    if (selectedCategory !== 'All') {
      list = list.filter(item => item.category === selectedCategory);
    }

    // Filter by Search Query
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.syntax.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );
  }, [activeTab, selectedCategory, searchQuery]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {}
  };

  const renderTailwindPreview = (syntax: string) => {
    if (syntax.includes('justify-between')) {
      return (
        <div className="border border-border/40 bg-surface-alt/40 rounded-xl p-3 flex items-center justify-between gap-4 text-[10px] font-bold">
          <span className="text-text-primary">Info Text</span>
          <button className="px-2 py-0.5 rounded bg-primary/20 text-primary">Btn</button>
        </div>
      );
    }
    if (syntax.includes('grid-cols')) {
      return (
        <div className="grid grid-cols-3 gap-2 text-[8px] font-bold text-center">
          <div className="bg-surface-alt border border-border/40 p-2 rounded-lg text-text-primary">Col 1</div>
          <div className="bg-surface-alt border border-border/40 p-2 rounded-lg text-text-primary">Col 2</div>
          <div className="bg-surface-alt border border-border/40 p-2 rounded-lg text-text-primary">Col 3</div>
        </div>
      );
    }
    if (syntax.includes('backdrop-blur')) {
      return (
        <div className="relative h-12 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-500 overflow-hidden flex items-center justify-center p-1.5">
          <div className="bg-surface/85 border border-border/50 backdrop-blur-md shadow rounded-lg w-full h-full flex items-center justify-center text-[9px] font-bold text-white">
            Frosted Glass
          </div>
        </div>
      );
    }
    if (syntax.includes('hover:scale-105')) {
      return (
        <div className="flex justify-center py-1">
          <button className="px-4 py-1.5 rounded-xl bg-primary text-white text-[10px] font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow cursor-pointer">
            Hover/Click
          </button>
        </div>
      );
    }
    if (syntax.includes('absolute inset-0')) {
      return (
        <div className="relative h-12 bg-surface-alt border border-border/40 rounded-xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">
            Centered Overlay
          </div>
        </div>
      );
    }
    if (syntax.includes('truncate')) {
      return (
        <div className="border border-border/40 bg-surface-alt/40 rounded-xl p-3 flex items-center justify-center">
          <p className="truncate max-w-[120px] text-[10px] font-mono text-text-primary" title="VeryLongTextThatClipsCleanly">
            VeryLongTextThatClipsCleanly
          </p>
        </div>
      );
    }
    if (syntax.includes('animate-pulse')) {
      return (
        <div className="flex justify-center">
          <span className="animate-pulse bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase border border-emerald-500/20">
            ● Live Status
          </span>
        </div>
      );
    }
    if (syntax.includes('bg-gradient-to-r')) {
      return (
        <div className="text-center py-1.5">
          <span className="text-sm font-black bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
            Gradient Vibe Text
          </span>
        </div>
      );
    }
    if (syntax.includes('sticky top-0')) {
      return (
        <div className="border border-border/40 bg-surface-alt/40 rounded-xl overflow-hidden h-14">
          <div className="bg-surface/80 backdrop-blur-md border-b border-border/30 px-3 py-1 flex items-center justify-between text-[8px] font-bold">
            <span>Sticky Navbar</span>
            <span>Links</span>
          </div>
          <div className="p-2 text-[8px] text-text-muted">Scroll content area...</div>
        </div>
      );
    }
    if (syntax.includes('rounded-full object-cover')) {
      return (
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            User
          </div>
        </div>
      );
    }
    if (syntax.includes('shadow-[')) {
      return (
        <div className="flex justify-center py-1">
          <div className="px-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-border/40 text-[9px] font-bold text-text-primary shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            Glow Card
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-col gap-6 max-w-6xl w-full mx-auto p-4 text-left"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Developer Reference <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Quick-copy reference guides for web development styling, layouts, and secure scripting</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
          <button
            onClick={() => { setActiveTab('tailwind'); setSearchQuery(''); setSelectedCategory('All'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tailwind' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconPalette size={14} />
            <span>Tailwind CSS</span>
          </button>
          <button
            onClick={() => { setActiveTab('php'); setSearchQuery(''); setSelectedCategory('All'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'php' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconBrandPhp size={14} />
            <span>PHP Scripting</span>
          </button>
        </div>
      </div>

      {/* Filters Section (Search + Categories) */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'tailwind' ? 'Tailwind classes' : 'PHP methods'}...`}
            className="input-field w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-border/80 bg-surface focus:outline-none focus:border-primary"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted flex items-center gap-1 mr-1">
            <IconFilter size={11} /> Filters:
          </span>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-surface-alt text-text-secondary border-border/40 hover:text-text-primary hover:border-border/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {activeItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-4.5 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border/80"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-muted bg-surface-alt border border-border/40 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                
                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <IconSparkles size={11} className="animate-pulse" />
                  {activeTab === 'tailwind' ? 'Layout/UI' : 'Utility'}
                </span>
              </div>

              {/* Title and Detailed Description */}
              <div>
                <h3 className="text-sm font-bold text-text-primary">{item.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-1.5">
                  <strong className="text-[10px] uppercase text-text-muted mr-1.5">Description:</strong>
                  {item.desc}
                </p>
              </div>

              {/* Copy Syntax Box */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Snippet Syntax</span>
                <div className="flex items-center justify-between gap-3 bg-surface-alt/60 border border-border/60 rounded-xl px-3.5 py-3 font-mono text-[10.5px] text-text-secondary select-all break-all relative">
                  <code className="pr-10 leading-normal text-left font-semibold text-text-primary">
                    {item.syntax}
                  </code>
                  <button
                    onClick={() => handleCopy(item.id, item.syntax)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg border border-border/40 bg-surface hover:bg-surface-alt hover:text-primary transition-colors cursor-pointer"
                    title="Copy Syntax"
                  >
                    {copiedId === item.id ? (
                      <IconCheck size={13} className="text-emerald-500" />
                    ) : (
                      <IconCopy size={13} />
                    )}
                  </button>
                </div>
              </div>

              {/* Live Preview (for Tailwind) or Code Block (for PHP) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  {activeTab === 'tailwind' ? <><IconEye size={10} /> Live Visual Preview</> : 'Example Code Usage'}
                </span>

                {activeTab === 'tailwind' ? (
                  <div className="bg-surface-alt/20 border border-border/30 rounded-xl p-3.5 min-h-[60px] flex flex-col justify-center">
                    {renderTailwindPreview(item.syntax)}
                  </div>
                ) : (
                  <pre className="bg-black/10 dark:bg-black/25 border border-border/40 rounded-xl p-3.5 font-mono text-[10px] leading-relaxed text-text-secondary overflow-x-auto">
                    <code>{item.example}</code>
                  </pre>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/60 rounded-3xl bg-surface/30">
          <p className="text-xs text-text-muted italic">No matching reference items found for current filters.</p>
        </div>
      )}
    </motion.div>
  );
}
