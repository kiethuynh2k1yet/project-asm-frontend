"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  ChildDescription,
  ChildHeading,
  ChildPanel,
  ChildRows,
  ChildTitle,
  EmptyInline,
  Field,
  LicenseRow,
  RemoveRow,
  PrimaryButton,
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
  onAdd: () => void;
  onUpdate: (index: number, changes: Partial<SoftwareLicense>) => void;
  onRemove: (index: number) => void;
  licensesForSoftware: (softwareId: number) => LicenseOption[];
};

export default function SoftwareLicenseRequirements({
  rows,
  software,
  editable,
  onAdd,
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
        {editable && (
          <PrimaryButton type="button" onClick={onAdd}>
            <Plus size={15} /> Thêm dòng
          </PrimaryButton>
        )}
      </ChildHeading>
      {rows.length === 0 ? (
        <EmptyInline>Chưa có license phần mềm.</EmptyInline>
      ) : (
        <ChildRows>
          {rows.map((row, index) => (
            <LicenseRow key={row.id ?? `license-${index}`}>
              <Field>
                <span>Phần mềm</span>
                <select
                  disabled={!editable}
                  value={row.software_asset_id}
                  onChange={(event) =>
                    onUpdate(index, {
                      software_asset_id: Number(event.target.value),
                    })
                  }
                >
                  {software.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code ? `${item.code} - ` : ""}
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <span>License</span>
                <select
                  disabled={!editable}
                  value={row.asset_license_id}
                  onChange={(event) =>
                    onUpdate(index, {
                      asset_license_id: Number(event.target.value),
                    })
                  }
                >
                  {licensesForSoftware(row.software_asset_id).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.license_code} - {item.license_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <span>Số lượng / người</span>
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
              </Field>
              {editable && (
                <RemoveRow
                  type="button"
                  aria-label="Xóa dòng license"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 size={16} />
                </RemoveRow>
              )}
            </LicenseRow>
          ))}
        </ChildRows>
      )}
    </ChildPanel>
  );
}
