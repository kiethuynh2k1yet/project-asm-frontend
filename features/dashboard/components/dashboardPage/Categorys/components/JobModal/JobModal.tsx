"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

import { X } from "lucide-react";

import type {
  Job,
  JobFormValues,
  JobStatus,
  JobStatusCode,
} from "../../constants/jobStatuses";

import * as S from "./JobModal.styles";

type JobModalProps = {
  job?: Job;
  statuses: JobStatus[];
  statusLoading?: boolean;
  existingJobs: Job[];
  onClose: () => void;
  onSave: (values: JobFormValues) => void;
};

export default function JobModal({
  job,
  statuses,
  statusLoading = false,
  existingJobs,
  onClose,
  onSave,
}: JobModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [code, setCode] = useState(job?.code ?? "");
  const [name, setName] = useState(job?.name ?? "");

  const [selectedStatus, setSelectedStatus] = useState<
    JobStatusCode | ""
  >(job?.status ?? "");

  const [error, setError] = useState("");

  // Khi thêm mới, ưu tiên trạng thái "Còn sử dụng".
  // Không cần gọi setState trong effect để đặt mặc định.
  const defaultStatus =
    statuses.find((item) => item.status_code === "IN_USE")
      ?.status_code ??
    statuses[0]?.status_code ??
    "";

  const status = selectedStatus || defaultStatus;

  const canSave =
    !statusLoading &&
    statuses.some((item) => item.status_code === status);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      dialog?.close();
    };
  }, []);

  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const numericCode = Number(code);

    if (
      !/^\d+$/.test(code) ||
      !Number.isInteger(numericCode) ||
      numericCode < 1 ||
      numericCode > 1000
    ) {
      setError("Mã công việc phải là số nguyên từ 1 đến 1000.");
      return;
    }

    const isDuplicate = existingJobs.some(
      (item) =>
        item.id !== job?.id &&
        Number(item.code) === numericCode,
    );

    if (isDuplicate) {
      setError("Mã công việc đã tồn tại.");
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Vui lòng nhập tên công việc.");
      return;
    }

    if (
      statusLoading ||
      !status ||
      !statuses.some((item) => item.status_code === status)
    ) {
      setError("Vui lòng chọn trạng thái hợp lệ.");
      return;
    }

    onSave({
      code,
      name: trimmedName,
      status,
    });
  };

  return (
    <S.Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <S.Header>
        <S.Title id={`${id}-title`}>
          {job ? "Sửa công việc" : "Thêm công việc"}
        </S.Title>

        <S.CloseButton
          type="button"
          aria-label="Đóng"
          onClick={onClose}
        >
          <X size={23} aria-hidden="true" />
        </S.CloseButton>
      </S.Header>

      <S.Form onSubmit={handleSubmit}>
        <S.Body>
          <S.Field>
            <S.Label htmlFor={`${id}-code`}>
              Mã công việc <S.Required>*</S.Required>
            </S.Label>

            <S.Input
              id={`${id}-code`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              maxLength={4}
              placeholder="Nhập mã từ 1 đến 1000"
              value={code}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*$/.test(value)) {
                  setCode(value);
                  setError("");
                }
              }}
              required
              autoFocus
            />

            <S.Hint>
              Chỉ nhập số nguyên từ 1 đến 1000.
            </S.Hint>
          </S.Field>

          <S.Field>
            <S.Label htmlFor={`${id}-name`}>
              Tên công việc <S.Required>*</S.Required>
            </S.Label>

            <S.Input
              id={`${id}-name`}
              type="text"
              placeholder="VD: Hỗ trợ phần mềm"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              required
            />
          </S.Field>

          <S.Field>
            <S.Label htmlFor={`${id}-status`}>
              Trạng thái
            </S.Label>

            <S.Select
              id={`${id}-status`}
              value={status}
              disabled={statusLoading || statuses.length === 0}
              onChange={(event) => {
                setSelectedStatus(
                  event.target.value as JobStatusCode,
                );

                setError("");
              }}
              required
            >
              <option value="" disabled>
                {statusLoading
                  ? "Đang tải trạng thái..."
                  : statuses.length === 0
                    ? "Không có trạng thái"
                    : "Chọn trạng thái"}
              </option>

              {statuses.map((item) => (
                <option
                  key={item.status_code}
                  value={item.status_code}
                >
                  {item.status_name}
                </option>
              ))}
            </S.Select>
          </S.Field>

          {error && (
            <S.Error role="alert">{error}</S.Error>
          )}
        </S.Body>

        <S.Footer>
          <S.CancelButton
            type="button"
            onClick={onClose}
          >
            Hủy
          </S.CancelButton>

          <S.SaveButton
            type="submit"
            disabled={!canSave}
          >
            {job ? "Lưu thay đổi" : "Thêm mới"}
          </S.SaveButton>
        </S.Footer>
      </S.Form>
    </S.Dialog>
  );
}