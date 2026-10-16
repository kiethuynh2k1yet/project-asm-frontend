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

type AssetType = { id: number; name: string };
type AssetGroup = { id: number; name: string; assetTypeId: number | null };
type AssetCategory = {
  id: number;
  code: string;
  name: string;
  assetTypeId: number | null;
  assetGroupId: number | null;
  status_id: number;
};
type FormValues = Omit<AssetCategory, "id">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOptionalInteger(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value));
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

function toAssetType(value: unknown): AssetType {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    !(value["asset-types_name"] === null ||
      typeof value["asset-types_name"] === "string")
  ) {
    throw new Error("Dữ liệu loại tài sản không hợp lệ.");
  }
  return { id: value.id, name: value["asset-types_name"] ?? "" };
}

function toAssetGroup(value: unknown): AssetGroup {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    !(value["asset-group_name"] === null ||
      typeof value["asset-group_name"] === "string") ||
    !isOptionalInteger(value["asset-type"])
  ) {
    throw new Error("Dữ liệu nhóm tài sản không hợp lệ.");
  }
  return {
    id: value.id,
    name: value["asset-group_name"] ?? "",
    assetTypeId: value["asset-type"],
  };
}

function toAssetCategory(value: unknown): AssetCategory {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    typeof value.status_id !== "number" ||
    !Number.isInteger(value.status_id) ||
    !(value["asset-category_code"] === null ||
      typeof value["asset-category_code"] === "string") ||
    !(value["asset-category_name"] === null ||
      typeof value["asset-category_name"] === "string") ||
    !isOptionalInteger(value["asset-type"]) ||
    !isOptionalInteger(value["asset-group"])
  ) {
    throw new Error("Dữ liệu chủng loại tài sản không hợp lệ.");
  }
  return {
    id: value.id,
    code: value["asset-category_code"] ?? "",
    name: value["asset-category_name"] ?? "",
    assetTypeId: value["asset-type"],
    assetGroupId: value["asset-group"],
    status_id: value.status_id,
  };
}

export default function AssetCategorys() {
  const [rows, setRows] = useState<AssetCategory[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    statusId: "",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AssetCategory>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadRows = useCallback(async (signal?: AbortSignal) => {
    const data = await readJson(await fetch(
      "/api/dashboard/master-data/asset-categorys",
      { cache: "no-store", signal },
    ));
    if (!Array.isArray(data)) {
      throw new Error("Danh sách chủng loại tài sản phải là một mảng.");
    }
    return data.map(toAssetCategory);
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
          : "Không tải được danh sách chủng loại tài sản.",
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
              : "Không tải được danh sách chủng loại tài sản.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    void (async () => {
      try {
        const data = await readJson(await fetch(
          "/api/dashboard/master-data/asset-types",
          { cache: "no-store", signal: controller.signal },
        ));
        if (!Array.isArray(data)) {
          throw new Error("Danh sách loại tài sản phải là một mảng.");
        }
        const parsed = data.map(toAssetType);
        if (active) setAssetTypes(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setLookupError(
            cause instanceof Error
              ? cause.message
              : "Không tải được danh sách loại tài sản.",
          );
        }
      }
    })();

    void (async () => {
      try {
        const data = await readJson(await fetch(
          "/api/dashboard/master-data/asset-groups",
          { cache: "no-store", signal: controller.signal },
        ));
        if (!Array.isArray(data)) {
          throw new Error("Danh sách nhóm tài sản phải là một mảng.");
        }
        const parsed = data.map(toAssetGroup);
        if (active) setAssetGroups(parsed);
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setLookupError(
            cause instanceof Error
              ? cause.message
              : "Không tải được danh sách nhóm tài sản.",
          );
        }
      } finally {
        if (active) setLookupsLoading(false);
      }
    })();

    void (async () => {
      try {
        const data = await readJson(await fetch("/api/dashboard/statuses", {
          cache: "no-store",
          signal: controller.signal,
        }));
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
      const typeName =
        assetTypes.find((type) => type.id === row.assetTypeId)?.name ?? "";
      const groupName =
        assetGroups.find((group) => group.id === row.assetGroupId)?.name ?? "";
      return (
        (filters.statusId === "" || row.status_id === filters.statusId) &&
        (!keyword ||
          [row.code, row.name, typeName, groupName].some((value) =>
            value.toLocaleLowerCase().includes(keyword),
          ))
      );
    });
  }, [assetGroups, assetTypes, filters, rows]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const selected = rows.find((row) => row.id === selectedId);

  const openModal = (row?: AssetCategory) => {
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
          ? `/api/dashboard/master-data/asset-categorys/${editing.id}`
          : "/api/dashboard/master-data/asset-categorys",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "asset-type": values.assetTypeId,
            "asset-group": values.assetGroupId,
            "asset-category_code": values.code.trim() || null,
            "asset-category_name": values.name.trim(),
            status_id: values.status_id,
          }),
        },
      );
      toAssetCategory(await readJson(response));
      setModalOpen(false);
      setEditing(undefined);
      await refreshRows();
    } catch (cause) {
      setSaveError(
        cause instanceof Error
          ? cause.message
          : "Không thể lưu chủng loại tài sản.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || saving) return;
    if (!window.confirm(`Bạn có chắc muốn xóa chủng loại "${selected.name}" không?`)) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      toAssetCategory(await readJson(await fetch(
        `/api/dashboard/master-data/asset-categorys/${selected.id}`,
        { method: "DELETE" },
      )));
      await refreshRows();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể xóa chủng loại tài sản.",
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
          searchPlaceholder="Nhập mã, tên, loại hoặc nhóm tài sản..."
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
        {(error || statusError || lookupError) && (
          <S.ErrorMessage role="alert">
            {error || statusError || lookupError}
          </S.ErrorMessage>
        )}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Mã chủng loại</th>
                <th scope="col">Tên chủng loại tài sản</th>
                <th scope="col">Loại tài sản</th>
                <th scope="col">Nhóm tài sản</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                visibleRows.map((row, index) => {
                  const status = statuses.find(
                    (item) => item.id === row.status_id,
                  );
                  const typeName =
                    assetTypes.find((type) => type.id === row.assetTypeId)
                      ?.name ?? "";
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
                      <td>{row.code}</td>
                      <td title={row.name}>{row.name}</td>
                      <td title={typeName}>{typeName}</td>
                      <td title={groupName}>{groupName}</td>
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
                      ? "Đang tải chủng loại tài sản..."
                      : error
                        ? "Không tải được danh sách."
                        : "Không có chủng loại tài sản phù hợp."}
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
          <S.Pagination aria-label="Phân trang chủng loại tài sản">
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
        <AssetCategoryModal
          key={editing?.id ?? "new"}
          item={editing}
          assetTypes={assetTypes}
          assetGroups={assetGroups}
          lookupsLoading={lookupsLoading}
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

type AssetCategoryModalProps = {
  item?: AssetCategory;
  assetTypes: AssetType[];
  assetGroups: AssetGroup[];
  lookupsLoading: boolean;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
};

function AssetCategoryModal({
  item,
  assetTypes,
  assetGroups,
  lookupsLoading,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: AssetCategoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [assetTypeId, setAssetTypeId] = useState<number | "">(
    item?.assetTypeId ?? "",
  );
  const [assetGroupId, setAssetGroupId] = useState<number | "">(
    item?.assetGroupId ?? "",
  );
  const [statusId, setStatusId] = useState<number | "">(
    item?.status_id ?? "",
  );
  const [error, setError] = useState("");
  const activeStatuses = statuses.filter((status) => status.parent_id === 2);
  const defaultStatus =
    activeStatuses.find((status) => status.status_code === "IN_USE") ??
    activeStatuses[0];
  const resolvedStatusId =
    statusId === "" ? (defaultStatus?.id ?? "") : statusId;
  const compatibleGroups = assetGroups.filter(
    (group) => group.assetTypeId === assetTypeId,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    if (trimmedCode.length > 16) {
      setError("Mã chủng loại không được vượt quá 16 ký tự.");
      return;
    }
    if (!trimmedName) {
      setError("Vui lòng nhập tên chủng loại tài sản.");
      return;
    }
    if (trimmedName.length > 255) {
      setError("Tên chủng loại không được vượt quá 255 ký tự.");
      return;
    }
    if (statusLoading || typeof resolvedStatusId !== "number") {
      setError("Vui lòng chờ tải trạng thái.");
      return;
    }
    if (assetTypeId !== "" && !assetTypes.some((type) => type.id === assetTypeId)) {
      setError("Loại tài sản đã chọn không hợp lệ.");
      return;
    }
    if (
      assetGroupId !== "" &&
      !compatibleGroups.some((group) => group.id === assetGroupId)
    ) {
      setError("Nhóm tài sản không thuộc loại tài sản đã chọn.");
      return;
    }
    if (assetGroupId !== "" && assetTypeId === "") {
      setError("Chọn loại tài sản trước khi chọn nhóm tài sản.");
      return;
    }

    void onSave({
      code: trimmedCode,
      name: trimmedName,
      assetTypeId: assetTypeId === "" ? null : assetTypeId,
      assetGroupId: assetGroupId === "" ? null : assetGroupId,
      status_id: resolvedStatusId,
    });
  };

  return (
    <M.Dialog
      ref={dialogRef}
      aria-labelledby="asset-category-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <M.Header>
        <M.Title id="asset-category-modal-title">
          {item ? "Cập nhật chủng loại tài sản" : "Thêm chủng loại tài sản"}
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
            <M.Label htmlFor="asset-category-code">Mã chủng loại</M.Label>
            <M.Input
              id="asset-category-code"
              value={code}
              maxLength={16}
              disabled={saving}
              onChange={(event) => setCode(event.target.value)}
              autoFocus
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="asset-category-name">
              Tên chủng loại tài sản <M.Required>*</M.Required>
            </M.Label>
            <M.Input
              id="asset-category-name"
              value={name}
              maxLength={255}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="asset-category-type">Loại tài sản</M.Label>
            <M.Select
              id="asset-category-type"
              value={assetTypeId}
              disabled={saving || lookupsLoading}
              onChange={(event) => {
                const nextTypeId = event.target.value
                  ? Number(event.target.value)
                  : "";
                setAssetTypeId(nextTypeId);
                if (
                  assetGroupId !== "" &&
                  !assetGroups.some(
                    (group) =>
                      group.id === assetGroupId &&
                      group.assetTypeId === nextTypeId,
                  )
                ) {
                  setAssetGroupId("");
                }
              }}
            >
              <option value="">
                {lookupsLoading ? "Đang tải loại tài sản..." : "Chọn loại tài sản"}
              </option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </M.Select>
          </M.Field>
          <M.Field>
            <M.Label htmlFor="asset-category-group">Nhóm tài sản</M.Label>
            <M.Select
              id="asset-category-group"
              value={assetGroupId}
              disabled={
                saving ||
                lookupsLoading ||
                assetTypeId === "" ||
                compatibleGroups.length === 0
              }
              onChange={(event) =>
                setAssetGroupId(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
            >
              <option value="">
                {lookupsLoading
                  ? "Đang tải nhóm tài sản..."
                  : assetTypeId === ""
                    ? "Chọn loại tài sản trước"
                    : compatibleGroups.length === 0
                      ? "Không có nhóm tài sản phù hợp"
                      : "Chọn nhóm tài sản"}
              </option>
              {compatibleGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </M.Select>
          </M.Field>
          <M.Field>
            <M.Label htmlFor="asset-category-status">
              Trạng thái <M.Required>*</M.Required>
            </M.Label>
            <M.Select
              id="asset-category-status"
              value={resolvedStatusId}
              onChange={(event) =>
                setStatusId(event.target.value ? Number(event.target.value) : "")
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
