"use client";

import { useId, useState } from "react";
import { CirclePlus, Search, SquarePen, Trash2, X } from "lucide-react";

import type { JobFilters, JobStatus } from "../../constants/jobStatuses";
import { useAuthRole } from "@/features/auth/components/auth-role-provider";

import * as PageStyles from "../../styles/styles";
import * as S from "./TaskToolbar.styles";

type TaskToolbarProps = {
  statuses: JobStatus[];
  statusLoading?: boolean;
  statusError?: string;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch?: (filters: JobFilters) => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  showStatus?: boolean;
};

export default function TaskToolbar({
  statuses,
  statusLoading = false,
  statusError = "",
  searchPlaceholder = "Nhập mã hoặc tên công việc...",
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  editDisabled = false,
  deleteDisabled = false,
  showStatus = true,
}: TaskToolbarProps) {
  const id = useId();
  const { role, error: roleError } = useAuthRole();

  const [keyword, setKeyword] = useState("");
  const [statusId, setStatusId] = useState<JobFilters["statusId"]>("");

  const jobStatuses = statuses.filter((item) => Number(item.parent_id) === 2);

  const hasStatuses = jobStatuses.length > 0;
  const isLoading = statusLoading && !hasStatuses;

  const placeholder = hasStatuses
    ? "Tất cả"
    : statusError
      ? "Không tải được trạng thái"
      : isLoading
        ? "Đang tải..."
        : "Không có trạng thái";

  const applyFilters = (nextStatusId = statusId, nextKeyword = keyword) => {
    onSearch?.({
      keyword: nextKeyword.trim(),
      statusId: nextStatusId,
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setStatusId("");
    onSearch?.({ keyword: "", statusId: "" });
  };

  return (
    <>
      <S.Toolbar>
        <S.Actions>
          <S.Button type="button" onClick={onAdd}>
            <CirclePlus size={16} aria-hidden="true" />
            Thêm
          </S.Button>

          <S.EditButton type="button" onClick={onEdit} disabled={editDisabled}>
            <SquarePen size={16} aria-hidden="true" />
            Sửa
          </S.EditButton>

          {role === "admin" && (
            <S.DeleteButton
              type="button"
              onClick={onDelete}
              disabled={deleteDisabled}
            >
              <Trash2 size={16} aria-hidden="true" />
              Xóa
            </S.DeleteButton>
          )}
        </S.Actions>

        <S.Filters
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <S.SearchField>
            <S.Label htmlFor={`${id}-search`}>Tìm kiếm</S.Label>

            <S.SearchGroup>
              <S.Input
                id={`${id}-search`}
                type="search"
                placeholder={searchPlaceholder}
                value={keyword}
                onChange={(event) => {
                  const nextKeyword = event.target.value;
                  setKeyword(nextKeyword);

                  if (nextKeyword === "") {
                    clearFilters();
                  }
                }}
              />

              {(keyword || statusId !== "") && (
                <S.ClearButton
                  type="button"
                  aria-label="Xóa bộ lọc tìm kiếm"
                  title="Xóa bộ lọc tìm kiếm"
                  onClick={clearFilters}
                >
                  <X size={16} aria-hidden="true" />
                </S.ClearButton>
              )}

              <S.SearchButton type="submit">
                <Search size={16} aria-hidden="true" />
                Tìm
              </S.SearchButton>
            </S.SearchGroup>
          </S.SearchField>

          {showStatus && <S.StatusField>
            <S.Label htmlFor={`${id}-status`}>Trạng thái</S.Label>

            <S.Select
              id={`${id}-status`}
              value={statusId}
              disabled={!hasStatuses}
              aria-busy={isLoading}
              title={statusError || undefined}
              onChange={(event) => {
                const nextStatusId =
                  event.target.value === "" ? "" : Number(event.target.value);

                setStatusId(nextStatusId);
                applyFilters(nextStatusId);
              }}
            >
              <option value="">{placeholder}</option>

              {jobStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.status_name}
                </option>
              ))}
            </S.Select>
          </S.StatusField>}
        </S.Filters>
      </S.Toolbar>
      {roleError && (
        <PageStyles.ErrorMessage role="alert">
          {roleError}
        </PageStyles.ErrorMessage>
      )}
    </>
  );
}
