"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { X } from "lucide-react";

import TaskToolbar from "../../Categorys/components/TaskToolbar/TaskToolbar";
import type {
  JobFilters,
  JobStatus,
} from "../../Categorys/constants/jobStatuses";
import * as S from "./styles/styles";

const PAGE_SIZE = 10;

type RoomType = {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
  isFinalLevel: boolean;
  description: string;
  status_id: number;
};

type RoomTypeFormValues = Omit<RoomType, "id">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBooleanValue(value: unknown): value is boolean | 0 | 1 {
  return value === true || value === false || value === 0 || value === 1;
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

function toRoomType(value: unknown): RoomType {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    typeof value["organization-code"] !== "string" ||
    typeof value["organization-levels-name"] !== "string" ||
    typeof value["sort-order"] !== "number" ||
    !Number.isInteger(value["sort-order"]) ||
    !isBooleanValue(value["is-final-level"]) ||
    !(value.description === null || typeof value.description === "string")
  ) {
    throw new Error("Dữ liệu loại phòng ban không hợp lệ.");
  }

  return {
    id: value.id,
    code: value["organization-code"],
    name: value["organization-levels-name"],
    sortOrder: value["sort-order"],
    isFinalLevel:
      value["is-final-level"] === true || value["is-final-level"] === 1,
    description: value.description ?? "",
    status_id: value.status_id,
  };
}

export default function RoomTypes() {
  const [items, setItems] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
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
  const [editing, setEditing] = useState<RoomType>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadItems = useCallback(async (signal?: AbortSignal) => {
    const query = new URLSearchParams();
    if (filters.keyword.trim()) query.set("keyword", filters.keyword.trim());
    if (filters.statusId !== "") {
      query.set("status_id", String(filters.statusId));
    }
    const queryString = query.toString();
    const response = await fetch(
      `/api/dashboard/master-data/room-types${queryString ? `?${queryString}` : ""}`,
      { cache: "no-store", signal },
    );
    const data = await readJson(response);
    if (!Array.isArray(data)) {
      throw new Error("Danh sách loại phòng ban phải là một mảng.");
    }
    return data.map(toRoomType);
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadStatuses() {
      try {
        const response = await fetch("/api/dashboard/statuses", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await readJson(response);
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
            parent_id: Number(item.parent_id),
            status_code: item.status_code,
            status_name: item.status_name,
          };
        });
        if (active) setStatuses(parsed);
      } catch (error) {
        if (active) {
          setStatusError(
            error instanceof Error
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

    async function load() {
      setLoading(true);
      setListError("");
      try {
        const data = await loadItems(controller.signal);
        if (active) {
          setItems(data);
          setPage(1);
          setSelectedId(null);
        }
      } catch (error) {
        if (active) {
          setItems([]);
          setListError(
            controller.signal.aborted
              ? "Tải loại phòng ban quá thời gian chờ."
              : error instanceof Error
                ? error.message
                : "Không tải được danh sách loại phòng ban.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadItems]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visibleItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedItem = items.find((item) => item.id === selectedId);

  const refreshItems = async () => {
    setLoading(true);
    setListError("");
    try {
      setItems(await loadItems());
      setPage(1);
      setSelectedId(null);
    } catch (error) {
      setListError(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách loại phòng ban.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: RoomType) => {
    if (saving) return;
    setEditing(item);
    setSaveError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(undefined);
    setSaveError("");
  };

  const handleSave = async (values: RoomTypeFormValues) => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(
        editing
          ? `/api/dashboard/master-data/room-types/${editing.id}`
          : "/api/dashboard/master-data/room-types",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "organization-code": values.code,
            "organization-levels-name": values.name,
            "sort-order": values.sortOrder,
            "is-final-level": values.isFinalLevel,
            description: values.description.trim() || null,
            status_id: values.status_id,
          }),
        },
      );
      toRoomType(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshItems();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu loại phòng ban.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || saving) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa loại phòng ban "${selectedItem.name}" không?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setListError("");
    try {
      const response = await fetch(
        `/api/dashboard/master-data/room-types/${selectedItem.id}`,
        { method: "DELETE" },
      );
      toRoomType(await readJson(response));
      await refreshItems();
    } catch (error) {
      setListError(
        error instanceof Error
          ? error.message
          : "Không thể xóa loại phòng ban.",
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
          searchPlaceholder="Nhập mã, tên hoặc mô tả..."
          editDisabled={!selectedItem || loading || saving}
          deleteDisabled={!selectedItem || loading || saving}
          onAdd={() => openModal()}
          onEdit={() => selectedItem && openModal(selectedItem)}
          onDelete={() => void handleDelete()}
          onSearch={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
            setSelectedId(null);
          }}
        />
        {statusError && <S.ErrorMessage role="alert">{statusError}</S.ErrorMessage>}
        {listError && <S.ErrorMessage role="alert">{listError}</S.ErrorMessage>}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Mã cấp phòng ban</th>
                <th scope="col">Tên cấp phòng ban</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Thứ tự cấp</th>
                <th scope="col">Cấp cuối</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!loading && visibleItems.map((item, index) => {
                const status = statuses.find((entry) => entry.id === item.status_id);
                return (
                  <S.TableRow
                    key={item.id}
                    $selected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td>{item.code}</td>
                    <td title={item.name}>{item.name}</td>
                    <td title={item.description}>{item.description}</td>
                    <td>{item.sortOrder}</td>
                    <td>{item.isFinalLevel ? "Có" : "Không"}</td>
                    <td>
                      <S.StatusBadge $active={status?.status_code === "IN_USE"}>
                        {status?.status_name ?? `Trạng thái #${item.status_id}`}
                      </S.StatusBadge>
                    </td>
                  </S.TableRow>
                );
              })}
              {(loading || visibleItems.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={7}>
                    {loading
                      ? "Đang tải loại phòng ban..."
                      : listError
                        ? "Không tải được danh sách."
                        : "Không có loại phòng ban phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>Tổng: <span>{items.length}</span> dòng</S.Total>
          <S.Pagination aria-label="Phân trang loại phòng ban">
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
        <RoomTypeModal
          item={editing}
          statuses={statuses}
          statusLoading={statusLoading}
          saving={saving}
          saveError={saveError}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </S.Page>
  );
}

type RoomTypeModalProps = {
  item?: RoomType;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: RoomTypeFormValues) => Promise<void>;
};

function RoomTypeModal({
  item,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: RoomTypeModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [sortOrder, setSortOrder] = useState<number | "">(item?.sortOrder ?? "");
  const [isFinalLevel, setIsFinalLevel] = useState(item?.isFinalLevel ?? false);
  const [statusId, setStatusId] = useState<number | "">(item?.status_id ?? "");
  const [error, setError] = useState("");
  const defaultStatus = statuses.find((entry) => entry.status_code === "IN_USE") ?? statuses[0];
  const resolvedStatusId = statusId === "" ? (defaultStatus?.id ?? "") : statusId;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();
    setError("");
    if (saving) return;

    if (!code.trim()) {
      setError("Vui lòng nhập mã cấp phòng ban.");
      return;
    }
    if (code.trim().length > 50) {
      setError("Mã cấp phòng ban không được vượt quá 50 ký tự.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên cấp phòng ban.");
      return;
    }
    if (sortOrder === "" || ![1, 2, 3, 4].includes(sortOrder)) {
      setError("Vui lòng chọn thứ tự cấp từ 1 đến 4.");
      return;
    }
    if (description.length > 500) {
      setError("Mô tả không được vượt quá 500 ký tự.");
      return;
    }
    if (
      statusLoading ||
      typeof resolvedStatusId !== "number" ||
      !statuses.some((entry) => entry.id === resolvedStatusId)
    ) {
      setError("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }

    void onSave({
      code: code.trim(),
      name: name.trim(),
      description,
      sortOrder,
      isFinalLevel,
      status_id: resolvedStatusId,
    });
  };

  return (
    <S.Modal.Dialog ref={dialogRef} aria-labelledby={`${id}-title`} onCancel={onClose}>
      <S.Modal.Header>
        <S.Modal.Title id={`${id}-title`}>
          {item ? "Sửa loại phòng ban" : "Thêm loại phòng ban"}
        </S.Modal.Title>
        <S.Modal.CloseButton
          type="button"
          aria-label="Đóng"
          onClick={onClose}
          disabled={saving}
        >
          <X size={18} aria-hidden="true" />
        </S.Modal.CloseButton>
      </S.Modal.Header>
      <S.Modal.Form onSubmit={handleSubmit}>
        <S.Modal.Body>
          <S.Modal.Field>
            <S.Modal.Label htmlFor={`${id}-code`}>
              Mã cấp phòng ban <S.Modal.Required>*</S.Modal.Required>
            </S.Modal.Label>
            <S.Modal.Input
              id={`${id}-code`}
              value={code}
              maxLength={50}
              required
              onChange={(event) => setCode(event.target.value)}
            />
          </S.Modal.Field>
          <S.Modal.Field>
            <S.Modal.Label htmlFor={`${id}-name`}>
              Tên cấp phòng ban <S.Modal.Required>*</S.Modal.Required>
            </S.Modal.Label>
            <S.Modal.Input
              id={`${id}-name`}
              value={name}
              maxLength={255}
              required
              onChange={(event) => setName(event.target.value)}
            />
          </S.Modal.Field>
          <S.Modal.Field>
            <S.Modal.Label htmlFor={`${id}-description`}>Mô tả</S.Modal.Label>
            <S.Modal.Textarea
              id={`${id}-description`}
              value={description}
              maxLength={500}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
            />
          </S.Modal.Field>
          <S.Modal.Field>
            <S.Modal.Label htmlFor={`${id}-sort-order`}>
              Thứ tự cấp <S.Modal.Required>*</S.Modal.Required>
            </S.Modal.Label>
            <S.Modal.Select
              id={`${id}-sort-order`}
              value={sortOrder}
              required
              onChange={(event) =>
                setSortOrder(event.target.value === "" ? "" : Number(event.target.value))
              }
            >
              <option value="">Chọn thứ tự cấp</option>
              {[1, 2, 3, 4].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </S.Modal.Select>
          </S.Modal.Field>
          <S.Modal.CheckField>
            <input
              id={`${id}-final-level`}
              type="checkbox"
              checked={isFinalLevel}
              onChange={(event) => setIsFinalLevel(event.target.checked)}
            />
            <S.Modal.Label htmlFor={`${id}-final-level`}>Cấp cuối cùng</S.Modal.Label>
          </S.Modal.CheckField>
          <S.Modal.Field>
            <S.Modal.Label htmlFor={`${id}-status`}>
              Trạng thái <S.Modal.Required>*</S.Modal.Required>
            </S.Modal.Label>
            <S.Modal.Select
              id={`${id}-status`}
              value={resolvedStatusId}
              disabled={statusLoading || statuses.length === 0}
              onChange={(event) =>
                setStatusId(event.target.value === "" ? "" : Number(event.target.value))
              }
            >
              <option value="">Chọn trạng thái</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.status_name}</option>
              ))}
            </S.Modal.Select>
          </S.Modal.Field>
          {error && <S.Modal.Error role="alert">{error}</S.Modal.Error>}
          {saveError && <S.Modal.Error role="alert">{saveError}</S.Modal.Error>}
        </S.Modal.Body>
        <S.Modal.Footer>
          <S.Modal.CancelButton type="button" disabled={saving} onClick={onClose}>
            Hủy
          </S.Modal.CancelButton>
          <S.Modal.SaveButton
            type="submit"
            disabled={saving || statusLoading || statuses.length === 0}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </S.Modal.SaveButton>
        </S.Modal.Footer>
      </S.Modal.Form>
    </S.Modal.Dialog>
  );
}
