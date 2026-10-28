import styled from "styled-components";

export const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
  user-select: none;
`;

export const AvatarButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;

export const Menu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 54px;
  right: 0;
  width: 240px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 100;

  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-8px)"};
  transition: all 0.15s ease;
`;

export const UserInfo = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
`;

export const UserName = styled.p`
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

export const UserEmail = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ContainerButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
`;

export const LogoutButton = styled.button`
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  &:hover {
    color: #b91c1c;
  }
`;
