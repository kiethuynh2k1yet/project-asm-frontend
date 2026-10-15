"use client";

import { useId, useState } from "react";
import { CirclePlus, Search, SquarePen } from "lucide-react";

import type {
  JobFilters,
  JobStatus,
} from "../../constants/jobStatuses";

import * as S from "./TaskToolbar.styles";

type TaskToolbarProps = {
  statuses: JobStatus[];
  statusLoading?: boolean;
  statusError?: string;
  onAdd?: () => void;
  onEdit?: () => void;
  onSearch?: (filters: JobFilters) => void;
  editDisabled?: boolean;
};

export default function TaskToolbar({
  statuses,
  statusLoading = false,
  statusError = "",
  onAdd,
  onEdit,
  onSearch,
  editDisabled = false,
}: TaskToolbarProps) {
  const id = useId();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<JobFilters["status"]>("");

  const jobStatuses = statuses.filter(
    (item) => Number(item.parent_id) === 2,
  );

  const hasStatuses = jobStatuses.length > 0;
  const isLoading = statusLoading && !hasStatuses;

  const placeholder = hasStatuses
    ? "Tất cả"
    : statusError
      ? "Không tải được trạng thái"
      : isLoading
        ? "Đang tải..."
        : "Không có trạng thái";

  return (
    <S.Toolbar>
      <S.Actions>
        <S.Button type="button" onClick={onAdd}>
          <CirclePlus size={16} aria-hidden="true" />
          Thêm
        </S.Button>

        <S.EditButton
          type="button"
          onClick={onEdit}
          disabled={editDisabled}
        >
          <SquarePen size={16} aria-hidden="true" />
          Sửa
        </S.EditButton>
      </S.Actions>

      <S.Filters
        onSubmit={(event) => {
          event.preventDefault();

          onSearch?.({
            keyword: keyword.trim(),
            status,
          });
        }}
      >
        <S.SearchField>
          <S.Label htmlFor={`${id}-search`}>
            Tìm kiếm
          </S.Label>

          <S.SearchGroup>
            <S.Input
              id={`${id}-search`}
              type="search"
              placeholder="Nhập mã hoặc tên công việc..."
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
            />

            <S.SearchButton type="submit">
              <Search size={16} aria-hidden="true" />
              Tìm
            </S.SearchButton>
          </S.SearchGroup>
        </S.SearchField>

        <S.StatusField>
          <S.Label htmlFor={`${id}-status`}>
            Trạng thái
          </S.Label>

          <S.Select
            id={`${id}-status`}
            value={status}
            disabled={!hasStatuses}
            aria-busy={isLoading}
            title={statusError || undefined}
            onChange={(event) =>
              setStatus(
                event.target.value as JobFilters["status"],
              )
            }
          >
            <option value="">{placeholder}</option>

            {jobStatuses.map((item) => (
              <option
                key={item.status_code}
                value={item.status_code}
              >
                {item.status_name}
              </option>
            ))}
          </S.Select>
        </S.StatusField>
      </S.Filters>
    </S.Toolbar>
  );
}