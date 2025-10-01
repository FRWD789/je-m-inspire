import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { EventsProvider } from "@/context/EventsContext"
import { Outlet } from "react-router-dom"

export default function Dashboard() {

 
  return (


    <EventsProvider>
    <SidebarProvider
        style={
            {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
        }
        >
      <AppSidebar variant="inset" />
      <SidebarInset className="p-4 grid gap-y-6">
            <SiteHeader />
                <Outlet/>
            </SidebarInset>
        </SidebarProvider>
    </EventsProvider>
 
  )
}
