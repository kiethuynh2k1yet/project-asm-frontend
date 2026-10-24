"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import TaskToolbar from "../components/TaskToolbar/TaskToolbar";
import type { JobFilters, JobStatus } from "../constants/jobStatuses";
import * as S from "../styles/styles";
import { ModalStyles as M } from "../styles/styles";

const PAGE_SIZE = 10;

type AssetType = { id: number; name: string };
type AssetGroup = {
  id: number;
  code: string;
  name: string;
  assetTypeId: number | null;
  status_id: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
    throw new Error(
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `API báo lỗi HTTP ${response.status}.`,
    );
  }
  return data;
}

function toAssetGroup(value: unknown): AssetGroup {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    typeof value.status_id !== "number" ||
    !(value["asset-group_code"] === null || typeof value["asset-group_code"] === "string") ||
    !(value["asset-group_name"] === null || typeof value["asset-group_name"] === "string") ||
    !(value["asset-type"] === null ||
      (typeof value["asset-type"] === "number" && Number.isInteger(value["asset-type"])))
  ) {
    throw new Error("Dữ liệu nhóm tài sản không hợp lệ.");
  }
  return {
    id: value.id as number,
    code: value["asset-group_code"] ?? "",
    name: value["asset-group_name"] ?? "",
    assetTypeId: value["asset-type"],
    status_id: value.status_id,
  };
}

function toAssetType(value: unknown): AssetType {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    !(value["asset-types_name"] === null || typeof value["asset-types_name"] === "string")
  ) {
    throw new Error("Dữ liệu loại tài sản không hợp lệ.");
  }
  return { id: value.id as number, name: value["asset-types_name"] ?? "" };
}

export default function AssetGroups() {
  const [rows, setRows] = useState<AssetGroup[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [filters, setFilters] = useState<JobFilters>({ keyword: "", statusId: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssetGroup>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadRows = useCallback(async (signal?: AbortSignal) => {
    const data = await readJson(await fetch("/api/dashboard/master-data/asset-groups", {
      cache: "no-store",
      signal,
    }));
    if (!Array.isArray(data)) throw new Error("Danh sách nhóm tài sản phải là một mảng.");
    return data.map(toAssetGroup);
  }, []);

  const refreshRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await loadRows());
      setPage(1);
      setSelectedId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được nhóm tài sản.");
    } finally {
      setLoading(false);
    }
  }, [loadRows]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void loadRows(controller.signal)
      .then((data) => { if (active) setRows(data); })
      .catch((cause: unknown) => {
        if (active && !controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Không tải được nhóm tài sản.");
        }
      })
      .finally(() => { if (active) setLoading(false); });

    void (async () => {
      try {
        const data = await readJson(await fetch("/api/dashboard/master-data/asset-types", {
          cache: "no-store",
          signal: controller.signal,
        }));
        if (!Array.isArray(data)) throw new Error("Danh sách loại tài sản phải là một mảng.");
        const parsed = data.map(toAssetType);
        if (active) setAssetTypes(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setLookupError(cause instanceof Error ? cause.message : "Không tải được loại tài sản.");
        }
      } finally {
        if (active) setLookupLoading(false);
      }
    })();

    void (async () => {
      try {
        const data = await readJson(await fetch("/api/dashboard/statuses", {
          cache: "no-store",
          signal: controller.signal,
        }));
        if (!Array.isArray(data)) throw new Error("Danh sách trạng thái phải là một mảng.");
        const parsed = data.map((entry: unknown): JobStatus => {
          if (
            !isRecord(entry) ||
            !Number.isInteger(Number(entry.id)) ||
            Number(entry.parent_id) !== 2 ||
            (entry.status_code !== "IN_USE" && entry.status_code !== "NOT_IN_USE") ||
            typeof entry.status_name !== "string"
          ) throw new Error("Dữ liệu trạng thái không hợp lệ.");
          return {
            id: Number(entry.id),
            parent_id: 2,
            status_code: entry.status_code,
            status_name: entry.status_name,
          };
        });
        if (active) setStatuses(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setStatusError(cause instanceof Error ? cause.message : "Không tải được trạng thái.");
        }
      } finally {
        if (active) setStatusLoading(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadRows]);

  const filtered = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase();
    return rows.filter((row) =>
      (filters.statusId === "" || row.status_id === filters.statusId) &&
      (!keyword || [row.code, row.name, String(row.assetTypeId ?? "")]
        .some((field) => field.toLocaleLowerCase().includes(keyword))),
    );
  }, [filters, rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = rows.find((row) => row.id === selectedId);

  const openModal = (row?: AssetGroup) => {
    if (saving) return;
    setEditing(row);
    setSaveError("");
    setModalOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get("asset-group_code") ?? "").trim();
    const name = String(form.get("asset-group_name") ?? "").trim();
    const rawAssetTypeId = String(form.get("asset-type") ?? "");
    const assetTypeId = rawAssetTypeId === "" ? null : Number(rawAssetTypeId);
    const statusId = Number(form.get("status_id"));
    if (!code) return setSaveError("Vui lòng nhập mã nhóm tài sản.");
    if (code.length > 16) return setSaveError("Mã nhóm tài sản không được vượt quá 16 ký tự.");
    if (!name) return setSaveError("Vui lòng nhập tên nhóm tài sản.");
    if (name.length > 255) return setSaveError("Tên nhóm tài sản không được vượt quá 255 ký tự.");
    if (assetTypeId !== null && !assetTypes.some((item) => item.id === assetTypeId)) {
      return setSaveError("Vui lòng chọn loại tài sản hợp lệ.");
    }
    if (!Number.isInteger(statusId)) return setSaveError("Vui lòng chọn trạng thái.");

    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(
        editing
          ? `/api/dashboard/master-data/asset-groups/${editing.id}`
          : "/api/dashboard/master-data/asset-groups",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "asset-group_code": code,
            "asset-group_name": name,
            "asset-type": assetTypeId,
            status_id: statusId,
          }),
        },
      );
      toAssetGroup(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshRows();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Không thể lưu nhóm tài sản.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || saving) return;
    if (!window.confirm(`Bạn có chắc muốn xóa nhóm tài sản "${selected.name}" không?`)) return;
    setSaving(true);
    setError("");
    try {
      toAssetGroup(await readJson(await fetch(
        `/api/dashboard/master-data/asset-groups/${selected.id}`,
        { method: "DELETE" },
      )));
      await refreshRows();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa nhóm tài sản.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <S.Page>
      <S.ToolbarSection>
        <TaskToolbar
          statuses={statuses}
          statusLoading={statusLoading}
          statusError={statusError}
          searchPlaceholder="Nhập mã, tên hoặc loại tài sản..."
          editDisabled={!selected || loading || saving}
          deleteDisabled={!selected || loading || saving}
          onAdd={() => openModal()}
          onEdit={() => selected && openModal(selected)}
          onDelete={() => void handleDelete()}
          onSearch={(next) => {
            setFilters(next);
            setPage(1);
            setSelectedId(null);
          }}
        />
        {(error || statusError || lookupError) &&
          <S.ErrorMessage role="alert">{error || statusError || lookupError}</S.ErrorMessage>}
      </S.ToolbarSection>
      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead><tr>
              <th scope="col">#</th><th scope="col">Mã nhóm</th><th scope="col">Tên nhóm tài sản</th>
              <th scope="col">Loại tài sản</th><th scope="col">Trạng thái</th>
            </tr></thead>
            <tbody>
              {!loading && visible.map((row, index) => {
                const status = statuses.find((entry) => entry.id === row.status_id);
                const assetTypeName = assetTypes.find((item) => item.id === row.assetTypeId)?.name ?? "";
                return (
                  <S.TableRow key={row.id} $selected={selectedId === row.id} onClick={() => setSelectedId(row.id)}>
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td><td>{row.code}</td>
                    <td title={row.name}>{row.name}</td><td title={assetTypeName}>{assetTypeName}</td>
                    <td><S.StatusBadge $active={status?.status_code === "IN_USE"}>
                      {status?.status_name ?? `Trạng thái #${row.status_id}`}
                    </S.StatusBadge></td>
                  </S.TableRow>
                );
              })}
              {(loading || visible.length === 0) && <tr><S.EmptyCell colSpan={5}>
                {loading ? "Đang tải nhóm tài sản..." : error ? "Không tải được danh sách." : "Không có nhóm tài sản phù hợp."}
              </S.EmptyCell></tr>}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>Tổng: <span>{filtered.length}</span> dòng</S.Total>
          <S.Pagination aria-label="Phân trang nhóm tài sản">
            <S.PageButton type="button" disabled={page === 1 || loading} onClick={() => { setPage((v) => v - 1); setSelectedId(null); }}>Trước</S.PageButton>
            <S.PageInfo>Trang {page}/{totalPages}</S.PageInfo>
            <S.PageButton type="button" disabled={page === totalPages || loading} onClick={() => { setPage((v) => v + 1); setSelectedId(null); }}>Sau</S.PageButton>
          </S.Pagination>
        </S.TableFooter>
      </S.TableSection>
      {modalOpen && (
        <AssetGroupModal
          key={editing?.id ?? "new"}
          item={editing}
          assetTypes={assetTypes}
          assetTypesLoading={lookupLoading}
          statuses={statuses}
          statusLoading={statusLoading}
          saving={saving}
          saveError={saveError}
          onClose={() => { if (!saving) { setModalOpen(false); setEditing(undefined); } }}
          onSave={(event) => void handleSave(event)}
        />
      )}
    </S.Page>
  );
}

type AssetGroupModalProps = {
  item?: AssetGroup;
  assetTypes: AssetType[];
  assetTypesLoading: boolean;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

function AssetGroupModal({
  item,
  assetTypes,
  assetTypesLoading,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: AssetGroupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeStatuses = statuses.filter((status) => status.parent_id === 2);
  const initialStatus = item?.status_id ??
    activeStatuses.find((status) => status.status_code === "IN_USE")?.id ??
    activeStatuses[0]?.id ??
    "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <M.Dialog ref={dialogRef} aria-labelledby="asset-group-modal-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <M.Header>
        <M.Title id="asset-group-modal-title">{item ? "Cập nhật nhóm tài sản" : "Thêm nhóm tài sản"}</M.Title>
        <M.CloseButton type="button" aria-label="Đóng" disabled={saving} onClick={onClose}><X size={18} /></M.CloseButton>
      </M.Header>
      <M.Form onSubmit={onSave}>
        <M.Body>
          <M.Field><M.Label htmlFor="asset-group-code">Mã nhóm tài sản <M.Required>*</M.Required></M.Label>
            <M.Input id="asset-group-code" name="asset-group_code" defaultValue={item?.code ?? ""} maxLength={16} required disabled={saving} autoFocus />
          </M.Field>
          <M.Field><M.Label htmlFor="asset-group-name">Tên nhóm tài sản <M.Required>*</M.Required></M.Label>
            <M.Input id="asset-group-name" name="asset-group_name" defaultValue={item?.name ?? ""} maxLength={255} required disabled={saving} />
          </M.Field>
          <M.Field><M.Label htmlFor="asset-group-type">Loại tài sản</M.Label>
            <M.Select
              id="asset-group-type"
              name="asset-type"
              defaultValue={item?.assetTypeId ?? ""}
              disabled={saving || assetTypesLoading}
            >
              <option value="">{assetTypesLoading ? "Đang tải loại tài sản..." : "Chọn loại tài sản"}</option>
              {assetTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </M.Select>
          </M.Field>
          <M.Field><M.Label htmlFor="asset-group-status">Trạng thái <M.Required>*</M.Required></M.Label>
            <M.Select id="asset-group-status" name="status_id" defaultValue={initialStatus} required disabled={saving || statusLoading || activeStatuses.length === 0}>
              {activeStatuses.length === 0 && <option value="">{statusLoading ? "Đang tải..." : "Không có trạng thái"}</option>}
              {activeStatuses.map((status) => <option key={status.id} value={status.id}>{status.status_name}</option>)}
            </M.Select>
          </M.Field>
          {saveError && <M.Error role="alert">{saveError}</M.Error>}
        </M.Body>
        <M.Footer>
          <M.CancelButton type="button" disabled={saving} onClick={onClose}>Hủy</M.CancelButton>
          <M.SaveButton type="submit" disabled={saving || statusLoading || activeStatuses.length === 0}>{saving ? "Đang lưu..." : "Lưu"}</M.SaveButton>
        </M.Footer>
      </M.Form>
    </M.Dialog>
  );
}
