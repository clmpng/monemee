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
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  MoreHorizontal,
  
  // Finanzen & Statistiken
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  DollarSign,
  CircleDollarSign,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  
  // Level & Gamification
  Sprout,
  Star,
  Rocket,
  Gem,
  Crown,
  Award,
  Trophy,
  Zap,
  Sparkles,
  
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
  LogOut,
  LogIn,
  Send,
  Reply,
  Archive,
  
  // Status & Feedback
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
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
  Inbox,
  
  // Social & Users
  Users,
  User,
  UserPlus,
  Heart,
  ThumbsUp,
  Briefcase,
  
  // Security
  Shield,
  ShieldCheck,
  
  // Misc
  Calendar,
  Clock,
  Tag,
  Filter,
  RefreshCw,
  Loader2,
  PartyPopper,
  SearchX,
  ShoppingBag,
  Camera,
  Mail,
  Lock,
  Unlock,
  Palette
} from 'lucide-react';

// ============================================
// ZENTRALE ICON-KONFIGURATION
// ============================================
export const ICON_CONFIG = {
  strokeWidth: 1.5,
  sizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32
  },
  defaultSize: 'md'
};

// Icon-Mapping
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
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  
  // Finanzen & Statistiken
  wallet: Wallet,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  receipt: Receipt,
  creditCard: CreditCard,
  dollar: DollarSign,
  dollarCircle: CircleDollarSign,
  piggyBank: PiggyBank,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  
  // Level & Gamification
  sprout: Sprout,
  star: Star,
  rocket: Rocket,
  gem: Gem,
  crown: Crown,
  award: Award,
  trophy: Trophy,
  zap: Zap,
  sparkles: Sparkles,
  
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
  logout: LogOut,
  login: LogIn,
  send: Send,
  reply: Reply,
  archive: Archive,
  
  // Status & Feedback
  check: Check,
  checkCircle: CheckCircle,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  info: Info,
  helpCircle: HelpCircle,
  eye: Eye,
  eyeOff: EyeOff,
  
  // Content & Dateien
  fileText: FileText,
  file: File,
  package: Package,
  video: Video,
  music: Music,
  image: Image,
  folderOpen: FolderOpen,
  inbox: Inbox,
  
  // Social & Users
  users: Users,
  user: User,
  userPlus: UserPlus,
  heart: Heart,
  thumbsUp: ThumbsUp,
  briefcase: Briefcase,
  
  // Security
  shield: Shield,
  shieldCheck: ShieldCheck,
  
  // Misc
  calendar: Calendar,
  clock: Clock,
  tag: Tag,
  filter: Filter,
  refresh: RefreshCw,
  loader: Loader2,
  partyPopper: PartyPopper,
  party: PartyPopper,
  searchX: SearchX,
  shoppingBag: ShoppingBag,
  camera: Camera,
  mail: Mail,
  lock: Lock,
  unlock: Unlock,
  palette: Palette
};

/**
 * Icon Component
 * Unified icon component using Lucide React
 */
export function Icon({ 
  name, 
  size = ICON_CONFIG.defaultSize, 
  strokeWidth = ICON_CONFIG.strokeWidth,
  className = '',
  style = {},
  ...props 
}) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  // Get numeric size
  const numericSize = typeof size === 'number' 
    ? size 
    : ICON_CONFIG.sizes[size] || ICON_CONFIG.sizes.md;
  
  return (
    <IconComponent 
      size={numericSize}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...props}
    />
  );
}

export default Icon;
