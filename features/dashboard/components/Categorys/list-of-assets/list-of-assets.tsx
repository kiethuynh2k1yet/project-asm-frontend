"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  CirclePlus,
  Pencil,
  Trash2,
  QrCode,
  FileSpreadsheet,
  Search,
  X,
} from "lucide-react";
import {
  Actions,
  Badge,
  Button,
  Chosen,
  Dialog,
  ErrorMessage,
  Filter,
  Filters,
  Footer,
  FormField,
  FormGrid,
  Input,
  Label,
  ModalActions,
  ModalHeader,
  Overlay,
  Page,
  PageButton,
  Scroll,
  SearchField,
  SearchLine,
  Select,
  Spacer,
  Table,
  TablePanel,
  Textarea,
  Toolbar,
} from "./list-of-assets.styles";
import AssetFormModal from "./components/asset-form-modal";

export type Asset = {
  id: number;
  asset_code: string | null;
  asset_name: string | null;
  asset_name_other: string | null;
  status_id: number;
  asset_status_id: number | null;
  original_price: number | null;
  qr_code: string | null;
  accounting_asset_code: string | null;
  unit_id: number | null;
  asset_type_id: number | null;
  asset_group_id: number | null;
  asset_category_id: number | null;
  license_type_id: number | null;
  model: string | null;
  serial: string | null;
  function_description: string | null;
  used_date: string | null;
  note: string | null;
  quantity: number | null;
};
export type Lookup = { id: number; name: string; symbol?: string };
export type Status = { id: number; status_name: string; status_code: string };
export type Lookups = {
  types: Lookup[];
  groups: Lookup[];
  categories: Lookup[];
  units: Lookup[];
  licenses: Lookup[];
  assetStatuses: Status[];
  activeStatuses: Status[];
};
type AssetPayload = Omit<Asset, "id">;
const emptyLookups: Lookups = {
  types: [],
  groups: [],
  categories: [],
  units: [],
  licenses: [],
  assetStatuses: [],
  activeStatuses: [],
};
const api = "/api/dashboard/master-data";

async function readJson(response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      typeof body === "object" &&
      body &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `API lỗi (${response.status}).`,
    );
  return body;
}
function asLookup(value: unknown, idKey: string, nameKey: string): Lookup {
  if (!value || typeof value !== "object")
    throw new Error("Dữ liệu danh mục không hợp lệ.");
  const row = value as Record<string, unknown>;
  return { id: Number(row.id), name: String(row[nameKey] ?? row[idKey] ?? "") };
}
function lookupMap(items: Lookup[]) {
  return new Map(items.map((item) => [item.id, item.name]));
}
function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function assetStatusTone(status: Status | undefined) {
  const code = status?.status_code.toLocaleUpperCase() ?? "";
  const name = (status?.status_name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

  if (code === "NOT_IN_USE" || name.includes("khong su dung")) return "gray";
  if (code.includes("REPAIR") || name.includes("sua chua")) return "red";
  if (
    code.includes("WAREHOUSE") ||
    code.includes("IN_STOCK") ||
    name.includes("nhap kho")
  ) return "blue";
  if (code === "IN_USE" || name.includes("dang su dung")) return "green";
  return "blue";
}

export default function AssetList() {
  const [rows, setRows] = useState<Asset[]>([]);
  const [lookups, setLookups] = useState(emptyLookups);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeId, setTypeId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const pageSize = 10;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await readJson(
        await fetch(`${api}/assets`, { cache: "no-store" }),
      );
      if (!Array.isArray(data))
        throw new Error("Danh sách tài sản không hợp lệ.");
      setRows(data as Asset[]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không tải được tài sản.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLookup = async (resource: string) => {
      const data = await readJson(
        await fetch(`${api}/${resource}`, {
          cache: "no-store",
          signal: controller.signal,
        }),
      );
      return Array.isArray(data) ? data : [];
    };
    void Promise.all([
      fetchLookup("asset-types"),
      fetchLookup("asset-groups"),
      fetchLookup("asset-categorys"),
      fetchLookup("units"),
      fetchLookup("licenses"),
      fetch("/api/dashboard/statuses?parent_id=7", {
        cache: "no-store",
        signal: controller.signal,
      }).then(readJson),
      fetch("/api/dashboard/statuses", {
        cache: "no-store",
        signal: controller.signal,
      }).then(readJson),
    ])
      .then(
        ([
          types,
          groups,
          categories,
          units,
          licenses,
          assetStatuses,
          activeStatuses,
        ]) => {
          const rowsOf = (v: unknown) => (Array.isArray(v) ? v : []);
          setLookups({
            types: rowsOf(types).map((v) => {
              const row = v as Record<string, unknown>;
              return {
                id: Number(row.id),
                name: `${String(row["asset-type_code"] ?? "").trim()} - ${String(row["asset-types_name"] ?? "").trim()}`,
              };
            }),
            groups: rowsOf(groups).map((v) =>
              asLookup(v, "asset-group_code", "asset-group_name"),
            ),
            categories: rowsOf(categories).map((v) =>
              asLookup(v, "asset-category_code", "asset-category_name"),
            ),
            units: rowsOf(units).map((v) => {
              const row = v as Record<string, unknown>;
              return {
                id: Number(row.id),
                name: `${String(row["unit-0f-measure_code"] ?? "").trim()} - ${String(row["unit-0f-measure_name"] ?? "").trim()}`,
                symbol: String(row.symbol ?? "").trim(),
              };
            }),
            licenses: rowsOf(licenses).map((v) =>
              asLookup(v, "license_code", "license-types_name"),
            ),
            assetStatuses: rowsOf(assetStatuses) as Status[],
            activeStatuses: rowsOf(activeStatuses) as Status[],
          });
        },
      )
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error ? cause.message : "Không tải được danh mục.",
          );
      });
    const refreshTimer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      controller.abort();
      window.clearTimeout(refreshTimer);
    };
  }, [refresh]);

  const typeNames = useMemo(() => lookupMap(lookups.types), [lookups.types]);
  const groupNames = useMemo(() => lookupMap(lookups.groups), [lookups.groups]);
  const categoryNames = useMemo(
    () => lookupMap(lookups.categories),
    [lookups.categories],
  );
  const unitNames = useMemo(() => lookupMap(lookups.units), [lookups.units]);
  const unitSymbols = useMemo(
    () => new Map(lookups.units.map((unit) => [unit.id, unit.symbol ?? ""])),
    [lookups.units],
  );
  const licenseNames = useMemo(
    () => lookupMap(lookups.licenses),
    [lookups.licenses],
  );
  const statusNames = useMemo(
    () =>
      new Map(lookups.assetStatuses.map((item) => [item.id, item.status_name])),
    [lookups.assetStatuses],
  );
  const assetStatusesById = useMemo(
    () => new Map(lookups.assetStatuses.map((status) => [status.id, status])),
    [lookups.assetStatuses],
  );
  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const q = keyword.trim().toLocaleLowerCase();

        return (
          (!q ||
            [row.asset_code, row.asset_name, row.model, row.serial].some(
              (value) => text(value).toLocaleLowerCase().includes(q),
            )) &&
          (!typeId || String(row.asset_type_id) === typeId) &&
          (!groupId || String(row.asset_group_id) === groupId) &&
          (!categoryId || String(row.asset_category_id) === categoryId) &&
          (!statusId || String(row.asset_status_id) === statusId)
        );
      }),
    [rows, keyword, typeId, groupId, categoryId, statusId],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = rows.find((row) => row.id === selectedIds[0]);

  const openForm = (row?: Asset) => {
    setEditing(row ?? null);
    setFormError("");
    setModalOpen(true);
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    const data = new FormData(event.currentTarget);
    const nullable = (key: string) =>
      String(data.get(key) ?? "").trim() || null;
    const number = (key: string) => {
      const value = String(data.get(key) ?? "").trim();
      if (!value) return null;
      const normalized =
        key === "original_price"
          ? value.replace(/\./g, "").replace(",", ".")
          : value;
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const payload: Partial<AssetPayload> = {
      asset_code: nullable("asset_code"),
      asset_name: nullable("asset_name"),
      asset_name_other: nullable("asset_name_other"),
      status_id:
        lookups.activeStatuses.find((s) => s.status_code === "IN_USE")?.id ??
        lookups.activeStatuses[0]?.id,
      asset_status_id: number("asset_status_id"),
      original_price: number("original_price"),
      qr_code: nullable("qr_code"),
      accounting_asset_code: nullable("accounting_asset_code"),
      unit_id: number("unit_id"),
      asset_type_id: number("asset_type_id"),
      asset_group_id: number("asset_group_id"),
      asset_category_id: number("asset_category_id"),
      license_type_id: number("license_type_id"),
      model: nullable("model"),
      serial: nullable("serial"),
      function_description: nullable("function_description"),
      used_date: nullable("used_date"),
      note: nullable("note"),
      quantity: number("quantity"),
    };
    if (!payload.status_id) {
      setBusy(false);
      setFormError("Không tải được trạng thái bản ghi.");
      return;
    }
    try {
      await readJson(
        await fetch(editing ? `${api}/assets/${editing.id}` : `${api}/assets`, {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      setModalOpen(false);
      await refresh();
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Không thể lưu tài sản.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (
      !selected ||
      !window.confirm(
        `Xóa tài sản ${selected.asset_code ?? selected.asset_name ?? "này"}?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await readJson(
        await fetch(`${api}/assets/${selected.id}`, { method: "DELETE" }),
      );
      setSelectedIds([]);
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể xóa tài sản.",
      );
    } finally {
      setBusy(false);
    }
  };
  const exportCsv = () => {
    const headers = [
      "Mã thiết bị",
      "Tên thiết bị",
      "Trạng thái",
      "Ghi chú",
      "Chủng loại",
      "Loại tài sản",
      "Nhóm tài sản",
      "Loại license",
      "Model",
      "Serial",
    ];
    const records = filtered.map((row) => [
      row.asset_code,
      row.asset_name,
      statusNames.get(row.asset_status_id ?? -1),
      row.note,
      categoryNames.get(row.asset_category_id ?? -1),
      typeNames.get(row.asset_type_id ?? -1),
      groupNames.get(row.asset_group_id ?? -1),
      licenseNames.get(row.license_type_id ?? -1),
      row.model,
      row.serial,
    ]);
    const csv = [headers, ...records]
      .map((record) =>
        record.map((v) => `"${text(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "danh-sach-tai-san.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const printQr = () => window.print();

  return (
    <Page>
      <Toolbar>
        <Actions>
          <Button $tone="blue" onClick={() => openForm()}>
            <CirclePlus size={15} />
            Thêm
          </Button>
          <Button
            $tone="yellow"
            disabled={!selected || busy}
            onClick={() => selected && openForm(selected)}
          >
            <Pencil size={14} />
            Sửa
          </Button>
          <Button $tone="red" disabled={!selected || busy} onClick={remove}>
            <Trash2 size={14} />
            Xóa
          </Button>
          <Spacer />
          <Button
            $outline
            onClick={printQr}
            disabled={selectedIds.length === 0}
          >
            <QrCode size={14} />
            In QR ({selectedIds.length})
          </Button>
          <Button $tone="green" $outline onClick={exportCsv}>
            <FileSpreadsheet size={14} />
            Xuất Excel
          </Button>
          {selected && (
            <Chosen>
              Đang chọn:{" "}
              <b>
                {selected.asset_code} - {selected.asset_name}
              </b>
            </Chosen>
          )}
        </Actions>
        <Filters>
          <Filter>
            <Label>Loại tài sản</Label>
            <Select
              value={typeId}
              onChange={(e) => {
                setTypeId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {lookups.types.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Filter>
          <Filter>
            <Label>Nhóm tài sản</Label>
            <Select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {lookups.groups.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Filter>
          <Filter>
            <Label>Chủng loại</Label>
            <Select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {lookups.categories.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Filter>
          <Filter>
            <Label>Trạng thái</Label>
            <Select
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              {lookups.assetStatuses.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.status_name}
                </option>
              ))}
            </Select>
          </Filter>
          <SearchField>
            <Label>Tìm kiếm</Label>
            <SearchLine>
              <Input
                placeholder="Nhập mã, tên, model, serial..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
              />
              <Button type="button" $tone="blue">
                <Search size={14} />
                Tìm
              </Button>
            </SearchLine>
          </SearchField>
        </Filters>
      </Toolbar>
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {modalOpen && (
        <AssetFormModal
          editing={editing}
          lookups={lookups}
          busy={busy}
          formError={formError}
          onClose={() => setModalOpen(false)}
          onSubmit={save}
        />
      )}
      <TablePanel>
        <Scroll>
          <Table>
            <thead>
              <tr>
                <th>
                  <input
                    aria-label="Chọn tất cả"
                    type="checkbox"
                    checked={
                      visible.length > 0 &&
                      visible.every((row) => selectedIds.includes(row.id))
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? [
                              ...new Set([
                                ...selectedIds,
                                ...visible.map((row) => row.id),
                              ]),
                            ]
                          : selectedIds.filter(
                              (id) => !visible.some((row) => row.id === id),
                            ),
                      )
                    }
                  />
                </th>
                <th>#</th>
                <th>QR</th>
                <th>Mã thiết bị</th>
                <th>Tên thiết bị</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Chủng loại</th>
                <th>Loại tài sản</th>
                <th>Nhóm tài sản</th>
                <th>Loại license</th>
                <th>Model</th>
                <th>Serial</th>
                <th>Số lượng</th>
                <th>Nguyên giá</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} className="empty">
                    Đang tải danh sách tài sản...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={16} className="empty">
                    Không có tài sản phù hợp.
                  </td>
                </tr>
              ) : (
                visible.map((row, index) => (
                  <tr
                    key={row.id}
                    className={selectedIds.includes(row.id) ? "selected" : ""}
                    onClick={() => setSelectedIds([row.id])}
                  >
                    <td>
                      <input
                        aria-label={`Chọn ${row.asset_code ?? row.asset_name}`}
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? [...new Set([...selectedIds, row.id])]
                              : selectedIds.filter((id) => id !== row.id),
                          )
                        }
                      />
                    </td>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td className="qr">
                      <QrCode size={18} aria-hidden="true" />
                    </td>
                    <td>{row.asset_code}</td>
                    <td>{row.asset_name}</td>
                    <td>
                      <Badge
                        $tone={assetStatusTone(
                          assetStatusesById.get(row.asset_status_id ?? -1),
                        )}
                      >
                        {statusNames.get(row.asset_status_id ?? -1) ??
                          text(row.asset_status_id)}
                      </Badge>
                    </td>
                    <td>{row.note}</td>
                    <td>{categoryNames.get(row.asset_category_id ?? -1)}</td>
                    <td>{typeNames.get(row.asset_type_id ?? -1)}</td>
                    <td>{groupNames.get(row.asset_group_id ?? -1)}</td>
                    <td>{licenseNames.get(row.license_type_id ?? -1)}</td>
                    <td>{row.model}</td>
                    <td>{row.serial}</td>
                    <td>{row.quantity}</td>
                    <td>
                      {row.original_price === null
                        ? ""
                        : `${(row.original_price * (row.quantity ?? 1)).toLocaleString("vi-VN")} ${unitSymbols.get(row.unit_id ?? -1) ?? ""}`.trim()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Scroll>
        <Footer>
          <span>
            Tổng: <b>{filtered.length} dòng</b>
          </span>
          <nav>
            <PageButton
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </PageButton>
            <span>
              Trang {page}/{pages}
            </span>
            <PageButton
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </PageButton>
          </nav>
        </Footer>
      </TablePanel>
      {modalOpen && (
        <Overlay
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setModalOpen(false);
            }
          }}
        >
          <Dialog onSubmit={save}>
            <ModalHeader>
              <h2>{editing ? "Sửa tài sản" : "Thêm tài sản"}</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={busy}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </ModalHeader>
            <FormGrid>
              <FormField>
                Mã thiết bị
                <Input
                  name="asset_code"
                  defaultValue={editing?.asset_code ?? ""}
                  maxLength={30}
                />
              </FormField>
              <FormField>
                Tên thiết bị
                <Input
                  name="asset_name"
                  defaultValue={editing?.asset_name ?? ""}
                  maxLength={255}
                />
              </FormField>
              <FormField>
                Tên khác
                <Input
                  name="asset_name_other"
                  defaultValue={editing?.asset_name_other ?? ""}
                />
              </FormField>
              <FormField>
                Trạng thái tài sản
                <Select
                  name="asset_status_id"
                  defaultValue={text(editing?.asset_status_id)}
                >
                  <option value="">Chọn trạng thái</option>
                  {lookups.assetStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status_name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Loại tài sản
                <Select
                  name="asset_type_id"
                  defaultValue={text(editing?.asset_type_id)}
                >
                  <option value="">Chọn loại tài sản</option>
                  {lookups.types.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Nhóm tài sản
                <Select
                  name="asset_group_id"
                  defaultValue={text(editing?.asset_group_id)}
                >
                  <option value="">Chọn nhóm tài sản</option>
                  {lookups.groups.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Chủng loại
                <Select
                  name="asset_category_id"
                  defaultValue={text(editing?.asset_category_id)}
                >
                  <option value="">Chọn chủng loại</option>
                  {lookups.categories.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Loại license
                <Select
                  name="license_type_id"
                  defaultValue={text(editing?.license_type_id)}
                >
                  <option value="">Chọn license</option>
                  {lookups.licenses.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Đơn vị tính
                <Select name="unit_id" defaultValue={text(editing?.unit_id)}>
                  <option value="">Chọn đơn vị</option>
                  {lookups.units.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField>
                Model
                <Input name="model" defaultValue={editing?.model ?? ""} />
              </FormField>
              <FormField>
                Serial
                <Input name="serial" defaultValue={editing?.serial ?? ""} />
              </FormField>
              <FormField>
                Mã QR
                <Input
                  name="qr_code"
                  defaultValue={editing?.qr_code ?? ""}
                  maxLength={16}
                />
              </FormField>
              <FormField>
                Mã tài sản kế toán
                <Input
                  name="accounting_asset_code"
                  defaultValue={editing?.accounting_asset_code ?? ""}
                  maxLength={16}
                />
              </FormField>
              <FormField>
                Ngày sử dụng
                <Input
                  name="used_date"
                  type="date"
                  defaultValue={editing?.used_date?.slice(0, 10) ?? ""}
                />
              </FormField>
              <FormField>
                Nguyên giá (VNĐ)
                <Input
                  name="original_price"
                  type="text"
                  inputMode="numeric"
                  defaultValue={
                    editing?.original_price == null
                      ? ""
                      : editing.original_price.toLocaleString("vi-VN")
                  }
                />
              </FormField>
              <FormField>
                Số lượng
                <Input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={text(editing?.quantity)}
                />
              </FormField>
              <FormField>
                Mô tả chức năng
                <Textarea
                  name="function_description"
                  defaultValue={editing?.function_description ?? ""}
                  maxLength={255}
                  rows={3}
                />
              </FormField>
              <FormField>
                Ghi chú
                <Textarea
                  name="note"
                  defaultValue={editing?.note ?? ""}
                  maxLength={255}
                  rows={3}
                />
              </FormField>
            </FormGrid>
            {formError && <ErrorMessage role="alert">{formError}</ErrorMessage>}
            <ModalActions>
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={busy}
              >
                Hủy
              </Button>
              <Button $tone="blue" disabled={busy}>
                {busy ? "Đang lưu..." : "Lưu"}
              </Button>
            </ModalActions>
          </Dialog>
        </Overlay>
      )}
    </Page>
  );
}
