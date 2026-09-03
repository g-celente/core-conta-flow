import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, titulosAPagar } from "@/lib/mock-data";

export const Route = createFileRoute("/aprovacoes")({
  head: () => ({
    meta: [
      { title: "Fila de aprovação de pagamentos — FinCore" },
      {
        name: "description",
        content: "Títulos acima da alçada do operador aguardando aprovação ou devolução.",
      },
      { property: "og:title", content: "Fila de aprovação de pagamentos — FinCore" },
      { property: "og:description", content: "Aprove ou devolva títulos com justificativa." },
    ],
  }),
  component: Aprovacoes;
});

function Aprovacoes() {
  return null;
}
