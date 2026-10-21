"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronRight, FilePlus2, Save, SquarePen, X } from "lucide-react";

import type { JobStatus } from "../../Categorys/constants/jobStatuses";
import * as S from "./diagram-organization.styles";

type Department = {
  id: number;
  code: string;
  name: string;
  englishName: string;
  departmentTypeId: number | null;
  managerId: number | null;
  parentCode: string | null;
  establishedDate: string;
  dissolvedDate: string;
  statusId: number;
};

type Employee = {
  id: number;
  employeeCode: string;
  fullName: string;
};

type DepartmentForm = Omit<Department, "id">;
type TreeNode = { department: Department; children: TreeNode[] };
type Mode = "view" | "new" | "edit";

const emptyForm: DepartmentForm = {
  code: "",
  name: "",
  englishName: "",
  departmentTypeId: null,
  managerId: null,
  parentCode: null,
  establishedDate: "",
  dissolvedDate: "",
  statusId: 0,
};

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
    throw new Error(
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `API báo lỗi HTTP ${response.status}.`,
    );
  }
  return data;
}

function dateOnly(value: unknown, label: string): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value !== "string") {
    throw new Error(`${label} không đúng định dạng.`);
  }
  return value.slice(0, 10);
}

function toDepartment(value: unknown): Department {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.status_id !== "number" ||
    typeof value["department-code"] !== "string" ||
    typeof value["department-name"] !== "string" ||
    !(value["english-name"] === null || typeof value["english-name"] === "string") ||
    !(value.department_type === null || typeof value.department_type === "number") ||
    !(value["manager-id"] === null || typeof value["manager-id"] === "number") ||
    !(value["parent-department"] === null || typeof value["parent-department"] === "string")
  ) {
    throw new Error("Dữ liệu sơ đồ tổ chức không hợp lệ.");
  }

  return {
    id: value.id,
    code: value["department-code"],
    name: value["department-name"],
    englishName: value["english-name"] ?? "",
    departmentTypeId: value.department_type,
    managerId: value["manager-id"],
    parentCode: value["parent-department"],
    establishedDate: dateOnly(value["established-date"], "Ngày thành lập"),
    dissolvedDate: dateOnly(value["dissolved-date"], "Ngày giải thể"),
    statusId: value.status_id,
  };
}

type DepartmentType = {
  id: number;
  code: string;
  name: string;
};

function toDepartmentType(value: unknown): DepartmentType {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value["organization-code"] !== "string" ||
    typeof value["organization-levels-name"] !== "string"
  ) {
    throw new Error("Dữ liệu loại phòng ban không hợp lệ.");
  }
  return {
    id: value.id,
    code: value["organization-code"],
    name: value["organization-levels-name"],
  };
}

function toEmployee(value: unknown): Employee {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.employee_code !== "string" ||
    typeof value.full_name !== "string"
  ) {
    throw new Error("Dữ liệu nhân viên không hợp lệ.");
  }
  return {
    id: value.id,
    employeeCode: value.employee_code,
    fullName: value.full_name,
  };
}

function buildTree(items: Department[]): TreeNode[] {
  const nodes = new Map(
    items.map((department) => [
      department.code,
      { department, children: [] } as TreeNode,
    ]),
  );
  const roots: TreeNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.department.parentCode
      ? nodes.get(node.department.parentCode)
      : undefined;
    if (parent && parent !== node) parent.children.push(node);
    else roots.push(node);
  }

  const visited = new Set<number>();
  const markVisited = (node: TreeNode) => {
    if (visited.has(node.department.id)) return;
    visited.add(node.department.id);
    node.children.forEach(markVisited);
  };
  roots.forEach(markVisited);
  for (const node of nodes.values()) {
    if (!visited.has(node.department.id)) {
      roots.push(node);
      markVisited(node);
    }
  }

  const sortNodes = (list: TreeNode[]) => {
    list.sort((left, right) => left.department.code.localeCompare(right.department.code));
    list.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);
  return roots;
}

function filterTree(nodes: TreeNode[], keyword: string): TreeNode[] {
  if (!keyword) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children, keyword);
    const department = node.department;
    const matches = [
      department.code,
      department.name,
      department.englishName,
    ].some((value) => value.toLocaleLowerCase().includes(keyword));
    return matches || children.length > 0 ? [{ ...node, children }] : [];
  });
}

function localToday(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function DiagramOrganization() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDissolved, setShowDissolved] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState<DepartmentForm>(emptyForm);
  const [dissolve, setDissolve] = useState(false);
  const [listError, setListError] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [departmentTypeError, setDepartmentTypeError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [saveError, setSaveError] = useState("");

  const selected = departments.find((item) => item.id === selectedId);
  const activeStatus = statuses.find((status) => status.status_code === "IN_USE");
  const inactiveStatus = statuses.find((status) => status.status_code === "NOT_IN_USE");

  const loadDepartments = useCallback(async (includeDissolved: boolean) => {
    const query = includeDissolved ? "?include_dissolved=true" : "";
    const response = await fetch(
      `/api/dashboard/department/diagram-organization${query}`,
      { cache: "no-store" },
    );
    const data = await readJson(response);
    if (!Array.isArray(data)) {
      throw new Error("Danh sách phòng ban phải là một mảng.");
    }
    return data.map(toDepartment);
  }, []);

  const refreshDepartments = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const next = await loadDepartments(showDissolved);
      setDepartments(next);
      setSelectedId((current) =>
        current !== null && next.some((item) => item.id === current)
          ? current
          : null,
      );
    } catch (error) {
      setDepartments([]);
      setListError(
        error instanceof Error
          ? error.message
          : "Không tải được sơ đồ tổ chức.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadDepartments, showDissolved]);

  useEffect(() => {
    let active = true;
    loadDepartments(showDissolved)
      .then((next) => {
        if (!active) return;
        setDepartments(next);
        setSelectedId((current) =>
          current !== null && next.some((item) => item.id === current)
            ? current
            : null,
        );
        setListError("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDepartments([]);
        setListError(
          error instanceof Error
            ? error.message
            : "Không tải được sơ đồ tổ chức.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadDepartments, showDissolved]);

  useEffect(() => {
    let active = true;
    const loadLookups = async () => {
      const [employeeResult, statusResult, departmentTypeResult] = await Promise.allSettled([
        fetch("/api/dashboard/human-resources/employees", { cache: "no-store" })
          .then(readJson),
        fetch("/api/dashboard/statuses", { cache: "no-store" })
          .then(readJson),
        fetch("/api/dashboard/department/room-types", { cache: "no-store" })
          .then(readJson),
      ]);
      if (!active) return;

      if (employeeResult.status === "fulfilled" && Array.isArray(employeeResult.value)) {
        try {
          setEmployees(employeeResult.value.map(toEmployee));
        } catch (error) {
          setEmployeeError(error instanceof Error ? error.message : "Không tải được nhân viên.");
        }
      } else {
        setEmployeeError(
          employeeResult.status === "rejected"
            ? employeeResult.reason instanceof Error
              ? employeeResult.reason.message
              : "Không tải được danh sách nhân viên."
            : "Danh sách nhân viên phải là một mảng.",
        );
      }

      if (statusResult.status === "fulfilled" && Array.isArray(statusResult.value)) {
        const parsed = statusResult.value.filter(
          (item): item is JobStatus =>
            isRecord(item) &&
            typeof item.id === "number" &&
            typeof item.status_code === "string" &&
            typeof item.status_name === "string" &&
            Number(item.parent_id) === 2,
        );
        setStatuses(parsed);
        if (!parsed.some((status) => status.status_code === "IN_USE") ||
            !parsed.some((status) => status.status_code === "NOT_IN_USE")) {
          setStatusError("Thiếu trạng thái Sử dụng hoặc Không sử dụng.");
        }
      } else {
        setStatusError(
          statusResult.status === "rejected"
            ? statusResult.reason instanceof Error
              ? statusResult.reason.message
              : "Không tải được trạng thái."
            : "Danh sách trạng thái phải là một mảng.",
        );
      }

      if (
        departmentTypeResult.status === "fulfilled" &&
        Array.isArray(departmentTypeResult.value)
      ) {
        try {
          setDepartmentTypes(departmentTypeResult.value.map(toDepartmentType));
        } catch (error) {
          setDepartmentTypeError(
            error instanceof Error
              ? error.message
              : "Không tải được loại phòng ban.",
          );
        }
      } else {
        setDepartmentTypeError(
          departmentTypeResult.status === "rejected"
            ? departmentTypeResult.reason instanceof Error
              ? departmentTypeResult.reason.message
              : "Không tải được danh sách loại phòng ban."
            : "Danh sách loại phòng ban phải là một mảng.",
        );
      }
    };
    void loadLookups();
    return () => {
      active = false;
    };
  }, []);

  const tree = useMemo(
    () => filterTree(buildTree(departments), search.trim().toLocaleLowerCase()),
    [departments, search],
  );

  const descendants = useMemo(() => {
    if (!selected) return new Set<string>();
    const result = new Set<string>();
    const pending = [selected.code];
    while (pending.length > 0) {
      const parentCode = pending.pop();
      if (!parentCode) continue;
      for (const item of departments) {
        if (item.parentCode === parentCode && !result.has(item.code)) {
          result.add(item.code);
          pending.push(item.code);
        }
      }
    }
    return result;
  }, [departments, selected]);

  const startNew = () => {
    setSelectedId(null);
    setDraft({
      ...emptyForm,
      statusId: activeStatus?.id ?? 0,
      establishedDate: localToday(),
    });
    setDissolve(false);
    setSaveError("");
    setMode("new");
  };

  const startEdit = () => {
    if (!selected) return;
    setDraft({
      code: selected.code,
      name: selected.name,
      englishName: selected.englishName,
      departmentTypeId: selected.departmentTypeId,
      managerId: selected.managerId,
      parentCode: selected.parentCode,
      establishedDate: selected.establishedDate,
      dissolvedDate: selected.dissolvedDate,
      statusId: selected.statusId,
    });
    setDissolve(Boolean(selected.dissolvedDate));
    setSaveError("");
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("view");
    setSaveError("");
    if (mode === "new") setSelectedId(null);
  };

  const save = async () => {
    if (mode === "view" || saving) return;
    setSaveError("");
    if (!draft.code.trim() || !draft.name.trim()) {
      setSaveError("Vui lòng nhập mã và tên phòng ban.");
      return;
    }
    if (draft.code.trim().length > 50 || draft.name.trim().length > 255 ||
        draft.englishName.trim().length > 255) {
      setSaveError("Mã hoặc tên phòng ban vượt quá độ dài cho phép.");
      return;
    }
    if (draft.parentCode && (draft.parentCode === draft.code.trim() ||
        descendants.has(draft.parentCode))) {
      setSaveError("Phòng ban cha không hợp lệ hoặc tạo vòng lặp.");
      return;
    }
    if (!activeStatus || !inactiveStatus) {
      setSaveError("Không thể lưu khi chưa tải đủ trạng thái phòng ban.");
      return;
    }

    const dissolvedDate = dissolve
      ? draft.dissolvedDate || localToday()
      : "";
    const body = {
      "department-code": draft.code.trim(),
      "department-name": draft.name.trim(),
      "english-name": draft.englishName.trim() || null,
      department_type: draft.departmentTypeId,
      "manager-id": draft.managerId,
      "parent-department": draft.parentCode || null,
      "established-date": draft.establishedDate || null,
      "dissolved-date": dissolvedDate || null,
      status_id: dissolve ? inactiveStatus.id : activeStatus.id,
    };

    setSaving(true);
    try {
      const response = await fetch(
        mode === "edit" && selected
          ? `/api/dashboard/department/diagram-organization/${selected.id}`
          : "/api/dashboard/department/diagram-organization",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const saved = toDepartment(await readJson(response));
      setSelectedId(saved.id);
      setMode("view");
      await refreshDepartments();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu phòng ban.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleExpanded = (code: string) => {
    setExpandedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const renderNodes = (nodes: TreeNode[], ancestors = new Set<number>()): ReactNode =>
    nodes.map(({ department, children }) => {
      if (ancestors.has(department.id)) return null;
      const path = new Set(ancestors).add(department.id);
      const expanded = !expandedCodes.has(department.code);
      const status = statuses.find((item) => item.id === department.statusId);
      return (
        <S.TreeItem key={department.id}>
          <S.TreeRow>
            <S.ExpandButton
              type="button"
              aria-label={`${expanded ? "Thu gọn" : "Mở rộng"} ${department.name}`}
              aria-expanded={expanded}
              onClick={() => toggleExpanded(department.code)}
              disabled={children.length === 0}
            >
              {children.length > 0
                ? expanded
                  ? <ChevronDown size={15} aria-hidden="true" />
                  : <ChevronRight size={15} aria-hidden="true" />
                : null}
            </S.ExpandButton>
            <S.TreeNodeButton
              type="button"
              $selected={selectedId === department.id}
              onClick={() => {
                setSelectedId(department.id);
                setDraft({
                  code: department.code,
                  name: department.name,
                  englishName: department.englishName,
                  departmentTypeId: department.departmentTypeId,
                  managerId: department.managerId,
                  parentCode: department.parentCode,
                  establishedDate: department.establishedDate,
                  dissolvedDate: department.dissolvedDate,
                  statusId: department.statusId,
                });
                setDissolve(Boolean(department.dissolvedDate));
                setMode("view");
                setSaveError("");
              }}
            >
              <S.NodeText>
                <strong>{department.name}</strong>
                <small>{department.code}</small>
              </S.NodeText>
              <S.Badge $inactive={Boolean(department.dissolvedDate)}>
                {department.dissolvedDate
                  ? "Đã giải thể"
                  : status?.status_name ?? "Đang hoạt động"}
              </S.Badge>
            </S.TreeNodeButton>
          </S.TreeRow>
          {children.length > 0 && expanded && (
            <S.TreeList>{renderNodes(children, path)}</S.TreeList>
          )}
        </S.TreeItem>
      );
    });

  return (
    <S.Page>
      <S.Header>
        <div>
          <h1>Sơ đồ tổ chức</h1>
          <p>Quản lý cơ cấu phòng ban và đơn vị trực thuộc</p>
        </div>
        <S.Actions>
          <S.ActionButton type="button" onClick={startNew} disabled={saving}>
            <FilePlus2 size={16} aria-hidden="true" />
            Mới
          </S.ActionButton>
          <S.ActionButton
            type="button"
            $variant="edit"
            onClick={startEdit}
            disabled={!selected || saving}
          >
            <SquarePen size={16} aria-hidden="true" />
            Sửa
          </S.ActionButton>
          {mode !== "view" && (
            <S.ActionButton
              type="button"
              $variant="cancel"
              onClick={cancelEdit}
              disabled={saving}
            >
              <X size={16} aria-hidden="true" />
              Hủy
            </S.ActionButton>
          )}
          <S.ActionButton
            type="button"
            $primary
            onClick={() => void save()}
            disabled={mode === "view" || saving}
          >
            <Save size={16} aria-hidden="true" />
            {saving ? "Đang lưu..." : "Lưu"}
          </S.ActionButton>
        </S.Actions>
      </S.Header>

      {(listError || statusError) && (
        <S.Message $error role="alert">{listError || statusError}</S.Message>
      )}

      <S.Workspace>
        <S.Panel aria-label="Cây sơ đồ tổ chức">
          <S.PanelHeader>
            <h2>Cơ cấu phòng ban</h2>
            <span>{departments.length} đơn vị</span>
          </S.PanelHeader>
          <S.SearchInput
            type="search"
            aria-label="Tìm phòng ban"
            placeholder="Tìm mã hoặc tên phòng ban..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <S.TreeScroll aria-busy={loading}>
            {loading ? (
              <S.EmptySelection>Đang tải sơ đồ tổ chức...</S.EmptySelection>
            ) : tree.length > 0 ? (
              <S.TreeList>{renderNodes(tree)}</S.TreeList>
            ) : (
              <S.EmptySelection>
                {listError ? "Không tải được dữ liệu." : "Không có phòng ban phù hợp."}
              </S.EmptySelection>
            )}
          </S.TreeScroll>
          <S.ToggleField>
            <input
              type="checkbox"
              checked={showDissolved}
              onChange={(event) => {
                setLoading(true);
                setShowDissolved(event.target.checked);
              }}
              disabled={loading}
            />
            Hiển thị phòng ban đã giải thể
          </S.ToggleField>
        </S.Panel>

        <S.Panel>
          <S.PanelHeader>
            <h2>
              {mode === "new"
                ? "Phòng ban mới"
                : mode === "edit"
                  ? "Chỉnh sửa phòng ban"
                  : selected?.name ?? "Thông tin phòng ban"}
            </h2>
            {selected && mode === "view" && <span>{selected.code}</span>}
          </S.PanelHeader>
          {mode === "view" && !selected ? (
            <S.EmptySelection>
              Chọn phòng ban trong sơ đồ hoặc bấm “Mới” để thêm đơn vị.
            </S.EmptySelection>
          ) : (
            <S.FormScroll>
              <S.FormGrid>
                <S.Field>
                  Mã phòng ban *
                  <input
                    value={draft.code}
                    maxLength={50}
                    disabled={mode === "view" || saving}
                    onChange={(event) => setDraft({ ...draft, code: event.target.value })}
                  />
                </S.Field>
                <S.Field>
                  Tên phòng ban *
                  <input
                    value={draft.name}
                    maxLength={255}
                    disabled={mode === "view" || saving}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  />
                </S.Field>
                <S.Field>
                  Tên tiếng Anh
                  <input
                    value={draft.englishName}
                    maxLength={255}
                    disabled={mode === "view" || saving}
                    onChange={(event) => setDraft({ ...draft, englishName: event.target.value })}
                  />
                </S.Field>
                <S.Field>
                  Loại phòng ban
                  <select
                    value={draft.departmentTypeId ?? ""}
                    disabled={mode === "view" || saving || Boolean(departmentTypeError)}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        departmentTypeId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">Chọn loại phòng ban</option>
                    {departmentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </S.Field>
                <S.Field>
                  Người quản lý
                  <select
                    value={draft.managerId ?? ""}
                    disabled={mode === "view" || saving || Boolean(employeeError)}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        managerId: event.target.value ? Number(event.target.value) : null,
                      })
                    }
                  >
                    <option value="">Chưa phân công</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.employeeCode})
                      </option>
                    ))}
                  </select>
                </S.Field>
                <S.Field>
                  Phòng ban cha
                  <select
                    value={draft.parentCode ?? ""}
                    disabled={mode === "view" || saving}
                    onChange={(event) =>
                      setDraft({ ...draft, parentCode: event.target.value || null })
                    }
                  >
                    <option value="">Không có / cấp cao nhất</option>
                    {departments
                      .filter((item) =>
                        item.id !== selected?.id &&
                        item.code !== draft.code.trim() &&
                        !descendants.has(item.code),
                      )
                      .map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.name} ({item.code})
                        </option>
                      ))}
                  </select>
                </S.Field>
                <S.Field>
                  Ngày thành lập
                  <input
                    type="date"
                    value={draft.establishedDate}
                    disabled={mode === "view" || saving}
                    onChange={(event) =>
                      setDraft({ ...draft, establishedDate: event.target.value })
                    }
                  />
                </S.Field>
                <S.Field>
                  Ngày giải thể
                  <input
                    type="date"
                    value={dissolve ? draft.dissolvedDate || localToday() : draft.dissolvedDate}
                    disabled
                  />
                </S.Field>
                <S.DissolveField>
                  <input
                    type="checkbox"
                    checked={dissolve}
                    disabled={mode === "view" || saving}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setDissolve(checked);
                      setDraft({
                        ...draft,
                        dissolvedDate: checked
                          ? draft.dissolvedDate || localToday()
                          : "",
                      });
                    }}
                  />
                  Giải thể phòng ban
                </S.DissolveField>
                {employeeError && <S.Message $error role="alert">{employeeError}</S.Message>}
                {departmentTypeError && (
                  <S.Message $error role="alert">{departmentTypeError}</S.Message>
                )}
                {saveError && <S.Message $error role="alert">{saveError}</S.Message>}
              </S.FormGrid>
            </S.FormScroll>
          )}
        </S.Panel>
      </S.Workspace>
    </S.Page>
  );
}
