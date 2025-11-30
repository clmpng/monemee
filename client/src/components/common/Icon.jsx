import React from 'react';
import {
  // Navigation
  Store,
  BarChart3,
  Megaphone,
  MessageCircle,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  
  // Finanzen & Statistiken
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  DollarSign,
  CircleDollarSign,
  PiggyBank,
  
  // Level & Gamification
  Sprout,
  Star,
  Rocket,
  Gem,
  Crown,
  Award,
  Trophy,
  Zap,
  
  // Aktionen
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Download,
  Upload,
  Link,
  ExternalLink,
  
  // Status & Feedback
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  
  // Content & Dateien
  FileText,
  File,
  Package,
  Video,
  Music,
  Image,
  FolderOpen,
  
  // Social & Users
  Users,
  User,
  UserPlus,
  Heart,
  ThumbsUp,
  
  // Misc
  Calendar,
  Clock,
  Tag,
  Filter,
  RefreshCw,
  Loader2,
  PartyPopper,
  SearchX,
  ShoppingBag
} from 'lucide-react';

// ============================================
// ZENTRALE ICON-KONFIGURATION
// Hier kannst du globale Einstellungen ändern
// ============================================
export const ICON_CONFIG = {
  // Standard Stroke-Breite (1 = dünn, 2 = normal, 3 = dick)
  strokeWidth: 1.5,
  
  // Standard-Größen in Pixel
  sizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32
  },
  
  // Standard-Größe wenn keine angegeben
  defaultSize: 'md'
};

// Icon-Mapping für einfachen Zugriff
const iconMap = {
  // Navigation
  store: Store,
  chart: BarChart3,
  megaphone: Megaphone,
  message: MessageCircle,
  settings: Settings,
  bell: Bell,
  search: Search,
  menu: Menu,
  close: X,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  moreVertical: MoreVertical,
  
  // Finanzen & Statistiken
  wallet: Wallet,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  receipt: Receipt,
  creditCard: CreditCard,
  dollar: DollarSign,
  dollarCircle: CircleDollarSign,
  piggyBank: PiggyBank,
  
  // Level & Gamification
  sprout: Sprout,
  star: Star,
  rocket: Rocket,
  gem: Gem,
  crown: Crown,
  award: Award,
  trophy: Trophy,
  zap: Zap,
  
  // Aktionen
  plus: Plus,
  edit: Edit,
  trash: Trash2,
  copy: Copy,
  share: Share2,
  download: Download,
  upload: Upload,
  link: Link,
  externalLink: ExternalLink,
  
  // Status & Feedback
  check: Check,
  checkCircle: CheckCircle,
  alert: AlertCircle,
  info: Info,
  help: HelpCircle,
  eye: Eye,
  eyeOff: EyeOff,
  
  // Content & Dateien
  fileText: FileText,
  file: File,
  package: Package,
  video: Video,
  music: Music,
  image: Image,
  folder: FolderOpen,
  
  // Social & Users
  users: Users,
  user: User,
  userPlus: UserPlus,
  heart: Heart,
  thumbsUp: ThumbsUp,
  
  // Misc
  calendar: Calendar,
  clock: Clock,
  tag: Tag,
  filter: Filter,
  refresh: RefreshCw,
  loader: Loader2,
  party: PartyPopper,
  searchX: SearchX,
  shoppingBag: ShoppingBag
};

/**
 * Zentrale Icon-Komponente
 * 
 * @param {string} name - Icon-Name (z.B. 'store', 'wallet', 'star')
 * @param {string} size - Größe: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' oder Zahl
 * @param {number} strokeWidth - Überschreibt globale strokeWidth
 * @param {string} className - Zusätzliche CSS-Klassen
 * @param {string} color - Icon-Farbe (CSS-Wert)
 */
function Icon({ 
  name, 
  size = ICON_CONFIG.defaultSize, 
  strokeWidth = ICON_CONFIG.strokeWidth,
  className = '',
  color,
  ...props 
}) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  // Größe ermitteln (String oder Zahl)
  const pixelSize = typeof size === 'number' 
    ? size 
    : ICON_CONFIG.sizes[size] || ICON_CONFIG.sizes.md;
  
  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      {...props}
    />
  );
}

// Exportiere auch die Raw-Icons für spezielle Fälle
export { iconMap };
export default Icon;