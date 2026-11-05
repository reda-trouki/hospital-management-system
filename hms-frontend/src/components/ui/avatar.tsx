import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

const Avatar = ({ className, ...p }: React.ComponentProps<typeof AvatarPrimitive.Root>) => <AvatarPrimitive.Root className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-full", className)} {...p} />
const AvatarFallback = ({ className, ...p }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => <AvatarPrimitive.Fallback className={cn("flex size-full items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground", className)} {...p} />
export { Avatar, AvatarFallback }
