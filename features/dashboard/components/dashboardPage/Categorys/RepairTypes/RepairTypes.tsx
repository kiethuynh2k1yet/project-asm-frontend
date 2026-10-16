"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import TaskToolbar from "../components/TaskToolbar/TaskToolbar";
import type {
  JobFilters,
  JobStatus,
} from "../constants/jobStatuses";
type MasterDataField = {
  key: string;
  label: string;
  required?: boolean;
};
import * as S from "../styles/styles";
import { ModalStyles as M } from "../styles/styles";

type MasterDataRow = {
  id: number;
  status_id: number;
  values: Record<string, string>;
};

type FormValues = Record<string, string>;
const PAGE_SIZE = 10;

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
    const message = isRecord(data) && typeof data.message === "string"
      ? data.message
      : `API báo lỗi HTTP ${response.status}.`;
    throw new Error(message);
  }
  return data;
}

function toRow(value: unknown, fields: MasterDataField[]): MasterDataRow {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    typeof value.status_id !== "number" ||
    !Number.isInteger(value.status_id)
  ) {
    throw new Error("Dữ liệu danh mục không hợp lệ.");
  }

  const values: FormValues = {};
  for (const field of fields) {
    const fieldValue = value[field.key];
    if (fieldValue !== null && typeof fieldValue !== "string") {
      throw new Error(`Dữ liệu ${field.label} không hợp lệ.`);
    }
    values[field.key] = fieldValue ?? "";
  }
  return { id: value.id, status_id: value.status_id, values };
}

const config = {
  resource: "repair-types",
  title: "loại sửa chữa",
  searchPlaceholder: "Nhập mã hoặc tên loại sửa chữa...",
  fields: [
    { key: "repair-type_code", label: "Mã loại sửa chữa", required: true },
    { key: "repair-type_name", label: "Tên loại sửa chữa", required: true },
  ],
};

export default function RepairTypes() {
  const apiPath = `/api/dashboard/master-data/${config.resource}`;
  const [rows, setRows] = useState<MasterDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    statusId: "",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<MasterDataRow>();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [formStatusId, setFormStatusId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  const loadRows = useCallback(
    async (signal?: AbortSignal) => {
      const data = await readJson(
        await fetch(apiPath, { cache: "no-store", signal }),
      );
      if (!Array.isArray(data)) {
        throw new Error("Danh sách danh mục phải là một mảng.");
      }
      return data.map((item: unknown) => toRow(item, config.fields));
    },
    [apiPath],
  );

  const refreshRows = async () => {
    setLoading(true);
    setDataError("");
    try {
      setRows(await loadRows());
      setPage(1);
      setSelectedId(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không tải được danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadStatuses() {
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
      } catch (error) {
        if (active) {
          setStatusError(
            controller.signal.aborted
              ? "Tải trạng thái đã bị hủy."
              : error instanceof Error
                ? error.message
                : "Không tải được trạng thái.",
          );
        }
      } finally {
        if (active) setStatusLoading(false);
      }
    }

    void loadStatuses();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void loadRows(controller.signal)
      .then((data) => {
        if (active) {
          setRows(data);
          setPage(1);
          setSelectedId(null);
        }
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) {
          setDataError(
            error instanceof Error ? error.message : "Không tải được danh mục.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadRows]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (modalOpen && dialog && !dialog.open) dialog.showModal();
    if (!modalOpen && dialog?.open) dialog.close();
  }, [modalOpen]);

  const filteredRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesStatus =
        filters.statusId === "" || row.status_id === filters.statusId;
      const matchesKeyword =
        !keyword ||
        config.fields.some((field) =>
          row.values[field.key].toLocaleLowerCase().includes(keyword),
        );
      return matchesStatus && matchesKeyword;
    });
  }, [filters.keyword, filters.statusId, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedRow = rows.find((row) => row.id === selectedId);

  const openModal = (row?: MasterDataRow) => {
    if (saving) return;
    setEditingRow(row);
    setFormValues(
      Object.fromEntries(
        config.fields.map((field) => [field.key, row?.values[field.key] ?? ""]),
      ),
    );
    setFormStatusId(row?.status_id ?? "");
    setSaveError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRow(undefined);
    setSaveError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const activeStatuses = statuses.filter((item) => item.parent_id === 2);
    const defaultStatus =
      activeStatuses.find((item) => item.status_code === "IN_USE") ??
      activeStatuses[0];
    const statusId = formStatusId === "" ? defaultStatus?.id : formStatusId;
    if (typeof statusId !== "number" || !activeStatuses.some((item) => item.id === statusId)) {
      setSaveError("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }
    for (const field of config.fields) {
      if (field.required && !formValues[field.key]?.trim()) {
        setSaveError(`Vui lòng nhập ${field.label.toLocaleLowerCase()}.`);
        return;
      }
    }

    setSaving(true);
    setSaveError("");
    try {
      const body = Object.fromEntries(
        config.fields.map((field) => [
          field.key,
          formValues[field.key]?.trim() || (field.required ? "" : null),
        ]),
      );
      const response = await fetch(
        editingRow ? `${apiPath}/${editingRow.id}` : apiPath,
        {
          method: editingRow ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, status_id: statusId }),
        },
      );
      toRow(await readJson(response), config.fields);
      setModalOpen(false);
      setEditingRow(undefined);
      await refreshRows();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || saving) return;
    const displayName =
      selectedRow.values[config.fields[1]?.key ?? config.fields[0].key];
    if (!window.confirm(`Bạn có chắc muốn xóa "${displayName}" không?`)) return;

    setSaving(true);
    setDataError("");
    try {
      toRow(
        await readJson(
          await fetch(`${apiPath}/${selectedRow.id}`, { method: "DELETE" }),
        ),
        config.fields,
      );
      await refreshRows();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không thể xóa danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const activeStatuses = statuses.filter((item) => item.parent_id === 2);
  const defaultStatus =
    activeStatuses.find((item) => item.status_code === "IN_USE") ??
    activeStatuses[0];
  const selectedStatus = formStatusId === "" ? defaultStatus?.id ?? "" : formStatusId;

  return (
    <S.Page>
      <S.ToolbarSection>
        <TaskToolbar
          statuses={statuses}
          statusLoading={statusLoading}
          statusError={statusError}
          searchPlaceholder={config.searchPlaceholder}
          editDisabled={!selectedRow || loading || saving}
          deleteDisabled={!selectedRow || loading || saving}
          onAdd={() => openModal()}
          onEdit={() => selectedRow && openModal(selectedRow)}
          onDelete={() => void handleDelete()}
          onSearch={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
            setSelectedId(null);
          }}
        />
        {statusError && <S.ErrorMessage role="alert">{statusError}</S.ErrorMessage>}
        {dataError && <S.ErrorMessage role="alert">{dataError}</S.ErrorMessage>}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead>
              <tr>
                <th scope="col">#</th>
                {config.fields.map((field) => (
                  <th scope="col" key={field.key}>{field.label}</th>
                ))}
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                visibleRows.map((row, index) => {
                  const status = activeStatuses.find((item) => item.id === row.status_id);
                  return (
                    <S.TableRow
                      key={row.id}
                      $selected={selectedId === row.id}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      {config.fields.map((field) => (
                        <td key={field.key} title={row.values[field.key]}>
                          {row.values[field.key]}
                        </td>
                      ))}
                      <td>
                        <S.StatusBadge $active={status?.status_code === "IN_USE"}>
                          {status?.status_name ?? `Trạng thái #${row.status_id}`}
                        </S.StatusBadge>
                      </td>
                    </S.TableRow>
                  );
                })}
              {(loading || visibleRows.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={config.fields.length + 2}>
                    {loading
                      ? `Đang tải ${config.title}...`
                      : dataError
                        ? "Không tải được danh sách."
                        : `Không có ${config.title} phù hợp.`}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>Tổng: <span>{filteredRows.length}</span> dòng</S.Total>
          <S.Pagination aria-label={`Phân trang ${config.title}`}>
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
            <S.PageInfo>Trang {page}/{totalPages}</S.PageInfo>
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
        <M.Dialog
          ref={dialogRef}
          aria-labelledby={`${id}-title`}
          onCancel={(event) => {
            event.preventDefault();
            closeModal();
          }}
        >
          <M.Header>
            <M.Title id={`${id}-title`}>
              {editingRow ? "Sửa" : "Thêm"} {config.title}
            </M.Title>
            <M.CloseButton type="button" aria-label="Đóng" disabled={saving} onClick={closeModal}>
              <X size={23} aria-hidden="true" />
            </M.CloseButton>
          </M.Header>
          <M.Form onSubmit={(event) => void handleSave(event)}>
            <M.Body>
              {config.fields.map((field, index) => (
                <M.Field key={field.key}>
                  <M.Label htmlFor={`${id}-${index}`}>
                    {field.label}
                    {field.required && <M.Required> *</M.Required>}
                  </M.Label>
                  <M.Input
                    id={`${id}-${index}`}
                    value={formValues[field.key] ?? ""}
                    maxLength={field.key.endsWith("code") ? 30 : 255}
                    disabled={saving}
                    onChange={(event) => {
                      setFormValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }));
                      setSaveError("");
                    }}
                    required={field.required}
                    autoFocus={index === 0}
                  />
                </M.Field>
              ))}
              <M.Field>
                <M.Label htmlFor={`${id}-status`}>Trạng thái</M.Label>
                <M.Select
                  id={`${id}-status`}
                  value={selectedStatus}
                  disabled={saving || statusLoading || activeStatuses.length === 0}
                  onChange={(event) => setFormStatusId(Number(event.target.value))}
                  required
                >
                  {activeStatuses.length === 0 && (
                    <option value="">
                      {statusLoading ? "Đang tải..." : "Không có trạng thái"}
                    </option>
                  )}
                  {activeStatuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.status_name}</option>
                  ))}
                </M.Select>
              </M.Field>
              {saveError && <M.Error role="alert">{saveError}</M.Error>}
            </M.Body>
            <M.Footer>
              <M.CancelButton type="button" disabled={saving} onClick={closeModal}>
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
      )}
    </S.Page>
  );
}
