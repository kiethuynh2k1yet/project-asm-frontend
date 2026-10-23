"use client";

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
  openGroupId: string | null;
  onGroupClick: (id: string) => void;
  onNavigate: () => void;
};

export default function Sidebar({
  isOpen,
  openGroupId,
  onGroupClick,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <SidebarWrapper $isOpen={isOpen}>
      <CompanyLogoSection $isOpen={isOpen}>
        <Image
          src="/images/generated-image.jpg"
          alt="ASM Company Logo"
          fill
          sizes={isOpen ? "280px" : "68px"}
          priority
        />
      </CompanyLogoSection>

      <SidebarMenu aria-label="Menu chính">
        {categoryItems.map((item) => {
          const Icon = item.icon;
          const isGroupOpen = openGroupId === item.id;
          const submenuId = `submenu-${item.id}`;

          return (
            <div key={item.id}>
              <MenuGroupButton
                type="button"
                onClick={() => onGroupClick(item.id)}
                aria-label={!isOpen ? item.label : undefined}
                title={!isOpen ? item.label : undefined}
                aria-expanded={isOpen && isGroupOpen}
                aria-controls={submenuId}
                $isOpen={isOpen}
              >
                <MenuGroupLabel>
                  {item.id === "categories" && isGroupOpen ? (
                    <FolderOpen size={20} aria-hidden="true" />
                  ) : (
                    <Icon size={20} aria-hidden="true" />
                  )}

                  {isOpen && <span>{item.label}</span>}
                </MenuGroupLabel>

                {isOpen && (
                  <MenuChevron $isOpen={isGroupOpen}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </MenuChevron>
                )}
              </MenuGroupButton>

              <SubMenu
                id={submenuId}
                hidden={!isOpen || !isGroupOpen}
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
                            onClick={onNavigate}
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