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
        id: "jobs",
        label: "Công việc",
        icon: BriefcaseBusiness,
        href: "/dashboard/jobs",
      },
      {
        id: "levels",
        label: "Cấp bậc",
        icon: Network,
        href: "/dashboard/levels",
      },
      {
        id: "locations",
        label: "Vị trí",
        icon: MapPin,
      },
      {
        id: "repair-types",
        label: "Loại sửa chữa",
        icon: Wrench,
      },
      {
        id: "tax-rates",
        label: "Thuế suất",
        icon: Percent,
      },
      {
        id: "asset-types",
        label: "Loại tài sản",
        icon: Box,
      },
      {
        id: "asset-groups",
        label: "Nhóm tài sản",
        icon: Boxes,
      },
      {
        id: "asset-categories",
        label: "Chủng loại tài sản",
        icon: Tags,
      },
      {
        id: "units",
        label: "Đơn vị tính",
        icon: Ruler,
      },
      {
        id: "licenses",
        label: "Loại license",
        icon: KeyRound,
      },
      {
        id: "suppliers",
        label: "Nhà cung cấp",
        icon: Truck,
      },
      {
        id: "warehouses",
        label: "Kho",
        icon: Building,
      },
      {
        id: "maintenance-cycles",
        label: "Chu kỳ bảo dưỡng",
        icon: RefreshCw,
      },
      {
        id: "organization-levels",
        label: "Cấp tổ chức công ty",
        icon: GitBranch,
      },
      {
        id: "standard-parameters",
        label: "Thông số chuẩn",
        icon: SlidersHorizontal,
      },
    ],
  },
];