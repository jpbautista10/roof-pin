import DashboardLayout from "@/components/layout/DashboardLayout";
import Placeholder from "./Placeholder";

export default function DashboardSettings() {
  return (
    <DashboardLayout>
      <Placeholder
        title="Settings"
        description="Update your company name, slug, logo, brand color, and CTA link here. Continue prompting to build this page."
      />
    </DashboardLayout>
  );
}
