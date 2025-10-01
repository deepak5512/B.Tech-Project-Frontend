import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "./ui/sidebar";

export function SiteHeader({
  heading,
  children,
}: {
  heading: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b">
      <div className="flex h-12 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-base font-medium">{heading}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {children}
        </div>
      </div>
    </header>
  );
}