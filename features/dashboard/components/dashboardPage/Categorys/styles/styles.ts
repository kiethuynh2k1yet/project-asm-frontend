import styled from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 14px;

  background: #edf2f5;
  color: #334155;

  &,
  & * {
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    gap: 10px;
    padding: 10px;
  }
`;

export const ToolbarSection = styled.section`
  flex-shrink: 0;
  min-width: 0;
`;

export const TableSection = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
  min-height: 0;
  overflow: hidden;

  background: #ffffff;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
`;

export const TableScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 760px;
  table-layout: fixed;

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

  th:first-child,
  td:first-child {
    width: 65px;
    text-align: center;
  }

  td:first-child {
    color: #64748b;
  }

  th:last-child,
  td:last-child {
    border-right: none;
  }

`;

export const TableRow = styled.tr<{ $selected: boolean }>`
  background: ${({ $selected }) =>
    $selected ? "#dbeafe" : "#ffffff"};

  cursor: pointer;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "#dbeafe" : "#f8fafc"};
  }
`;

export const SelectJobButton = styled.button`
  display: block;
  width: 100%;
  padding: 0;

  background: transparent;
  color: inherit;
  border: none;

  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 3px;
    border-radius: 2px;
  }
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 4px 10px;
  border-radius: 20px;

  background: ${({ $active }) =>
    $active ? "#dcfce7" : "#f1f5f9"};

  color: ${({ $active }) =>
    $active ? "#166534" : "#475569"};

  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
`;

export const EmptyCell = styled.td`
  && {
    height: 140px;
    color: #64748b;
    text-align: center;
    white-space: normal;
  }
`;

export const TableFooter = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  min-height: 48px;
  padding: 8px 12px;

  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

export const Total = styled.div`
  color: #64748b;
  font-size: 12px;

  span {
    color: #334155;
    font-weight: 600;
  }
`;

export const Pagination = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PageInfo = styled.span`
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
`;

export const PageButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 30px;
  padding: 0 10px;

  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 5px;

  font-size: 12px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #eff6ff;
    color: #2563eb;
    border-color: #93c5fd;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  margin: 10px 0 0;
  padding: 10px 12px;

  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 6px;

  font-size: 13px;
  line-height: 1.5;
`;

export const ModalStyles = {
  Dialog: styled.dialog`
    width: min(640px, calc(100% - 32px));
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 0;
    overflow: auto;
    background: #ffffff;
    color: #1e293b;
    border: none;
    border-radius: 10px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);

    &,
    & * {
      box-sizing: border-box;
    }

    &::backdrop {
      background: rgba(15, 23, 42, 0.45);
    }
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 22px;
  `,
  Title: styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  `,
  CloseButton: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    color: #64748b;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
  `,
  Form: styled.form`
    margin: 0;
  `,
  Body: styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 22px;
    background: #eef2f6;
    border-radius: 8px;
  `,
  Field: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  Label: styled.label`
    color: #1e293b;
    font-size: 14px;
    font-weight: 600;
  `,
  Required: styled.span`
    color: #dc2626;
  `,
  Input: styled.input`
    width: 100%;
    height: 42px;
    padding: 0 12px;
    background: #ffffff;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;

    &::placeholder {
      color: #94a3b8;
    }

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }
  `,
  Select: styled.select`
    width: 100%;
    height: 42px;
    padding: 0 12px;
    background: #ffffff;
    color: #1e293b;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }
  `,
  Hint: styled.span`
    color: #64748b;
    font-size: 12px;
  `,
  Error: styled.p`
    margin: 0;
    padding: 10px 12px;
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    border-radius: 6px;
    font-size: 13px;
  `,
  Footer: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 22px;
    background: #ffffff;
  `,
  CancelButton: styled.button`
    min-height: 38px;
    padding: 0 16px;
    background: #ffffff;
    color: #475569;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: #f1f5f9;
    }

    &:focus-visible {
      outline: 2px solid #60a5fa;
      outline-offset: 2px;
    }
  `,
  SaveButton: styled.button`
    min-height: 38px;
    padding: 0 16px;
    background: #2563eb;
    color: #ffffff;
    border: 1px solid #2563eb;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid #60a5fa;
      outline-offset: 2px;
    }
  `,
};