import {
  FolderClosed,
  BriefcaseBusiness,
  Network,
  MapPin,
  Wrench,
  Percent,
  Box,
  Boxes,
  Tags,
  Ruler,
  KeyRound,
  Truck,
  Building,
  RefreshCw,
  GitBranch,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";

export type CategoryItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Route;
  children?: CategoryItem[];
};

export const categoryItems: CategoryItem[] = [
  {
    id: "categories",
    label: "Danh mục",
    icon: FolderClosed,
    children: [
      {
        id: "works",
        label: "Công việc",
        icon: BriefcaseBusiness,
        href: "/dashboard/Category/works",
      },
      {
        id: "levels",
        label: "Cấp bậc",
        icon: Network,
        href: "/dashboard/Category/ranks",
      },
      {
        id: "locations",
        label: "Vị trí",
        icon: MapPin,
        // href: "/dashboard/Category/locations",
      },
      {
        id: "repair-types",
        label: "Loại sửa chữa",
        icon: Wrench,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "tax-rates",
        label: "Thuế suất",
        icon: Percent,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "asset-types",
        label: "Loại tài sản",
        icon: Box,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "asset-groups",
        label: "Nhóm tài sản",
        icon: Boxes,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "asset-categories",
        label: "Chủng loại tài sản",
        icon: Tags,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "units",
        label: "Đơn vị tính",
        icon: Ruler,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "licenses",
        label: "Loại license",
        icon: KeyRound,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "suppliers",
        label: "Nhà cung cấp",
        icon: Truck,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "warehouses",
        label: "Kho",
        icon: Building,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "maintenance-cycles",
        label: "Chu kỳ bảo dưỡng",
        icon: RefreshCw,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "organization-levels",
        label: "Cấp tổ chức công ty",
        icon: GitBranch,
        // href: "/dashboard/Category/levels",
      },
      {
        id: "standard-parameters",
        label: "Thông số chuẩn",
        icon: SlidersHorizontal,
        // href: "/dashboard/Category/levels",
      },
    ],
  },
];