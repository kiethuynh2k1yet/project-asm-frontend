"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";

import { X } from "lucide-react";

import type {
  Job,
  JobFormValues,
  JobStatus,
} from "../../constants/jobStatuses";

import * as S from "./WorkModal.styles";

type WorkModalProps = {
  job?: Job;
  statuses: JobStatus[];
  statusLoading?: boolean;
  saving?: boolean;
  saveError?: string;
  onClose: () => void;
  onSave: (values: JobFormValues) => Promise<void>;
};

export default function WorkModal({
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
    jobStatuses.find(
      (item) => item.status_code === "IN_USE",
    ) ?? jobStatuses[0];

  const statusId =
    selectedStatusId === ""
      ? (defaultStatus?.id ?? "")
      : selectedStatusId;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

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
      !jobStatuses.some(
        (item) => item.id === statusId,
      )
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
    <S.Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();

        if (!saving) {
          onClose();
        }
      }}
    >
      <S.Header>
        <S.Title id={`${id}-title`}>
          {job ? "Sửa công việc" : "Thêm công việc"}
        </S.Title>

        <S.CloseButton
          type="button"
          aria-label="Đóng"
          disabled={saving}
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
          </S.Field>

          <S.Field>
            <S.Label htmlFor={`${id}-status`}>
              Trạng thái
            </S.Label>

            <S.Select
              id={`${id}-status`}
              value={statusId}
              disabled={
                saving ||
                statusLoading ||
                jobStatuses.length === 0
              }
              onChange={(event) =>
                setSelectedStatusId(
                  Number(event.target.value),
                )
              }
              required
            >
              <option value="" disabled>
                {statusLoading
                  ? "Đang tải..."
                  : "Chọn trạng thái"}
              </option>

              {jobStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.status_name}
                </option>
              ))}
            </S.Select>
          </S.Field>

          {(error || saveError) && (
            <S.Error role="alert">
              {error || saveError}
            </S.Error>
          )}
        </S.Body>

        <S.Footer>
          <S.CancelButton
            type="button"
            disabled={saving}
            onClick={onClose}
          >
            Hủy
          </S.CancelButton>

          <S.SaveButton
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
          </S.SaveButton>
        </S.Footer>
      </S.Form>
    </S.Dialog>
  );
}