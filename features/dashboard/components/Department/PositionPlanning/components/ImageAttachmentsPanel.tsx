"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import {
  AttachmentImageCard,
  AttachmentImageGrid,
  AttachmentImageInfo,
  AttachmentImagePreview,
  AttachmentImagePreviewEmpty,
  AttachmentImageActions,
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
  editable: boolean;
  isCreate: boolean;
  attachments: Attachment[];
  pendingFiles: PendingFile[];
  onUpload: (files: File[], note: string) => Promise<File[]>;
  onRemove: (attachment: Attachment) => void;
  onRemovePending: (index: number) => void;
  attachmentUrl: (id: number) => string;
  formatSize: (size: string | null) => string;
};

export default function ImageAttachmentsPanel({
  editable,
  isCreate,
  attachments,
  pendingFiles,
  onUpload,
  onRemove,
  onRemovePending,
  attachmentUrl,
  formatSize,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<File, string>>(() => new Map());
  const pendingWithIndexes = pendingFiles
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => item.attachmentType === "IMAGE");

  useEffect(() => {
    const urls = new Map<File, string>();
    pendingWithIndexes.forEach(({ file }) => urls.set(file, URL.createObjectURL(file)));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingFiles]);

  const submit = async () => {
    if (!selectedFiles.length || uploading) return;
    setUploading(true);
    try {
      const failedFiles = await onUpload(selectedFiles, note);
      setSelectedFiles(failedFiles);
      if (fileInput.current) fileInput.current.value = "";
      if (!failedFiles.length) setNote("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ChildPanel>
      <ChildHeading>
        <div><ChildTitle>Khác</ChildTitle><ChildDescription>Chọn hình ảnh, tối đa 20 MB mỗi tệp.</ChildDescription></div>
      </ChildHeading>
      <UploadPanel>
        {editable && <UploadFields>
          <UploadField>
            <span>Chọn hình ảnh <b>*</b></span>
            <FilePicker>
              <FilePickerButton type="button" onClick={() => fileInput.current?.click()}>
                <ImagePlus size={15} /> Chọn tệp
              </FilePickerButton>
              <FilePickerName title={selectedFiles.map((file) => file.name).join(", ")}>
                {selectedFiles.length ? selectedFiles.map((file) => file.name).join(", ") : "Chưa chọn tệp nào"}
              </FilePickerName>
              <HiddenFile ref={fileInput} type="file" accept="image/*" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))} />
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

        {attachments.length === 0 && pendingWithIndexes.length === 0 ? (
          <AttachmentImagePreviewEmpty>Chưa có hình ảnh.</AttachmentImagePreviewEmpty>
        ) : (
          <AttachmentImageGrid>
            {attachments.map((item) => {
              const src = attachmentUrl(item.id);
              return <AttachmentImageCard key={`saved-${item.id}`}>
                <AttachmentImagePreview><Image src={src} alt={item.original_name} width={320} height={112} unoptimized /></AttachmentImagePreview>
                <AttachmentImageInfo>
                  <strong title={item.original_name}>{item.original_name}</strong>
                  <span>{formatSize(item.file_size)}</span>
                  {item.note && <p>{item.note}</p>}
                </AttachmentImageInfo>
                {editable && <AttachmentImageActions>
                  <a href={src} target="_blank" rel="noreferrer">Xem</a>
                  <button type="button" onClick={() => onRemove(item)}><Trash2 size={14} /> Xóa</button>
                </AttachmentImageActions>}
              </AttachmentImageCard>;
            })}
            {pendingWithIndexes.map((item) => {
              const src = previewUrls.get(item.file);
              return <AttachmentImageCard key={`pending-${item.originalIndex}`}>
                <AttachmentImagePreview>
                  {src ? <Image src={src} alt={item.file.name} width={320} height={112} unoptimized /> : <AttachmentImagePreviewEmpty>Ảnh xem trước</AttachmentImagePreviewEmpty>}
                </AttachmentImagePreview>
                <AttachmentImageInfo>
                  <strong title={item.file.name}>{item.file.name}</strong>
                  <span>{formatSize(String(item.file.size))} · Chưa lưu</span>
                  {item.note && <p>{item.note}</p>}
                </AttachmentImageInfo>
                <AttachmentImageActions>
                  {src && <a href={src} target="_blank" rel="noreferrer">Xem</a>}
                  {editable && <button type="button" onClick={() => onRemovePending(item.originalIndex)}><Trash2 size={14} /> Xóa</button>}
                </AttachmentImageActions>
              </AttachmentImageCard>;
            })}
          </AttachmentImageGrid>
        )}
        {isCreate && pendingWithIndexes.length > 0 && <small>Hình ảnh sẽ được lưu khi bạn lưu kế hoạch.</small>}
      </UploadPanel>
    </ChildPanel>
  );
}
