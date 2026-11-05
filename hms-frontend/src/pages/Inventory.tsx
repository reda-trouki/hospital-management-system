import { useState } from "react"
import { PageHeader } from "@/components/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddItem, StockTable } from "./StockTable"

export default function Inventory() {
  const [tab, setTab] = useState<"Supply" | "Equipment">("Supply")
  return (
    <>
      <PageHeader title="Inventory" description="Medical supplies and equipment, with reorder and maintenance alerts."><AddItem category={tab} /></PageHeader>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList><TabsTrigger value="Supply">Supplies</TabsTrigger><TabsTrigger value="Equipment">Equipment</TabsTrigger></TabsList>
        <TabsContent value="Supply"><StockTable category="Supply" /></TabsContent>
        <TabsContent value="Equipment"><StockTable category="Equipment" /></TabsContent>
      </Tabs>
    </>
  )
}
