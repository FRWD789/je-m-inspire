import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { NavLink, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {

  const location = useLocation()
  console.log(location.pathname)
  return (
    <SidebarGroup>
      <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  className={
                    `flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors
                    ${
                      location.pathname===item.url
                        ? "bg-muted text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                  
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
    </SidebarGroup>
  )
}