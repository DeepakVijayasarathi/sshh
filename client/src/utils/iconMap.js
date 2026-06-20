import React from 'react';
import {
  LayoutDashboard, Users, Calendar, Newspaper, Image, Building2,
  GraduationCap, Heart, MessageSquare, Bell, BarChart2,
  Activity, Settings, Globe, BookOpen, Crown, UserCog,
  ShieldCheck, List, GitBranch, Home, Info, Award, Phone,
  Link2, Briefcase, X,
} from 'lucide-react';

const MAP = {
  LayoutDashboard, Users, Calendar, Newspaper, Image, Building2,
  GraduationCap, Heart, MessageSquare, Bell, BarChart2,
  Activity, Settings, Globe, BookOpen, Crown, UserCog,
  ShieldCheck, List, GitBranch, Home, Info, Award, Phone,
  Link2, Briefcase,
};

export const ICON_NAMES = Object.keys(MAP);

export const IconComponent = ({ name, size = 17, style }) => {
  const Icon = MAP[name] || List;
  return <Icon size={size} style={{ flexShrink: 0, ...style }} />;
};

export default MAP;
