export type AppUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  password_hash?: string | null;
  password_salt?: string | null;
  is_admin: boolean;
  created_at: string;
};

export type DealStatus = "open" | "funded" | "purchased" | "sold" | "closed";
export type ParticipationStatus = "pending" | "confirmed" | "cancelled";

export type Deal = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  target_amount: string;
  expected_sale_price: string | null;
  status: DealStatus;
  created_by: string | null;
  created_at: string;
};

export type Participation = {
  id: string;
  deal_id: string;
  user_id: string;
  amount: string;
  status: ParticipationStatus;
  created_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
  users?: Pick<AppUser, "username" | "display_name"> | null;
};

export type DealWithTotals = Deal & {
  confirmed_amount: number;
  pending_amount: number;
  remaining_amount: number;
};
