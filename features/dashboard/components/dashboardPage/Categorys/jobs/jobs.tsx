"use client";

import { useEffect, useState } from "react";

import TaskToolbar from "../components/TaskToolbar/TaskToolbar";
import JobModal from "../components/JobModal/JobModal";

import type {
  Job,
  JobFilters,
  JobFormValues,
  JobStatus,
} from "../constants/jobStatuses";

import * as S from "./jobs.styles";

const PAGE_SIZE = 10;

export default function Jobs() {
  // Không sử dụng dữ liệu mẫu.
  const [jobs, setJobs] = useState<Job[]>([]);

  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const [filters, setFilters] = useState<JobFilters>({
    keyword: "",
    status: "",
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();

  // Lấy danh sách trạng thái từ API.
  useEffect(() => {
  const controller = new AbortController();

  let active = true;
  let timedOut = false;

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15000);

  async function loadStatuses() {
    try {
      setStatusLoading(true);
      setStatusError("");

      const response = await fetch("/api/statuses", {
        cache: "no-store",
        signal: controller.signal,
      });

      const responseText = await response.text();

      let data: unknown;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `API /api/statuses trả dữ liệu không phải JSON (HTTP ${response.status}).`,
        );
      }

      if (!response.ok) {
        let message =
          `Không tải được trạng thái (HTTP ${response.status}).`;

        if (
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
        ) {
          message = data.message;
        }

        throw new Error(message);
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "API trạng thái không trả về một mảng.",
        );
      }

      if (active) {
        setStatuses(data);
      }
    } catch (error) {
      // Không cập nhật state khi trang đã unmount.
      if (!active) return;

      setStatusError(
        timedOut
          ? "Tải trạng thái quá 15 giây. Kiểm tra API Next.js và backend NestJS."
          : error instanceof Error
            ? error.message
            : "Không thể tải trạng thái.",
      );
    } finally {
      window.clearTimeout(timeoutId);

      if (active) {
        setStatusLoading(false);
      }
    }
  }

  loadStatuses();

  return () => {
    active = false;
    window.clearTimeout(timeoutId);
    controller.abort();
  };
}, []);
  const selectedJob = jobs.find(
    (job) => job.id === selectedId,
  );

  // Tìm theo mã hoặc tên và kết hợp lọc trạng thái.
  const filteredJobs = jobs.filter((job) => {
    const keyword = filters.keyword
      .trim()
      .toLocaleLowerCase("vi");

    const matchesKeyword =
      job.code.toLowerCase().includes(keyword) ||
      job.name.toLocaleLowerCase("vi").includes(keyword);

    const matchesStatus =
      filters.status === "" || job.status === filters.status;

    return matchesKeyword && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJobs.length / PAGE_SIZE),
  );

  const visibleJobs = filteredJobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleOpenAdd = () => {
    setEditingJob(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedJob) return;

    setEditingJob(selectedJob);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(undefined);
  };

  const handleSearch = (values: JobFilters) => {
    setFilters(values);
    setPage(1);
    setSelectedId(null);
  };

  // Hiện tại thêm/sửa trong state, chưa gọi API lưu công việc.
  const handleSave = (values: JobFormValues) => {
    if (editingJob) {
      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                ...values,
              }
            : job,
        ),
      );
    } else {
      setJobs((currentJobs) => {
        const nextId =
          Math.max(
            0,
            ...currentJobs.map((job) => job.id),
          ) + 1;

        return [
          {
            id: nextId,
            ...values,
          },
          ...currentJobs,
        ];
      });
    }

    setPage(1);
    setSelectedId(null);
    handleCloseModal();
  };

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
    setSelectedId(null);
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
    setSelectedId(null);
  };

  return (
    <S.Page>
      <S.ToolbarSection>
        <TaskToolbar
          statuses={statuses}
          statusLoading={statusLoading}
          editDisabled={!selectedJob}
          onAdd={handleOpenAdd}
          onEdit={handleOpenEdit}
          onSearch={handleSearch}
        />

        {statusError && (
          <S.ErrorMessage role="alert">
            {statusError}
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
              {visibleJobs.map((job, index) => {
                const statusName =
                  statuses.find(
                    (item) =>
                      item.status_code === job.status,
                  )?.status_name ?? job.status;

                return (
                  <S.TableRow
                    key={job.id}
                    $selected={selectedId === job.id}
                    onClick={() => setSelectedId(job.id)}
                  >
                    <td>
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>
                      <S.SelectJobButton
                        type="button"
                        aria-label={`Chọn công việc ${job.code}: ${job.name}`}
                        aria-pressed={selectedId === job.id}
                        onClick={() => setSelectedId(job.id)}
                      >
                        {job.code}
                      </S.SelectJobButton>
                    </td>

                    <td title={job.name}>
                      {job.name}
                    </td>

                    <td>
                      <S.StatusBadge
                        $active={job.status === "IN_USE"}
                      >
                        {statusName}
                      </S.StatusBadge>
                    </td>
                  </S.TableRow>
                );
              })}

              {visibleJobs.length === 0 && (
                <tr>
                  <S.EmptyCell colSpan={4}>
                    {jobs.length === 0
                      ? "Chưa có công việc. Bấm Thêm để tạo công việc mới."
                      : "Không tìm thấy công việc phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>

        <S.TableFooter>
          <S.Total>
            Tổng: <span>{filteredJobs.length}</span> dòng
          </S.Total>

          <S.Pagination aria-label="Phân trang công việc">
            <S.PageButton
              type="button"
              disabled={page === 1}
              onClick={handlePreviousPage}
            >
              Trước
            </S.PageButton>

            <S.PageInfo aria-live="polite">
              Trang {page}/{totalPages}
            </S.PageInfo>

            <S.PageButton
              type="button"
              disabled={page === totalPages}
              onClick={handleNextPage}
            >
              Sau
            </S.PageButton>
          </S.Pagination>
        </S.TableFooter>
      </S.TableSection>

      {isModalOpen && (
        <JobModal
          job={editingJob}
          statuses={statuses}
          statusLoading={statusLoading}
          existingJobs={jobs}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </S.Page>
  );
}