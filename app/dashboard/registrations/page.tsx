import ResourcePage from "@/components/ResourcePage";
import { RESOURCES } from "@/lib/resources";

export default function Page() {
  return <ResourcePage config={RESOURCES.registrations} />;
}