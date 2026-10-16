"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import TaskToolbar from "../components/TaskToolbar/TaskToolbar";
import type { JobFilters, JobStatus } from "../constants/jobStatuses";
import * as S from "../styles/styles";
import { ModalStyles as M } from "../styles/styles";

const PAGE_SIZE = 10;

type Tax = {
  id: number;
  code: string;
  name: string;
  percentage: string;
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

function toTax(value: unknown): Tax {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    typeof value.status_id !== "number" ||
    !(value.tax_code === null || typeof value.tax_code === "string") ||
    !(value.tax_name === null || typeof value.tax_name === "string") ||
    !(value["tax-percentage"] === null || typeof value["tax-percentage"] === "string")
  ) {
    throw new Error("Dữ liệu thuế suất không hợp lệ.");
  }
  return {
    id: value.id as number,
    code: value.tax_code ?? "",
    name: value.tax_name ?? "",
    percentage: value["tax-percentage"] ?? "",
    status_id: value.status_id,
  };
}

export default function Taxs() {
  const [rows, setRows] = useState<Tax[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [filters, setFilters] = useState<JobFilters>({ keyword: "", statusId: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tax>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadRows = useCallback(async (signal?: AbortSignal) => {
    const data = await readJson(await fetch("/api/dashboard/master-data/taxs", {
      cache: "no-store",
      signal,
    }));
    if (!Array.isArray(data)) throw new Error("Danh sách thuế suất phải là một mảng.");
    return data.map(toTax);
  }, []);

  const refreshRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await loadRows());
      setPage(1);
      setSelectedId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được danh sách thuế suất.");
    } finally {
      setLoading(false);
    }
  }, [loadRows]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void loadRows(controller.signal)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((cause: unknown) => {
        if (active && !controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Không tải được danh sách thuế suất.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

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
      (!keyword || [row.code, row.name, row.percentage].some((field) =>
        field.toLocaleLowerCase().includes(keyword),
      )),
    );
  }, [filters, rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = rows.find((row) => row.id === selectedId);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get("tax_code") ?? "").trim();
    const name = String(form.get("tax_name") ?? "").trim();
    const percentage = String(form.get("tax-percentage") ?? "").trim();
    const statusId = Number(form.get("status_id"));
    if (!code) return setSaveError("Vui lòng nhập mã thuế.");
    if (code.length > 16) return setSaveError("Mã thuế không được vượt quá 16 ký tự.");
    if (!name) return setSaveError("Vui lòng nhập tên thuế.");
    if (name.length > 255) return setSaveError("Tên thuế không được vượt quá 255 ký tự.");
    if (percentage.length > 16) return setSaveError("Thuế suất không được vượt quá 16 ký tự.");
    if (!Number.isInteger(statusId)) return setSaveError("Vui lòng chọn trạng thái.");

    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(
        editing ? `/api/dashboard/master-data/taxs/${editing.id}` : "/api/dashboard/master-data/taxs",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tax_code: code,
            tax_name: name,
            "tax-percentage": percentage || null,
            status_id: statusId,
          }),
        },
      );
      toTax(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshRows();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Không thể lưu thuế suất.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || saving) return;
    if (!window.confirm(`Bạn có chắc muốn xóa thuế "${selected.name}" không?`)) return;
    setSaving(true);
    setError("");
    try {
      toTax(await readJson(await fetch(
        `/api/dashboard/master-data/taxs/${selected.id}`,
        { method: "DELETE" },
      )));
      await refreshRows();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa thuế suất.");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (row?: Tax) => {
    if (saving) return;
    setEditing(row);
    setSaveError("");
    setModalOpen(true);
  };

  return (
    <S.Page>
      <S.ToolbarSection>
        <TaskToolbar
          statuses={statuses}
          statusLoading={statusLoading}
          statusError={statusError}
          searchPlaceholder="Nhập mã, tên hoặc thuế suất..."
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
        {(error || statusError) && <S.ErrorMessage role="alert">{error || statusError}</S.ErrorMessage>}
      </S.ToolbarSection>
      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead><tr>
              <th scope="col">#</th><th scope="col">Mã thuế</th><th scope="col">Tên thuế</th>
              <th scope="col">Thuế suất</th><th scope="col">Trạng thái</th>
            </tr></thead>
            <tbody>
              {!loading && visible.map((row, index) => {
                const status = statuses.find((entry) => entry.id === row.status_id);
                return (
                  <S.TableRow key={row.id} $selected={selectedId === row.id} onClick={() => setSelectedId(row.id)}>
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td><td>{row.code}</td>
                    <td title={row.name}>{row.name}</td><td>{row.percentage}</td>
                    <td><S.StatusBadge $active={status?.status_code === "IN_USE"}>
                      {status?.status_name ?? `Trạng thái #${row.status_id}`}
                    </S.StatusBadge></td>
                  </S.TableRow>
                );
              })}
              {(loading || visible.length === 0) && <tr><S.EmptyCell colSpan={5}>
                {loading ? "Đang tải thuế suất..." : error ? "Không tải được danh sách." : "Không có thuế suất phù hợp."}
              </S.EmptyCell></tr>}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>Tổng: <span>{filtered.length}</span> dòng</S.Total>
          <S.Pagination aria-label="Phân trang thuế suất">
            <S.PageButton type="button" disabled={page === 1 || loading} onClick={() => { setPage((v) => v - 1); setSelectedId(null); }}>Trước</S.PageButton>
            <S.PageInfo>Trang {page}/{totalPages}</S.PageInfo>
            <S.PageButton type="button" disabled={page === totalPages || loading} onClick={() => { setPage((v) => v + 1); setSelectedId(null); }}>Sau</S.PageButton>
          </S.Pagination>
        </S.TableFooter>
      </S.TableSection>
      {modalOpen && (
        <TaxModal
          key={editing?.id ?? "new"}
          tax={editing}
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

type TaxModalProps = {
  tax?: Tax;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

function TaxModal({ tax, statuses, statusLoading, saving, saveError, onClose, onSave }: TaxModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeStatuses = statuses.filter((status) => status.parent_id === 2);
  const initialStatus = tax?.status_id ??
    activeStatuses.find((status) => status.status_code === "IN_USE")?.id ??
    activeStatuses[0]?.id ??
    "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <M.Dialog ref={dialogRef} aria-labelledby="tax-modal-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <M.Header>
        <M.Title id="tax-modal-title">{tax ? "Cập nhật thuế suất" : "Thêm thuế suất"}</M.Title>
        <M.CloseButton type="button" aria-label="Đóng" disabled={saving} onClick={onClose}><X size={18} /></M.CloseButton>
      </M.Header>
      <M.Form onSubmit={onSave}>
        <M.Body>
          <M.Field><M.Label htmlFor="tax-code">Mã thuế <M.Required>*</M.Required></M.Label>
            <M.Input id="tax-code" name="tax_code" defaultValue={tax?.code ?? ""} maxLength={16} required disabled={saving} autoFocus />
          </M.Field>
          <M.Field><M.Label htmlFor="tax-name">Tên thuế <M.Required>*</M.Required></M.Label>
            <M.Input id="tax-name" name="tax_name" defaultValue={tax?.name ?? ""} maxLength={255} required disabled={saving} />
          </M.Field>
          <M.Field><M.Label htmlFor="tax-percentage">Thuế suất</M.Label>
            <M.Input id="tax-percentage" name="tax-percentage" defaultValue={tax?.percentage ?? ""} maxLength={16} disabled={saving} />
          </M.Field>
          <M.Field><M.Label htmlFor="tax-status">Trạng thái <M.Required>*</M.Required></M.Label>
            <M.Select id="tax-status" name="status_id" defaultValue={initialStatus} required disabled={saving || statusLoading || activeStatuses.length === 0}>
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
