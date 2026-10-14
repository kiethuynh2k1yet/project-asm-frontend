"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { FolderOpen, ChevronRight } from "lucide-react";

import { categoryItems } from "./categoryIteam";

import {
  SidebarWrapper,
  CompanyLogoSection,
  SidebarMenu,
  MenuGroupButton,
  MenuGroupLabel,
  MenuChevron,
  SubMenu,
  SubMenuList,
  SubMenuItem,
  SubMenuItemLink,
} from "./sidebar.styles";

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  // Danh mục mặc định đóng.
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id)
        ? prev.filter((groupId) => groupId !== id)
        : [...prev, id]
    );
  };

  return (
    <SidebarWrapper $isOpen={isOpen}>
      <CompanyLogoSection>
        <Image
          src="/images/generated-image.jpg"
          alt="ASM Company Logo"
          fill
          sizes="280px"
          priority
        />
      </CompanyLogoSection>

      <SidebarMenu aria-label="Menu chính">
        {categoryItems.map((item) => {
          const Icon = item.icon;
          const isGroupOpen = openGroups.includes(item.id);
          const submenuId = `submenu-${item.id}`;

          return (
            <div key={item.id}>
              <MenuGroupButton
                type="button"
                onClick={() => toggleGroup(item.id)}
                aria-expanded={isGroupOpen}
                aria-controls={submenuId}
              >
                <MenuGroupLabel>
                  {item.id === "categories" && isGroupOpen ? (
                    <FolderOpen size={20} aria-hidden="true" />
                  ) : (
                    <Icon size={20} aria-hidden="true" />
                  )}

                  <span>{item.label}</span>
                </MenuGroupLabel>

                <MenuChevron $isOpen={isGroupOpen}>
                  <ChevronRight size={18} aria-hidden="true" />
                </MenuChevron>
              </MenuGroupButton>

              <SubMenu
                id={submenuId}
                hidden={!isGroupOpen}
              >
                <SubMenuList>
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;

                    const isActive = Boolean(
                      child.href &&
                        (pathname === child.href ||
                          pathname.startsWith(`${child.href}/`))
                    );

                    return (
                      <li key={child.id}>
                        {child.href ? (
                          <SubMenuItemLink
                            href={child.href}
                            $isActive={isActive}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <ChildIcon
                              size={19}
                              aria-hidden="true"
                            />

                            <span>{child.label}</span>
                          </SubMenuItemLink>
                        ) : (
                          <SubMenuItem
                            type="button"
                            $isActive={false}
                            disabled
                            title="Chưa tạo trang"
                          >
                            <ChildIcon
                              size={19}
                              aria-hidden="true"
                            />

                            <span>{child.label}</span>
                          </SubMenuItem>
                        )}
                      </li>
                    );
                  })}
                </SubMenuList>
              </SubMenu>
            </div>
          );
        })}
      </SidebarMenu>
    </SidebarWrapper>
  );
}