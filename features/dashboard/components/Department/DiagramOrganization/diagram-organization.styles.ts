import styled from "styled-components";

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 14px;
  background: #edf2f5;
  color: #1e293b;

  &,
  & * {
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    gap: 10px;
    padding: 10px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;

  h1 {
    margin: 0;
    color: #0f172a;
    font-size: 21px;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 13px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const ActionButton = styled.button<{
  $primary?: boolean;
  $subtle?: boolean;
  $variant?: "edit" | "cancel";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  background: ${({ $primary, $subtle, $variant }) =>
    $primary
      ? "#2563eb"
      : $variant === "edit"
        ? "#f97316"
        : $variant === "cancel"
          ? "#dc2626"
          : $subtle
            ? "#fff"
            : "#eff6ff"};
  color: ${({ $primary, $variant }) =>
    $primary || $variant ? "#fff" : "#1d4ed8"};
  border: 1px solid
    ${({ $primary, $variant }) =>
      $primary
        ? "#2563eb"
        : $variant === "edit"
          ? "#f97316"
          : $variant === "cancel"
            ? "#dc2626"
            : "#bfdbfe"};
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(0.97);
  }

  &:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }
`;

export const Workspace = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: minmax(280px, 34%) minmax(0, 1fr);
  gap: 14px;
  min-height: 0;

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(240px, 38%) minmax(360px, 1fr);
    overflow-y: auto;
  }
`;

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
`;

export const SearchInput = styled.input`
  width: calc(100% - 28px);
  height: 37px;
  margin: 12px 14px 4px;
  padding: 0 11px;
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;

export const TreeScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 12px 16px;
`;

export const TreeList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const TreeItem = styled.li`
  position: relative;
  margin: 0;
  padding: 3px 0 3px 19px;
  border-left: 1px solid #cbd5e1;

  &:last-child {
    border-left-color: transparent;
  }

  &::before {
    position: absolute;
    top: 20px;
    left: 0;
    width: 14px;
    border-top: 1px solid #cbd5e1;
    content: "";
  }
`;

export const TreeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const ExpandButton = styled.button`
  display: inline-flex;
  flex: 0 0 22px;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 26px;
  padding: 0;
  background: transparent;
  color: #64748b;
  border: 0;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

export const TreeNodeButton = styled.button<{ $selected: boolean }>`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  min-height: 36px;
  padding: 5px 9px;
  background: ${({ $selected }) => ($selected ? "#dbeafe" : "transparent")};
  color: #334155;
  border: 1px solid
    ${({ $selected }) => ($selected ? "#93c5fd" : "transparent")};
  border-radius: 6px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#dbeafe" : "#f8fafc")};
  }
`;

export const NodeText = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;

  strong {
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    overflow: hidden;
    color: #64748b;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Badge = styled.span<{ $inactive?: boolean }>`
  flex: 0 0 auto;
  padding: 3px 7px;
  background: ${({ $inactive }) => ($inactive ? "#f1f5f9" : "#dcfce7")};
  color: ${({ $inactive }) => ($inactive ? "#64748b" : "#166534")};
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
`;

export const ToggleField = styled.label`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  padding: 0 15px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 600;

  input {
    width: 16px;
    height: 16px;
    accent-color: #2563eb;
  }
`;

export const FormScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 18px;

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 14px;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 600;

  input,
  select {
    width: 100%;
    height: 39px;
    padding: 0 10px;
    background: #fff;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font: inherit;
    font-size: 13px;
    font-weight: 400;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  input:disabled,
  select:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

export const DissolveField = styled.label`
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 0 11px;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;

  input {
    width: 16px;
    height: 16px;
    accent-color: #ea580c;
  }
`;

export const Message = styled.p<{ $error?: boolean }>`
  margin: 12px 16px;
  padding: 10px 12px;
  background: ${({ $error }) => ($error ? "#fef2f2" : "#f8fafc")};
  color: ${({ $error }) => ($error ? "#b91c1c" : "#64748b")};
  border: 1px solid ${({ $error }) => ($error ? "#fecaca" : "#e2e8f0")};
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
`;

export const EmptySelection = styled.div`
  display: grid;
  min-height: 220px;
  place-items: center;
  padding: 24px;
  color: #64748b;
  text-align: center;
  font-size: 14px;
`;
