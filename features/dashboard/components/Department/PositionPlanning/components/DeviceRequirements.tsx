"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  ChildDescription,
  ChildHeading,
  ChildPanel,
  ChildTitle,
  DeviceTable,
  DeviceTableScroll,
  EmptyInline,
  PrimaryButton,
} from "../PositionPlanning.styles";

type CategoryOption = { id: number; code: string; name: string };
type SpecificationOption = {
  id: number;
  code: string;
  name: string;
  cpu_chip: string | null;
  ram: string | null;
  ssd: string | null;
  gpu: string | null;
};
type Device = {
  id?: number;
  asset_category_id: number;
  quantity: number;
  standard_specification_id: number | null;
};

type Props = {
  devices: Device[];
  categories: CategoryOption[];
  specifications: SpecificationOption[];
  editable: boolean;
  onAdd: () => void;
  onUpdate: (index: number, changes: Partial<Device>) => void;
  onRemove: (index: number) => void;
};

export default function DeviceRequirements({
  devices,
  categories,
  specifications,
  editable,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const specsById = new Map(specifications.map((item) => [item.id, item]));

  return (
    <ChildPanel>
      <ChildHeading>
        <div>
          <ChildTitle>Thiết bị theo thông số chuẩn</ChildTitle>
          <ChildDescription>Định mức thiết bị áp dụng cho một nhân viên.</ChildDescription>
        </div>
        {editable && <PrimaryButton type="button" onClick={onAdd}><Plus size={15} /> Thêm dòng</PrimaryButton>}
      </ChildHeading>
      {devices.length === 0 ? <EmptyInline>Chưa có thiết bị.</EmptyInline> : (
        <DeviceTableScroll><DeviceTable>
          <thead><tr><th>#</th><th>Mã chủng loại</th><th>Tên chủng loại</th><th>Số lượng</th><th>Mã chuẩn</th><th>Loại chuẩn</th><th>CPU / Chip</th><th>RAM</th><th>SSD</th><th>GPU</th>{editable && <th />}</tr></thead>
          <tbody>{devices.map((device, index) => {
            const spec = device.standard_specification_id ? specsById.get(device.standard_specification_id) : undefined;
            const category = categories.find((item) => item.id === device.asset_category_id);
            return <tr key={device.id ?? `device-${index}`}>
              <td>{index + 1}</td><td>{category?.code || "—"}</td>
              <td><select aria-label="Tên chủng loại" disabled={!editable} value={device.asset_category_id} onChange={(event) => onUpdate(index, { asset_category_id: Number(event.target.value) })}><option value={0}>Chọn chủng loại</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td>
              <td><input aria-label="Số lượng" disabled={!editable} type="number" min={1} step={1} value={device.quantity} onChange={(event) => onUpdate(index, { quantity: Number(event.target.value) })} /></td>
              <td>{spec?.code || "—"}</td>
              <td><select aria-label="Loại chuẩn" disabled={!editable} value={device.standard_specification_id ?? ""} onChange={(event) => onUpdate(index, { standard_specification_id: event.target.value ? Number(event.target.value) : null })}><option value="">Chọn chuẩn</option>{specifications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td>
              <td>{spec?.cpu_chip || "—"}</td><td>{spec?.ram || "—"}</td><td>{spec?.ssd || "—"}</td><td>{spec?.gpu || "—"}</td>
              {editable && <td><button type="button" aria-label="Xóa dòng thiết bị" onClick={() => onRemove(index)}><Trash2 size={16} /></button></td>}
            </tr>;
          })}</tbody>
        </DeviceTable></DeviceTableScroll>
      )}
    </ChildPanel>
  );
}
