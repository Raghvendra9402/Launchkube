"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiGalleryLine,
  RiPulseLine,
  RiCommandLine,
  RiTerminalBoxLine,
  RiRobotLine,
  RiBookOpenLine,
  RiSettingsLine,
  RiCropLine,
  RiPieChartLine,
  RiMapLine,
} from "@remixicon/react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Briefcase, Rocket, ShipWheel } from "lucide-react";

// This is sample data.
const data = {
  teams: [
    {
      name: "Launchkube",
      logo: <ShipWheel />,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Deploy Repository",
      url: "/deploy",
      icon: Rocket,
    },
    {
      title: "Jobs",
      url: "/jobs",
      icon: Briefcase,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: session?.user.image!,
            email: session?.user.email!,
            name: session?.user.name!,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
