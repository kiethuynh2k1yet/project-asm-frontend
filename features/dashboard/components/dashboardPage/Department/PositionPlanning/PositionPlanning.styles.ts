import styled from "styled-components";

export const Page = styled.main`
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  padding: 14px;
  background: #edf2f5;
  color: #334155;

  &,
  & * {
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    gap: 13px;
    padding: 16px 12px max(26px, env(safe-area-inset-bottom));
  }
`;

export const PageHeading = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-wrap: wrap;

    > div {
      min-width: 0;
    }
  }
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 26px;
  font-weight: 700;

  @media (max-width: 640px) {
    font-size: 21px;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

export const Subtitle = styled.p`
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;

  @media (max-width: 640px) {
    max-width: 240px;
    font-size: 12px;
  }
`;

const ButtonBase = `
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 13px;
  border: 1px solid transparent;
  border-radius: 7px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const FormControl = `
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #172033;
  font: inherit;
  font-size: 14px;

  &:disabled {
    background: #f8fafc;
    color: #64748b;
  }
`;

export const PrimaryButton = styled.button`
  ${ButtonBase}
  background: #1769d2;
  color: #fff;

  &:hover:not(:disabled) {
    background: #1158b6;
  }

  @media (max-width: 640px) {
    ${PageHeading} > & {
      min-height: 36px;
      padding: 7px 10px;
    }
  }
`;

export const SecondaryButton = styled.button`
  ${ButtonBase}
  border-color: #cbd5e1;
  background: #fff;
  color: #334155;

  &:hover:not(:disabled) {
    background: #f1f5f9;
  }
`;

export const DangerButton = styled.button`
  ${ButtonBase}
  border-color: #fecaca;
  background: #fff;
  color: #c2413b;

  &:hover:not(:disabled) {
    background: #fff1f2;
  }
`;

export const Notice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  background: #ecfdf5;
  color: #065f46;
  font-size: 14px;

  &[data-variant="error"] {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  &[data-variant="warning"] {
    border-color: #fcd34d;
    background: #fffbeb;
    color: #92400e;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
`;

export const FilterCard = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr)) minmax(240px, 1.4fr);
  align-items: end;
  gap: 13px;
  padding: 16px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 11px;
    padding: 13px;
  }
`;

export const Field = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;

  b {
    color: #dc2626;
  }

  select,
  input {
    ${FormControl}
  }

  textarea {
    ${FormControl}
    min-height: 180px;
    resize: vertical;
    line-height: 1.5;
  }
`;

export const SearchField = styled.form<{ $compact?: boolean }>`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;

  input {
    ${FormControl}
    border-radius: 6px 0 0 6px;
  }

  @media (max-width: 1100px) {
    grid-column: 1 / -1;
  }

  @media (max-width: 640px) {
    grid-column: auto;
  }
`;

export const SearchControl = styled.div`
  display: flex;
  min-width: 0;

  input {
    min-width: 0;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 12px;
    border: 1px solid #1769d2;
    border-radius: 0 6px 6px 0;
    background: #1769d2;
    color: #fff;
    cursor: pointer;
  }
`;

export const TreeSelect = styled.div`
  position: relative;
  min-width: 0;
`;

export const TreeSelectButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #172033;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }

  span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const TreeDismiss = styled.button`
  position: fixed;
  z-index: 20;
  inset: 0;
  border: 0;
  background: transparent;
`;

export const TreePopup = styled.div`
  position: absolute;
  z-index: 21;
  top: calc(100% + 4px);
  left: 0;
  width: max(100%, 280px);
  max-height: 300px;
  overflow: auto;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
`;

export const TreeRow = styled.div`
  display: flex;
  min-height: 32px;
  align-items: center;
`;

export const TreeToggle = styled.button`
  display: inline-flex;
  width: 24px;
  height: 28px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 19px;
  cursor: pointer;
`;

export const TreeSpacer = styled.span`
  display: inline-flex;
  width: 24px;
  height: 28px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 19px;
`;

export const TreeChoice = styled.button<{ $selected?: boolean }>`
  display: flex;
  min-height: 30px;
  flex: 1;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  border: 0;
  border-radius: 5px;
  background: ${({ $selected }) => ($selected ? "#eff6ff" : "transparent")};
  color: ${({ $selected }) => ($selected ? "#1d4ed8" : "#334155")};
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #eff6ff;
    color: #1d4ed8;
  }
`;

export const TreeCode = styled.span`
  color: #64748b;
  font-family: ui-monospace, monospace;
`;

export const ListCard = styled.section`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

export const Total = styled.span`
  color: #64748b;
  font-size: 13px;
`;

export const TableScroll = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
`;

export const PlanTable = styled.table`
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: #334155;
  font-size: 13px;
  text-align: left;

  th,
  td {
    height: 40px;
    padding: 9px 12px;
    overflow: hidden;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
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

  th:last-child,
  td:last-child {
    border-right: none;
  }

  td {
    color: #334155;
  }

  tbody tr[tabindex] {
    cursor: pointer;

    &:hover {
      background: #f8fbff;
    }
  }
`;

export const PlanRow = styled.tr<{ $selected?: boolean }>`
  background: ${({ $selected }) => ($selected ? "#eff6ff" : "#fff")};

  &:hover {
    background: ${({ $selected }) => ($selected ? "#eff6ff" : "#f8fbff")};
  }
`;

export const EmptyCell = styled.td`
  && {
    height: 140px;
    color: #64748b;
    text-align: center;
    white-space: normal;
  }
`;

export const StatusBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#dcfce7" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#166534" : "#475569")};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

export const Pagination = styled.footer`
  display: flex;
  min-height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;

    > div {
      align-self: flex-end;
    }
  }
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PaginationButton = styled.button`
  min-height: 32px;
  padding: 5px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 40;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(15, 23, 42, 0.5);

  @media (max-width: 640px) {
    padding: 0;
  }
`;

export const Modal = styled.section`
  display: flex;
  width: min(1050px, 100%);
  height: min(850px, calc(100vh - 44px));
  height: min(850px, calc(100dvh - 44px));
  max-height: calc(100vh - 44px);
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);

  @media (max-width: 640px) {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
`;

export const ModalHeader = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0;
    font-size: 19px;
  }

  @media (max-width: 640px) {
    padding: max(13px, env(safe-area-inset-top)) 15px 13px;

    h2 {
      font-size: 16px;
    }
  }
`;

export const ModalAlert = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 12px 16px 0;
  padding: 9px 11px;
  border: 1px solid #a7f3d0;
  border-radius: 7px;
  background: #ecfdf5;
  color: #065f46;
  font-size: 13px;

  &[data-error="true"] {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  button {
    display: inline-flex;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

export const ModalBody = styled.div`
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 210px minmax(0, 1fr);
  overflow: hidden;

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
  }
`;

export const SectionNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;

  @media (max-width: 640px) {
    flex: 0 0 auto;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
    border-right: 0;
    border-bottom: 1px solid #e2e8f0;
  }
`;

export const NavButton = styled.button<{ $active?: boolean }>`
  max-width: 100%;
  padding: 10px;
  border: 1px solid ${({ $active }) => ($active ? "#bfdbfe" : "transparent")};
  border-radius: 7px;
  background: ${({ $active }) => ($active ? "#eff6ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#1d4ed8" : "#475569")};
  font: inherit;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? "#eff6ff" : "#eef2f7")};
  }

  @media (max-width: 640px) {
    max-width: 170px;
    flex: 0 0 auto;
    padding: 8px;
    font-size: 12px;
  }
`;

export const ModalContent = styled.div`
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 20px;

  @media (max-width: 640px) {
    min-height: 0;
    padding: 14px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 13px;
  }
`;

export const ModalFooter = styled.footer`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 20px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 11px 13px max(11px, env(safe-area-inset-bottom));

    > span {
      max-width: 100px;
    }
  }
`;

export const FooterActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    ${PrimaryButton},
    ${SecondaryButton} {
      padding: 7px 9px;
      font-size: 12px;
    }
  }
`;

export const InnerTabs = styled.div`
  display: flex;
  gap: 3px;
  overflow-x: auto;
  margin: -4px 0 16px;
  border-bottom: 1px solid #e2e8f0;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 0 0 auto;
  padding: 9px 12px;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? "#1769d2" : "transparent")};
  background: transparent;
  color: ${({ $active }) => ($active ? "#1769d2" : "#64748b")};
  font: inherit;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;

  @media (max-width: 640px) {
    padding: 9px;
    font-size: 12px;
  }
`;

export const ChildPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ChildHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const ChildTitle = styled.h3`
  margin: 0;
  font-size: 15px;
`;

export const ChildDescription = styled.p`
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
`;

export const EmptyInline = styled.p`
  margin: 0;
  padding: 25px 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
`;

export const ChildRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
`;

export const SpecSummary = styled.div`
  grid-column: 1 / -1;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
`;

export const RemoveRow = styled.button`
  display: inline-flex;
  width: 32px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;

  &:hover {
    background: #fef2f2;
  }
`;

export const DeviceRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(180px, 1.3fr) minmax(130px, 0.7fr) minmax(190px, 1fr) 34px;
  align-items: end;
  gap: 10px;
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  ${Field} {
    min-width: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) 34px;

    ${SpecSummary} {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) 34px;

    ${Field} {
      grid-column: 1;
    }

    ${RemoveRow} {
      grid-column: 2;
      grid-row: 1;
      align-self: center;
    }

    ${SpecSummary} {
      grid-column: 1 / -1;
    }
  }
`;

export const LicenseRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(130px, 0.7fr) 34px;
  align-items: end;
  gap: 10px;
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) 34px;
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) 34px;

    ${Field} {
      grid-column: 1;
    }

    ${RemoveRow} {
      grid-column: 2;
      grid-row: 1;
      align-self: center;
    }
  }
`;

export const HiddenFile = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;

export const UploadNote = styled.div`
  input {
    ${FormControl}
    min-height: 34px;
    max-width: 380px;
  }
`;

export const PendingFiles = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const PendingFileRow = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 6px;
  background: #eff6ff;
  color: #334155;
  font-size: 13px;

  span {
    margin-left: auto;
    color: #64748b;
    font-size: 12px;
  }

  button {
    display: inline-flex;
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }
`;

export const AttachmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Attachment = styled.article`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 9px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const AttachmentThumb = `
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  overflow: hidden;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
`;

export const ImageThumb = styled.a`
  ${AttachmentThumb}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const FileThumb = styled.a`${AttachmentThumb}`;

export const AttachmentInfo = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;

  a {
    overflow: hidden;
    color: #1d4ed8;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: #64748b;
    font-size: 11px;
  }
`;
