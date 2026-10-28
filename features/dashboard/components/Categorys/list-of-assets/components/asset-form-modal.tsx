"use client";

import {
  useRef,
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { FilePlus2, ImagePlus, Plus, Trash2, Upload, X } from "lucide-react";
import type { Asset, Lookups } from "../list-of-assets";
import {
  AssetModalBody,
  AssetModalButton,
  AssetModalClose,
  AssetModalControl,
  AssetModalDialog,
  AssetModalField,
  AssetModalFooter,
  AssetModalGrid,
  AssetModalHint,
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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
                <AssetModalControl
                  name="original_price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={value(editing?.original_price)}
                />
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
                  defaultValue={value(editing?.unit_id)}
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
              <AssetModalPanelTitle>Thông tin loại license</AssetModalPanelTitle>
              <AssetModalGrid>
                <AssetModalField>
                  Loại license
                  <AssetModalSelect
                    name="license_type_id"
                    defaultValue={value(editing?.license_type_id)}
                  >
                    <option value="">-- Chọn license --</option>
                    {lookups.licenses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </AssetModalSelect>
                </AssetModalField>
                <AssetModalField>
                  Ghi chú license
                  <AssetModalTextarea
                    name="license_note"
                    placeholder="Nhập thông tin license"
                    rows={2}
                  />
                </AssetModalField>
              </AssetModalGrid>
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
          {[
            ["parts", "Phụ tùng linh kiện"],
            ["maintenance", "Bảo dưỡng định kì"],
            ["repair", "Sửa chữa kế hoạch"],
            ["network", "Thông tin mạng"],
          ].some(([id]) => activeTab === id) && (
            <AssetModalPanel>
              <AssetModalPanelTitle>
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </AssetModalPanelTitle>
              <AssetModalPanelActions>
                <span>Chưa có thông tin.</span>
                <AssetModalButton type="button" $primary>
                  <Plus size={15} />
                  Thêm
                </AssetModalButton>
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
                        title={selectedFiles.map((file) => file.name).join(", ")}
                      >
                        {selectedFiles.map((file) => file.name).join(", ") ||
                          "Chưa chọn tệp"}
                      </FilePickerName>
                      <HiddenFile
                        ref={fileInput}
                        type="file"
                        multiple
                        onChange={(event) => selectFiles(event, setSelectedFiles)}
                      />
                    </FilePicker>
                  </UploadField>
                  <UploadField>
                    <span>Ghi chú</span>
                    <input
                      value={attachmentNote}
                      onChange={(event) => setAttachmentNote(event.target.value)}
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
                        title={selectedImages.map((file) => file.name).join(", ")}
                      >
                        {selectedImages.map((file) => file.name).join(", ") ||
                          "Chưa chọn tệp"}
                      </FilePickerName>
                      <HiddenFile
                        ref={imageInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => selectFiles(event, setSelectedImages)}
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
