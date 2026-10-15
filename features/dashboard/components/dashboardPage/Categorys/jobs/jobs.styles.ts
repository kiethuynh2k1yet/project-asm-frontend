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
  font-family: Arial, sans-serif;

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

  font-family: inherit;
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