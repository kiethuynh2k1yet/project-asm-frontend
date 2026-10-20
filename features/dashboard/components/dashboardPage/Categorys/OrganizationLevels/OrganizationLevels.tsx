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

type OrganizationLevel = {
  id: number;
  code: string;
  name: string;
  description: string;
  levelNumber: number;
  isLastLevel: boolean;
  status_id: number;
};

type FormValues = Omit<OrganizationLevel, "id">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isBit(value: unknown): value is boolean | 0 | 1 {
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
    const message = isRecord(data) && typeof data.message === "string"
      ? data.message
      : `API báo lỗi HTTP ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

function toOrganizationLevel(value: unknown): OrganizationLevel {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    !(value["organization-level_code"] === null ||
      typeof value["organization-level_code"] === "string") ||
    !(value["organization-level_name"] === null ||
      typeof value["organization-level_name"] === "string") ||
    !(value["organization-level_description"] === null ||
      typeof value["organization-level_description"] === "string") ||
    !isInteger(value["organization-level_number"]) ||
    !isBit(value.is_last_level)
  ) {
    throw new Error("Dữ liệu cấp tổ chức không hợp lệ.");
  }

  return {
    id: value.id,
    code: value["organization-level_code"] ?? "",
    name: value["organization-level_name"] ?? "",
    description: value["organization-level_description"] ?? "",
    levelNumber: value["organization-level_number"],
    isLastLevel: value.is_last_level === true || value.is_last_level === 1,
    status_id: value.status_id,
  };
}

export default function OrganizationLevels() {
  const [items, setItems] = useState<OrganizationLevel[]>([]);
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
  const [editing, setEditing] = useState<OrganizationLevel>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadItems = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/dashboard/master-data/organization-levels", {
      cache: "no-store",
      signal,
    });
    const data = await readJson(response);
    if (!Array.isArray(data)) {
      throw new Error("Danh sách cấp tổ chức phải là một mảng.");
    }
    return data.map(toOrganizationLevel);
  }, []);

  const refreshItems = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      setItems(await loadItems());
      setPage(1);
      setSelectedId(null);
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Không tải được danh sách cấp tổ chức.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadItems]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
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
            (item.status_code !== "IN_USE" && item.status_code !== "NOT_IN_USE") ||
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
            error instanceof Error ? error.message : "Không tải được trạng thái.",
          );
        }
      } finally {
        if (active) setStatusLoading(false);
      }
    }

    void load();
    void loadItems()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setListError(
            error instanceof Error ? error.message : "Không tải được danh sách cấp tổ chức.",
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
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase();
    return items
      .filter((item) => filters.statusId === "" || item.status_id === filters.statusId)
      .filter((item) =>
        !keyword ||
        [item.code, item.name, item.description, String(item.levelNumber)]
          .some((value) => value.toLocaleLowerCase().includes(keyword)),
      )
      .sort((left, right) => left.levelNumber - right.levelNumber);
  }, [filters, items]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedItem = items.find((item) => item.id === selectedId);

  const openModal = (item?: OrganizationLevel) => {
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

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch(
        editing
          ? `/api/dashboard/master-data/organization-levels/${editing.id}`
          : "/api/dashboard/master-data/organization-levels",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "organization-level_name": values.name.trim() || null,
            "organization-level_description": values.description.trim() || null,
            "organization-level_number": values.levelNumber,
            is_last_level: values.isLastLevel,
            status_id: values.status_id,
          }),
        },
      );
      toOrganizationLevel(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshItems();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không thể lưu cấp tổ chức.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || saving) return;
    if (!window.confirm(`Bạn có chắc muốn xóa cấp tổ chức "${selectedItem.name}" không?`)) {
      return;
    }
    setSaving(true);
    setListError("");
    try {
      const response = await fetch(
        `/api/dashboard/master-data/organization-levels/${selectedItem.id}`,
        { method: "DELETE" },
      );
      toOrganizationLevel(await readJson(response));
      await refreshItems();
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Không thể xóa cấp tổ chức.");
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
                <th scope="col">Mã cấp</th>
                <th scope="col">Tên cấp tổ chức</th>
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
                    <td>{item.levelNumber}</td>
                    <td>{item.isLastLevel ? "Có" : "Không"}</td>
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
                      ? "Đang tải cấp tổ chức..."
                      : listError
                        ? "Không tải được danh sách."
                        : "Không có cấp tổ chức phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <S.TableFooter>
          <S.Total>Tổng: <span>{filteredItems.length}</span> dòng</S.Total>
          <S.Pagination aria-label="Phân trang cấp tổ chức">
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
        <OrganizationLevelModal
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

type ModalProps = {
  item?: OrganizationLevel;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
};

function OrganizationLevelModal({
  item,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [levelNumber, setLevelNumber] = useState<number | "">(item?.levelNumber ?? "");
  const [isLastLevel, setIsLastLevel] = useState(item?.isLastLevel ?? false);
  const [statusId, setStatusId] = useState<number | "">(item?.status_id ?? "");
  const [error, setError] = useState("");
  const defaultStatus = statuses.find((entry) => entry.status_code === "IN_USE") ?? statuses[0];
  const resolvedStatusId = statusId === "" ? (defaultStatus?.id ?? "") : statusId;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError("Vui lòng nhập tên cấp tổ chức.");
    if (name.trim().length > 255) return setError("Tên cấp tổ chức không được vượt quá 255 ký tự.");
    if (description.trim().length > 255) return setError("Mô tả không được vượt quá 255 ký tự.");
    if (levelNumber === "" || !Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 4) {
      return setError("Thứ tự cấp chỉ được nhập từ 1 đến 4.");
    }
    if (statusLoading || typeof resolvedStatusId !== "number") {
      return setError("Vui lòng chờ tải trạng thái.");
    }
    void onSave({
      code: item?.code ?? "",
      name,
      description,
      levelNumber,
      isLastLevel,
      status_id: resolvedStatusId,
    });
  };

  return (
    <M.Dialog
      ref={dialogRef}
      aria-labelledby="organization-level-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <M.Header>
        <M.Title id="organization-level-modal-title">
          {item ? "Cập nhật cấp tổ chức" : "Thêm cấp tổ chức"}
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
            <M.Label htmlFor="organization-level-code">Mã cấp tổ chức</M.Label>
            <M.Input
              id="organization-level-code"
              value={item?.code || "Tự tạo khi lưu"}
              readOnly
              autoFocus={!item}
            />
            <M.Hint>Mã gồm 4 chữ số, được hệ thống tự tạo khi lưu.</M.Hint>
          </M.Field>
          <M.Field>
            <M.Label htmlFor="organization-level-name">Tên cấp tổ chức <M.Required>*</M.Required></M.Label>
            <M.Input
              id="organization-level-name"
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="organization-level-description">Mô tả</M.Label>
            <M.Textarea
              id="organization-level-description"
              value={description}
              maxLength={255}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="organization-level-number">Thứ tự cấp <M.Required>*</M.Required></M.Label>
            <M.Select
              id="organization-level-number"
              value={levelNumber}
              onChange={(event) => setLevelNumber(event.target.value ? Number(event.target.value) : "")}
            >
              <option value="">Chọn thứ tự cấp</option>
              {[1, 2, 3, 4].map((number) => (
                <option key={number} value={number}>{number}</option>
              ))}
            </M.Select>
            <M.Hint>Chỉ chọn từ cấp 1 đến cấp 4.</M.Hint>
          </M.Field>
          <M.CheckField>
            <input
              id="organization-level-last"
              type="checkbox"
              checked={isLastLevel}
              onChange={(event) => setIsLastLevel(event.target.checked)}
            />
            <M.Label htmlFor="organization-level-last">Cấp cuối cùng</M.Label>
          </M.CheckField>
          <M.Field>
            <M.Label htmlFor="organization-level-status">Trạng thái <M.Required>*</M.Required></M.Label>
            <M.Select
              id="organization-level-status"
              value={resolvedStatusId}
              onChange={(event) => setStatusId(event.target.value ? Number(event.target.value) : "")}
              disabled={statusLoading || statuses.length === 0}
            >
              <option value="">Chọn trạng thái</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.status_name}</option>
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
            disabled={saving || statusLoading || statuses.length === 0}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </M.SaveButton>
        </M.Footer>
      </M.Form>
    </M.Dialog>
  );
}
