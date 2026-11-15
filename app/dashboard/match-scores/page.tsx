import ResourcePage from "@/components/ResourcePage";
import { RESOURCES } from "@/lib/resources";

export const instant = false;

export default function Page() {
  return <ResourcePage config={RESOURCES.matchScores} />;

}