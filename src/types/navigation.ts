// 定义导航项类型
export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  // 可选参数，用于精确匹配路径
  exact?: boolean;
  adminOnly?: boolean; // 可选参数，表示该导航项是否仅对管理员可见
  children?: NavigationItem[]; // 可选参数，允许嵌套子导航项
  // 可选参数，允许自定义点击处理，如果提供，将覆盖默认的路由导航
  onClick?: () => void;
}