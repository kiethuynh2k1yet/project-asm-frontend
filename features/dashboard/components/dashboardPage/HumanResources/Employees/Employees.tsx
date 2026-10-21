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
} from "lucide-react";

import * as S from "../../Categorys/styles/styles";
import * as T from "../../Categorys/components/TaskToolbar/TaskToolbar.styles";

const PAGE_SIZE = 10;

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
};

type EmployeeFormValues = Omit<Employee, "id">;

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
        message = data.message
          .filter((item) => typeof item === "string")
          .join(", ") || message;
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
    !(value.position === null || typeof value.position === "string") ||
    !(
      typeof value.is_active === "boolean" ||
      value.is_active === 0 ||
      value.is_active === 1
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
    position: value.position,
    is_active: value.is_active === true || value.is_active === 1,
  };
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  const loadEmployees = useCallback(async (signal?: AbortSignal) => {
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
  }, [filters]);

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
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const visibleEmployees = employees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const applyFilters = (nextFilters: EmployeeFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setSelectedId(null);
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
      toEmployee(await readJson(response));
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
                  const value = event.target.value as EmployeeFilters["isActive"];
                  setActiveInput(value);
                  applyFilters({ keyword: keywordInput.trim(), isActive: value });
                }}
              >
                <option value="">Tất cả</option>
                <option value="true">Đang làm việc</option>
                <option value="false">Đã nghỉ</option>
              </T.Select>
            </T.StatusField>
          </T.Filters>
        </T.Toolbar>

        {listError && (
          <S.ErrorMessage role="alert">{listError}</S.ErrorMessage>
        )}
      </S.ToolbarSection>

      <S.TableSection>
        <S.TableScroll>
          <S.Table style={{ minWidth: 1120 }}>
            <colgroup>
              <col style={{ width: 55 }} />
              <col style={{ width: 130 }} />
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
                    onClick={() => setSelectedId(employee.id)}
                  >
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td>
                      <S.SelectJobButton
                        type="button"
                        aria-pressed={selectedId === employee.id}
                        onClick={() => setSelectedId(employee.id)}
                      >
                        {employee.employee_code}
                      </S.SelectJobButton>
                    </td>
                    <td title={employee.full_name}>{employee.full_name}</td>
                    <td title={employee.email ?? ""}>{employee.email || "—"}</td>
                    <td>{employee.phone || "—"}</td>
                    <td title={employee.department ?? ""}>
                      {employee.department || "—"}
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
                  <S.EmptyCell colSpan={8}>
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
  saving: boolean;
  saveError: string;
  onClose: () => void;
  onSave: (values: EmployeeFormValues) => Promise<void>;
};

function EmployeeModal({
  employee,
  saving,
  saveError,
  onClose,
  onSave,
}: EmployeeModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [employeeCode, setEmployeeCode] = useState(employee?.employee_code ?? "");
  const [fullName, setFullName] = useState(employee?.full_name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [position, setPosition] = useState(employee?.position ?? "");
  const [isActive, setIsActive] = useState(employee?.is_active ?? true);
  const [error, setError] = useState("");

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
    if (!employeeCode.trim() || !fullName.trim()) {
      setError("Vui lòng nhập mã nhân viên và họ tên.");
      return;
    }

    void onSave({
      employee_code: employeeCode.trim(),
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      department: department.trim() || null,
      position: position.trim() || null,
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
            <S.ModalStyles.Label htmlFor={`${id}-email`}>Email</S.ModalStyles.Label>
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
            <S.ModalStyles.Input
              id={`${id}-department`}
              value={department}
              maxLength={100}
              disabled={saving}
              onChange={(event) => setDepartment(event.target.value)}
            />
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
