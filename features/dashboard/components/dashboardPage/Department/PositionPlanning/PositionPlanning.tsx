"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FilePlus2,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Page, styles } from "./PositionPlanning.styles";

const API = "/api/dashboard/ITASM/position-plans";
const PAGE_SIZE = 20;

type Option = { id: number; code: string; name: string };
type Department = {
  id: number;
  code: string;
  name: string;
  parent_code: string | null;
};
type StatusOption = { id: number; status_name: string };
type Specification = Option & {
  cpu_chip: string | null;
  ram: string | null;
  ssd: string | null;
  gpu: string | null;
  monitor: string | null;
};
type PendingFile = {
  file: File;
  attachmentType: "FILE" | "IMAGE";
  note: string;
};
type LicenseOption = {
  id: number;
  asset_id: number;
  license_code: string;
  license_name: string;
};
type Device = {
  id?: number;
  asset_category_id: number;
  quantity: number;
  standard_specification_id: number | null;
  status_id: number;
  category_code?: string;
  category_name?: string;
  standard_name?: string;
  cpu_chip?: string | null;
  ram?: string | null;
  ssd?: string | null;
  gpu?: string | null;
  monitor?: string | null;
};
type SoftwareLicense = {
  id?: number;
  software_asset_id: number;
  asset_license_id: number;
  quantity: number;
  status_id: number;
  asset_code?: string;
  asset_name?: string;
  license_code?: string;
  license_name?: string;
};
type Attachment = {
  id: number;
  attachment_type: "FILE" | "IMAGE";
  original_name: string;
  file_path: string;
  file_size: string | null;
  note: string | null;
};
type PlanRow = {
  id: number;
  work_id: number;
  work_code: string | null;
  work_name: string | null;
  level_id: number;
  rank_code: string | null;
  rank_name: string | null;
  organization_code: string;
  department_name: string | null;
  status_id: number;
  status_name: string | null;
  created_at: string;
};
type Plan = PlanRow & {
  job_description: string | null;
  recruitment_description: string | null;
  devices: Device[];
  software_licenses: SoftwareLicense[];
  attachments: Attachment[];
};
type Options = {
  works: Option[];
  ranks: Option[];
  departments: Department[];
  statuses: StatusOption[];
  categories: Option[];
  specifications: Specification[];
  software: Option[];
  licenses: LicenseOption[];
};
type Draft = {
  work_id: number | "";
  level_id: number | "";
  organization_code: string;
  status_id: number;
  job_description: string;
  recruitment_description: string;
  devices: Device[];
  software_licenses: SoftwareLicense[];
  attachments: Attachment[];
};

type ModalMode = "create" | "edit" | "view";
type Section = "general" | "job" | "recruitment" | "requirements";
type RequirementTab = "devices" | "licenses" | "files" | "images";

const emptyOptions: Options = {
  works: [],
  ranks: [],
  departments: [],
  statuses: [],
  categories: [],
  specifications: [],
  software: [],
  licenses: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`API không trả JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `API báo lỗi HTTP ${response.status}.`;
    throw new Error(message);
  }
  return data;
}

function toOption(value: unknown): Option | null {
  if (!isRecord(value)) return null;
  const id = Number(value.id);
  if (!Number.isInteger(id)) return null;
  return {
    id,
    code: String(value.code ?? value.work_code ?? value.rank_code ?? ""),
    name: String(
      value.name ?? value.work_name ?? value.rank_name ?? value.standard_name ?? "",
    ),
  };
}

function toOptions(value: unknown): Option[] {
  return Array.isArray(value)
    ? value.map(toOption).filter((item): item is Option => item !== null)
    : [];
}

function toListRow(value: unknown): PlanRow | null {
  if (!isRecord(value) || !Number.isInteger(Number(value.id))) return null;
  return {
    id: Number(value.id),
    work_id: Number(value.work_id),
    work_code: typeof value.work_code === "string" ? value.work_code : null,
    work_name: typeof value.work_name === "string" ? value.work_name : null,
    level_id: Number(value.level_id),
    rank_code: typeof value.rank_code === "string" ? value.rank_code : null,
    rank_name: typeof value.rank_name === "string" ? value.rank_name : null,
    organization_code: String(value.organization_code ?? ""),
    department_name:
      typeof value.department_name === "string" ? value.department_name : null,
    status_id: Number(value.status_id),
    status_name: typeof value.status_name === "string" ? value.status_name : null,
    created_at: String(value.created_at ?? ""),
  };
}

function toDevice(value: Record<string, unknown>): Device | null {
  const id = Number(value.id);
  const categoryId = Number(value.asset_category_id);
  const quantity = Number(value.quantity);
  if (!Number.isInteger(categoryId) || !Number.isInteger(quantity)) return null;
  const standardId =
    value.standard_specification_id === null ||
    value.standard_specification_id === undefined
      ? null
      : Number(value.standard_specification_id);
  return {
    ...(Number.isInteger(id) ? { id } : {}),
    asset_category_id: categoryId,
    quantity,
    standard_specification_id: standardId,
    status_id: Number(value.status_id ?? 6),
    category_code: typeof value.category_code === "string" ? value.category_code : undefined,
    category_name: typeof value.category_name === "string" ? value.category_name : undefined,
    standard_name: typeof value.standard_name === "string" ? value.standard_name : undefined,
    cpu_chip: typeof value.cpu_chip === "string" ? value.cpu_chip : null,
    ram: typeof value.ram === "string" ? value.ram : null,
    ssd: typeof value.ssd === "string" ? value.ssd : null,
    gpu: typeof value.gpu === "string" ? value.gpu : null,
    monitor: typeof value.monitor === "string" ? value.monitor : null,
  };
}

function toSoftwareLicense(value: Record<string, unknown>): SoftwareLicense | null {
  const id = Number(value.id);
  const softwareId = Number(value.software_asset_id);
  const licenseId = Number(value.asset_license_id);
  const quantity = Number(value.quantity);
  if (
    !Number.isInteger(softwareId) ||
    !Number.isInteger(licenseId) ||
    !Number.isFinite(quantity)
  ) {
    return null;
  }
  return {
    ...(Number.isInteger(id) ? { id } : {}),
    software_asset_id: softwareId,
    asset_license_id: licenseId,
    quantity,
    status_id: Number(value.status_id ?? 6),
    asset_code: typeof value.asset_code === "string" ? value.asset_code : undefined,
    asset_name: typeof value.asset_name === "string" ? value.asset_name : undefined,
    license_code: typeof value.license_code === "string" ? value.license_code : undefined,
    license_name: typeof value.license_name === "string" ? value.license_name : undefined,
  };
}

function toAttachment(value: Record<string, unknown>): Attachment | null {
  const id = Number(value.id);
  if (
    !Number.isInteger(id) ||
    (value.attachment_type !== "FILE" && value.attachment_type !== "IMAGE")
  ) {
    return null;
  }
  return {
    id,
    attachment_type: value.attachment_type,
    original_name: String(value.original_name ?? ""),
    file_path: String(value.file_path ?? ""),
    file_size: value.file_size == null ? null : String(value.file_size),
    note: typeof value.note === "string" ? value.note : null,
  };
}

function readOptions(value: unknown): Options {
  if (!isRecord(value)) throw new Error("Dữ liệu danh mục không hợp lệ.");
  const statuses = Array.isArray(value.statuses)
    ? value.statuses.filter(isRecord).map((item) => ({
        id: Number(item.id),
        status_name: String(item.status_name ?? ""),
      }))
    : [];
  const departments = Array.isArray(value.departments)
    ? value.departments.filter(isRecord).flatMap((item) => {
        const id = Number(item.id);
        if (!Number.isInteger(id)) return [];
        return [{
          id,
          code: String(item.code ?? ""),
          name: String(item.name ?? ""),
          parent_code:
            typeof item.parent_code === "string" ? item.parent_code : null,
        }];
      })
    : [];
  const specifications: Specification[] = Array.isArray(value.specifications)
    ? value.specifications.filter(isRecord).flatMap((item) => {
        const option = toOption(item);
        return option
          ? [{
              ...option,
              cpu_chip: typeof item.cpu_chip === "string" ? item.cpu_chip : null,
              ram: typeof item.ram === "string" ? item.ram : null,
              ssd: typeof item.ssd === "string" ? item.ssd : null,
              gpu: typeof item.gpu === "string" ? item.gpu : null,
              monitor: typeof item.monitor === "string" ? item.monitor : null,
            }]
          : [];
      })
    : [];
  const licenses = Array.isArray(value.licenses)
    ? value.licenses.filter(isRecord).map((item) => ({
        id: Number(item.id),
        asset_id: Number(item.asset_id),
        license_code: String(item.license_code ?? ""),
        license_name: String(item.license_name ?? ""),
      }))
    : [];
  return {
    works: toOptions(value.works),
    ranks: toOptions(value.ranks),
    departments,
    statuses,
    categories: toOptions(value.categories),
    specifications,
    software: toOptions(value.software),
    licenses,
  };
}

function toDraft(plan: Plan): Draft {
  return {
    work_id: plan.work_id,
    level_id: plan.level_id,
    organization_code: plan.organization_code,
    status_id: plan.status_id,
    job_description: plan.job_description ?? "",
    recruitment_description: plan.recruitment_description ?? "",
    devices: plan.devices.map((device) => ({
      ...device,
      status_id: Number(device.status_id ?? 6),
    })),
    software_licenses: plan.software_licenses.map((line) => ({
      ...line,
      status_id: Number(line.status_id ?? 6),
    })),
    attachments: plan.attachments,
  };
}

function emptyDraft(): Draft {
  return {
    work_id: "",
    level_id: "",
    organization_code: "",
    status_id: 6,
    job_description: "",
    recruitment_description: "",
    devices: [],
    software_licenses: [],
    attachments: [],
  };
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("vi-VN");
}

function formatSize(value: string | null) {
  const size = Number(value);
  if (!Number.isFinite(size)) return "";
  return size >= 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
}

function DepartmentSelect({
  departments,
  value,
  onChange,
  disabled = false,
  label = "Tất cả đơn vị",
}: {
  departments: Department[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const byParent = useMemo(() => {
    const map = new Map<string | null, Department[]>();
    departments.forEach((department) => {
      const parent = departments.some((item) => item.code === department.parent_code)
        ? department.parent_code
        : null;
      map.set(parent, [...(map.get(parent) ?? []), department]);
    });
    return map;
  }, [departments]);
  const selected = departments.find((item) => item.code === value);

  const renderNodes = (parent: string | null, depth: number, ancestry: Set<string>) =>
    (byParent.get(parent) ?? []).map((department) => {
      if (ancestry.has(department.code)) return null;
      const children = byParent.get(department.code) ?? [];
      const nextAncestry = new Set(ancestry).add(department.code);
      const isExpanded = expanded.has(department.code);
      return (
        <div key={department.id}>
          <div className={styles.treeRow} style={{ paddingLeft: 8 + depth * 16 }}>
            {children.length > 0 ? (
              <button
                type="button"
                className={styles.treeToggle}
                aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                onClick={() =>
                  setExpanded((current) => {
                    const next = new Set(current);
                    if (next.has(department.code)) next.delete(department.code);
                    else next.add(department.code);
                    return next;
                  })
                }
              >
                {isExpanded ? "⌄" : "›"}
              </button>
            ) : (
              <span className={styles.treeSpacer} />
            )}
            <button
              type="button"
              data-department-id={department.id}
              className={`${styles.treeChoice} ${value === department.code ? styles.treeSelected : ""}`}
              onClick={() => {
                onChange(department.code);
                setOpen(false);
              }}
            >
              <span className={styles.treeCode}>[{department.code}]</span>
              {department.name}
            </button>
          </div>
          {isExpanded && renderNodes(department.code, depth + 1, nextAncestry)}
        </div>
      );
    });

  return (
    <div className={styles.treeSelect}>
      <button
        type="button"
        className={styles.select}
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected ? `[${selected.code}] ${selected.name}` : label}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className={styles.treeDismiss}
            aria-label="Đóng danh sách đơn vị"
            onClick={() => setOpen(false)}
          />
          <div className={styles.treePopup}>
            <button
              type="button"
              className={`${styles.treeChoice} ${!value ? styles.treeSelected : ""}`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              {label}
            </button>
            {renderNodes(null, 0, new Set())}
          </div>
        </>
      )}
    </div>
  );
}

export default function PositionPlanning() {
  const [options, setOptions] = useState<Options>(emptyOptions);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    work: "",
    rank: "",
    department: "",
    status: "",
  });
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [mode, setMode] = useState<ModalMode | null>(null);
  const [section, setSection] = useState<Section>("general");
  const [requirementTab, setRequirementTab] = useState<RequirementTab>("devices");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadNote, setUploadNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/options`, { cache: "no-store" })
      .then(readJson)
      .then((data) => {
        if (mounted) setOptions(readOptions(data));
      })
      .catch((error: unknown) => {
        if (mounted) setPageError(error instanceof Error ? error.message : "Không tải được danh mục.");
      })
      .finally(() => {
        if (mounted) setOptionsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadList = useCallback(async (signal?: AbortSignal) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (filters.work) params.set("work_id", filters.work);
    if (filters.rank) params.set("level_id", filters.rank);
    if (filters.department) params.set("department_code", filters.department);
    if (filters.status) params.set("status_id", filters.status);
    if (keyword) params.set("keyword", keyword);
    setListLoading(true);
    try {
      const data = await readJson(
        await fetch(`${API}?${params}`, { cache: "no-store", signal }),
      );
      if (signal?.aborted) return;
      if (!isRecord(data) || !Array.isArray(data.data)) {
        throw new Error("Dữ liệu danh sách hoạch định không hợp lệ.");
      }
      const normalizedRows: PlanRow[] = data.data.map((item) => {
        const row = toListRow(item);
        if (!row) throw new Error("Có dòng hoạch định trả về dữ liệu không hợp lệ.");
        return row;
      });
      setRows(normalizedRows);
      setTotal(Number(data.total ?? 0));
      setPageError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPageError(error instanceof Error ? error.message : "Không tải được danh sách.");
    } finally {
      if (!signal?.aborted) setListLoading(false);
    }
  }, [filters, keyword, page]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadList(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadList]);

  const loadPlan = async (id: number): Promise<Plan> => {
    const data = await readJson(await fetch(`${API}/${id}`, { cache: "no-store" }));
    if (!isRecord(data)) throw new Error("Dữ liệu chi tiết hoạch định không hợp lệ.");
    const row = toListRow(data);
    if (!row) throw new Error("Dữ liệu chi tiết hoạch định không hợp lệ.");
    const devices = Array.isArray(data.devices)
      ? data.devices.filter(isRecord).map(toDevice).filter((item): item is Device => item !== null)
      : [];
    const softwareLicenses = Array.isArray(data.software_licenses)
      ? data.software_licenses.filter(isRecord).map(toSoftwareLicense).filter((item): item is SoftwareLicense => item !== null)
      : [];
    const attachments = Array.isArray(data.attachments)
      ? data.attachments.filter(isRecord).map(toAttachment).filter((item): item is Attachment => item !== null)
      : [];
    const plan: Plan = {
      ...row,
      job_description:
        typeof data.job_description === "string" ? data.job_description : null,
      recruitment_description:
        typeof data.recruitment_description === "string"
          ? data.recruitment_description
          : null,
      devices,
      software_licenses: softwareLicenses,
      attachments,
    };
    return plan;
  };

  const openPlan = async (id: number, nextMode: ModalMode) => {
    setPageError("");
    setNotice("");
    try {
      const plan = await loadPlan(id);
      setDraft(toDraft(plan));
      setActivePlanId(id);
      setPendingFiles([]);
      setSection("general");
      setRequirementTab("devices");
      setMode(nextMode);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Không tải được hoạch định.");
    }
  };

  const startCreate = () => {
    setPageError("");
    setNotice("");
    setDraft(emptyDraft());
    setActivePlanId(null);
    setPendingFiles([]);
    setSection("general");
    setRequirementTab("devices");
    setMode("create");
  };

  const savePlan = async () => {
    if (mode === "view") return;
    if (!draft.work_id) {
      setPageError("Vui lòng chọn công việc");
      return;
    }
    if (!draft.level_id) {
      setPageError("Vui lòng chọn cấp bậc");
      return;
    }
    if (!draft.organization_code) {
      setPageError("Vui lòng chọn đơn vị");
      return;
    }
    const duplicateDevices = new Set<string>();
    for (const device of draft.devices) {
      if (!device.asset_category_id) {
        setPageError("Vui lòng chọn chủng loại thiết bị");
        return;
      }
      if (!Number.isInteger(Number(device.quantity)) || Number(device.quantity) < 1) {
        setPageError("Số lượng thiết bị phải là số nguyên lớn hơn 0");
        return;
      }
      const key = `${device.asset_category_id}:${device.standard_specification_id ?? "null"}`;
      if (duplicateDevices.has(key)) {
        setPageError("Chủng loại và thông số chuẩn bị trùng trong danh sách thiết bị");
        return;
      }
      duplicateDevices.add(key);
    }
    const duplicateLicenses = new Set<string>();
    for (const license of draft.software_licenses) {
      if (!license.software_asset_id || !license.asset_license_id) {
        setPageError("Vui lòng chọn phần mềm và license");
        return;
      }
      if (!Number.isInteger(Number(license.quantity)) || Number(license.quantity) < 1) {
        setPageError("Số lượng license phải là số nguyên lớn hơn 0");
        return;
      }
      if (license.status_id === 6) {
        const key = `${license.software_asset_id}:${license.asset_license_id}`;
        if (duplicateLicenses.has(key)) {
          setPageError("Phần mềm và license đang sử dụng bị trùng");
          return;
        }
        duplicateLicenses.add(key);
      }
    }
    setSaving(true);
    setPageError("");
    try {
      const body = {
        work_id: Number(draft.work_id),
        level_id: Number(draft.level_id),
        organization_code: draft.organization_code,
        status_id: draft.status_id,
        job_description: draft.job_description,
        recruitment_description: draft.recruitment_description,
        devices: draft.devices.map(({ asset_category_id, quantity, standard_specification_id, status_id }) => ({
          asset_category_id,
          quantity: Number(quantity),
          standard_specification_id,
          status_id,
        })),
        software_licenses: draft.software_licenses.map(({ software_asset_id, asset_license_id, quantity, status_id }) => ({
          software_asset_id,
          asset_license_id,
          quantity: Number(quantity),
          status_id,
        })),
      };
      const response = await readJson(
        await fetch(mode === "create" ? API : `${API}/${activePlanId}`, {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const savedId =
        isRecord(response) && Number.isInteger(Number(response.id))
          ? Number(response.id)
          : activePlanId;
      if (!savedId) throw new Error("API không trả về mã hoạch định đã lưu.");
      const uploadErrors: string[] = [];
      for (const pendingFile of pendingFiles) {
        const formData = new FormData();
        formData.set("file", pendingFile.file);
        formData.set("attachment_type", pendingFile.attachmentType);
        formData.set("note", pendingFile.note);
        try {
          await readJson(
            await fetch(`${API}/${savedId}/attachments`, {
              method: "POST",
              body: formData,
            }),
          );
        } catch (error) {
          uploadErrors.push(
            `${pendingFile.file.name}: ${
              error instanceof Error ? error.message : "Không tải lên được."
            }`,
          );
        }
      }
      const successMessage =
        mode === "create"
          ? "Thêm hoạch định vị trí thành công."
          : "Cập nhật hoạch định vị trí thành công.";
      setNotice(
        uploadErrors.length
          ? `${successMessage} Tệp chưa tải lên: ${uploadErrors.join("; ")}`
          : successMessage,
      );
      setPageError("");
      setSelectedId(savedId);
      setMode(null);
      setPendingFiles([]);
      if (mode === "create" && page !== 1) setPage(1);
      else await loadList();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Không thể lưu hoạch định.");
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async () => {
    if (!selectedId) return;
    const selected = rows.find((row) => row.id === selectedId);
    const positionName = [selected?.work_name, selected?.rank_name]
      .filter(Boolean)
      .join(" - ");
    const departmentName = selected?.department_name ?? selected?.organization_code ?? "";
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa hoạch định vị trí "${positionName}" của đơn vị "${departmentName}" không?`,
      )
    ) return;
    try {
      await readJson(await fetch(`${API}/${selectedId}`, { method: "DELETE" }));
      setSelectedId(null);
      setNotice("Xóa hoạch định vị trí thành công.");
      await loadList();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Không thể xóa hoạch định.");
    }
  };

  const uploadAttachment = async (file: File, type: "FILE" | "IMAGE") => {
    if (!activePlanId) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("attachment_type", type);
    formData.set("note", uploadNote);
    try {
      const data = await readJson(
        await fetch(`${API}/${activePlanId}/attachments`, {
          method: "POST",
          body: formData,
        }),
      );
      if (!isRecord(data)) throw new Error("Thông tin tệp tải lên không hợp lệ.");
      const nextAttachment: Attachment = {
        id: Number(data.id),
        attachment_type: type,
        original_name: String(data.original_name ?? file.name),
        file_path: String(data.file_path ?? ""),
        file_size: data.file_size == null ? String(file.size) : String(data.file_size),
        note: typeof data.note === "string" ? data.note : null,
      };
      setDraft((current) => ({
        ...current,
        attachments: [...current.attachments, nextAttachment],
      }));
      setUploadNote("");
      setNotice("Tải tệp lên thành công.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Không thể tải tệp lên.");
    }
  };

  const removeAttachment = async (attachment: Attachment) => {
    if (!activePlanId) return;
    try {
      await readJson(
        await fetch(`${API}/${activePlanId}/attachments/${attachment.id}`, {
          method: "DELETE",
        }),
      );
      setDraft((current) => ({
        ...current,
        attachments: current.attachments.filter((item) => item.id !== attachment.id),
      }));
      setNotice("Xóa tệp đính kèm thành công.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Không thể xóa tệp.");
    }
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const editable = mode !== "view";
  const specById = new Map(options.specifications.map((item) => [item.id, item]));
  const licensesForSoftware = (softwareId: number) =>
    options.licenses.filter((item) => item.asset_id === softwareId);
  const attachmentUrl = (attachmentId: number) =>
    `${API}/${activePlanId}/attachments/${attachmentId}/file`;

  const addDevice = () =>
    setDraft((current) => ({
      ...current,
      devices: [
        ...current.devices,
        {
          asset_category_id: options.categories[0]?.id ?? 0,
          quantity: 1,
          standard_specification_id: null,
          status_id: 6,
        },
      ],
    }));

  const addSoftwareLicense = () =>
    setDraft((current) => {
      const softwareId = options.software[0]?.id ?? 0;
      const licenseId = licensesForSoftware(softwareId)[0]?.id ?? 0;
      return {
        ...current,
        software_licenses: [
          ...current.software_licenses,
          {
            software_asset_id: softwareId,
            asset_license_id: licenseId,
            quantity: 1,
            status_id: 6,
          },
        ],
      };
    });

  return (
    <Page className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Quản lý tổ chức</p>
          <h1>Hoạch định vị trí</h1>
          <p className={styles.subtitle}>Quản lý vị trí công việc, thiết bị và license theo đơn vị.</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={startCreate}>
          <Plus size={17} /> Mới
        </button>
      </header>

      {(notice || pageError) && (
        <div className={`${styles.notice} ${pageError ? styles.errorNotice : notice.includes("Tệp chưa tải lên") ? styles.warningNotice : ""}`} role="status">
          <span>{pageError || notice}</span>
          <button type="button" aria-label="Đóng thông báo" onClick={() => { setNotice(""); setPageError(""); }}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className={styles.filterCard} aria-label="Bộ lọc hoạch định vị trí">
        <label className={styles.field}>
          <span>Công việc</span>
          <select
            value={filters.work}
            disabled={optionsLoading}
            onChange={(event) => { setFilters((current) => ({ ...current, work: event.target.value })); setPage(1); setSelectedId(null); }}
          >
            <option value="">Tất cả</option>
            {options.works.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span>Cấp bậc</span>
          <select
            value={filters.rank}
            disabled={optionsLoading}
            onChange={(event) => { setFilters((current) => ({ ...current, rank: event.target.value })); setPage(1); setSelectedId(null); }}
          >
            <option value="">Tất cả</option>
            {options.ranks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span>Đơn vị</span>
          <DepartmentSelect
            departments={options.departments}
            value={filters.department}
            onChange={(department) => { setFilters((current) => ({ ...current, department })); setPage(1); setSelectedId(null); }}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select
            value={filters.status}
            disabled={optionsLoading}
            onChange={(event) => { setFilters((current) => ({ ...current, status: event.target.value })); setPage(1); setSelectedId(null); }}
          >
            <option value="">Tất cả</option>
            {options.statuses.map((item) => <option key={item.id} value={item.id}>{item.status_name}</option>)}
          </select>
        </label>
        <form
          className={`${styles.field} ${styles.searchField}`}
          onSubmit={(event) => { event.preventDefault(); setKeyword(searchText.trim()); setPage(1); setSelectedId(null); }}
        >
          <span>Tìm kiếm</span>
          <div className={styles.searchControl}>
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Công việc, cấp bậc, đơn vị..." />
            <button type="submit" aria-label="Tìm kiếm"><Search size={17} /><span>Tìm</span></button>
          </div>
        </form>
      </section>

      <section className={styles.listCard}>
        <div className={styles.toolbar}>
          <div className={styles.actionGroup}>
            <button className={styles.secondaryButton} type="button" onClick={() => {
              if (selectedId) void openPlan(selectedId, "edit");
              else setNotice("Vui lòng chọn một dòng cần chỉnh sửa");
            }}>
              <Pencil size={16} /> Sửa
            </button>
            <button className={styles.dangerButton} type="button" title={!selectedId ? "Chọn 1 dòng để xóa" : undefined} disabled={!selectedId} onClick={() => void removePlan()}>
              <Trash2 size={16} /> Xóa
            </button>
          </div>
          <span className={styles.total}>Tổng: {total} dòng</span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>Công việc</th><th>Cấp bậc</th><th>Đơn vị</th><th>Trạng thái</th><th>Ngày tạo</th></tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan={6} className={styles.empty}>Đang tải dữ liệu...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>Không có dữ liệu</td></tr>
              ) : rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={selectedId === row.id ? styles.selectedRow : ""}
                  onClick={() => setSelectedId(row.id)}
                  onDoubleClick={() => void openPlan(row.id, "view")}
                  tabIndex={0}
                  onKeyDown={(event) => { if (event.key === "Enter") void openPlan(row.id, "view"); }}
                >
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{row.work_name ?? "—"}</td>
                  <td>{row.rank_name ?? "—"}</td>
                  <td>{row.department_name ?? row.organization_code}</td>
                  <td><span className={`${styles.status} ${row.status_id === 6 ? styles.active : styles.inactive}`}>{row.status_name ?? (row.status_id === 6 ? "Còn sử dụng" : "Không sử dụng")}</span></td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className={styles.pagination}>
          <span>Tổng: {total} dòng</span>
          <div>
            <button type="button" disabled={page <= 1 || listLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</button>
            <span>Trang {page}/{maxPage}</span>
            <button type="button" disabled={page >= maxPage || listLoading} onClick={() => setPage((current) => Math.min(maxPage, current + 1))}>Sau</button>
          </div>
        </footer>
      </section>

      {mode && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="position-plan-title">
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Quản lý tổ chức</p>
                <h2 id="position-plan-title">
                  {mode === "create" ? "Thêm hoạch định vị trí" : mode === "edit" ? "Chỉnh sửa hoạch định vị trí" : "Chi tiết hoạch định vị trí"}
                </h2>
              </div>
              <button className={styles.iconButton} type="button" aria-label="Đóng" onClick={() => setMode(null)}><X size={20} /></button>
            </header>
            {(pageError || notice) && (
              <div className={`${styles.modalAlert} ${pageError ? styles.modalError : ""}`} role="status">
                <span>{pageError || notice}</span>
                <button type="button" aria-label="Đóng thông báo" onClick={() => { setPageError(""); setNotice(""); }}>
                  <X size={15} />
                </button>
              </div>
            )}
            <div className={styles.modalBody}>
              <nav className={styles.sectionNav} aria-label="Thông tin hoạch định">
                {([
                  ["general", "Thông tin chung"],
                  ["job", "Mô tả công việc"],
                  ["recruitment", "Mô tả tuyển dụng"],
                  ["requirements", "Yêu cầu MMTB / phần mềm"],
                ] as Array<[Section, string]>).map(([key, title]) => (
                  <button key={key} type="button" className={section === key ? styles.navActive : ""} onClick={() => setSection(key)}>{title}</button>
                ))}
              </nav>
              <div className={styles.modalContent}>
                {section === "general" && (
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Công việc <b>*</b></span>
                      <select disabled={!editable || optionsLoading} value={draft.work_id} onChange={(event) => setDraft((current) => ({ ...current, work_id: event.target.value ? Number(event.target.value) : "" }))}>
                        <option value="">-- Chọn công việc --</option>
                        {options.works.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Cấp bậc <b>*</b></span>
                      <select disabled={!editable || optionsLoading} value={draft.level_id} onChange={(event) => setDraft((current) => ({ ...current, level_id: event.target.value ? Number(event.target.value) : "" }))}>
                        <option value="">-- Chọn cấp bậc --</option>
                        {options.ranks.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ""}{item.name}</option>)}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Đơn vị <b>*</b></span>
                      <DepartmentSelect
                        departments={options.departments}
                        value={draft.organization_code}
                        disabled={!editable}
                        label="-- Chọn đơn vị --"
                        onChange={(organization_code) => setDraft((current) => ({ ...current, organization_code }))}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Trạng thái</span>
                      <select disabled={!editable} value={draft.status_id} onChange={(event) => setDraft((current) => ({ ...current, status_id: Number(event.target.value) }))}>
                        {options.statuses.map((item) => <option key={item.id} value={item.id}>{item.status_name}</option>)}
                        {options.statuses.length === 0 && <><option value={6}>Còn sử dụng</option><option value={5}>Không sử dụng</option></>}
                      </select>
                    </label>
                  </div>
                )}
                {section === "job" && (
                  <label className={styles.field}>
                    <span>Mô tả công việc</span>
                    <textarea rows={12} value={draft.job_description} disabled={!editable} onChange={(event) => setDraft((current) => ({ ...current, job_description: event.target.value }))} placeholder="Nhập mô tả công việc..." />
                  </label>
                )}
                {section === "recruitment" && (
                  <label className={styles.field}>
                    <span>Mô tả tuyển dụng</span>
                    <textarea rows={12} value={draft.recruitment_description} disabled={!editable} onChange={(event) => setDraft((current) => ({ ...current, recruitment_description: event.target.value }))} placeholder="Nhập mô tả tuyển dụng..." />
                  </label>
                )}
                {section === "requirements" && (
                  <div>
                    <div className={styles.innerTabs}>
                      {([
                        ["devices", "Thiết bị"],
                        ["licenses", "License phần mềm"],
                        ["files", "Tệp đính kèm"],
                        ["images", "Khác / Hình ảnh"],
                      ] as Array<[RequirementTab, string]>).map(([key, title]) => (
                        <button key={key} type="button" className={requirementTab === key ? styles.tabActive : ""} onClick={() => setRequirementTab(key)}>{title}</button>
                      ))}
                    </div>
                    {requirementTab === "devices" && (
                      <div className={styles.childPanel}>
                        <div className={styles.childHeading}>
                          <div><h3>Thiết bị theo thông số chuẩn</h3><p>Định mức thiết bị áp dụng cho một nhân viên.</p></div>
                          {editable && <button type="button" className={styles.secondaryButton} onClick={addDevice}><Plus size={15} /> Thêm dòng</button>}
                        </div>
                        {draft.devices.length === 0 ? <p className={styles.emptyInline}>Chưa có thiết bị.</p> : (
                          <div className={styles.childRows}>
                            {draft.devices.map((device, index) => {
                              const specification = device.standard_specification_id ? specById.get(device.standard_specification_id) : undefined;
                              return (
                                <div className={styles.deviceRow} key={device.id ?? `device-${index}`}>
                                  <label className={styles.field}><span>Chủng loại</span><select disabled={!editable} value={device.asset_category_id} onChange={(event) => setDraft((current) => ({ ...current, devices: current.devices.map((row, rowIndex) => rowIndex === index ? { ...row, asset_category_id: Number(event.target.value) } : row) }))}>{options.categories.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ""}{item.name}</option>)}</select></label>
                                  <label className={styles.field}><span>Số lượng / người</span><input disabled={!editable} type="number" min={1} step={1} value={device.quantity} onChange={(event) => setDraft((current) => ({ ...current, devices: current.devices.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row) }))} /></label>
                                  <label className={styles.field}><span>Thông số chuẩn</span><select disabled={!editable} value={device.standard_specification_id ?? ""} onChange={(event) => setDraft((current) => ({ ...current, devices: current.devices.map((row, rowIndex) => rowIndex === index ? { ...row, standard_specification_id: event.target.value ? Number(event.target.value) : null } : row) }))}><option value="">Không yêu cầu</option>{options.specifications.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label>
                                  {specification && <div className={styles.specSummary}>CPU: {specification.cpu_chip || "—"} · RAM: {specification.ram || "—"} · SSD: {specification.ssd || "—"} · GPU: {specification.gpu || "—"} · Màn hình: {specification.monitor || "—"}</div>}
                                  {editable && <button type="button" className={styles.removeRow} aria-label="Xóa dòng thiết bị" onClick={() => setDraft((current) => ({ ...current, devices: current.devices.filter((_, rowIndex) => rowIndex !== index) }))}><Trash2 size={16} /></button>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {requirementTab === "licenses" && (
                      <div className={styles.childPanel}>
                        <div className={styles.childHeading}>
                          <div><h3>License phần mềm</h3><p>Mỗi dòng là một định mức license trên một người.</p></div>
                          {editable && <button type="button" className={styles.secondaryButton} onClick={addSoftwareLicense}><Plus size={15} /> Thêm dòng</button>}
                        </div>
                        {draft.software_licenses.length === 0 ? <p className={styles.emptyInline}>Chưa có license phần mềm.</p> : (
                          <div className={styles.childRows}>
                            {draft.software_licenses.map((line, index) => (
                              <div className={styles.licenseRow} key={line.id ?? `license-${index}`}>
                                <label className={styles.field}><span>Phần mềm</span><select disabled={!editable} value={line.software_asset_id} onChange={(event) => { const software_asset_id = Number(event.target.value); const firstLicense = licensesForSoftware(software_asset_id)[0]?.id ?? 0; setDraft((current) => ({ ...current, software_licenses: current.software_licenses.map((row, rowIndex) => rowIndex === index ? { ...row, software_asset_id, asset_license_id: firstLicense } : row) })); }}>{options.software.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ""}{item.name}</option>)}</select></label>
                                <label className={styles.field}><span>License</span><select disabled={!editable} value={line.asset_license_id} onChange={(event) => setDraft((current) => ({ ...current, software_licenses: current.software_licenses.map((row, rowIndex) => rowIndex === index ? { ...row, asset_license_id: Number(event.target.value) } : row) }))}>{licensesForSoftware(line.software_asset_id).map((item) => <option key={item.id} value={item.id}>{item.license_code} - {item.license_name}</option>)}</select></label>
                                <label className={styles.field}><span>Số lượng / người</span><input disabled={!editable} type="number" min={1} step={1} value={line.quantity} onChange={(event) => setDraft((current) => ({ ...current, software_licenses: current.software_licenses.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row) }))} /></label>
                                {editable && <button type="button" className={styles.removeRow} aria-label="Xóa dòng license" onClick={() => setDraft((current) => ({ ...current, software_licenses: current.software_licenses.filter((_, rowIndex) => rowIndex !== index) }))}><Trash2 size={16} /></button>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(requirementTab === "files" || requirementTab === "images") && (
                      <div className={styles.childPanel}>
                        <div className={styles.childHeading}>
                          <div><h3>{requirementTab === "files" ? "Tệp đính kèm" : "Hình ảnh / Khác"}</h3><p>Tối đa 20 MB mỗi tệp.</p></div>
                          {editable && <label className={styles.secondaryButton}>
                            {requirementTab === "files" ? <FilePlus2 size={15} /> : <ImagePlus size={15} />}
                            Chọn tệp
                            <input
                              className={styles.hiddenFile}
                              type="file"
                              accept={requirementTab === "images" ? "image/*" : undefined}
                              multiple
                              onChange={(event) => {
                                const files = Array.from(event.target.files ?? []);
                                const validFiles = files.filter((file) => file.size <= 20 * 1024 * 1024 && (requirementTab !== "images" || file.type.startsWith("image/")));
                                if (validFiles.length !== files.length) setPageError("Tệp tối đa 20 MB; tab Hình ảnh chỉ nhận ảnh.");
                                if (mode === "create") {
                                  setPendingFiles((current) => [
                                    ...current,
                                    ...validFiles.map((file) => ({
                                      file,
                                      attachmentType: requirementTab === "images" ? "IMAGE" as const : "FILE" as const,
                                      note: uploadNote,
                                    })),
                                  ]);
                                  setUploadNote("");
                                }
                                else validFiles.forEach((file) => void uploadAttachment(file, requirementTab === "images" ? "IMAGE" : "FILE"));
                                event.target.value = "";
                              }}
                            />
                          </label>}
                        </div>
                        {requirementTab === "files" && editable && <div className={styles.uploadNote}><input value={uploadNote} onChange={(event) => setUploadNote(event.target.value)} placeholder="Ghi chú cho lần tải lên" /></div>}
                        {mode === "create" && pendingFiles.length > 0 && (
                          <ul className={styles.pendingFiles}>{pendingFiles.map((pendingFile, index) => <li key={`${pendingFile.file.name}-${index}`}>{pendingFile.file.name} <span>{formatSize(String(pendingFile.file.size))}</span><button type="button" aria-label="Bỏ tệp" onClick={() => setPendingFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={14} /></button></li>)}</ul>
                        )}
                        {draft.attachments.filter((item) => item.attachment_type === (requirementTab === "files" ? "FILE" : "IMAGE")).length === 0 && pendingFiles.length === 0 ? (
                          <p className={styles.emptyInline}>Chưa có tệp đính kèm.</p>
                        ) : (
                          <div className={styles.attachmentGrid}>
                            {draft.attachments.filter((item) => item.attachment_type === (requirementTab === "files" ? "FILE" : "IMAGE")).map((item) => (
                              <article className={styles.attachment} key={item.id}>
                                {item.attachment_type === "IMAGE" ? <a href={attachmentUrl(item.id)} target="_blank" rel="noreferrer" className={styles.imageThumb}><Image src={attachmentUrl(item.id)} alt={item.original_name} width={48} height={48} unoptimized /></a> : <a href={attachmentUrl(item.id)} target="_blank" rel="noreferrer" className={styles.fileThumb}><FilePlus2 size={24} /></a>}
                                <div className={styles.attachmentInfo}><a href={attachmentUrl(item.id)} target="_blank" rel="noreferrer">{item.original_name}</a><small>{formatSize(item.file_size)}{item.note ? ` · ${item.note}` : ""}</small></div>
                                {editable && <button type="button" className={styles.removeRow} aria-label="Xóa tệp" onClick={() => void removeAttachment(item)}><Trash2 size={15} /></button>}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <footer className={styles.modalFooter}>
              <span>{mode === "view" ? "Chế độ xem chi tiết" : "Các trường có dấu * là bắt buộc"}</span>
              <div>
                <button className={styles.secondaryButton} type="button" onClick={() => setMode(null)}>{mode === "view" ? "Đóng" : "Hủy"}</button>
                {mode === "view" && <button className={styles.primaryButton} type="button" onClick={() => setMode("edit")}>Chỉnh sửa</button>}
                {editable && <button className={styles.primaryButton} type="button" disabled={saving || optionsLoading} onClick={() => void savePlan()}>{saving ? "Đang lưu..." : mode === "create" ? "Thêm" : "Cập nhật"}</button>}
              </div>
            </footer>
          </section>
        </div>
      )}
    </Page>
  );
}
