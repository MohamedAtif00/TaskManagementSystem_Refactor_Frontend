import { UserRole } from './user-role';

export interface MenuItem {
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  items: Array<SubMenuItem>;
}

export interface SubMenuItem {
  icon?: string;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
  roles?: UserRole[];
  permissions?: string[];
  /** When false, hidden from top navbar Overview/Work dropdowns. Default true. */
  showInNavbar?: boolean;
  /** When false, hidden from sidebar and mobile nav. Default true. */
  showInSidebar?: boolean;
}
