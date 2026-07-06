import { z } from "zod";

export const CURRENCIES = [
  { value: "INR", label: "₹ INR — Indian Rupee" },
  { value: "USD", label: "$ USD — US Dollar" },
  { value: "EUR", label: "€ EUR — Euro" },
  { value: "GBP", label: "£ GBP — British Pound" },
  { value: "CAD", label: "C$ CAD — Canadian Dollar" },
  { value: "AUD", label: "A$ AUD — Australian Dollar" },
  { value: "JPY", label: "¥ JPY — Japanese Yen" },
  { value: "CNY", label: "¥ CNY — Chinese Yuan" },
  { value: "SGD", label: "S$ SGD — Singapore Dollar" },
  { value: "AED", label: "د.إ AED — UAE Dirham" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "SEK", label: "kr SEK — Swedish Krona" },
] as const;

export const profileFormSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
}
