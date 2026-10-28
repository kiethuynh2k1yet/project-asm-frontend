"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  CirclePlus,
  Search,
  SquarePen,
  Trash2,
  X,
  KeyRound,
} from "lucide-react";

import * as S from "../../Categorys/styles/styles";
import * as T from "../../Categorys/components/TaskToolbar/TaskToolbar.styles";
import { useAuthRole } from "@/features/auth/components/auth-role-provider";
import * as E from "./employees.styles";

const PAGE_SIZE = 10;

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  department_type_id: number | null;
  position: string | null;
  position_plan_id: number | null;
  is_active: boolean;
  password_changed_at?: string | null;
};

type EmployeeFormValues = Omit<Employee, "id" | "password_changed_at">;

type DepartmentLevel = {
  id: number;
  name: string;
};

type PositionPlanOption = {
  id: number;
  work_name: string | null;
  rank_name: string | null;
  department_name: string | null;
  status_id: number;
};

type EmployeeFilters = {
  keyword: string;
  isActive: "" | "true" | "false";
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
    let message = `API báo lỗi HTTP ${response.status}.`;
    if (isRecord(data)) {
      if (typeof data.message === "string") {
        message = data.message;
      } else if (Array.isArray(data.message)) {
        message =
          data.message.filter((item) => typeof item === "string").join(", ") ||
          message;
      }
    }
    throw new Error(message);
  }

  return data;
}

function toEmployee(value: unknown): Employee {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.employee_code !== "string" ||
    typeof value.full_name !== "string" ||
    !(value.email === null || typeof value.email === "string") ||
    !(value.phone === null || typeof value.phone === "string") ||
    !(value.department === null || typeof value.department === "string") ||
    !(
      value.department_type_id === undefined ||
      value.department_type_id === null ||
      (typeof value.department_type_id === "number" &&
        Number.isInteger(value.department_type_id) &&
        value.department_type_id > 0)
    ) ||
    !(value.position === null || typeof value.position === "string") ||
    !(
      value.position_plan_id === undefined ||
      value.position_plan_id === null ||
      (typeof value.position_plan_id === "number" &&
        Number.isInteger(value.position_plan_id) &&
        value.position_plan_id > 0)
    ) ||
    !(
      typeof value.is_active === "boolean" ||
      value.is_active === 0 ||
      value.is_active === 1
    ) ||
    !(
      value.password_changed_at === undefined ||
      value.password_changed_at === null ||
      typeof value.password_changed_at === "string"
    )
  ) {
    throw new Error("Dữ liệu nhân viên không hợp lệ.");
  }

  return {
    id: value.id,
    employee_code: value.employee_code,
    full_name: value.full_name,
    email: value.email,
    phone: value.phone,
    department: value.department,
    department_type_id:
      typeof value.department_type_id === "number"
        ? value.department_type_id
        : null,
    position: value.position,
    position_plan_id:
      typeof value.position_plan_id === "number"
        ? value.position_plan_id
        : null,
    is_active: value.is_active === true || value.is_active === 1,
    password_changed_at:
      typeof value.password_changed_at === "string"
        ? value.password_changed_at
        : null,
  };
}

function toDepartmentLevel(value: unknown): DepartmentLevel {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value["organization-levels-name"] !== "string"
  ) {
    throw new Error("Dữ liệu tên cấp phòng ban không hợp lệ.");
  }

  return {
    id: value.id,
    name: value["organization-levels-name"].trim(),
  };
}

function toPositionPlanOption(value: unknown): PositionPlanOption {
  if (
    !isRecord(value) ||
    !Number.isInteger(Number(value.id)) ||
    !Number.isInteger(Number(value.status_id))
  ) {
    throw new Error("Dữ liệu hoạch định vị trí không hợp lệ.");
  }
  return {
    id: Number(value.id),
    work_name: typeof value.work_name === "string" ? value.work_name : null,
    rank_name: typeof value.rank_name === "string" ? value.rank_name : null,
    department_name:
      typeof value.department_name === "string" ? value.department_name : null,
    status_id: Number(value.status_id),
  };
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentLevels, setDepartmentLevels] = useState<DepartmentLevel[]>(
    [],
  );
  const [departmentLevelsLoading, setDepartmentLevelsLoading] = useState(true);
  const [departmentLevelsError, setDepartmentLevelsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [filters, setFilters] = useState<EmployeeFilters>({
    keyword: "",
    isActive: "",
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [activeInput, setActiveInput] =
    useState<EmployeeFilters["isActive"]>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { role: userRole, error: accountError } = useAuthRole();
  const [credentialNotice, setCredentialNotice] = useState<{
    employeeCode: string;
    password: string;
    action: "created" | "reset";
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    async function loadDepartmentLevels() {
      try {
        const response = await fetch("/api/dashboard/master-data/room-types", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await readJson(response);
        if (!Array.isArray(data)) {
          throw new Error("Danh sách tên cấp phòng ban phải là một mảng.");
        }
        const levels = data.map(toDepartmentLevel);
        if (active) {
          setDepartmentLevels(levels.filter((level) => level.name));
        }
      } catch (error) {
        if (active) {
          setDepartmentLevelsError(
            controller.signal.aborted
              ? "Tải danh sách tên cấp phòng ban quá thời gian chờ."
              : error instanceof Error
                ? error.message
                : "Không tải được danh sách tên cấp phòng ban.",
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setDepartmentLevelsLoading(false);
      }
    }

    void loadDepartmentLevels();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const loadEmployees = useCallback(
    async (signal?: AbortSignal) => {
      const query = new URLSearchParams();
      if (filters.keyword.trim()) {
        query.set("keyword", filters.keyword.trim());
      }
      if (filters.isActive !== "") {
        query.set("is_active", filters.isActive);
      }
      const queryString = query.toString();
      const response = await fetch(
        `/api/dashboard/human-resources/employees${queryString ? `?${queryString}` : ""}`,
        { cache: "no-store", signal },
      );
      const data = await readJson(response);
      if (!Array.isArray(data)) {
        throw new Error("Danh sách nhân viên phải là một mảng.");
      }
      return data.map(toEmployee);
    },
    [filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    async function load() {
      try {
        setLoading(true);
        setListError("");
        const data = await loadEmployees(controller.signal);
        if (active) {
          setEmployees(data);
          setPage(1);
          setSelectedId(null);
        }
      } catch (error) {
        if (!active) return;
        setEmployees([]);
        setListError(
          controller.signal.aborted
            ? "Tải danh sách nhân viên quá thời gian chờ."
            : error instanceof Error
              ? error.message
              : "Không tải được danh sách nhân viên.",
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadEmployees]);

  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedId,
  );
  const getDepartmentName = (employee: Employee) =>
    departmentLevels.find((level) => level.id === employee.department_type_id)
      ?.name ?? employee.department;
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const visibleEmployees = employees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const applyFilters = (nextFilters: EmployeeFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setSelectedId(null);
    setCredentialNotice(null);
  };

  const refreshEmployees = async (successMessage: string) => {
    try {
      setLoading(true);
      setListError("");
      const data = await loadEmployees();
      setEmployees(data);
      setPage(1);
    } catch (error) {
      setListError(
        `${successMessage}, nhưng chưa tải lại được danh sách: ${
          error instanceof Error ? error.message : "Lỗi không xác định."
        }`,
      );
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleSave = async (values: EmployeeFormValues) => {
    if (saving) return;
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(
        editing
          ? `/api/dashboard/human-resources/employees/${editing.id}`
          : "/api/dashboard/human-resources/employees",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const data = await readJson(response);
      toEmployee(data);
      if (
        !editing &&
        isRecord(data) &&
        typeof data.initialPassword === "string"
      ) {
        setCredentialNotice({
          employeeCode: values.employee_code,
          password: data.initialPassword,
          action: "created",
        });
      } else {
        setCredentialNotice(null);
      }
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Không thể lưu nhân viên.",
      );
      setSaving(false);
      return;
    }

    setModalOpen(false);
    setEditing(undefined);
    setSelectedId(null);
    await refreshEmployees("Đã lưu nhân viên");
  };

  const handleDelete = async () => {
    if (!selectedEmployee || saving) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa nhân viên "${selectedEmployee.full_name}" không?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setListError("");
    try {
      const response = await fetch(
        `/api/dashboard/human-resources/employees/${selectedEmployee.id}`,
        { method: "DELETE" },
      );
      toEmployee(await readJson(response));
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Không thể xóa nhân viên.",
      );
      setSaving(false);
      return;
    }

    setSelectedId(null);
    await refreshEmployees("Đã xóa nhân viên");
  };

  const handleResetPassword = async () => {
    if (userRole !== "admin" || !selectedEmployee || saving) {
      return;
    }
    if (
      !window.confirm(
        `Đặt lại mật khẩu của "${selectedEmployee.employee_code}" thành mã nhân viên này?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setListError("");
    setCredentialNotice(null);
    try {
      const response = await fetch(
        `/api/dashboard/human-resources/employees/${selectedEmployee.id}/reset-password`,
        { method: "POST" },
      );
      const data = await readJson(response);
      if (!isRecord(data) || typeof data.temporaryPassword !== "string") {
        throw new Error("Dữ liệu tài khoản sau khi reset không hợp lệ.");
      }
      setCredentialNotice({
        employeeCode: selectedEmployee.employee_code,
        password: data.temporaryPassword,
        action: "reset",
      });
    } catch (error) {
      setListError(
        error instanceof Error
          ? error.message
          : "Không thể reset mật khẩu tài khoản.",
      );
      setSaving(false);
      return;
    }

    await refreshEmployees("Đã reset mật khẩu");
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(undefined);
    setSaveError("");
  };

  return (
    <S.Page>
      <S.ToolbarSection>
        <T.Toolbar>
          <T.Actions>
            <T.Button
              type="button"
              onClick={() => {
                setEditing(undefined);
                setSaveError("");
                setModalOpen(true);
              }}
            >
              <CirclePlus size={16} aria-hidden="true" />
              Thêm
            </T.Button>
            {userRole === "admin" && (
              <>
                <T.Button
                  type="button"
                  disabled={!selectedEmployee || loading || saving}
                  onClick={() => void handleResetPassword()}
                >
                  <KeyRound size={16} aria-hidden="true" />
                  Reset mật khẩu
                </T.Button>
                <T.EditButton
                  type="button"
                  disabled={!selectedEmployee || loading || saving}
                  onClick={() => {
                    if (!selectedEmployee) return;
                    setEditing(selectedEmployee);
                    setSaveError("");
                    setModalOpen(true);
                  }}
                >
                  <SquarePen size={16} aria-hidden="true" />
                  Sửa
                </T.EditButton>
                <T.DeleteButton
                  type="button"
                  disabled={!selectedEmployee || loading || saving}
                  onClick={() => void handleDelete()}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Xóa
                </T.DeleteButton>
              </>
            )}
          </T.Actions>

          <T.Filters
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters({
                keyword: keywordInput.trim(),
                isActive: activeInput,
              });
            }}
          >
            <T.SearchField>
              <T.Label htmlFor="employee-search">Tìm kiếm</T.Label>
              <T.SearchGroup>
                <T.Input
                  id="employee-search"
                  type="search"
                  placeholder="Mã, họ tên, email, phòng ban..."
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                />
                {(keywordInput || activeInput !== "") && (
                  <T.ClearButton
                    type="button"
                    aria-label="Xóa bộ lọc tìm kiếm"
                    title="Xóa bộ lọc tìm kiếm"
                    onClick={() => {
                      setKeywordInput("");
                      setActiveInput("");
                      applyFilters({ keyword: "", isActive: "" });
                    }}
                  >
                    <X size={16} aria-hidden="true" />
                  </T.ClearButton>
                )}
                <T.SearchButton type="submit">
                  <Search size={16} aria-hidden="true" />
                  Tìm
                </T.SearchButton>
              </T.SearchGroup>
            </T.SearchField>

            <T.StatusField>
              <T.Label htmlFor="employee-active-filter">Trạng thái</T.Label>
              <T.Select
                id="employee-active-filter"
                value={activeInput}
                onChange={(event) => {
                  const value = event.target
                    .value as EmployeeFilters["isActive"];
                  setActiveInput(value);
                  applyFilters({
                    keyword: keywordInput.trim(),
                    isActive: value,
                  });
                }}
              >
                <option value="">Tất cả</option>
                <option value="true">Đang làm việc</option>
                <option value="false">Đã nghỉ</option>
              </T.Select>
            </T.StatusField>
          </T.Filters>
        </T.Toolbar>

        {listError && <S.ErrorMessage role="alert">{listError}</S.ErrorMessage>}
        {accountError && (
          <S.ErrorMessage role="alert">{accountError}</S.ErrorMessage>
        )}
        {credentialNotice && (
          <S.ErrorMessage
            role="status"
            style={{
              background: "#eff6ff",
              color: "#1e40af",
              borderColor: "#bfdbfe",
            }}
          >
            {credentialNotice.action === "created"
              ? "Mật khẩu khởi tạo"
              : "Mật khẩu mới"}{" "}
            cho mã nhân viên <strong>{credentialNotice.employeeCode}</strong>:{" "}
            <strong>{credentialNotice.password}</strong>. Chỉ hiển thị lúc này;
            hãy gửi cho nhân viên và yêu cầu đổi sớm.
          </S.ErrorMessage>
        )}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll className="employee-desktop-table">
          <S.Table style={{ minWidth: userRole === "admin" ? 1280 : 1140 }}>
            <colgroup>
              <col style={{ width: 55 }} />
              <col style={{ width: 130 }} />
              {userRole === "admin" && <col style={{ width: 150 }} />}
              <col style={{ width: 190 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 130 }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Mã nhân viên</th>
                {userRole === "admin" && <th scope="col">Cập nhật mật khẩu</th>}
                <th scope="col">Họ và tên</th>
                <th scope="col">Email</th>
                <th scope="col">Điện thoại</th>
                <th scope="col">Phòng ban</th>
                <th scope="col">Chức vụ</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                visibleEmployees.map((employee, index) => (
                  <S.TableRow
                    key={employee.id}
                    $selected={selectedId === employee.id}
                    onClick={() => {
                      setSelectedId(employee.id);
                      setCredentialNotice(null);
                    }}
                  >
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td>
                      <S.SelectJobButton
                        type="button"
                        aria-pressed={selectedId === employee.id}
                        onClick={() => {
                          setSelectedId(employee.id);
                          setCredentialNotice(null);
                        }}
                      >
                        {employee.employee_code}
                      </S.SelectJobButton>
                    </td>
                    {userRole === "admin" && (
                      <td>
                        {employee.password_changed_at
                          ? new Date(
                              employee.password_changed_at,
                            ).toLocaleString("vi-VN")
                          : "Chưa có tài khoản"}
                      </td>
                    )}
                    <td title={employee.full_name}>{employee.full_name}</td>
                    <td title={employee.email ?? ""}>
                      {employee.email || "—"}
                    </td>
                    <td>{employee.phone || "—"}</td>
                    <td title={getDepartmentName(employee) ?? ""}>
                      {getDepartmentName(employee) || "—"}
                    </td>
                    <td title={employee.position ?? ""}>
                      {employee.position || "—"}
                    </td>
                    <td>
                      <S.StatusBadge $active={employee.is_active}>
                        {employee.is_active ? "Đang làm việc" : "Đã nghỉ"}
                      </S.StatusBadge>
                    </td>
                  </S.TableRow>
                ))}
              {(loading || visibleEmployees.length === 0) && (
                <tr>
                  <S.EmptyCell colSpan={userRole === "admin" ? 9 : 8}>
                    {loading
                      ? "Đang tải nhân viên..."
                      : listError
                        ? "Không tải được danh sách."
                        : "Không có nhân viên phù hợp."}
                  </S.EmptyCell>
                </tr>
              )}
            </tbody>
          </S.Table>
        </S.TableScroll>
        <E.MobileEmployeeList aria-label="Danh sách nhân viên">
          {loading ? (
            <E.EmptyState>Đang tải nhân viên...</E.EmptyState>
          ) : visibleEmployees.length === 0 ? (
            <E.EmptyState>
              {listError
                ? "Không tải được danh sách."
                : "Không có nhân viên phù hợp."}
            </E.EmptyState>
          ) : (
            visibleEmployees.map((employee, index) => (
              <E.EmployeeCard
                key={employee.id}
                type="button"
                $selected={selectedId === employee.id}
                aria-pressed={selectedId === employee.id}
                onClick={() => {
                  setSelectedId(employee.id);
                  setCredentialNotice(null);
                }}
              >
                <E.CardHeader>
                  <E.CardCode>{employee.employee_code}</E.CardCode>
                  <S.StatusBadge $active={employee.is_active}>
                    {employee.is_active ? "Đang làm việc" : "Đã nghỉ"}
                  </S.StatusBadge>
                  <E.CardIndex>
                    #{(page - 1) * PAGE_SIZE + index + 1}
                  </E.CardIndex>
                </E.CardHeader>
                <E.CardName>{employee.full_name}</E.CardName>
                <E.CardDetails>
                  {userRole === "admin" && (
                    <E.CardField>
                      <E.CardLabel>Cập nhật mật khẩu</E.CardLabel>
                      <E.CardValue>
                        {employee.password_changed_at
                          ? new Date(
                              employee.password_changed_at,
                            ).toLocaleString("vi-VN")
                          : "Chưa có tài khoản"}
                      </E.CardValue>
                    </E.CardField>
                  )}
                  <E.CardField>
                    <E.CardLabel>Email</E.CardLabel>
                    <E.CardValue>{employee.email || "—"}</E.CardValue>
                  </E.CardField>
                  <E.CardField>
                    <E.CardLabel>Điện thoại</E.CardLabel>
                    <E.CardValue>{employee.phone || "—"}</E.CardValue>
                  </E.CardField>
                  <E.CardField>
                    <E.CardLabel>Phòng ban</E.CardLabel>
                    <E.CardValue>
                      {getDepartmentName(employee) || "—"}
                    </E.CardValue>
                  </E.CardField>
                  <E.CardField>
                    <E.CardLabel>Chức vụ</E.CardLabel>
                    <E.CardValue>{employee.position || "—"}</E.CardValue>
                  </E.CardField>
                </E.CardDetails>
              </E.EmployeeCard>
            ))
          )}
        </E.MobileEmployeeList>

        <S.TableFooter>
          <S.Total>
            Tổng: <span>{employees.length}</span> dòng
          </S.Total>
          <S.Pagination aria-label="Phân trang nhân viên">
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
        <EmployeeModal
          employee={editing}
          departmentLevels={departmentLevels}
          departmentLevelsLoading={departmentLevelsLoading}
          departmentLevelsError={departmentLevelsError}
          saving={saving}
          saveError={saveError}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </S.Page>
  );
}

type EmployeeModalProps = {
  employee?: Employee;
  departmentLevels: DepartmentLevel[];
  departmentLevelsLoading: boolean;
  departmentLevelsError: string;
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: EmployeeFormValues) => Promise<void>;
};

function EmployeeModal({
  employee,
  departmentLevels,
  departmentLevelsLoading,
  departmentLevelsError,
  saving,
  saveError,
  onClose,
  onSave,
}: EmployeeModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [employeeCode, setEmployeeCode] = useState(
    employee?.employee_code ?? "",
  );
  const [fullName, setFullName] = useState(employee?.full_name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [department, setDepartment] = useState<string | null>(null);
  const [position, setPosition] = useState(employee?.position ?? "");
  const [positionPlanId, setPositionPlanId] = useState(
    employee?.position_plan_id ? String(employee.position_plan_id) : "",
  );
  const [positionPlans, setPositionPlans] = useState<PositionPlanOption[]>([]);
  const [positionPlansLoading, setPositionPlansLoading] = useState(true);
  const [positionPlansError, setPositionPlansError] = useState("");
  const [isActive, setIsActive] = useState(employee?.is_active ?? true);
  const [error, setError] = useState("");
  const inferredDepartmentId =
    employee?.department_type_id ??
    departmentLevels.find((level) => level.name === employee?.department)?.id;
  const departmentValue =
    department ?? (inferredDepartmentId ? String(inferredDepartmentId) : "");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadPositionPlans() {
      try {
        const response = await fetch(
          "/api/dashboard/human-resources/employees/position-plans",
          { cache: "no-store" },
        );
        const data = await readJson(response);
        if (!Array.isArray(data)) {
          throw new Error("Danh sách hoạch định vị trí phải là một mảng.");
        }
        const plans = data.map(toPositionPlanOption);
        if (active) setPositionPlans(plans);
      } catch (error) {
        if (active) {
          setPositionPlansError(
            error instanceof Error
              ? error.message
              : "Không tải được danh sách hoạch định vị trí.",
          );
        }
      } finally {
        if (active) setPositionPlansLoading(false);
      }
    }
    void loadPositionPlans();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = (
    event,
  ) => {
    event.preventDefault();
    setError("");
    if (saving) return;
    if (!employeeCode.trim() || !fullName.trim()) {
      setError("Vui lòng nhập mã nhân viên và họ tên.");
      return;
    }

    void onSave({
      employee_code: employeeCode.trim(),
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      department_type_id:
        departmentValue === "" ? null : Number(departmentValue),
      department:
        departmentLevels.find((level) => level.id === Number(departmentValue))
          ?.name ??
        (employee?.department_type_id === null ? employee.department : null),
      position: position.trim() || null,
      position_plan_id: positionPlanId ? Number(positionPlanId) : null,
      is_active: isActive,
    });
  };

  return (
    <S.ModalStyles.Dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <S.ModalStyles.Header>
        <S.ModalStyles.Title id={`${id}-title`}>
          {employee ? "Sửa nhân viên" : "Thêm nhân viên"}
        </S.ModalStyles.Title>
        <S.ModalStyles.CloseButton
          type="button"
          aria-label="Đóng"
          disabled={saving}
          onClick={onClose}
        >
          <X size={23} aria-hidden="true" />
        </S.ModalStyles.CloseButton>
      </S.ModalStyles.Header>

      <S.ModalStyles.Form onSubmit={handleSubmit}>
        <S.ModalStyles.Body>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-code`}>
              Mã nhân viên <S.ModalStyles.Required>*</S.ModalStyles.Required>
            </S.ModalStyles.Label>
            <S.ModalStyles.Input
              id={`${id}-code`}
              value={employeeCode}
              maxLength={100}
              disabled={saving}
              required
              autoFocus
              onChange={(event) => setEmployeeCode(event.target.value)}
            />
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-name`}>
              Họ và tên <S.ModalStyles.Required>*</S.ModalStyles.Required>
            </S.ModalStyles.Label>
            <S.ModalStyles.Input
              id={`${id}-name`}
              value={fullName}
              maxLength={150}
              disabled={saving}
              required
              onChange={(event) => setFullName(event.target.value)}
            />
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-email`}>
              Email
            </S.ModalStyles.Label>
            <S.ModalStyles.Input
              id={`${id}-email`}
              type="email"
              value={email}
              maxLength={255}
              disabled={saving}
              onChange={(event) => setEmail(event.target.value)}
            />
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-phone`}>
              Điện thoại
            </S.ModalStyles.Label>
            <S.ModalStyles.Input
              id={`${id}-phone`}
              value={phone}
              maxLength={30}
              disabled={saving}
              onChange={(event) => setPhone(event.target.value)}
            />
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-department`}>
              Phòng ban
            </S.ModalStyles.Label>
            <S.ModalStyles.Select
              id={`${id}-department`}
              value={departmentValue}
              disabled={
                saving ||
                departmentLevelsLoading ||
                Boolean(departmentLevelsError)
              }
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="">
                {departmentLevelsLoading
                  ? "Đang tải tên cấp phòng ban..."
                  : "Chọn tên cấp phòng ban"}
              </option>
              {departmentLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </S.ModalStyles.Select>
            {departmentLevelsError && (
              <S.ModalStyles.Error role="alert">
                {departmentLevelsError}
              </S.ModalStyles.Error>
            )}
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-position`}>
              Chức vụ
            </S.ModalStyles.Label>
            <S.ModalStyles.Input
              id={`${id}-position`}
              value={position}
              maxLength={100}
              disabled={saving}
              onChange={(event) => setPosition(event.target.value)}
            />
          </S.ModalStyles.Field>
          <S.ModalStyles.Field>
            <S.ModalStyles.Label htmlFor={`${id}-position-plan`}>
              Hoạch định vị trí
            </S.ModalStyles.Label>
            <S.ModalStyles.Select
              id={`${id}-position-plan`}
              value={positionPlanId}
              disabled={
                saving || positionPlansLoading || Boolean(positionPlansError)
              }
              onChange={(event) => setPositionPlanId(event.target.value)}
            >
              <option value="">
                {positionPlansLoading
                  ? "Đang tải hoạch định vị trí..."
                  : "Không gán hoạch định vị trí"}
              </option>
              {positionPlans.map((plan) => (
                <option
                  key={plan.id}
                  value={plan.id}
                  disabled={
                    plan.status_id !== 6 &&
                    plan.id !== employee?.position_plan_id
                  }
                >
                  {[plan.work_name, plan.rank_name, plan.department_name]
                    .filter(Boolean)
                    .join(" - ") || `Vị trí #${plan.id}`}
                  {plan.status_id !== 6 ? " (Không sử dụng)" : ""}
                </option>
              ))}
            </S.ModalStyles.Select>
            {positionPlansError && (
              <S.ModalStyles.Error role="alert">
                {positionPlansError}
              </S.ModalStyles.Error>
            )}
          </S.ModalStyles.Field>
          <S.ModalStyles.CheckField>
            <input
              id={`${id}-active`}
              type="checkbox"
              checked={isActive}
              disabled={saving}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <S.ModalStyles.Label htmlFor={`${id}-active`}>
              Đang làm việc
            </S.ModalStyles.Label>
          </S.ModalStyles.CheckField>
          {(error || saveError) && (
            <S.ModalStyles.Error role="alert">
              {error || saveError}
            </S.ModalStyles.Error>
          )}
        </S.ModalStyles.Body>
        <S.ModalStyles.Footer>
          <S.ModalStyles.CancelButton
            type="button"
            disabled={saving}
            onClick={onClose}
          >
            Hủy
          </S.ModalStyles.CancelButton>
          <S.ModalStyles.SaveButton type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : employee ? "Lưu thay đổi" : "Thêm mới"}
          </S.ModalStyles.SaveButton>
        </S.ModalStyles.Footer>
      </S.ModalStyles.Form>
    </S.ModalStyles.Dialog>
  );
}
