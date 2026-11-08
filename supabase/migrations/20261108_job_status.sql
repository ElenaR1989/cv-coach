-- Add status column to job_postings for admin approval flow
alter table job_postings add column if not exists status text not null default 'pending';

-- Set existing active jobs to 'active' so they stay visible
update job_postings set status = 'active' where is_active = true;
update job_postings set status = 'inactive' where is_active = false;
