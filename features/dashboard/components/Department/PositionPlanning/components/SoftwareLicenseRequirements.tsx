"use client";

import { Trash2 } from "lucide-react";
import {
  ChildDescription,
  ChildHeading,
  ChildPanel,
  ChildTitle,
  EmptyInline,
  Field,
  RemoveRow,
  DeviceTable,
  DeviceTableScroll,
  SelectChevron,
  SelectControl,
} from "../PositionPlanning.styles";

type Option = { id: number; code: string; name: string };
type LicenseOption = {
  id: number;
  asset_id: number;
  license_code: string;
  license_name: string;
};
type SoftwareLicense = {
  id?: number;
  software_asset_id: number;
  asset_license_id: number;
  quantity: number;
};

type Props = {
  rows: SoftwareLicense[];
  software: Option[];
  editable: boolean;
  onSelectSoftware: (softwareId: number) => void;
  onUpdate: (index: number, changes: Partial<SoftwareLicense>) => void;
  onRemove: (index: number) => void;
  licensesForSoftware: (softwareId: number) => LicenseOption[];
};

export default function SoftwareLicenseRequirements({
  rows,
  software,
  editable,
  onSelectSoftware,
  onUpdate,
  onRemove,
  licensesForSoftware,
}: Props) {
  return (
    <ChildPanel>
      <ChildHeading>
        <div>
          <ChildTitle>License phần mềm</ChildTitle>
          <ChildDescription>
            Mỗi dòng là một định mức license trên một người.
          </ChildDescription>
        </div>
      </ChildHeading>
      {editable && (
        <Field>
          <span>Phần mềm</span>
          <SelectControl style={{ maxWidth: 420 }}>
            <select
              value=""
              onChange={(event) => {
                const softwareId = Number(event.target.value);
                if (softwareId) onSelectSoftware(softwareId);
              }}
            >
              <option value="">-- Chọn phần mềm --</option>
              {software.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <SelectChevron size={16} />
          </SelectControl>
        </Field>
      )}
      {rows.length === 0 ? (
        <EmptyInline>Chưa có license phần mềm.</EmptyInline>
      ) : (
        <DeviceTableScroll>
          <DeviceTable>
            <thead>
              <tr>
                <th>#</th>
                <th>Mã phần mềm</th>
                <th>Tên phần mềm</th>
                <th>Mã loại license</th>
                <th>Loại license</th>
                <th>Số lượng</th>
                {editable && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const softwareItem = software.find(
                  (item) => item.id === row.software_asset_id,
                );
                const licenseItem = licensesForSoftware(
                  row.software_asset_id,
                ).find((item) => item.id === row.asset_license_id);
                return (
                  <tr key={row.id ?? `license-${index}`}>
                    <td>{index + 1}</td>
                    <td>{softwareItem?.code ?? row.asset_code ?? ""}</td>
                    <td>{softwareItem?.name ?? row.asset_name ?? ""}</td>
                    <td>{licenseItem?.license_code ?? row.license_code ?? ""}</td>
                    <td>{licenseItem?.license_name ?? row.license_name ?? ""}</td>
                    <td>
                      <input
                        disabled={!editable}
                        type="number"
                        min={1}
                        step={1}
                        value={row.quantity}
                        onChange={(event) =>
                          onUpdate(index, { quantity: Number(event.target.value) })
                        }
                      />
                    </td>
                    {editable && (
                      <td>
                        <RemoveRow
                          type="button"
                          aria-label="Xóa dòng license"
                          onClick={() => onRemove(index)}
                        >
                          <Trash2 size={16} />
                        </RemoveRow>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </DeviceTable>
        </DeviceTableScroll>
      )}
    </ChildPanel>
  );
}
