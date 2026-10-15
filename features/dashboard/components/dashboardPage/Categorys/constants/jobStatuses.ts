export type JobStatusCode = "IN_USE" | "NOT_IN_USE";

export type JobStatus = {
  id: number;
  parent_id: number;
  status_code: JobStatusCode;
  status_name: string;
};

export type Job = {
  id: number;
  code: string;
  name: string;
  status_id: number;
};

export type JobFormValues = {
  code: string;
  name: string;
  status_id: number;
};

export type JobFilters = {
  keyword: string;
  statusId: number | "";
};

export type WorkApiRow = {
  id: number;
  work_code: string | null;
  work_name: string | null;
  status_id: number;
};