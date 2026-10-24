import styled from "styled-components";

export const MobileEmployeeList = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    overflow: auto;
    padding: 10px;
  }
`;

export const EmployeeCard = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 14px;
  color: #334155;
  text-align: left;
  background: ${({ $selected }) => ($selected ? "#eff6ff" : "#ffffff")};
  border: 1px solid ${({ $selected }) => ($selected ? "#60a5fa" : "#dbe2ea")};
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const CardHeader = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardCode = styled.strong`
  min-width: 0;
  overflow-wrap: anywhere;
  color: #1e40af;
  font-size: 14px;
`;

export const CardIndex = styled.span`
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
`;

export const CardName = styled.span`
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  overflow-wrap: anywhere;
`;

export const CardDetails = styled.span`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin-top: 14px;
`;

export const CardField = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
`;

export const CardLabel = styled.span`
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
`;

export const CardValue = styled.span`
  color: #334155;
  font-size: 13px;
  overflow-wrap: anywhere;
`;

export const EmptyState = styled.p`
  margin: 0;
  padding: 32px 16px;
  color: #64748b;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
`;
