import styled from "styled-components";

export const styles = {
  actionGroup: "actionGroup",
  active: "active",
  attachment: "attachment",
  attachmentGrid: "attachmentGrid",
  attachmentInfo: "attachmentInfo",
  childHeading: "childHeading",
  childPanel: "childPanel",
  childRows: "childRows",
  dangerButton: "dangerButton",
  deviceRow: "deviceRow",
  empty: "empty",
  emptyInline: "emptyInline",
  errorNotice: "errorNotice",
  eyebrow: "eyebrow",
  field: "field",
  fileThumb: "fileThumb",
  filterCard: "filterCard",
  formGrid: "formGrid",
  heading: "heading",
  hiddenFile: "hiddenFile",
  iconButton: "iconButton",
  imageThumb: "imageThumb",
  inactive: "inactive",
  innerTabs: "innerTabs",
  licenseRow: "licenseRow",
  listCard: "listCard",
  modal: "modal",
  modalAlert: "modalAlert",
  modalBackdrop: "modalBackdrop",
  modalBody: "modalBody",
  modalContent: "modalContent",
  modalError: "modalError",
  modalFooter: "modalFooter",
  modalHeader: "modalHeader",
  navActive: "navActive",
  notice: "notice",
  page: "page",
  pagination: "pagination",
  pendingFiles: "pendingFiles",
  primaryButton: "primaryButton",
  removeRow: "removeRow",
  searchControl: "searchControl",
  searchField: "searchField",
  secondaryButton: "secondaryButton",
  sectionNav: "sectionNav",
  select: "select",
  selectedRow: "selectedRow",
  specSummary: "specSummary",
  status: "status",
  subtitle: "subtitle",
  tabActive: "tabActive",
  table: "table",
  tableScroll: "tableScroll",
  toolbar: "toolbar",
  total: "total",
  treeChoice: "treeChoice",
  treeCode: "treeCode",
  treeDismiss: "treeDismiss",
  treePopup: "treePopup",
  treeRow: "treeRow",
  treeSelect: "treeSelect",
  treeSelected: "treeSelected",
  treeSpacer: "treeSpacer",
  treeToggle: "treeToggle",
  uploadNote: "uploadNote",
  warningNotice: "warningNotice",
} as const;

export const Page = styled.main`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  overflow: auto;
  padding: 24px;
  color: #172033;

  &.page {
    min-height: 0;
  }

  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .heading h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
  }

  .eyebrow {
    margin: 0 0 5px;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .subtitle {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 14px;
  }

  .primaryButton,
  .secondaryButton,
  .dangerButton {
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
  }

  .primaryButton {
    background: #1769d2;
    color: #fff;
  }

  .primaryButton:hover {
    background: #1158b6;
  }

  .secondaryButton {
    border-color: #cbd5e1;
    background: #fff;
    color: #334155;
  }

  .secondaryButton:hover:not(:disabled) {
    background: #f1f5f9;
  }

  .dangerButton {
    border-color: #fecaca;
    background: #fff;
    color: #c2413b;
  }

  .dangerButton:hover:not(:disabled) {
    background: #fff1f2;
  }

  .primaryButton:disabled,
  .secondaryButton:disabled,
  .dangerButton:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .notice {
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
  }

  .notice button,
  .iconButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .errorNotice {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .warningNotice {
    border-color: #fcd34d;
    background: #fffbeb;
    color: #92400e;
  }

  .filterCard,
  .listCard {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .filterCard {
    display: grid;
    grid-template-columns: repeat(4, minmax(140px, 1fr)) minmax(240px, 1.4fr);
    align-items: end;
    gap: 13px;
    padding: 16px;
  }

  .field {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 6px;
    color: #334155;
    font-size: 13px;
    font-weight: 600;
  }

  .field b {
    color: #dc2626;
  }

  .field select,
  .field input,
  .field textarea,
  .searchControl input,
  .uploadNote input {
    box-sizing: border-box;
    width: 100%;
    min-height: 38px;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #fff;
    color: #172033;
    font: inherit;
    font-size: 14px;
  }

  .field textarea {
    min-height: 180px;
    resize: vertical;
    line-height: 1.5;
  }

  .field select:disabled,
  .field input:disabled,
  .field textarea:disabled {
    background: #f8fafc;
    color: #64748b;
  }

  .searchControl {
    display: flex;
    min-width: 0;
  }

  .searchControl input {
    min-width: 0;
    border-radius: 6px 0 0 6px;
  }

  .searchControl button {
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

  .treeSelect {
    position: relative;
    min-width: 0;
  }

  .select {
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
  }

  .select:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }

  .select span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .treeDismiss {
    position: fixed;
    z-index: 20;
    inset: 0;
    border: 0;
    background: transparent;
  }

  .treePopup {
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
  }

  .treeRow {
    display: flex;
    min-height: 32px;
    align-items: center;
  }

  .treeToggle,
  .treeSpacer {
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
  }

  .treeToggle {
    cursor: pointer;
  }

  .treeChoice {
    display: flex;
    min-height: 30px;
    flex: 1;
    align-items: center;
    gap: 6px;
    padding: 4px 7px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: #334155;
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .treeChoice:hover,
  .treeSelected {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .treeCode {
    color: #64748b;
    font-family: ui-monospace, monospace;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .actionGroup {
    display: flex;
    gap: 8px;
  }

  .total,
  .pagination {
    color: #64748b;
    font-size: 13px;
  }

  .tableScroll {
    width: 100%;
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    text-align: left;
  }

  .table th {
    padding: 11px 14px;
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .table td {
    padding: 12px 14px;
    border-top: 1px solid #edf2f7;
    color: #334155;
  }

  .table tbody tr[tabindex] {
    cursor: pointer;
  }

  .table tbody tr[tabindex]:hover {
    background: #f8fbff;
  }

  .table .selectedRow {
    background: #eff6ff;
  }

  .empty {
    height: 96px;
    color: #64748b !important;
    text-align: center;
  }

  .status {
    display: inline-flex;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .active {
    background: #dcfce7;
    color: #166534;
  }

  .inactive {
    background: #f1f5f9;
    color: #475569;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid #e2e8f0;
  }

  .pagination div {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pagination button {
    min-height: 32px;
    padding: 5px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #fff;
    color: #334155;
    cursor: pointer;
  }

  .pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .modalBackdrop {
    position: fixed;
    z-index: 40;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 22px;
    background: rgba(15, 23, 42, 0.5);
  }

  .modal {
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
  }

  .modalHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex: 0 0 auto;
    padding: 17px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modalHeader h2 {
    margin: 0;
    font-size: 19px;
  }

  .modalAlert {
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
  }

  .modalAlert button {
    display: inline-flex;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .modalError {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .iconButton {
    width: 34px;
    height: 34px;
    border-radius: 6px;
    color: #64748b;
  }

  .iconButton:hover {
    background: #f1f5f9;
  }

  .modalBody {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: 210px minmax(0, 1fr);
    overflow: hidden;
  }

  .sectionNav {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px;
    border-right: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .sectionNav button {
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: #475569;
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .sectionNav button:hover {
    background: #eef2f7;
  }

  .sectionNav .navActive {
    border-color: #bfdbfe;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 600;
  }

  .modalContent {
    min-width: 0;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 20px;
  }

  .formGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .modalFooter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    gap: 12px;
    padding: 13px 20px;
    border-top: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 12px;
  }

  .modalFooter div {
    display: flex;
    gap: 8px;
  }

  .innerTabs {
    display: flex;
    gap: 3px;
    overflow-x: auto;
    margin: -4px 0 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .innerTabs button {
    flex: 0 0 auto;
    padding: 9px 12px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #64748b;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .innerTabs .tabActive {
    border-bottom-color: #1769d2;
    color: #1769d2;
    font-weight: 600;
  }

  .childPanel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .childHeading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .childHeading h3 {
    margin: 0;
    font-size: 15px;
  }

  .childHeading p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 12px;
  }

  .emptyInline {
    margin: 0;
    padding: 25px 12px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    color: #64748b;
    font-size: 13px;
    text-align: center;
  }

  .childRows {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .deviceRow,
  .licenseRow {
    position: relative;
    display: grid;
    grid-template-columns: minmax(180px, 1.3fr) minmax(130px, 0.7fr) minmax(190px, 1fr) 34px;
    align-items: end;
    gap: 10px;
    padding: 13px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .licenseRow {
    grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(130px, 0.7fr) 34px;
  }

  .specSummary {
    grid-column: 1 / -1;
    padding: 8px 10px;
    border-radius: 6px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }

  .removeRow {
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
  }

  .removeRow:hover {
    background: #fef2f2;
  }

  .hiddenFile {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .uploadNote input {
    min-height: 34px;
    max-width: 380px;
  }

  .pendingFiles {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pendingFiles li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    border-radius: 6px;
    background: #eff6ff;
    color: #334155;
    font-size: 13px;
  }

  .pendingFiles span {
    margin-left: auto;
    color: #64748b;
    font-size: 12px;
  }

  .pendingFiles button {
    display: inline-flex;
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }

  .attachmentGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 10px;
  }

  .attachment {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
    padding: 9px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  .imageThumb,
  .fileThumb {
    display: grid;
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    place-items: center;
    overflow: hidden;
    border-radius: 6px;
    background: #f1f5f9;
    color: #64748b;
  }

  .imageThumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .attachmentInfo {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 4px;
  }

  .attachmentInfo a {
    overflow: hidden;
    color: #1d4ed8;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attachmentInfo small {
    color: #64748b;
    font-size: 11px;
  }

  @media (max-width: 1100px) {
    .filterCard {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .searchField {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 900px) {
    .deviceRow,
    .licenseRow {
      grid-template-columns: repeat(2, minmax(0, 1fr)) 34px;
    }

    .deviceRow .specSummary {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    gap: 13px;
    padding: 16px 12px max(26px, env(safe-area-inset-bottom));

    .heading {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .heading > div {
      min-width: 0;
    }

    .heading h1 {
      font-size: 21px;
    }

    .subtitle {
      max-width: 240px;
      font-size: 12px;
    }

    .heading > .primaryButton {
      min-height: 36px;
      padding: 7px 10px;
    }

    .filterCard {
      grid-template-columns: 1fr;
      gap: 11px;
      padding: 13px;
    }

    .searchField {
      grid-column: auto;
    }

    .toolbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .actionGroup {
      width: 100%;
    }

    .actionGroup button {
      flex: 1;
    }

    .table {
      min-width: 760px;
    }

    .pagination {
      align-items: flex-start;
      flex-direction: column;
    }

    .pagination div {
      align-self: flex-end;
    }

    .modalBackdrop {
      padding: 0;
    }

    .modal {
      width: 100%;
      height: 100vh;
      max-height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      border-radius: 0;
    }

    .modalHeader {
      flex: 0 0 auto;
      padding: max(13px, env(safe-area-inset-top)) 15px 13px;
    }

    .modalHeader h2 {
      font-size: 16px;
    }

    .modalBody {
      display: flex;
      flex-direction: column;
    }

    .sectionNav {
      flex: 0 0 auto;
      flex-direction: row;
      overflow-x: auto;
      padding: 8px;
      border-right: 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .sectionNav button {
      max-width: 170px;
      flex: 0 0 auto;
      padding: 8px;
      font-size: 12px;
    }

    .modalContent {
      min-height: 0;
      overscroll-behavior: contain;
      padding: 14px;
    }

    .formGrid {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    .modalFooter {
      flex: 0 0 auto;
      align-items: flex-end;
      padding: 11px 13px max(11px, env(safe-area-inset-bottom));
    }

    .modalFooter > span {
      max-width: 100px;
    }

    .modalFooter .primaryButton,
    .modalFooter .secondaryButton {
      padding: 7px 9px;
      font-size: 12px;
    }

    .innerTabs button {
      padding: 9px;
      font-size: 12px;
    }

    .childHeading {
      align-items: flex-start;
      flex-direction: column;
    }

    .deviceRow,
    .licenseRow {
      grid-template-columns: minmax(0, 1fr) 34px;
    }

    .deviceRow .field,
    .licenseRow .field {
      grid-column: 1;
    }

    .removeRow {
      grid-column: 2;
      grid-row: 1;
      align-self: center;
    }

    .specSummary {
      grid-column: 1 / -1 !important;
    }

    .attachmentGrid {
      grid-template-columns: 1fr;
    }
  }
`;
