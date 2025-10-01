import {
  IconBuildingStore,
  IconClock,
  IconDatabase,
  IconGridPattern,
  IconHomeFilled,
  IconLocation,
  IconReportAnalytics,
  IconTruckDelivery,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { Link } from "react-router-dom";

const data = {
  main: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconHomeFilled,
    },
    {
      title: "Data Table",
      url: "/data-table",
      icon: IconDatabase,
    },
  ],
  analysis: [
    {
      title: "Data Analysis-I",
      url: "/analysis/one",
      icon: IconClock,
    },
    {
      title: "Data Analysis-II",
      url: "/analysis/two",
      icon: IconReportAnalytics,
    },
  ],
  classification: [
    {
      title: "Logistic Regression",
      url: "/classification/logistic-regression",
      icon: IconBuildingStore,
    },
    {
      title: "K-Nearest Neighbors",
      url: "/classification/knn",
      icon: IconTruckDelivery,
    },
    {
      title: "Naive Bayes",
      url: "/classification/naive-bayes",
      icon: IconLocation,
    },
    {
      title: "Random Forest Classifier",
      url: "/classification/random-forest-classifier",
      icon: IconBuildingStore,
    },
    {
      title: "XG Boost Classifier",
      url: "/classification/xg-boost-classifier",
      icon: IconTruckDelivery,
    },
    {
      title: "LDA Classifier",
      url: "/classification/lda-classifier",
      icon: IconLocation,
    },
  ],
  regression: [
    {
      title: "Linear Regression",
      url: "/regression/linear-regression",
      icon: IconGridPattern,
    },
    {
      title: "XG Boost Regressor",
      url: "/regression/xg-boost-regressor",
      icon: IconGridPattern,
    },
    {
      title: "Decision Tree Regressor",
      url: "/regression/decision-tree-regressor",
      icon: IconGridPattern,
    },
    {
      title: "Random Forest Regressor",
      url: "/regression/random-forest-regressor",
      icon: IconGridPattern,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Data Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.analysis.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Regression Models</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.regression.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Classification Models</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.classification.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}