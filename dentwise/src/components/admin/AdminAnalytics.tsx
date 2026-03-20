"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminAnalytics } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS = ["#2563eb", "#f59e0b", "#ef4444"];

export default function AdminAnalytics() {
  const { data, isLoading } = useAdminAnalytics();

  const doctorStatusData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Active", value: data.doctorStats.active },
      { name: "Pending", value: data.doctorStats.pending },
      { name: "Suspended", value: data.doctorStats.suspended },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Loading analytics...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Appointment Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.appointmentSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Status</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={doctorStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
              >
                {doctorStatusData.map((_, index) => (
                  <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.paymentSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" name="Successful" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardContent className="grid gap-4 md:grid-cols-3 p-6">
          <div>
            <div className="text-2xl font-bold">{data.paymentStats.total}</div>
            <div className="text-sm text-muted-foreground">Total payments</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{data.paymentStats.success}</div>
            <div className="text-sm text-muted-foreground">Successful payments</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.paymentStats.revenue.toLocaleString()} FCFA
            </div>
            <div className="text-sm text-muted-foreground">Total revenue</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
