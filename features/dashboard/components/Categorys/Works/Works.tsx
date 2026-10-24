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

import TaskToolbar from "../components/TaskToolbar/TaskToolbar";

import type {
  Job,
  JobFilters,
  JobFormValues,
  JobStatus,
  WorkApiRow,
} from "../constants/jobStatuses";

import * as S from "../styles/styles";
import { ModalStyles } from "../styles/styles";

const PAGE_SIZE = 10;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `API không trả JSON (HTTP ${response.status}).`,
    );
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

function toJob(value: unknown): Job {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    !(
      value.work_code === null ||
      typeof value.work_code === "string"
    ) ||
    !(
      value.work_name === null ||
      typeof value.work_name === "string"
    )
  ) {
    throw new Error("Dữ liệu công việc không hợp lệ.");
  }

  const row = value as WorkApiRow;

  return {
    id: row.id,
    code: row.work_code ?? "",
    name: row.work_name ?? "",
    status_id: row.status_id,
  };
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [worksLoading, setWorksLoading] = useState(true);
  const [worksError, setWorksError] = useState("");

  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    statusId: "",
  });

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job>();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // GET trạng thái.
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      15000,
    );

    let active = true;

    async function loadStatuses() {
      try {
        setStatusLoading(true);
        setStatusError("");

        const response = await fetch("/api/dashboard/statuses", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await readJson(response);

        if (!Array.isArray(data)) {
          throw new Error("Trạng thái phải là một mảng.");
        }

        const normalized: JobStatus[] = data.map(
          (item: unknown) => {
            if (!isRecord(item)) {
              throw new Error("Dữ liệu trạng thái không hợp lệ.");
            }

            const id = Number(item.id);
            const parentId = Number(item.parent_id);

            if (
              item.id === null ||
              item.id === undefined ||
              !Number.isInteger(id) ||
              id < 0 ||
              id > 255 ||
              parentId !== 2 ||
              (
                item.status_code !== "IN_USE" &&
                item.status_code !== "NOT_IN_USE"
              ) ||
              typeof item.status_name !== "string"
            ) {
              throw new Error(
                "API trạng thái cần trả id, parent_id = 2, status_code và status_name.",
              );
            }

            return {
              id,
              parent_id: parentId,
              status_code: item.status_code,
              status_name: item.status_name,
            };
          },
        );

        if (active) {
          setStatuses(normalized);
        }
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
        window.clearTimeout(timeoutId);

        if (active) {
          setStatusLoading(false);
        }
      }
    }

    void loadStatuses();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const loadWorks = useCallback(
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
        `/api/dashboard/master-data/works${queryString ? `?${queryString}` : ""}`,
        {
          cache: "no-store",
          signal,
        },
      );

      const data = await readJson(response);

      if (!Array.isArray(data)) {
        throw new Error(
          "Danh sách công việc phải là một mảng.",
        );
      }

      return data.map(toJob);
    },
    [
      filters.keyword,
      filters.statusId,
    ],
  );

  // GET công việc khi mở trang hoặc đổi bộ lọc.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const timeoutId = window.setTimeout(
      () => controller.abort(),
      15000,
    );

    async function run() {
      try {
        setWorksLoading(true);
        setWorksError("");

        const data = await loadWorks(controller.signal);

        if (active) {
          setJobs(data);
          setPage(1);
          setSelectedId(null);
        }
      } catch (error) {
        if (!active) return;

        setJobs([]);
        setWorksError(
          controller.signal.aborted
            ? "Tải công việc quá thời gian chờ."
            : error instanceof Error
              ? error.message
              : "Không tải được công việc.",
        );
      } finally {
        window.clearTimeout(timeoutId);

        if (active) {
          setWorksLoading(false);
        }
      }
    }

    void run();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadWorks]);

  const selectedJob = jobs.find(
    (job) => job.id === selectedId,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(jobs.length / PAGE_SIZE),
  );

  const visibleJobs = jobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingJob(undefined);
    setSaveError("");
  };

  const handleSave = async (values: JobFormValues) => {
    if (saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        editingJob
          ? `/api/dashboard/master-data/works/${editingJob.id}`
          : "/api/dashboard/master-data/works",
        {
          method: editingJob ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            work_code: values.code,
            work_name: values.name,
            status_id: values.status_id,
          }),
        },
      );

      const data = await readJson(response);

      // Kiểm tra response lưu thành công đúng định dạng.
      toJob(data);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Không thể lưu công việc.",
      );

      setSaving(false);
      return;
    }

    setIsModalOpen(false);
    setEditingJob(undefined);
    setSelectedId(null);

    // Lưu đã thành công; lỗi tải lại không được báo là lỗi lưu.
    try {
      setWorksLoading(true);
      setWorksError("");

      const updatedJobs = await loadWorks();

      setJobs(updatedJobs);
      setPage(1);
    } catch (error) {
      setWorksError(
        `Đã lưu công việc, nhưng chưa tải lại được danh sách: ${
          error instanceof Error
            ? error.message
            : "Lỗi không xác định."
        }`,
      );
    } finally {
      setWorksLoading(false);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob || saving) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa công việc "${selectedJob.name}" không?`,
    );

    if (!confirmed) return;

    setSaving(true);
    setWorksError("");

    try {
      const response = await fetch(
        `/api/dashboard/master-data/works/${selectedJob.id}`,
        { method: "DELETE" },
      );

      toJob(await readJson(response));
    } catch (error) {
      setWorksError(
        error instanceof Error
          ? error.message
          : "Không thể xóa công việc.",
      );
      setSaving(false);
      return;
    }

    setSelectedId(null);

    try {
      setWorksLoading(true);
      const updatedJobs = await loadWorks();

      setJobs(updatedJobs);
      setPage(1);
    } catch (error) {
      setWorksError(
        `Đã xóa công việc, nhưng chưa tải lại được danh sách: ${
          error instanceof Error
            ? error.message
            : "Lỗi không xác định."
        }`,
      );
    } finally {
      setWorksLoading(false);
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
          editDisabled={
            !selectedJob || worksLoading || saving
          }
          deleteDisabled={
            !selectedJob || worksLoading || saving
          }
          onAdd={() => {
            if (saving) return;

            setEditingJob(undefined);
            setSaveError("");
            setIsModalOpen(true);
          }}
          onEdit={() => {
            if (!selectedJob || saving) return;

            setEditingJob(selectedJob);
            setSaveError("");
            setIsModalOpen(true);
          }}
          onDelete={() => {
            void handleDelete();
          }}
          onSearch={(values) => {
            setFilters(values);
            setPage(1);
            setSelectedId(null);
          }}
        />

        {statusError && (
          <S.ErrorMessage role="alert">
            {statusError}
          </S.ErrorMessage>
        )}

        {worksError && (
          <S.ErrorMessage role="alert">
            {worksError}
          </S.ErrorMessage>
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
                <th scope="col">Mã công việc</th>
                <th scope="col">Tên công việc</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {!worksLoading &&
                visibleJobs.map((job, index) => {
                  const status = statuses.find(
                    (item) =>
                      item.id === job.status_id,
                  );

                  return (
                    <S.TableRow
                      key={job.id}
                      $selected={selectedId === job.id}
                      onClick={() =>
                        setSelectedId(job.id)
                      }
                    >
                      <td>
                        {(page - 1) * PAGE_SIZE +
                          index +
                          1}
                      </td>

                      <td>
                        <S.SelectJobButton
                          type="button"
                          aria-pressed={
                            selectedId === job.id
                          }
                          onClick={() =>
                            setSelectedId(job.id)
                          }
                        >
                          {job.code}
                        </S.SelectJobButton>
                      </td>

                      <td title={job.name}>
                        {job.name}
                      </td>

                      <td>
                        <S.StatusBadge
                          $active={
                            status?.status_code ===
                            "IN_USE"
                          }
                        >
                          {status?.status_name ??
                            `Trạng thái #${job.status_id}`}
                        </S.StatusBadge>
                      </td>
                    </S.TableRow>
                  );
                })}

              {(worksLoading ||
                visibleJobs.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={4}>
                    {worksLoading
                      ? "Đang tải công việc..."
                      : worksError
                        ? "Không tải được danh sách."
                        : "Không có công việc phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>

        <S.TableFooter>
          <S.Total>
            Tổng: <span>{jobs.length}</span> dòng
          </S.Total>

          <S.Pagination aria-label="Phân trang công việc">
            <S.PageButton
              type="button"
              disabled={page === 1 || worksLoading}
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
              disabled={
                page === totalPages || worksLoading
              }
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

      {isModalOpen && (
        <WorkModal
          job={editingJob}
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

type WorkModalProps = {
  job?: Job;
  statuses: JobStatus[];
  statusLoading?: boolean;
  saving?: boolean;
  saveError?: string;
  onClose: () => void;
  onSave: (values: JobFormValues) => Promise<void>;
};

function WorkModal({
  job,
  statuses,
  statusLoading = false,
  saving = false,
  saveError = "",
  onClose,
  onSave,
}: WorkModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState(job?.code ?? "");
  const [name, setName] = useState(job?.name ?? "");
  const [selectedStatusId, setSelectedStatusId] =
    useState<number | "">(job?.status_id ?? "");
  const [error, setError] = useState("");

  const jobStatuses = statuses.filter(
    (item) => Number(item.parent_id) === 2,
  );
  const defaultStatus =
    jobStatuses.find((item) => item.status_code === "IN_USE") ??
    jobStatuses[0];
  const statusId =
    selectedStatusId === ""
      ? (defaultStatus?.id ?? "")
      : selectedStatusId;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) dialog.showModal();

    return () => dialog?.close();
  }, []);

  const handleSubmit: NonNullable<
    ComponentProps<"form">["onSubmit"]
  > = (event) => {
    event.preventDefault();
    setError("");

    if (saving) return;

    const numericCode = Number(code);

    if (
      !/^\d{1,4}$/.test(code) ||
      !Number.isInteger(numericCode) ||
      numericCode < 1 ||
      numericCode > 1000
    ) {
      setError("Mã công việc phải là số từ 1 đến 1000.");
      return;
    }

    if (!name.trim()) {
      setError("Vui lòng nhập tên công việc.");
      return;
    }

    if (
      statusLoading ||
      typeof statusId !== "number" ||
      !Number.isInteger(statusId) ||
      !jobStatuses.some((item) => item.id === statusId)
    ) {
      setError("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }

    void onSave({
      code,
      name: name.trim(),
      status_id: statusId,
    });
  };

  return (
    <ModalStyles.Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <ModalStyles.Header>
        <ModalStyles.Title id={`${id}-title`}>
          {job ? "Sửa công việc" : "Thêm công việc"}
        </ModalStyles.Title>
        <ModalStyles.CloseButton
          type="button"
          aria-label="Đóng"
          disabled={saving}
          onClick={onClose}
        >
          <X size={23} aria-hidden="true" />
        </ModalStyles.CloseButton>
      </ModalStyles.Header>

      <ModalStyles.Form onSubmit={handleSubmit}>
        <ModalStyles.Body>
          <ModalStyles.Field>
            <ModalStyles.Label htmlFor={`${id}-code`}>
              Mã công việc <ModalStyles.Required>*</ModalStyles.Required>
            </ModalStyles.Label>
            <ModalStyles.Input
              id={`${id}-code`}
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Nhập mã từ 1 đến 1000"
              value={code}
              disabled={saving}
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value)) {
                  setCode(event.target.value);
                  setError("");
                }
              }}
              required
              autoFocus
            />
            <ModalStyles.Hint>Chỉ nhập số nguyên từ 1 đến 1000.</ModalStyles.Hint>
          </ModalStyles.Field>

          <ModalStyles.Field>
            <ModalStyles.Label htmlFor={`${id}-name`}>
              Tên công việc <ModalStyles.Required>*</ModalStyles.Required>
            </ModalStyles.Label>
            <ModalStyles.Input
              id={`${id}-name`}
              value={name}
              maxLength={255}
              placeholder="VD: Hỗ trợ phần mềm"
              disabled={saving}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              required
            />
          </ModalStyles.Field>

          <ModalStyles.Field>
            <ModalStyles.Label htmlFor={`${id}-status`}>Trạng thái</ModalStyles.Label>
            <ModalStyles.Select
              id={`${id}-status`}
              value={statusId}
              disabled={
                saving ||
                statusLoading ||
                jobStatuses.length === 0
              }
              onChange={(event) =>
                setSelectedStatusId(Number(event.target.value))
              }
              required
            >
              <option value="" disabled>
                {statusLoading ? "Đang tải..." : "Chọn trạng thái"}
              </option>
              {jobStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.status_name}
                </option>
              ))}
            </ModalStyles.Select>
          </ModalStyles.Field>

          {(error || saveError) && (
            <ModalStyles.Error role="alert">{error || saveError}</ModalStyles.Error>
          )}
        </ModalStyles.Body>

        <ModalStyles.Footer>
          <ModalStyles.CancelButton
            type="button"
            disabled={saving}
            onClick={onClose}
          >
            Hủy
          </ModalStyles.CancelButton>
          <ModalStyles.SaveButton
            type="submit"
            disabled={
              saving ||
              statusLoading ||
              jobStatuses.length === 0
            }
          >
            {saving
              ? "Đang lưu..."
              : job
                ? "Lưu thay đổi"
                : "Thêm mới"}
          </ModalStyles.SaveButton>
        </ModalStyles.Footer>
      </ModalStyles.Form>
    </ModalStyles.Dialog>
  );
}