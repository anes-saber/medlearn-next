"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, PenLine, FileText } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  recentAttempts: any[];
  upcomingHomework: any[];
}

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("student.nav.dashboard") !== "student.nav.dashboard" ? t("student.nav.dashboard") : "Student Dashboard"}</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here is an overview of your progress.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <Link href="/dashboard/courses" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">View all courses</Link>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Quizzes Taken</CardTitle>
            <PenLine className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentAttempts.length}</div>
            <Link href="/dashboard/quizzes" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Take a new quiz</Link>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Homework</CardTitle>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.upcomingHomework.length}</div>
            <Link href="/dashboard/homework" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">View assignments</Link>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Recent Score</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recentAttempts[0] ? `${data.recentAttempts[0].score}/${data.recentAttempts[0].total}` : "--"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last quiz attempt</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader>
            <CardTitle>Recent Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentAttempts.length > 0 ? (
              <ul className="space-y-4">
                {data.recentAttempts.map((attempt) => (
                  <li key={attempt.id} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{attempt.quizzes?.title || "Unknown Quiz"}</p>
                      <p className="text-xs text-gray-500">{new Date(attempt.completed_at).toLocaleDateString()}</p>
                    </div>
                    <div className="font-bold text-emerald-400">
                      {Math.round((attempt.score / attempt.total) * 100)}%
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No recent attempts.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader>
            <CardTitle>Upcoming Homework</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingHomework.length > 0 ? (
              <ul className="space-y-4">
                {data.upcomingHomework.map((hw) => (
                  <li key={hw.id} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{hw.title || "Untitled Assignment"}</p>
                      {hw.deadline && (
                        <p className="text-xs text-gray-500">Due: {new Date(hw.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Link href={`/dashboard/homework/${hw.id}`} className="text-xs text-emerald-500 hover:underline">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No upcoming homework.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
