export interface SiteSettings {
  id: number;
  contact_phone: string | null;
  contact_email: string | null;
  office_address: string | null;
  working_hours: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  show_login_button: boolean;
}
