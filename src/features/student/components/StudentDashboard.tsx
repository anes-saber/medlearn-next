"use client";

import Link from "next/link";
import {
  BookOpen,
  FileQuestion,
  Target,
  ArrowRight,
  Library,
  PenLine,
} from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";
import type { DashboardData } from "@/features/student/services/dashboard";

const CLINICAL_GREEN = "hsl(151, 50%, 35%)";
const CLINICAL_GREEN_LIGHT = "hsl(151, 50%, 45%)";
const ALERT_RED = "hsl(0, 69%, 51%)";
const AMBER = "hsl(38, 92%, 50%)";

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const { profile, recentAttempts, avgScore, retentionScore, majors, modules } = data;

  const examReadiness = Math.min(100, avgScore + 10);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">

      {/* HEADER CARD */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 shadow-sm">
        <div className="flex-1 min-w-0">
          <p className="font-heading text-xl md:text-2xl font-bold tracking-tight text-card-foreground">
            {profile.fullName || "Medical Student"}
          </p>
          <p className="text-xs mt-0.5 text-muted-foreground/70">
            {profile.email}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Semester</span>
              <p className="text-sm font-medium mt-0.5 text-card-foreground/80">
                Semester 1 · 2025/26
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Average Score</span>
              <p className="text-sm font-mono font-bold mt-0.5" style={{ color: avgScore >= 70 ? CLINICAL_GREEN_LIGHT : AMBER }}>
                {avgScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4">
          <ProgressRing value={avgScore} size={80} strokeWidth={6}
            circleColor={avgScore >= 70 ? CLINICAL_GREEN : avgScore >= 40 ? AMBER : ALERT_RED}
            trackColor="var(--color-muted, hsl(220,12%,20%))">
            <span className="text-sm font-mono font-bold text-card-foreground">
              {avgScore}%
            </span>
          </ProgressRing>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-muted-foreground/70">Overall</p>
            <p className="text-[11px] text-muted-foreground/50">Academic Progress</p>
          </div>
        </div>
      </div>

      {/* STUDY METRICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Exam Readiness",
            value: examReadiness,
            icon: Target,
            color: examReadiness >= 70 ? CLINICAL_GREEN : examReadiness >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.length} attempt${recentAttempts.length !== 1 ? "s" : ""} recorded`,
          },
          {
            label: "Average Score",
            value: avgScore,
            icon: FileQuestion,
            color: avgScore >= 70 ? CLINICAL_GREEN : avgScore >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.filter(a => a.score / a.total >= 0.6).length}/${recentAttempts.length} passed`,
          },
          {
            label: "Retention",
            value: retentionScore,
            icon: BookOpen,
            color: retentionScore >= 70 ? CLINICAL_GREEN : retentionScore >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.reduce((s, a) => s + a.total, 0)} questions answered`,
          },
        ].map((metric) => (
          <div key={metric.label}
            className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {metric.label}
              </span>
              <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
            </div>
            <span className="font-mono text-2xl font-bold" style={{ color: metric.color }}>
              {metric.value}%
            </span>
            <p className="text-[11px] mt-1.5 text-muted-foreground/60">
              {metric.desc}
            </p>
          </div>
        ))}
      </div>

      {/* MODULES / COURSES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-bold text-card-foreground">
            Your Courses
          </h2>
          <Link href="/dashboard/courses"
            className="text-xs font-medium flex items-center gap-1 text-primary transition-colors hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {majors.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No courses available yet.
              </p>
            </div>
          )}
          {majors.map((major) => {
            const majorModules = modules.filter(m => m.major_id === major.id);
            const majorQuizzes = data.totalQuizzes;
            const moduleCount = majorModules.length;
            const completionPct = moduleCount > 0
              ? Math.min(100, Math.round((recentAttempts.length / Math.max(moduleCount, 1)) * 100))
              : 0;

            return (
              <Link key={major.id} href={`/dashboard/courses`}
                className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md block"
              >
                <h3 className="font-heading text-sm font-bold text-card-foreground">
                  {major.name}
                </h3>
                <p className="text-[11px] mt-0.5 text-muted-foreground/60">
                  {moduleCount} module{moduleCount !== 1 ? "s" : ""} · {majorQuizzes} quiz{majorQuizzes !== 1 ? "zes" : ""}
                </p>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground/70">Progress</span>
                    <span className="font-mono font-medium text-primary">
                      {completionPct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full w-full overflow-hidden bg-muted">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPct}%`,
                        background: `linear-gradient(90deg, ${CLINICAL_GREEN}, ${CLINICAL_GREEN_LIGHT})`,
                      }}
                    />
                  </div>
                </div>

                {majorModules.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {majorModules.slice(0, 3).map(mod => (
                      <div key={mod.id} className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        <div className="w-1 h-1 rounded-full shrink-0 bg-primary" />
                        {mod.name}
                      </div>
                    ))}
                    {majorModules.length > 3 && (
                      <p className="text-[10px] mt-1 text-muted-foreground/50">
                        +{majorModules.length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-bold mb-3 text-card-foreground">
              Recent Attempts
            </h2>
            {recentAttempts.length > 0 ? (
              <div className="space-y-2">
                {recentAttempts.slice(0, 4).map((attempt) => {
                  const pct = Math.round((attempt.score / attempt.total) * 100);
                  return (
                    <div key={attempt.id}
                      className="flex items-center justify-between py-1.5 border-b border-border/50 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate text-card-foreground/80">
                          {((attempt.quizzes as { title?: string })?.title) || "Quiz"}
                        </p>
                        <p className="text-[10px] mt-0.5 text-muted-foreground/60">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold shrink-0 ml-3"
                        style={{
                          color: pct >= 70 ? CLINICAL_GREEN : pct >= 40 ? AMBER : ALERT_RED,
                        }}>
                        {attempt.score}/{attempt.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs py-4 text-center text-muted-foreground">
                No attempts yet.
              </p>
            )}
            <Link href="/dashboard/quizzes"
              className="text-xs font-medium flex items-center gap-1 mt-3 text-primary transition-colors hover:underline">
              <PenLine className="h-3 w-3" /> Take a quiz
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-bold mb-3 text-card-foreground">
              Resource Hub
            </h2>
            {majors.length > 0 ? (
              <div className="space-y-2">
                {majors.slice(0, 4).map(major => (
                  <Link key={major.id} href={`/dashboard/courses`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted text-muted-foreground/70">
                    <Library className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {major.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs py-4 text-center text-muted-foreground">
                No resources yet.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}