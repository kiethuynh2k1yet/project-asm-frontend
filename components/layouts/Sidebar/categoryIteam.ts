import {
  FolderClosed,
  BriefcaseBusiness,
  Building2,
  Layers3,
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

export type CategoryChildItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Route;
};

export type CategoryItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Route;
  children?: CategoryChildItem[];
};

export const categoryItems: CategoryItem[] = [
  {
    id: "departments",
    label: "Phòng Ban",
    icon: Building2,
    children: [
      {
        id: "room-types",
        label: "Loại phòng ban",
        icon: Layers3,
        href: "/dashboard/Department/room-types",
      },
      {
        id: "diagram-organization",
        label: "Sơ đồ tổ chức",
        icon: GitBranch,
        href: "/dashboard/Department/diagram-organization",
      },
    ],
  },
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
        href: "/dashboard/Category/locations",
      },
      {
        id: "repair-types",
        label: "Loại sửa chữa",
        icon: Wrench,
        href: "/dashboard/Category/repair-types",
      },
      {
        id: "tax-rates",
        label: "Thuế suất",
        icon: Percent,
        href: "/dashboard/Category/taxs",
      },
      {
        id: "asset-types",
        label: "Loại tài sản",
        icon: Box,
        href: "/dashboard/Category/asset-types",
      },
      {
        id: "asset-groups",
        label: "Nhóm tài sản",
        icon: Boxes,
        href: "/dashboard/Category/asset-groups",
      },
      {
        id: "asset-categories",
        label: "Chủng loại tài sản",
        icon: Tags,
        href: "/dashboard/Category/asset-categorys",
      },
      {
        id: "units",
        label: "Đơn vị tính",
        icon: Ruler,
        href: "/dashboard/Category/units",
      },
      {
        id: "licenses",
        label: "Loại license",
        icon: KeyRound,
        href: "/dashboard/Category/licenses",
      },
      {
        id: "suppliers",
        label: "Nhà cung cấp",
        icon: Truck,
        href: "/dashboard/Category/suppliers",
      },
      {
        id: "warehouses",
        label: "Kho",
        icon: Building,
        href: "/dashboard/Category/warehouses",
      },
      {
        id: "maintenance-cycles",
        label: "Chu kỳ bảo dưỡng",
        icon: RefreshCw,
        href: "/dashboard/Category/maintenance-cycles",
      },
      {
        id: "organization-levels",
        label: "Cấp tổ chức công ty",
        icon: GitBranch,
        href: "/dashboard/Category/organization-levels",
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