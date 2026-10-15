export type JobStatusCode = "IN_USE" | "NOT_IN_USE";

export type JobStatus = {
  parent_id: number;
  status_code: JobStatusCode;
  status_name: string;
};

export type JobFilters = {
  keyword: string;
  status: JobStatusCode | "";
};

export type Job = {
  id: number;
  code: string;
  name: string;
  status: JobStatusCode;
};

export type JobFormValues = Omit<Job, "id">;