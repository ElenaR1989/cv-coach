import { createClient } from "@/lib/supabase/server";

export async function saveApplication(data: {
  userId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobDescription: string;
  cv: string;
  coverLetter: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("job_applications").insert({
    user_id: data.userId,
    job_title: data.jobTitle,
    company_name: data.companyName,
    location: data.location,
    job_description: data.jobDescription,
    cv_snapshot: data.cv,
    cover_letter: data.coverLetter,
  });

  if (error) throw error;
}