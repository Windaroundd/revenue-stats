"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Lock,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import { redirect } from "next/navigation";

export default function HomePage() {
  return redirect("/revenue");
}
