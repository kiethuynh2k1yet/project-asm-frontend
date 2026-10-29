import styled, { css } from "styled-components";

const assetModalControlStyles = css`
  width: 100%;
  height: 42px;
  min-width: 0;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #1e293b;
  font: inherit;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const Page = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 14px;
  overflow: hidden;
  background: #edf2f5;
  color: #334155;
  font-size: 13px;

  &,
  & * {
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    gap: 10px;
    padding: 10px;
  }
`;
export const Toolbar = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  width: 100%;
  padding: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);

`;
export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
`;
export const Button = styled.button<{
  $tone?: "blue" | "yellow" | "red" | "green";
  $outline?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid
    ${({ $tone, $outline }) =>
      $outline
        ? $tone === "green"
          ? "#16a34a"
          : "#2563eb"
        : $tone === "yellow"
          ? "#f97316"
          : $tone === "red"
            ? "#dc2626"
            : "#2563eb"};
  border-radius: 7px;
  background: ${({ $tone, $outline }) =>
    $outline
      ? "#fff"
      : $tone === "yellow"
        ? "#f97316"
        : $tone === "red"
          ? "#dc2626"
          : "#2563eb"};
  color: ${({ $outline }) => ($outline ? "#2563eb" : "#fff")};
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(0.94);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
export const Spacer = styled.div`
  display: none;
`;
export const Chosen = styled.div`
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;

  @media (max-width: 480px) {
    width: 100%;
    margin-left: 0;
  }
`;
export const Filters = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(125px, 1fr)) minmax(210px, 1.5fr);
  gap: 12px;
  flex: 1;
  width: 100%;
  min-width: 0;
  max-width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(120px, 1fr)) minmax(200px, 1.4fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;
export const Filter = styled.label`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
`;
export const SearchField = styled(Filter)``;
export const Label = styled.span`
  color: #000;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
`;
export const Select = styled.select`
  width: 100%;
  height: 38px;
  min-width: 0;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;
export const Input = styled.input`
  width: 100%;
  height: 38px;
  min-width: 0;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: #fff;
  color: #334155;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;
export const SearchLine = styled.div`
  display: flex;
  gap: 6px;
`;
export const ErrorMessage = styled.div`
  padding: 10px 12px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
`;
export const TablePanel = styled.section`
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
`;
export const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;
export const Table = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #334155;
  font-size: 13px;

  th,
  td {
    height: 40px;
    padding: 9px 12px;
    overflow: hidden;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 42px;
    background: #f1f5f9;
    color: #1e293b;
    border-bottom-color: #cbd5e1;
    font-size: 12px;
    font-weight: 700;
  }

  tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background: #f8fafc;
  }

  tbody tr.selected {
    background: #dbeafe;
  }

  input[type="checkbox"] {
    accent-color: #2563eb;
  }

  .empty {
    height: 140px;
    color: #64748b;
    text-align: center;
  }

  .qr {
    color: #64748b;
    font-size: 20px;
    text-align: center;
  }

  th:nth-child(1),
  td:nth-child(1) {
    position: sticky;
    left: 0;
    z-index: 2;
    background: #fff;
    text-align: center;
  }

  th:nth-child(1) {
    z-index: 3;
    background: #f1f5f9;
  }

  tbody tr.selected td:nth-child(1) {
    background: #dbeafe;
  }
`;
export const Badge = styled.span<{ $tone?: "blue" | "red" | "gray" | "green" }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ $tone = "blue" }) =>
    ({
      blue: "#dbeafe",
      red: "#fee2e2",
      gray: "#e5e7eb",
      green: "#16a34a",
    })[$tone]};
  color: ${({ $tone = "blue" }) =>
    ({
      blue: "#1d4ed8",
      red: "#b91c1c",
      gray: "#4b5563",
      green: "#ffffff",
    })[$tone]};
  font-size: 11px;
  font-weight: 600;
`;
export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;

  nav {
    display: flex;
    align-items: center;
    gap: 9px;
  }
`;
export const PageButton = styled.button`
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
export const Overlay = styled.div`
  display: none;
`;
export const Dialog = styled.form`
  width: min(1280px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: 18px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
`;
export const ModalHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: #1e293b;
    font-size: 18px;
  }

  button {
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }
`;
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;
export const FormField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
`;
export const Textarea = styled.textarea`
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #1e293b;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;
export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;
export const AssetModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.45);
`;

export const AssetModalDialog = styled.form`
  display: flex;
  flex-direction: column;
  width: min(1280px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  overflow: hidden;
  background: #fff;
  color: #1e293b;
  border: 0;
  border-radius: 10px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
`;

export const AssetModalTopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 58px;
  padding: 18px 22px;
  background: #fff;
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
`;

export const AssetModalClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AssetModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: auto;
  padding: 22px;
  background: #eef2f6;
`;
export const AssetModalSection = styled.section`
  margin: 0;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #fff;
`;

export const AssetModalPanel = styled.section`
  margin: 0;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #fff;
`;

export const AssetModalPanelTitle = styled.h3`
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
`;

export const AssetModalTechnicalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 16px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const AssetModalTechnicalField = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;

  > span {
    display: flex;
    min-height: 20px;
    align-items: center;
    gap: 6px;
  }

  b {
    color: #dc2626;
  }
`;

export const AssetModalPanelActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  color: #64748b;
  font-size: 13px;

  label {
    display: inline-flex;
    cursor: pointer;
  }

  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const AssetModalFileInput = styled.input`
  display: none;
`;

export const AssetModalFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 16px;
`;

export const AssetModalFileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;

  button {
    border: 0;
    background: transparent;
    color: #dc2626;
    cursor: pointer;
  }
`;

export const AssetModalSectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
`;

export const AssetModalStep = styled.span`
  display: none;
`;

export const AssetModalStepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const AssetModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
  padding: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const AssetModalField = styled.label`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 4px;
  row-gap: 8px;
  min-width: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;

  &:has(textarea) {
    grid-column: 1 / -1;
  }

  b {
    grid-column: 2;
    grid-row: 1;
    color: #dc2626;
    font-weight: 700;
  }

  input,
  select,
  textarea,
  small {
    grid-column: 1 / -1;
  }
`;

export const AssetModalWideField = styled(AssetModalField)`
  grid-column: 1 / -1;
`;

export const AssetModalControl = styled.input`
  ${assetModalControlStyles}
`;

export const AssetModalInputWithSuffix = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  > input {
    flex: 1;
    min-width: 0;
  }

  > span {
    flex: 0 0 auto;
    white-space: nowrap;
    font-weight: 400;
  }
`;

export const AssetModalSelect = styled.select`
  ${assetModalControlStyles}
  appearance: auto;
  cursor: pointer;
`;

export const AssetModalTextarea = styled.textarea`
  ${assetModalControlStyles}
  height: auto;
  min-height: 84px;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
`;

export const AssetModalHint = styled.small`
  color: #64748b;
  font-size: 12px;
  font-weight: 400;
`;

export const AssetModalTabs = styled.nav`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  min-height: 40px;
  overflow-x: auto;
  border-bottom: 1px solid #cbd5e1;
`;

export const AssetModalTab = styled.button<{ $active?: boolean }>`
  padding: 10px 12px;
  border: 0;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "#2563eb" : "transparent")};
  background: transparent;
  color: ${({ $active }) => ($active ? "#1e293b" : "#2563eb")};
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
`;

export const AssetModalFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-height: 64px;
  padding: 16px 22px;
  background: #fff;

  & > span:first-child {
    margin-right: auto;
  }
`;

export const AssetModalFooterStep = styled(AssetModalStep)`
  margin-right: auto;
`;
export const AssetModalButton = styled.button<{ $primary?: boolean }>`
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid ${({ $primary }) => ($primary ? "#2563eb" : "#dc2626")};
  border-radius: 6px;
  background: ${({ $primary }) => ($primary ? "#2563eb" : "#dc2626")};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ $primary }) => ($primary ? "#1d4ed8" : "#b91c1c")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AssetModalAddButton = styled(AssetModalButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  line-height: 1;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.16);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    border-color: #1d4ed8;
    background: #1d4ed8;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.22);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.16);
    transform: translateY(0);
  }
`;
