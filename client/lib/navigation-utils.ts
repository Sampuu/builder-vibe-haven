import { UserRole } from "@/hooks/use-auth";

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case "user":
      return "/dashboard/user";
    case "police":
      return "/dashboard/police";
    case "fire":
      return "/dashboard/fire";
    case "ambulance":
      return "/dashboard/ambulance";
    case "hospital":
      return "/dashboard/hospital";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/user";
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case "user":
      return "User";
    case "police":
      return "Police";
    case "fire":
      return "Fire Brigade";
    case "ambulance":
      return "Ambulance";
    case "hospital":
      return "Hospital";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
};
