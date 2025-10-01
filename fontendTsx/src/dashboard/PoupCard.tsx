"use client"
import * as React from "react"
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"


const data = {
  nav: [
    { name: "Notifications", icon: Bell },
    { name: "Navigation", icon: Menu },
    { name: "Home", icon: Home },
    { name: "Appearance", icon: Paintbrush },
    { name: "Messages & media", icon: MessageCircle },
    { name: "Language & region", icon: Globe },
    { name: "Accessibility", icon: Keyboard },
    { name: "Mark as read", icon: Check },
    { name: "Audio & video", icon: Video },
    { name: "Connected accounts", icon: Link },
    { name: "Privacy & visibility", icon: Lock },
    { name: "Advanced", icon: Settings },
  ],
}

export function PoupCard({children}:{children:React.ReactNode}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Creer un Evenment</Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Creer un evenment</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                {children}
            </div>
          </main>

      </DialogContent>
    </Dialog>
  )
}
