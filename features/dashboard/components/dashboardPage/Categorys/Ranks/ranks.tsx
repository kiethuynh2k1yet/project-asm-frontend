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
import type {
  JobFilters,
  JobStatus,
} from "../constants/jobStatuses";
import * as S from "../Works/Works.styles";
import { ModalStyles as M } from "../Works/Works.styles";

const PAGE_SIZE = 10;

type Rank = {
  id: number;
  code: string;
  name: string;
  note: string;
  status_id: number;
};

type RankFormValues = Omit<Rank, "id">;

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

function toRank(value: unknown): Rank {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    !(value.rank_code === null || typeof value.rank_code === "string") ||
    !(value.rank_name === null || typeof value.rank_name === "string") ||
    !(value.note === null || typeof value.note === "string")
  ) {
    throw new Error("Dữ liệu cấp bậc không hợp lệ.");
  }

  return {
    id: value.id,
    code: value.rank_code ?? "",
    name: value.rank_name ?? "",
    note: value.note ?? "",
    status_id: value.status_id,
  };
}

export default function Ranks() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [ranksLoading, setRanksLoading] = useState(true);
  const [ranksError, setRanksError] = useState("");
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
  const [editingRank, setEditingRank] = useState<Rank>();
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

  const loadRanks = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/dashboard/ranks", {
      cache: "no-store",
      signal,
    });
    const data = await readJson(response);

    if (!Array.isArray(data)) {
      throw new Error("Danh sách cấp bậc phải là một mảng.");
    }

    return data.map(toRank);
  }, []);

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

  const refreshRanks = useCallback(async (signal?: AbortSignal) => {
    setRanksLoading(true);
    setRanksError("");

    try {
      const data = await loadRanks(signal);
      setRanks(data);
      setPage(1);
      setSelectedId(null);
    } catch (error) {
      if (signal?.aborted) return;
      setRanksError(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách cấp bậc.",
      );
    } finally {
      if (!signal?.aborted) setRanksLoading(false);
    }
  }, [loadRanks]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function run() {
      try {
        setRanksLoading(true);
        setRanksError("");
        const data = await loadRanks(controller.signal);

        if (active) {
          setRanks(data);
          setPage(1);
          setSelectedId(null);
        }
      } catch (error) {
        if (!active) return;
        setRanksError(
          controller.signal.aborted
            ? "Tải cấp bậc quá thời gian chờ."
            : error instanceof Error
              ? error.message
              : "Không tải được danh sách cấp bậc.",
        );
      } finally {
        if (active) setRanksLoading(false);
      }
    }

    void run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadRanks]);

  const filteredRanks = useMemo(() => {
    const keyword = filters.keyword.trim().toLocaleLowerCase();

    return ranks
      .filter((rank) =>
        filters.statusId === "" ||
        rank.status_id === filters.statusId,
      )
      .filter((rank) =>
        !keyword ||
        [rank.code, rank.name, rank.note].some((value) =>
          value.toLocaleLowerCase().includes(keyword),
        ),
      )
      .sort((left, right) =>
        right.code.localeCompare(left.code, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }, [filters.keyword, filters.statusId, ranks]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRanks.length / PAGE_SIZE),
  );
  const visibleRanks = filteredRanks.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const selectedRank = ranks.find((rank) => rank.id === selectedId);

  const openModal = (rank?: Rank) => {
    if (saving) return;
    setEditingRank(rank);
    setSaveError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRank(undefined);
    setSaveError("");
  };

  const handleSave = async (values: RankFormValues) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        editingRank
          ? `/api/dashboard/ranks/${editingRank.id}`
          : "/api/dashboard/ranks",
        {
          method: editingRank ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rank_code: values.code.trim(),
            rank_name: values.name.trim(),
            note: values.note.trim() || null,
            status_id: values.status_id,
          }),
        },
      );
      toRank(await readJson(response));
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu cấp bậc.",
      );
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setEditingRank(undefined);
    setSelectedId(null);

    try {
      await refreshRanks();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRank || saving) return;

    if (!window.confirm(`Bạn có chắc muốn xóa cấp bậc "${selectedRank.name}" không?`)) {
      return;
    }

    setSaving(true);
    setRanksError("");

    try {
      const response = await fetch(
        `/api/dashboard/ranks/${selectedRank.id}`,
        { method: "DELETE" },
      );
      toRank(await readJson(response));
      await refreshRanks();
    } catch (error) {
      setRanksError(
        error instanceof Error ? error.message : "Không thể xóa cấp bậc.",
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
          searchPlaceholder="Nhập mã, tên hoặc ghi chú..."
          editDisabled={!selectedRank || ranksLoading || saving}
          deleteDisabled={!selectedRank || ranksLoading || saving}
          onAdd={() => openModal()}
          onEdit={() => {
            if (selectedRank) openModal(selectedRank);
          }}
          onDelete={() => void handleDelete()}
          onSearch={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
            setSelectedId(null);
          }}
        />

        {statusError && <S.ErrorMessage role="alert">{statusError}</S.ErrorMessage>}
        {ranksError && <S.ErrorMessage role="alert">{ranksError}</S.ErrorMessage>}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table style={{ minWidth: 1000 }}>
            <colgroup>
              <col style={{ width: 65 }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "40%" }} />
              <col style={{ width: "19%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Mã cấp bậc</th>
                <th scope="col">Tên cấp bậc</th>
                <th scope="col">Ghi chú</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!ranksLoading && visibleRanks.map((rank, index) => {
                const status = statuses.find(
                  (item) => item.id === rank.status_id,
                );

                return (
                  <S.TableRow
                    key={rank.id}
                    $selected={selectedId === rank.id}
                    onClick={() => setSelectedId(rank.id)}
                  >
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td>{rank.code}</td>
                    <td title={rank.name}>{rank.name}</td>
                    <td title={rank.note}>{rank.note}</td>
                    <td>
                      <S.StatusBadge $active={status?.status_code === "IN_USE"}>
                        {status?.status_name ?? `Trạng thái #${rank.status_id}`}
                      </S.StatusBadge>
                    </td>
                  </S.TableRow>
                );
              })}
              {(ranksLoading || visibleRanks.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={5}>
                    {ranksLoading
                      ? "Đang tải cấp bậc..."
                      : ranksError
                        ? "Không tải được danh sách."
                        : "Không có cấp bậc phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>

        <S.TableFooter>
          <S.Total>Tổng: <span>{filteredRanks.length}</span> dòng</S.Total>
          <S.Pagination aria-label="Phân trang cấp bậc">
            <S.PageButton
              type="button"
              disabled={page === 1 || ranksLoading}
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
              disabled={page === totalPages || ranksLoading}
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
        <RankModal
          rank={editingRank}
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

type RankModalProps = {
  rank?: Rank;
  statuses: JobStatus[];
  statusLoading: boolean;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: RankFormValues) => Promise<void>;
};

function RankModal({
  rank,
  statuses,
  statusLoading,
  saving,
  saveError,
  onClose,
  onSave,
}: RankModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(rank?.code ?? "");
  const [name, setName] = useState(rank?.name ?? "");
  const [note, setNote] = useState(rank?.note ?? "");
  const [selectedStatusId, setSelectedStatusId] = useState<number | "">(
    rank?.status_id ?? "",
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
      setError("Vui lòng nhập mã cấp bậc.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên cấp bậc.");
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
      note,
      status_id: statusId,
    });
  };

  return (
    <M.Dialog
      ref={dialogRef}
      aria-labelledby="rank-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <M.Header>
        <M.Title id="rank-modal-title">
          {rank ? "Sửa cấp bậc" : "Thêm cấp bậc"}
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
            <M.Label htmlFor="rank-code">Mã cấp bậc <M.Required>*</M.Required></M.Label>
            <M.Input
              id="rank-code"
              value={code}
              maxLength={30}
              disabled={saving}
              onChange={(event) => setCode(event.target.value)}
              required
              autoFocus
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="rank-name">Tên cấp bậc <M.Required>*</M.Required></M.Label>
            <M.Input
              id="rank-name"
              value={name}
              maxLength={255}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="rank-note">Ghi chú</M.Label>
            <M.Input
              id="rank-note"
              value={note}
              maxLength={255}
              disabled={saving}
              onChange={(event) => setNote(event.target.value)}
            />
          </M.Field>
          <M.Field>
            <M.Label htmlFor="rank-status">Trạng thái</M.Label>
            <M.Select
              id="rank-status"
              value={statusId}
              disabled={saving || statusLoading || statuses.length === 0}
              onChange={(event) => setSelectedStatusId(Number(event.target.value))}
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