"use client";

import {
  useRef,
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
} from "react";
import { FilePlus2, ImagePlus, Plus, Trash2, Upload, X } from "lucide-react";
import type { Asset, Lookups } from "../list-of-assets";
import {
  AssetModalBody,
  AssetModalAddButton,
  AssetModalButton,
  AssetModalClose,
  AssetModalControl,
  AssetModalDialog,
  AssetModalField,
  AssetModalFooter,
  AssetModalGrid,
  AssetModalHint,
  AssetModalInputWithSuffix,
  AssetModalPanel,
  AssetModalPanelActions,
  AssetModalPanelTitle,
  AssetModalTechnicalField,
  AssetModalTechnicalGrid,
  AssetModalOverlay,
  AssetModalSection,
  AssetModalSectionTitle,
  AssetModalSelect,
  AssetModalStep,
  AssetModalStepRow,
  AssetModalTab,
  AssetModalTabs,
  AssetModalTextarea,
  AssetModalTopBar,
} from "../list-of-assets.styles";
import {
  AttachmentTable,
  AttachmentTableScroll,
  ChildDescription,
  ChildHeading,
  ChildPanel,
  ChildTitle,
  FilePicker,
  FilePickerButton,
  FilePickerName,
  HiddenFile,
  UploadFields,
  UploadField,
  UploadPanel,
  UploadSubmit,
} from "../../../Department/PositionPlanning/PositionPlanning.styles";

type AssetFormModalProps = {
  editing: Asset | null;
  lookups: Lookups;
  busy: boolean;
  formError: string;
  onClose: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

type StandardSpecification = {
  id: number;
  code: string;
  name: string;
  cpu_chip: string;
  ram: string;
  ssd: string;
  gpu: string;
  monitor: string;
};

type LicenseRow = {
  rowId: number;
  licenseId: number | "";
  code: string;
  name: string;
  statusId: number | "";
};

type LicenseOption = {
  id: number;
  code: string;
  name: string;
};

type PartAssetOption = {
  id: number;
  code: string;
  name: string;
  unitId: number | null;
  unitName: string;
};

type PartRow = {
  rowId: number;
  assetId: number | "";
  code: string;
  name: string;
  unitName: string;
  quantity: string;
  note: string;
};

const value = (input: string | number | null | undefined) =>
  input === null || input === undefined ? "" : String(input);

export default function AssetFormModal({
  editing,
  lookups,
  busy,
  formError,
  onClose,
  onSubmit,
}: AssetFormModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedUnitId, setSelectedUnitId] = useState(
    value(editing?.unit_id),
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [otherImages, setOtherImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [attachmentNote, setAttachmentNote] = useState("");
  const [imageNote, setImageNote] = useState("");
  const [standardSpecifications, setStandardSpecifications] = useState<
    StandardSpecification[]
  >([]);
  const [selectedStandardId, setSelectedStandardId] = useState("");
  const [technicalValues, setTechnicalValues] = useState({
    cpu_chip: "",
    ram: "",
    ssd: "",
    gpu: "",
    monitor: "",
  });
  const [licenseRows, setLicenseRows] = useState<LicenseRow[]>([]);
  const [licenseOptions, setLicenseOptions] = useState<LicenseOption[]>([]);
  const [licenseStatuses, setLicenseStatuses] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [partOptions, setPartOptions] = useState<PartAssetOption[]>([]);
  const [partRows, setPartRows] = useState<PartRow[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/dashboard/ITASM/position-plans/options", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const values = (data as { specifications?: unknown }).specifications;
        if (!Array.isArray(values)) return;

        setStandardSpecifications(
          values
            .filter(
              (item): item is Record<string, unknown> =>
                typeof item === "object" && item !== null,
            )
            .map((item) => ({
              id: Number(item.id),
              code: String(item.code ?? ""),
              name: String(item.name ?? ""),
              cpu_chip: String(item.cpu_chip ?? ""),
              ram: String(item.ram ?? ""),
              ssd: String(item.ssd ?? ""),
              gpu: String(item.gpu ?? ""),
              monitor: String(item.monitor ?? ""),
            })),
        );
      })
      .catch(() => {
        if (!cancelled) setStandardSpecifications([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const partsGroup = lookups.groups.find(
      (group) => {
        const groupName = group.name.trim().toLocaleLowerCase("vi-VN");
        return groupName.includes("linh kiện") && groupName.includes("máy");
      },
    );
    if (!partsGroup) return;
    void fetch("/api/dashboard/master-data/assets", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const options = data
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === "object" && item !== null,
          )
          .filter((item) => Number(item.asset_group_id) === partsGroup.id)
          .map((item) => {
            const unitId = Number(item.unit_id);
            const unit = lookups.units.find((candidate) => candidate.id === unitId);
            return {
              id: Number(item.id),
              code: String(item.asset_code ?? ""),
              name: String(item.asset_name ?? ""),
              unitId: Number.isFinite(unitId) ? unitId : null,
              unitName: unit?.name ?? "",
            };
          });
        setPartOptions(options);
      })
      .catch(() => {
        if (!cancelled) setPartOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [lookups.groups, lookups.units]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetch("/api/dashboard/master-data/licenses", { cache: "no-store" }),
      fetch("/api/dashboard/statuses", { cache: "no-store" }),
    ])
      .then(async ([licensesResponse, statusesResponse]) => {
        const licenses: unknown = await licensesResponse.json();
        const statuses: unknown = await statusesResponse.json();
        if (cancelled || !Array.isArray(licenses)) return;

        const statusOptions = (Array.isArray(statuses) ? statuses : [])
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === "object" &&
              item !== null &&
              Number(item.parent_id) === 2,
          )
          .map((item) => ({
            id: Number(item.id),
            name: String(item.status_name ?? ""),
          }));

        setLicenseOptions(
          licenses
            .filter(
              (item): item is Record<string, unknown> =>
                typeof item === "object" && item !== null,
            )
            .map((item) => ({
              id: Number(item.id),
              code: String(item.license_code ?? ""),
              name: String(item["license-types_name"] ?? ""),
            })),
        );
        setLicenseStatuses(statusOptions);
      })
      .catch(() => {
        if (!cancelled) {
          setLicenseOptions([]);
          setLicenseStatuses([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectStandard = (id: string) => {
    setSelectedStandardId(id);
    const specification = standardSpecifications.find(
      (item) => String(item.id) === id,
    );

    setTechnicalValues({
      cpu_chip: specification?.cpu_chip ?? "",
      ram: specification?.ram ?? "",
      ssd: specification?.ssd ?? "",
      gpu: specification?.gpu ?? "",
      monitor: specification?.monitor ?? "",
    });
  };

  const addLicenseRow = () => {
    setLicenseRows((current) => [
      ...current,
      {
        rowId: Date.now() + current.length,
        licenseId: "",
        code: "",
        name: "",
        statusId: "",
      },
    ]);
  };

  const selectLicense = (rowId: number, licenseId: string) => {
    const option = licenseOptions.find((item) => String(item.id) === licenseId);
    setLicenseRows((current) =>
      current.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              licenseId: option?.id ?? "",
              code: option?.code ?? "",
              name: option?.name ?? "",
            }
          : row,
      ),
    );
  };

  const addPartRow = () => {
    setPartRows((current) => [
      ...current,
      {
        rowId: Date.now() + current.length,
        assetId: "",
        code: "",
        name: "",
        unitName: "",
        quantity: "1",
        note: "",
      },
    ]);
  };

  const selectPart = (rowId: number, assetId: string) => {
    const option = partOptions.find((part) => String(part.id) === assetId);
    setPartRows((current) =>
      current.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              assetId: option?.id ?? "",
              code: option?.code ?? "",
              name: option?.name ?? "",
              unitName: option?.unitName ?? "",
            }
          : row,
      ),
    );
  };

  const tabs = [
    { id: "general", label: "Thông tin chung" },
    { id: "license", label: "Thông tin loại license" },
    { id: "technical", label: "Thông số kỹ thuật" },
    { id: "parts", label: "Phụ tùng linh kiện" },
    { id: "maintenance", label: "Bảo dưỡng định kì" },
    { id: "repair", label: "Sửa chữa kế hoạch" },
    { id: "network", label: "Thông tin mạng" },
    { id: "attachments", label: "Tệp đính kèm" },
    { id: "other", label: "Khác" },
  ];

  const selectFiles = (
    event: ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<File[]>>,
  ) => {
    setter(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const uploadFiles = (
    files: File[],
    note: string,
    setter: Dispatch<SetStateAction<File[]>>,
    clearNote: Dispatch<SetStateAction<string>>,
  ) => {
    if (!files.length) return;
    setter((current) => [...current, ...files]);
    clearNote("");
  };

  return (
    <AssetModalOverlay
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <AssetModalDialog onSubmit={onSubmit}>
        <AssetModalTopBar>
          <AssetModalStep>1</AssetModalStep>
          <span>
            {editing
              ? "Sửa tài sản thiết bị/phần mềm"
              : "Thêm tài sản thiết bị/phần mềm"}
          </span>
          <AssetModalClose
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Đóng"
          >
            <X size={16} />
          </AssetModalClose>
        </AssetModalTopBar>
        <AssetModalBody>
          <AssetModalSection>
            <AssetModalSectionTitle>
              <AssetModalStep>2</AssetModalStep>
              Thông tin tài sản
            </AssetModalSectionTitle>
            <AssetModalGrid>
              <AssetModalField>
                Mã thiết bị <b>*</b>
                <AssetModalControl
                  name="asset_code"
                  defaultValue={value(editing?.asset_code)}
                  maxLength={30}
                  placeholder="VSN000007"
                />
                <AssetModalHint>
                  Có thể sửa; lưu xong không sửa được mã
                </AssetModalHint>
              </AssetModalField>
              <AssetModalField>
                Tên thiết bị <b>*</b>
                <AssetModalControl
                  name="asset_name"
                  defaultValue={value(editing?.asset_name)}
                  maxLength={255}
                  placeholder="VD: Máy vi tính bàn"
                />
              </AssetModalField>
              <AssetModalField>
                Tên khác
                <AssetModalControl
                  name="asset_name_other"
                  defaultValue={value(editing?.asset_name_other)}
                />
              </AssetModalField>
              <AssetModalField>
                Trạng thái
                <AssetModalSelect
                  name="asset_status_id"
                  defaultValue={value(editing?.asset_status_id)}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {lookups.assetStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status_name}
                    </option>
                  ))}
                </AssetModalSelect>
              </AssetModalField>
              <AssetModalField>
                Nguyên giá
                <AssetModalInputWithSuffix>
                  <AssetModalControl
                    name="original_price"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      editing?.original_price == null
                        ? ""
                        : editing.original_price.toLocaleString("vi-VN")
                    }
                  />
                  <span>
                    {lookups.units.find(
                      (unit) => String(unit.id) === selectedUnitId,
                    )?.symbol ?? ""}
                  </span>
                </AssetModalInputWithSuffix>
              </AssetModalField>
              <AssetModalField>
                Số lượng
                <AssetModalControl
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={value(editing?.quantity ?? 1)}
                />
              </AssetModalField>
              <AssetModalField>
                Mã QR
                <AssetModalControl
                  name="qr_code"
                  defaultValue={value(editing?.qr_code)}
                  maxLength={16}
                />
              </AssetModalField>
              <AssetModalField>
                Mã tài sản kế toán
                <AssetModalControl
                  name="accounting_asset_code"
                  defaultValue={value(editing?.accounting_asset_code)}
                  maxLength={16}
                />
              </AssetModalField>
            </AssetModalGrid>
          </AssetModalSection>
          <AssetModalStepRow>
            <AssetModalStep>3</AssetModalStep>
            <AssetModalTabs aria-label="Nhóm thông tin tài sản">
              {tabs.map((tab) => (
                <AssetModalTab
                  key={tab.id}
                  type="button"
                  $active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </AssetModalTab>
              ))}
            </AssetModalTabs>
          </AssetModalStepRow>
          <AssetModalSection hidden={activeTab !== "general"}>
            <AssetModalSectionTitle>
              <AssetModalStep>4</AssetModalStep>
              Thông tin chung
            </AssetModalSectionTitle>
            <AssetModalGrid>
              <AssetModalField>
                Đơn vị tính <b>*</b>
                <AssetModalSelect
                  name="unit_id"
                  value={selectedUnitId}
                  onChange={(event) => setSelectedUnitId(event.target.value)}
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {lookups.units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </AssetModalSelect>
              </AssetModalField>
              <AssetModalField>
                Loại tài sản <b>*</b>
                <AssetModalSelect
                  name="asset_type_id"
                  defaultValue={value(editing?.asset_type_id)}
                >
                  <option value="">-- Chọn loại tài sản --</option>
                  {lookups.types.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </AssetModalSelect>
              </AssetModalField>
              <AssetModalField>
                Nhóm tài sản <b>*</b>
                <AssetModalSelect
                  name="asset_group_id"
                  defaultValue={value(editing?.asset_group_id)}
                >
                  <option value="">-- Chọn nhóm tài sản --</option>
                  {lookups.groups.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </AssetModalSelect>
              </AssetModalField>
              <AssetModalField>
                Chủng loại <b>*</b>
                <AssetModalSelect
                  name="asset_category_id"
                  defaultValue={value(editing?.asset_category_id)}
                >
                  <option value="">-- Chọn chủng loại --</option>
                  {lookups.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </AssetModalSelect>
              </AssetModalField>
              <AssetModalField>
                Model
                <AssetModalControl
                  name="model"
                  defaultValue={value(editing?.model)}
                />
              </AssetModalField>
              <AssetModalField>
                Serial
                <AssetModalControl
                  name="serial"
                  defaultValue={value(editing?.serial)}
                />
              </AssetModalField>
              <AssetModalField>
                Ngày sử dụng
                <AssetModalControl
                  name="used_date"
                  type="date"
                  defaultValue={editing?.used_date?.slice(0, 10) ?? ""}
                />
              </AssetModalField>
              <AssetModalField>
                Ghi chú
                <AssetModalControl
                  name="note"
                  defaultValue={value(editing?.note)}
                  maxLength={255}
                />
              </AssetModalField>
              <AssetModalField>
                Mô tả chức năng
                <AssetModalTextarea
                  name="function_description"
                  defaultValue={value(editing?.function_description)}
                  maxLength={255}
                  rows={2}
                />
              </AssetModalField>
            </AssetModalGrid>
          </AssetModalSection>
          {activeTab === "license" && (
            <AssetModalPanel>
              <AssetModalPanelTitle>Thông tin license</AssetModalPanelTitle>
              <AssetModalPanelActions>
                <span />
                <AssetModalAddButton type="button" onClick={addLicenseRow}>
                  <Plus size={15} />
                  Thêm
                </AssetModalAddButton>
              </AssetModalPanelActions>
              <AttachmentTableScroll>
                <AttachmentTable>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã loại license</th>
                      <th>Tên loại license</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseRows.map((license, index) => (
                      <tr key={license.rowId}>
                        <td>{index + 1}</td>
                        <td>{license.code}</td>
                        <td>
                          <AssetModalSelect
                            name={index === 0 ? "license_type_id" : undefined}
                            value={license.licenseId}
                            onChange={(event) =>
                              selectLicense(license.rowId, event.target.value)
                            }
                          >
                            <option value="">-- Chọn loại license --</option>
                            {licenseOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </AssetModalSelect>
                        </td>
                        <td>
                          <AssetModalSelect
                            name={`license_status_id_${license.rowId}`}
                            value={license.statusId}
                            onChange={(event) =>
                              setLicenseRows((current) =>
                                current.map((row) =>
                                  row.rowId === license.rowId
                                    ? {
                                        ...row,
                                        statusId: event.target.value
                                          ? Number(event.target.value)
                                          : "",
                                      }
                                    : row,
                                ),
                              )
                            }
                          >
                            <option value="">-- Chọn trạng thái --</option>
                            {licenseStatuses.map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.name}
                              </option>
                            ))}
                          </AssetModalSelect>
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label="Xóa license"
                            onClick={() =>
                              setLicenseRows((current) =>
                                current.filter(
                                  (item) => item.rowId !== license.rowId,
                                ),
                              )
                            }
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                    {licenseRows.length === 0 && (
                      <tr>
                        <td colSpan={5}>Chưa có thông tin license.</td>
                      </tr>
                    )}
                  </tbody>
                </AttachmentTable>
              </AttachmentTableScroll>
            </AssetModalPanel>
          )}
          {activeTab === "technical" && (
            <AssetModalPanel>
              <AssetModalPanelTitle>Thông số kỹ thuật</AssetModalPanelTitle>
              <AssetModalTechnicalGrid>
                <AssetModalTechnicalField>
                  <span>
                    Mã chuẩn <b>*</b>
                  </span>
                  <AssetModalSelect
                    name="standard_specification_id"
                    value={selectedStandardId}
                    onChange={(event) => selectStandard(event.target.value)}
                  >
                    <option value="">-- Chọn mã chuẩn --</option>
                    {standardSpecifications.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </AssetModalSelect>
                </AssetModalTechnicalField>
                <AssetModalTechnicalField>
                  <span>CPU / Chip</span>
                  <AssetModalControl
                    name="cpu_chip"
                    value={technicalValues.cpu_chip}
                    onChange={(event) =>
                      setTechnicalValues((current) => ({
                        ...current,
                        cpu_chip: event.target.value,
                      }))
                    }
                  />
                </AssetModalTechnicalField>
                <AssetModalTechnicalField>
                  <span>RAM</span>
                  <AssetModalControl
                    name="ram"
                    value={technicalValues.ram}
                    onChange={(event) =>
                      setTechnicalValues((current) => ({
                        ...current,
                        ram: event.target.value,
                      }))
                    }
                  />
                </AssetModalTechnicalField>
                <AssetModalTechnicalField>
                  <span>SSD</span>
                  <AssetModalControl
                    name="ssd"
                    value={technicalValues.ssd}
                    onChange={(event) =>
                      setTechnicalValues((current) => ({
                        ...current,
                        ssd: event.target.value,
                      }))
                    }
                  />
                </AssetModalTechnicalField>
                <AssetModalTechnicalField>
                  <span>GPU</span>
                  <AssetModalControl
                    name="gpu"
                    value={technicalValues.gpu}
                    onChange={(event) =>
                      setTechnicalValues((current) => ({
                        ...current,
                        gpu: event.target.value,
                      }))
                    }
                  />
                </AssetModalTechnicalField>
                <AssetModalTechnicalField>
                  <span>Màn hình</span>
                  <AssetModalControl
                    name="monitor"
                    value={technicalValues.monitor}
                    onChange={(event) =>
                      setTechnicalValues((current) => ({
                        ...current,
                        monitor: event.target.value,
                      }))
                    }
                  />
                </AssetModalTechnicalField>
              </AssetModalTechnicalGrid>
            </AssetModalPanel>
          )}
          {activeTab === "parts" && (
            <AssetModalPanel>
              <AssetModalPanelTitle>Phụ tùng linh kiện kèm theo</AssetModalPanelTitle>
              <AssetModalPanelActions>
                <span />
                <AssetModalAddButton type="button" onClick={addPartRow}>
                  <Plus size={15} />
                  Thêm dòng
                </AssetModalAddButton>
              </AssetModalPanelActions>
              <AttachmentTableScroll>
                <AttachmentTable>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã phụ tùng</th>
                      <th>Tên phụ tùng</th>
                      <th>Đơn vị tính</th>
                      <th>Số lượng</th>
                      <th>Ghi chú</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partRows.map((part, index) => (
                      <tr key={part.rowId}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{part.code}</strong>
                        </td>
                        <td>
                          <AssetModalSelect
                            name={`part_asset_id_${part.rowId}`}
                            value={part.assetId}
                            onChange={(event) =>
                              selectPart(part.rowId, event.target.value)
                            }
                          >
                            <option value="">-- Chọn tên phụ tùng --</option>
                            {partOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </AssetModalSelect>
                        </td>
                        <td>{part.unitName}</td>
                        <td>
                          <AssetModalControl
                            name={`part_quantity_${part.rowId}`}
                            type="number"
                            min={1}
                            value={part.quantity}
                            onChange={(event) =>
                              setPartRows((current) =>
                                current.map((row) =>
                                  row.rowId === part.rowId
                                    ? { ...row, quantity: event.target.value }
                                    : row,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <AssetModalControl
                            name={`part_note_${part.rowId}`}
                            value={part.note}
                            onChange={(event) =>
                              setPartRows((current) =>
                                current.map((row) =>
                                  row.rowId === part.rowId
                                    ? { ...row, note: event.target.value }
                                    : row,
                                ),
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label="Xóa phụ tùng"
                            onClick={() =>
                              setPartRows((current) =>
                                current.filter((row) => row.rowId !== part.rowId),
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {partRows.length === 0 && (
                      <tr>
                        <td colSpan={7}>Chưa có phụ tùng linh kiện.</td>
                      </tr>
                    )}
                  </tbody>
                </AttachmentTable>
              </AttachmentTableScroll>
              {partOptions.length === 0 && (
                <p style={{ margin: "10px 16px 14px", fontSize: 12 }}>
                  Chưa có tài sản thuộc nhóm “Linh kiện máy”.
                </p>
              )}
            </AssetModalPanel>
          )}
          {["maintenance", "repair", "network"].includes(activeTab) && (
            <AssetModalPanel>
              <AssetModalPanelTitle>
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </AssetModalPanelTitle>
              <AssetModalPanelActions>
                <span>Chưa có thông tin.</span>
                <AssetModalAddButton type="button">
                  <Plus size={15} />
                  Thêm
                </AssetModalAddButton>
              </AssetModalPanelActions>
            </AssetModalPanel>
          )}
          {activeTab === "attachments" && (
            <ChildPanel>
              <ChildHeading>
                <div>
                  <ChildTitle>Tệp đính kèm</ChildTitle>
                  <ChildDescription>Tối đa 20 MB mỗi tệp.</ChildDescription>
                </div>
              </ChildHeading>
              <UploadPanel>
                <UploadFields>
                  <UploadField>
                    <span>
                      Chọn tệp <b>*</b>
                    </span>
                    <FilePicker>
                      <FilePickerButton
                        type="button"
                        onClick={() => fileInput.current?.click()}
                      >
                        <FilePlus2 size={15} />
                        Chọn tệp
                      </FilePickerButton>
                      <FilePickerName
                        title={selectedFiles
                          .map((file) => file.name)
                          .join(", ")}
                      >
                        {selectedFiles.map((file) => file.name).join(", ") ||
                          "Chưa chọn tệp"}
                      </FilePickerName>
                      <HiddenFile
                        ref={fileInput}
                        type="file"
                        multiple
                        onChange={(event) =>
                          selectFiles(event, setSelectedFiles)
                        }
                      />
                    </FilePicker>
                  </UploadField>
                  <UploadField>
                    <span>Ghi chú</span>
                    <input
                      value={attachmentNote}
                      onChange={(event) =>
                        setAttachmentNote(event.target.value)
                      }
                      placeholder="Nhập ghi chú..."
                    />
                  </UploadField>
                  <UploadSubmit
                    type="button"
                    disabled={!selectedFiles.length}
                    onClick={() =>
                      uploadFiles(
                        selectedFiles,
                        attachmentNote,
                        setAttachments,
                        setAttachmentNote,
                      )
                    }
                  >
                    <Upload size={15} /> Tải lên
                  </UploadSubmit>
                </UploadFields>
                {attachments.length === 0 ? (
                  <p>Chưa có tệp đính kèm.</p>
                ) : (
                  <AttachmentTableScroll>
                    <AttachmentTable>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tên tệp</th>
                          <th>Loại</th>
                          <th>Dung lượng</th>
                          <th>Ghi chú</th>
                          <th>Ngày tải</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attachments.map((file, index) => (
                          <tr key={`${file.name}-${index}`}>
                            <td>{index + 1}</td>
                            <td>{file.name}</td>
                            <td>{file.type || "Tệp đính kèm"}</td>
                            <td>{Math.ceil(file.size / 1024)} KB</td>
                            <td>{attachmentNote || "—"}</td>
                            <td>Chưa lưu</td>
                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  setAttachments((current) =>
                                    current.filter(
                                      (_, fileIndex) => fileIndex !== index,
                                    ),
                                  )
                                }
                              >
                                <Trash2 size={14} /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AttachmentTable>
                  </AttachmentTableScroll>
                )}
              </UploadPanel>
            </ChildPanel>
          )}
          {activeTab === "other" && (
            <ChildPanel>
              <ChildHeading>
                <div>
                  <ChildTitle>Hình ảnh / Khác</ChildTitle>
                  <ChildDescription>Tối đa 20 MB mỗi tệp.</ChildDescription>
                </div>
              </ChildHeading>
              <UploadPanel>
                <UploadFields>
                  <UploadField>
                    <span>
                      Chọn tệp <b>*</b>
                    </span>
                    <FilePicker>
                      <FilePickerButton
                        type="button"
                        onClick={() => imageInput.current?.click()}
                      >
                        <ImagePlus size={15} />
                        Chọn tệp
                      </FilePickerButton>
                      <FilePickerName
                        title={selectedImages
                          .map((file) => file.name)
                          .join(", ")}
                      >
                        {selectedImages.map((file) => file.name).join(", ") ||
                          "Chưa chọn tệp"}
                      </FilePickerName>
                      <HiddenFile
                        ref={imageInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) =>
                          selectFiles(event, setSelectedImages)
                        }
                      />
                    </FilePicker>
                  </UploadField>
                  <UploadField>
                    <span>Ghi chú</span>
                    <input
                      value={imageNote}
                      onChange={(event) => setImageNote(event.target.value)}
                      placeholder="Nhập ghi chú..."
                    />
                  </UploadField>
                  <UploadSubmit
                    type="button"
                    disabled={!selectedImages.length}
                    onClick={() =>
                      uploadFiles(
                        selectedImages,
                        imageNote,
                        setOtherImages,
                        setImageNote,
                      )
                    }
                  >
                    <Upload size={15} /> Tải lên
                  </UploadSubmit>
                </UploadFields>
                {otherImages.length === 0 ? (
                  <p>Chưa có tệp đính kèm.</p>
                ) : (
                  <AttachmentTableScroll>
                    <AttachmentTable>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tên tệp</th>
                          <th>Loại</th>
                          <th>Dung lượng</th>
                          <th>Ghi chú</th>
                          <th>Ngày tải</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherImages.map((file, index) => (
                          <tr key={`${file.name}-${index}`}>
                            <td>{index + 1}</td>
                            <td>{file.name}</td>
                            <td>{file.type || "Hình ảnh"}</td>
                            <td>{Math.ceil(file.size / 1024)} KB</td>
                            <td>{imageNote || "—"}</td>
                            <td>Chưa lưu</td>
                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  setOtherImages((current) =>
                                    current.filter(
                                      (_, fileIndex) => fileIndex !== index,
                                    ),
                                  )
                                }
                              >
                                <Trash2 size={14} /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AttachmentTable>
                  </AttachmentTableScroll>
                )}
              </UploadPanel>
            </ChildPanel>
          )}
          {formError && (
            <p
              role="alert"
              style={{
                margin: "0 12px 10px",
                color: "#fca5a5",
                fontSize: 12,
              }}
            >
              {formError}
            </p>
          )}
        </AssetModalBody>
        <AssetModalFooter>
          <AssetModalButton type="button" onClick={onClose} disabled={busy}>
            Hủy
          </AssetModalButton>
          <AssetModalButton $primary disabled={busy}>
            {busy ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm mới"}
          </AssetModalButton>
        </AssetModalFooter>
      </AssetModalDialog>
    </AssetModalOverlay>
  );
}
