"use client";

import { useRef, useState } from "react";
import { FilePlus2, ImagePlus, Trash2, Upload } from "lucide-react";
import {
  AttachmentTable,
  AttachmentTableScroll,
  ChildDescription,
  ChildHeading,
  ChildPanel,
  ChildTitle,
  FilePicker,
  FilePickerButton,
  FilePickerName,
  HiddenFile,
  UploadFields,
  UploadField,
  UploadPanel,
  UploadSubmit,
} from "../PositionPlanning.styles";

type Attachment = {
  id: number;
  attachment_type: "FILE" | "IMAGE";
  original_name: string;
  file_path: string;
  file_size: string | null;
  note: string | null;
  mime_type?: string | null;
  created_at?: string | null;
};
type PendingFile = {
  file: File;
  attachmentType: "FILE" | "IMAGE";
  note: string;
};

type Props = {
  type: "FILE" | "IMAGE";
  editable: boolean;
  isCreate: boolean;
  attachments: Attachment[];
  pendingFiles: PendingFile[];
  onUpload: (files: File[], note: string) => Promise<boolean>;
  onRemove: (attachment: Attachment) => void;
  onRemovePending: (index: number) => void;
  formatSize: (size: string | null) => string;
  formatDate: (value: string) => string;
};

export default function AttachmentUploadPanel({
  type,
  editable,
  isCreate,
  attachments,
  pendingFiles,
  onUpload,
  onRemove,
  onRemovePending,
  formatSize,
  formatDate,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const selectedNames = selectedFiles.map((file) => file.name).join(", ");
  const displayedPending = pendingFiles
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => item.attachmentType === type);

  const submit = async () => {
    if (!selectedFiles.length || uploading) return;
    setUploading(true);
    try {
      if (await onUpload(selectedFiles, note)) {
        setSelectedFiles([]);
        setNote("");
        if (fileInput.current) fileInput.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <ChildPanel>
      <ChildHeading>
        <div><ChildTitle>{type === "FILE" ? "Tệp đính kèm" : "Hình ảnh / Khác"}</ChildTitle><ChildDescription>Tối đa 20 MB mỗi tệp.</ChildDescription></div>
      </ChildHeading>
      <UploadPanel>
      {editable && <UploadFields>
        <UploadField>
          <span>Chọn tệp <b>*</b></span>
          <FilePicker>
            <FilePickerButton type="button" onClick={() => fileInput.current?.click()}>
              {type === "FILE" ? <FilePlus2 size={15} /> : <ImagePlus size={15} />}
              Chọn tệp
            </FilePickerButton>
            <FilePickerName title={selectedNames}>{selectedNames || "Chưa chọn tệp"}</FilePickerName>
            <HiddenFile
              ref={fileInput}
              type="file"
              accept={type === "IMAGE" ? "image/*" : undefined}
              multiple
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
            />
          </FilePicker>
        </UploadField>
        <UploadField>
          <span>Ghi chú</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nhập ghi chú..." />
        </UploadField>
        <UploadSubmit type="button" disabled={!selectedFiles.length || uploading} onClick={() => void submit()}>
          <Upload size={15} /> {uploading ? "Đang tải..." : "Tải lên"}
        </UploadSubmit>
      </UploadFields>}

      {attachments.length === 0 && displayedPending.length === 0 ? (
        <p>Chưa có tệp đính kèm.</p>
      ) : (
        <AttachmentTableScroll>
          <AttachmentTable>
            <thead><tr><th>#</th><th>Tên tệp</th><th>Loại</th><th>Dung lượng</th><th>Ghi chú</th><th>Ngày tải</th>{editable && <th>Thao tác</th>}</tr></thead>
            <tbody>
              {attachments.map((item, index) => (
                <tr key={`saved-${item.id}`}>
                  <td>{index + 1}</td><td>{item.original_name}</td>
                  <td>{item.mime_type || (item.attachment_type === "IMAGE" ? "Hình ảnh" : "Tệp đính kèm")}</td>
                  <td>{formatSize(item.file_size)}</td><td>{item.note || "—"}</td><td>{item.created_at ? formatDate(item.created_at) : "Đã tải lên"}</td>
                  {editable && <td><button type="button" onClick={() => onRemove(item)}>Xóa</button></td>}
                </tr>
              ))}
              {displayedPending.map((item, index) => (
                <tr key={`pending-${item.originalIndex}`}>
                  <td>{attachments.length + index + 1}</td><td>{item.file.name}</td>
                  <td>{item.file.type || (type === "IMAGE" ? "Hình ảnh" : "Tệp đính kèm")}</td>
                  <td>{formatSize(String(item.file.size))}</td><td>{item.note || "—"}</td><td>Chưa lưu</td>
                  {editable && <td><button type="button" onClick={() => onRemovePending(item.originalIndex)}><Trash2 size={14} /> Xóa</button></td>}
                </tr>
              ))}
            </tbody>
          </AttachmentTable>
        </AttachmentTableScroll>
      )}
      {isCreate && displayedPending.length > 0 && <small>Tệp sẽ được tải lên khi bạn lưu kế hoạch.</small>}
      </UploadPanel>
    </ChildPanel>
  );
}
