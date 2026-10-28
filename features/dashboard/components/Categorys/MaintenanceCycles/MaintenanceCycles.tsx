"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import TaskToolbar from "../components/TaskToolbar/TaskToolbar";
import type { JobFilters, JobStatus } from "../constants/jobStatuses";
import * as S from "../styles/styles";
import { ModalStyles as M } from "../styles/styles";

const PAGE_SIZE = 10;

type AssetGroup = { id: number; name: string };
type MaintenanceCycle = {
  id: number;
  assetGroupId: number | null;
  year: number | null;
  month: number | null;
  date: number | null;
  status_id: number;
};
type FormValues = Omit<MaintenanceCycle, "id">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableInteger(value: unknown): value is number | null {
  return (
    value === null || (typeof value === "number" && Number.isInteger(value))
  );
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
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    !(
      value["asset-group_name"] === null ||
      typeof value["asset-group_name"] === "string"
    )
  ) {
    throw new Error("Dữ liệu nhóm tài sản không hợp lệ.");
  }
  return { id: value.id, name: value["asset-group_name"] ?? "" };
}

function toMaintenanceCycle(value: unknown): MaintenanceCycle {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    typeof value.status_id !== "number" ||
    !Number.isInteger(value.status_id) ||
    !isNullableInteger(value["asset-group"]) ||
    !isNullableInteger(value.year) ||
    !isNullableInteger(value.month) ||
    !isNullableInteger(value.date)
  ) {
    throw new Error("Dữ liệu chu kỳ bảo dưỡng không hợp lệ.");
  }
  return {
    id: value.id,
    assetGroupId: value["asset-group"],
    year: value.year,
    month: value.month,
    date: value.date,
    status_id: value.status_id,
  };
}

function displayNumber(value: number | null): string {
  return value === null ? "" : String(value);
}

export default function MaintenanceCycles() {
  const [rows, setRows] = useState<MaintenanceCycle[]>([]);
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    statusId: "",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupsError, setGroupsError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceCycle>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadRows = useCallback(async (signal?: AbortSignal) => {
    const data = await readJson(
      await fetch("/api/dashboard/master-data/maintenance-cycles", {
        cache: "no-store",
        signal,
      }),
    );
    if (!Array.isArray(data)) {
      throw new Error("Danh sách chu kỳ bảo dưỡng phải là một mảng.");
    }
    return data.map(toMaintenanceCycle);
  }, []);

  const refreshRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await loadRows());
      setPage(1);
      setSelectedId(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không tải được danh sách chu kỳ bảo dưỡng.",
      );
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
          setError(
            cause instanceof Error
              ? cause.message
              : "Không tải được danh sách chu kỳ bảo dưỡng.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    void (async () => {
      try {
        const data = await readJson(
          await fetch("/api/dashboard/master-data/asset-groups", {
            cache: "no-store",
            signal: controller.signal,
          }),
        );
        if (!Array.isArray(data)) {
          throw new Error("Danh sách nhóm tài sản phải là một mảng.");
        }
        const parsed = data.map(toAssetGroup);
        if (active) setAssetGroups(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setGroupsError(
            cause instanceof Error
              ? cause.message
              : "Không tải được danh sách nhóm tài sản.",
          );
        }
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();

    void (async () => {
      try {
        const data = await readJson(
          await fetch("/api/dashboard/statuses", {
            cache: "no-store",
            signal: controller.signal,
          }),
        );
        if (!Array.isArray(data)) {
          throw new Error("Danh sách trạng thái phải là một mảng.");
        }
        const parsed = data.map((item: unknown): JobStatus => {
          if (
            !isRecord(item) ||
            !Number.isInteger(Number(item.id)) ||
            Number(item.parent_id) !== 2 ||
            (item.status_code !== "IN_USE" &&
              item.status_code !== "NOT_IN_USE") ||
            typeof item.status_name !== "string"
          ) {
            throw new Error("Dữ liệu trạng thái không hợp lệ.");
          }
          return {
            id: Number(item.id),
            parent_id: 2,
            status_code: item.status_code,
            status_name: item.status_name,
          };
        });
        if (active) setStatuses(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setStatusError(
            cause instanceof Error
              ? cause.message
              : "Không tải được trạng thái.",
          );
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

  const filteredRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const groupName =
        assetGroups.find((group) => group.id === row.assetGroupId)?.name ?? "";
      const values = [
        groupName,
        displayNumber(row.year),
        displayNumber(row.month),
        displayNumber(row.date),
      ];
      return (
        (filters.statusId === "" || row.status_id === filters.statusId) &&
        (!keyword ||
          values.some((value) => value.toLocaleLowerCase().includes(keyword)))
      );
    });
  }, [assetGroups, filters, rows]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const selected = rows.find((row) => row.id === selectedId);

  const openModal = (row?: MaintenanceCycle) => {
    if (saving) return;
    setEditing(row);
    setSaveError("");
    setModalOpen(true);
  };

  const handleSave = async (values: FormValues) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(
        editing
          ? `/api/dashboard/master-data/maintenance-cycles/${editing.id}`
          : "/api/dashboard/master-data/maintenance-cycles",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "asset-group": values.assetGroupId,
            year: values.year,
            month: values.month,
            date: values.date,
            status_id: values.status_id,
          }),
        },
      );
      toMaintenanceCycle(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshRows();
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "Không thể lưu chu kỳ bảo dưỡng.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || saving) return;
    if (!window.confirm("Bạn có chắc muốn xóa chu kỳ bảo dưỡng này không?")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      toMaintenanceCycle(
        await readJson(
          await fetch(
            `/api/dashboard/master-data/maintenance-cycles/${selected.id}`,
            { method: "DELETE" },
          ),
        ),
      );
      await refreshRows();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể xóa chu kỳ bảo dưỡng.",
      );
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
          searchPlaceholder="Nhập nhóm tài sản, năm, tháng hoặc ngày..."
          editDisabled={!selected || loading || saving}
          deleteDisabled={!selected || loading || saving}
          onAdd={() => openModal()}
          onEdit={() => selected && openModal(selected)}
          onDelete={() => void handleDelete()}
          onSearch={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
            setSelectedId(null);
          }}
        />
        {(error || statusError || groupsError) && (
          <S.ErrorMessage role="alert">
            {error || statusError || groupsError}
          </S.ErrorMessage>
        )}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nhóm tài sản</th>
                <th scope="col">Năm</th>
                <th scope="col">Tháng</th>
                <th scope="col">Ngày</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                visibleRows.map((row, index) => {
                  const status = statuses.find(
                    (item) => item.id === row.status_id,
                  );
                  const groupName =
                    assetGroups.find((group) => group.id === row.assetGroupId)
                      ?.name ?? "";
                  return (
                    <S.TableRow
                      key={row.id}
                      $selected={selectedId === row.id}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td title={groupName}>{groupName}</td>
                      <td>{displayNumber(row.year)}</td>
                      <td>{displayNumber(row.month)}</td>
                      <td>{displayNumber(row.date)}</td>
                      <td>
                        <S.StatusBadge
                          $active={status?.status_code === "IN_USE"}
                        >
                          {status?.status_name ??
                            `Trạng thái #${row.status_id}`}
                        </S.StatusBadge>
                      </td>
                    </S.TableRow>
                  );
                })}
              {(loading || visibleRows.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={6}>
                    {loading
                      ? "Đang tải chu kỳ bảo dưỡng..."
                      : error
                        ? "Không tải được danh sách."
                        : "Không có chu kỳ bảo dưỡng phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>
            Tổng: <span>{filteredRows.length}</span> dòng
          </S.Total>
          <S.Pagination aria-label="Phân trang chu kỳ bảo dưỡng">
            <S.PageButton
              type="button"
              disabled={page === 1 || loading}
              onClick={() => {
                setPage((current) => current - 1);
                setSelectedId(null);
              }}
            >
              Trước
            </S.PageButton>
            <S.PageInfo>
              Trang {page}/{totalPages}
            </S.PageInfo>
            <S.PageButton
              type="button"
              disabled={page === totalPages || loading}
              onClick={() => {
                setPage((current) => current + 1);
                setSelectedId(null);
              }}
            >
              Sau
            </S.PageButton>
          </S.Pagination>
        </S.TableFooter>
      </S.TableSection>

      {modalOpen && (
        <MaintenanceCycleModal
          key={editing?.id ?? "new"}
          item={editing}
          assetGroups={assetGroups}
          groupsLoading={groupsLoading}
          statuses={statuses}
          statusLoading={statusLoading}
          saving={saving}
          saveError={saveError}
          onClose={() => {
            if (!saving) {
              setModalOpen(false);
              setEditing(undefined);
            }
          }}
          onSave={handleSave}
        />
      )}
    </S.Page>
  );
}

type MaintenanceCycleModalProps = {
  item?: MaintenanceCycle;
  assetGroups: AssetGroup[];
  groupsLoading: boolean;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
};

function MaintenanceCycleModal({
  item,
  assetGroups,
  groupsLoading,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: MaintenanceCycleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [assetGroupId, setAssetGroupId] = useState<number | "">(
    item?.assetGroupId ?? "",
  );
  const [year, setYear] = useState(
    item?.year === null || item?.year === undefined ? "" : String(item.year),
  );
  const [month, setMonth] = useState(
    item?.month === null || item?.month === undefined ? "" : String(item.month),
  );
  const [date, setDate] = useState(
    item?.date === null || item?.date === undefined ? "" : String(item.date),
  );
  const [statusId, setStatusId] = useState<number | "">(item?.status_id ?? "");
  const [error, setError] = useState("");
  const activeStatuses = statuses.filter((status) => status.parent_id === 2);
  const defaultStatus =
    activeStatuses.find((status) => status.status_code === "IN_USE") ??
    activeStatuses[0];
  const resolvedStatusId =
    statusId === "" ? (defaultStatus?.id ?? "") : statusId;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const parseOptionalInteger = (
      value: string,
      label: string,
    ): number | null => {
      if (value.trim() === "") return null;
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed)) {
        throw new Error(`${label} phải là số nguyên hợp lệ.`);
      }
      return parsed;
    };

    let parsedYear: number | null;
    let parsedMonth: number | null;
    let parsedDate: number | null;
    try {
      parsedYear = parseOptionalInteger(year, "Năm");
      parsedMonth = parseOptionalInteger(month, "Tháng");
      parsedDate = parseOptionalInteger(date, "Ngày");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Năm, tháng, ngày không hợp lệ.",
      );
      return;
    }
    if (parsedYear === null && parsedMonth === null && parsedDate === null) {
      setError("Cần nhập ít nhất một trong các trường năm, tháng hoặc ngày.");
      return;
    }
    if (
      assetGroupId !== "" &&
      !assetGroups.some((group) => group.id === assetGroupId)
    ) {
      setError("Nhóm tài sản đã chọn không hợp lệ.");
      return;
    }
    if (statusLoading || typeof resolvedStatusId !== "number") {
      setError("Vui lòng chờ tải trạng thái.");
      return;
    }

    void onSave({
      assetGroupId: assetGroupId === "" ? null : assetGroupId,
      year: parsedYear,
      month: parsedMonth,
      date: parsedDate,
      status_id: resolvedStatusId,
    });
  };

  return (
    <M.Dialog
      ref={dialogRef}
      aria-labelledby="maintenance-cycle-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <M.Header>
        <M.Title id="maintenance-cycle-modal-title">
          {item ? "Cập nhật chu kỳ bảo dưỡng" : "Thêm chu kỳ bảo dưỡng"}
        </M.Title>
        <M.CloseButton
          type="button"
          aria-label="Đóng"
          disabled={saving}
          onClick={onClose}
        >
          <X size={18} />
        </M.CloseButton>
      </M.Header>
      <M.Form onSubmit={handleSubmit}>
        <M.Body>
          <M.Field>
            <M.Label htmlFor="maintenance-cycle-asset-group">
              Nhóm tài sản
            </M.Label>
            <M.Select
              id="maintenance-cycle-asset-group"
              value={assetGroupId}
              disabled={saving || groupsLoading}
              onChange={(event) =>
                setAssetGroupId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
            >
              <option value="">
                {groupsLoading
                  ? "Đang tải nhóm tài sản..."
                  : "Chọn nhóm tài sản"}
              </option>
              {assetGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </M.Select>
          </M.Field>
          <M.Field>
            <M.Label htmlFor="maintenance-cycle-year">Năm</M.Label>
            <M.Input
              id="maintenance-cycle-year"
              type="number"
              step="1"
              value={year}
              disabled={saving}
              onChange={(event) => setYear(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="maintenance-cycle-month">Tháng</M.Label>
            <M.Input
              id="maintenance-cycle-month"
              type="number"
              step="1"
              value={month}
              disabled={saving}
              onChange={(event) => setMonth(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="maintenance-cycle-date">Ngày</M.Label>
            <M.Input
              id="maintenance-cycle-date"
              type="number"
              step="1"
              value={date}
              disabled={saving}
              onChange={(event) => setDate(event.target.value)}
            />
          </M.Field>
          <M.Hint>
            Nhập ít nhất một trong ba trường năm, tháng hoặc ngày.
          </M.Hint>
          <M.Field>
            <M.Label htmlFor="maintenance-cycle-status">
              Trạng thái <M.Required>*</M.Required>
            </M.Label>
            <M.Select
              id="maintenance-cycle-status"
              value={resolvedStatusId}
              onChange={(event) =>
                setStatusId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              disabled={saving || statusLoading || activeStatuses.length === 0}
            >
              {activeStatuses.length === 0 && (
                <option value="">
                  {statusLoading ? "Đang tải..." : "Không có trạng thái"}
                </option>
              )}
              {activeStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.status_name}
                </option>
              ))}
            </M.Select>
          </M.Field>
          {error && <M.Error role="alert">{error}</M.Error>}
          {saveError && <M.Error role="alert">{saveError}</M.Error>}
        </M.Body>
        <M.Footer>
          <M.CancelButton type="button" disabled={saving} onClick={onClose}>
            Hủy
          </M.CancelButton>
          <M.SaveButton
            type="submit"
            disabled={saving || statusLoading || activeStatuses.length === 0}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </M.SaveButton>
        </M.Footer>
      </M.Form>
    </M.Dialog>
  );
}
