"use client";

import {
  useCallback,
  useEffect,
  useId,
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
import * as S from "../styles/styles";
import { ModalStyles as M } from "../styles/styles";

const PAGE_SIZE = 10;

type Location = {
  id: number;
  code: string;
  name: string;
  status_id: number;
};

type LocationFormValues = Omit<Location, "id">;

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
    let message = `API báo lỗi HTTP ${response.status}.`;

    if (isRecord(data)) {
      if (typeof data.message === "string") {
        message = data.message;
      } else if (Array.isArray(data.message)) {
        message = data.message
          .filter((item) => typeof item === "string")
          .join(", ") || message;
      }
    }

    throw new Error(message);
  }

  return data;
}

function toLocation(value: unknown): Location {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    !(value.location_code === null || typeof value.location_code === "string") ||
    !(value.location_name === null || typeof value.location_name === "string")
  ) {
    throw new Error("Dữ liệu vị trí không hợp lệ.");
  }

  return {
    id: value.id,
    code: value.location_code ?? "",
    name: value.location_name ?? "",
    status_id: value.status_id,
  };
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");
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
  const [editingLocation, setEditingLocation] = useState<Location>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadStatuses = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/dashboard/statuses", {
      cache: "no-store",
      signal,
    });
    const data = await readJson(response);

    if (!Array.isArray(data)) {
      throw new Error("Danh sách trạng thái phải là một mảng.");
    }

    return data.map((item: unknown): JobStatus => {
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
  }, []);

  const loadLocations = useCallback(
    async (signal?: AbortSignal) => {
      const query = new URLSearchParams();

      if (filters.keyword.trim()) {
        query.set("keyword", filters.keyword.trim());
      }

      if (filters.statusId !== "") {
        query.set("status_id", String(filters.statusId));
      }

      const queryString = query.toString();
      const response = await fetch(
        `/api/dashboard/master-data/locations${queryString ? `?${queryString}` : ""}`,
        { cache: "no-store", signal },
      );
      const data = await readJson(response);

      if (!Array.isArray(data)) {
        throw new Error("Danh sách vị trí phải là một mảng.");
      }

      return data.map(toLocation);
    },
    [filters.keyword, filters.statusId],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function run() {
      try {
        setStatusLoading(true);
        setStatusError("");
        const data = await loadStatuses(controller.signal);
        if (active) setStatuses(data);
      } catch (error) {
        if (!active) return;
        setStatusError(
          controller.signal.aborted
            ? "Tải trạng thái quá thời gian chờ."
            : error instanceof Error
              ? error.message
              : "Không tải được trạng thái.",
        );
      } finally {
        if (active) setStatusLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadStatuses]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    let active = true;

    async function run() {
      try {
        setLocationsLoading(true);
        setLocationsError("");
        const data = await loadLocations(controller.signal);

        if (active) {
          setLocations(data);
          setPage(1);
          setSelectedId(null);
        }
      } catch (error) {
        if (!active) return;
        setLocations([]);
        setLocationsError(
          controller.signal.aborted
            ? "Tải vị trí quá thời gian chờ."
            : error instanceof Error
              ? error.message
              : "Không tải được danh sách vị trí.",
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLocationsLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadLocations]);

  const selectedLocation = locations.find(
    (location) => location.id === selectedId,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(locations.length / PAGE_SIZE),
  );
  const visibleLocations = locations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const openModal = (location?: Location) => {
    if (saving) return;
    setEditingLocation(location);
    setSaveError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingLocation(undefined);
    setSaveError("");
  };

  const handleSave = async (values: LocationFormValues) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        editingLocation
          ? `/api/dashboard/master-data/locations/${editingLocation.id}`
          : "/api/dashboard/master-data/locations",
        {
          method: editingLocation ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_code: values.code.trim(),
            location_name: values.name.trim(),
            status_id: values.status_id,
          }),
        },
      );
      toLocation(await readJson(response));
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu vị trí.",
      );
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setEditingLocation(undefined);
    setSelectedId(null);

    try {
      setLocationsLoading(true);
      setLocationsError("");
      const updatedLocations = await loadLocations();
      setLocations(updatedLocations);
      setPage(1);
    } catch (error) {
      setLocationsError(
        `Đã lưu vị trí, nhưng chưa tải lại được danh sách: ${
          error instanceof Error ? error.message : "Lỗi không xác định."
        }`,
      );
    } finally {
      setLocationsLoading(false);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLocation || saving) return;

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa vị trí "${selectedLocation.name}" không?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setLocationsError("");

    try {
      const response = await fetch(
        `/api/dashboard/master-data/locations/${selectedLocation.id}`,
        { method: "DELETE" },
      );
      toLocation(await readJson(response));
    } catch (error) {
      setLocationsError(
        error instanceof Error ? error.message : "Không thể xóa vị trí.",
      );
      setSaving(false);
      return;
    }

    setSelectedId(null);

    try {
      setLocationsLoading(true);
      const updatedLocations = await loadLocations();
      setLocations(updatedLocations);
      setPage(1);
    } catch (error) {
      setLocationsError(
        `Đã xóa vị trí, nhưng chưa tải lại được danh sách: ${
          error instanceof Error ? error.message : "Lỗi không xác định."
        }`,
      );
    } finally {
      setLocationsLoading(false);
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
          searchPlaceholder="Nhập mã hoặc tên vị trí..."
          editDisabled={!selectedLocation || locationsLoading || saving}
          deleteDisabled={!selectedLocation || locationsLoading || saving}
          onAdd={() => openModal()}
          onEdit={() => {
            if (selectedLocation) openModal(selectedLocation);
          }}
          onDelete={() => void handleDelete()}
          onSearch={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
            setSelectedId(null);
          }}
        />

        {statusError && (
          <S.ErrorMessage role="alert">{statusError}</S.ErrorMessage>
        )}
        {locationsError && (
          <S.ErrorMessage role="alert">{locationsError}</S.ErrorMessage>
        )}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table>
            <colgroup>
              <col style={{ width: "65px" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "45%" }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Mã vị trí</th>
                <th scope="col">Tên vị trí</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!locationsLoading &&
                visibleLocations.map((location, index) => {
                  const status = statuses.find(
                    (item) => item.id === location.status_id,
                  );

                  return (
                    <S.TableRow
                      key={location.id}
                      $selected={selectedId === location.id}
                      onClick={() => setSelectedId(location.id)}
                    >
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td>{location.code}</td>
                      <td title={location.name}>{location.name}</td>
                      <td>
                        <S.StatusBadge
                          $active={status?.status_code === "IN_USE"}
                        >
                          {status?.status_name ??
                            `Trạng thái #${location.status_id}`}
                        </S.StatusBadge>
                      </td>
                    </S.TableRow>
                  );
                })}

              {(locationsLoading || visibleLocations.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={4}>
                    {locationsLoading
                      ? "Đang tải vị trí..."
                      : locationsError
                        ? "Không tải được danh sách."
                        : "Không có vị trí phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>

        <S.TableFooter>
          <S.Total>
            Tổng: <span>{locations.length}</span> dòng
          </S.Total>
          <S.Pagination aria-label="Phân trang vị trí">
            <S.PageButton
              type="button"
              disabled={page === 1 || locationsLoading}
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
              disabled={page === totalPages || locationsLoading}
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
        <LocationModal
          location={editingLocation}
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

type LocationModalProps = {
  location?: Location;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: LocationFormValues) => Promise<void>;
};

function LocationModal({
  location,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: LocationModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(location?.code ?? "");
  const [name, setName] = useState(location?.name ?? "");
  const [selectedStatusId, setSelectedStatusId] = useState<number | "">(
    location?.status_id ?? "",
  );
  const [error, setError] = useState("");
  const defaultStatus =
    statuses.find((item) => item.status_code === "IN_USE") ?? statuses[0];
  const statusId =
    selectedStatusId === ""
      ? (defaultStatus?.id ?? "")
      : selectedStatusId;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Vui lòng nhập mã vị trí.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên vị trí.");
      return;
    }
    if (
      statusLoading ||
      typeof statusId !== "number" ||
      !statuses.some((item) => item.id === statusId)
    ) {
      setError("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }

    void onSave({
      code,
      name,
      status_id: statusId,
    });
  };

  return (
    <M.Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <M.Header>
        <M.Title id={`${id}-title`}>
          {location ? "Sửa vị trí" : "Thêm vị trí"}
        </M.Title>
        <M.CloseButton
          type="button"
          aria-label="Đóng"
          disabled={saving}
          onClick={onClose}
        >
          <X size={23} aria-hidden="true" />
        </M.CloseButton>
      </M.Header>
      <M.Form onSubmit={handleSubmit}>
        <M.Body>
          <M.Field>
            <M.Label htmlFor={`${id}-code`}>
              Mã vị trí <M.Required>*</M.Required>
            </M.Label>
            <M.Input
              id={`${id}-code`}
              value={code}
              maxLength={30}
              disabled={saving}
              onChange={(event) => setCode(event.target.value)}
              required
              autoFocus
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor={`${id}-name`}>
              Tên vị trí <M.Required>*</M.Required>
            </M.Label>
            <M.Input
              id={`${id}-name`}
              value={name}
              maxLength={255}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor={`${id}-status`}>Trạng thái</M.Label>
            <M.Select
              id={`${id}-status`}
              value={statusId}
              disabled={saving || statusLoading || statuses.length === 0}
              onChange={(event) =>
                setSelectedStatusId(Number(event.target.value))
              }
              required
            >
              {statuses.length === 0 && (
                <option value="">
                  {statusLoading ? "Đang tải..." : "Không có trạng thái"}
                </option>
              )}
              {statuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.status_name}
                </option>
              ))}
            </M.Select>
          </M.Field>
          {(error || saveError) && (
            <M.Error role="alert">{error || saveError}</M.Error>
          )}
        </M.Body>
        <M.Footer>
          <M.CancelButton type="button" disabled={saving} onClick={onClose}>
            Hủy
          </M.CancelButton>
          <M.SaveButton type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </M.SaveButton>
        </M.Footer>
      </M.Form>
    </M.Dialog>
  );
}
