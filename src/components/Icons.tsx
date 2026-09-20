import {
  Wrench, Droplets, Zap, Wind, Sparkles, Hammer, PaintRoller,
  WashingMachine, Scissors, Star, Shield, Clock, CheckCircle2,
  Search, MapPin, Calendar, Phone, Mail, User, Menu, X, ArrowRight,
  ArrowLeft, Plus, Edit, Trash2, TrendingUp, DollarSign, Users,
  Settings, LogOut, Home, ChevronRight, ChevronDown, Filter,
  Star as StarIcon, Award, BadgeCheck, AlertCircle, Loader2,
  CheckCircle, XCircle, Clock3, Wallet, LayoutDashboard, UserCog,
  ClipboardList, BarChart3, Eye, EyeOff, Package, Heart,
  ChevronLeft, Bell, Search as SearchIcon, Lightbulb, Briefcase,
  Home as HomeIcon, Filter as FilterIcon, MoreVertical, Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Wrench, Droplets, Zap, Wind, Sparkles, Hammer, PaintRoller,
  WashingMachine, Scissors,
};

export function getServiceIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Wrench;
}

export {
  Wrench, Droplets, Zap, Wind, Sparkles, Hammer, PaintRoller,
  WashingMachine, Scissors, Star, Shield, Clock, CheckCircle2,
  Search, MapPin, Calendar, Phone, Mail, User, Menu, X, ArrowRight,
  ArrowLeft, Plus, Edit, Trash2, TrendingUp, DollarSign, Users,
  Settings, LogOut, Home, ChevronRight, ChevronDown, Filter,
  StarIcon, Award, BadgeCheck, AlertCircle, Loader2,
  CheckCircle, XCircle, Clock3, Wallet, LayoutDashboard, UserCog,
  ClipboardList, BarChart3, Eye, EyeOff, Package, Heart,
  ChevronLeft, Bell, SearchIcon, Lightbulb, Briefcase,
  HomeIcon, FilterIcon, MoreVertical, Download,
};
