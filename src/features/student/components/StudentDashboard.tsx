"use client";

import Link from "next/link";
import {
  BookOpen,
  FileQuestion,
  Target,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Library,
  PenLine,
} from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";
import type { DashboardData } from "@/features/student/services/dashboard";

const MEDICAL_BLUE = "#1B4965";
const MEDICAL_BLUE_LIGHT = "#2D6B96";
const CLINICAL_GREEN = "#2D8659";
const CLINICAL_GREEN_LIGHT = "#3BA66E";
const ALERT_RED = "#D63031";
const AMBER = "#F39C12";
const DATA_GREEN = "#2D8659";

export default function StudentDashboard({ data }: { data: DashboardData }) {
  const { profile, recentAttempts, avgScore, retentionScore, majors, modules, upcomingHomework } = data;

  const examReadiness = Math.min(100, avgScore + 10);

  const now = new Date();
  const overdue = upcomingHomework.filter(hw => hw.due_at && new Date(hw.due_at) < now);
  const thisWeek = upcomingHomework.filter(hw => {
    if (!hw.due_at) return false;
    const d = new Date(hw.due_at);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return d >= now && d <= weekEnd;
  });
  const onTrack = upcomingHomework.filter(hw => {
    if (!hw.due_at) return false;
    return new Date(hw.due_at) > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  function daysUntil(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const nextExam = upcomingHomework.find(hw => hw.due_at && new Date(hw.due_at) >= now);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8 font-sans">

      {/* ═══════════════════════════════════════════════════
         HEADER CARD — Semester, GPA, Next Exam, Progress Ring
         ═══════════════════════════════════════════════════ */}
      <div className="rounded-2xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5"
        style={{
          background: "linear-gradient(135deg, hsl(220,14%,10%), hsl(220,14%,7%))",
          borderColor: "hsl(220,12%,18%)",
        }}
      >
        {/* Left: Student info */}
        <div className="flex-1 min-w-0">
          <p className="font-heading text-xl md:text-2xl font-bold tracking-tight"
            style={{ color: "hsl(210,20%,92%)" }}>
            {profile.fullName || "Medical Student"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,50%)" }}>
            {profile.email}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "hsl(215,15%,45%)" }}>Semester</span>
              <p className="text-sm font-medium mt-0.5" style={{ color: "hsl(210,20%,85%)" }}>
                Semester 1 · 2025/26
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "hsl(215,15%,45%)" }}>Average Score</span>
              <p className="text-sm font-mono font-bold mt-0.5" style={{ color: avgScore >= 70 ? CLINICAL_GREEN_LIGHT : AMBER }}>
                {avgScore}%
              </p>
            </div>
            {nextExam && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "hsl(215,15%,45%)" }}>Next Assignment</span>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"
                  style={{ color: "hsl(210,20%,85%)" }}>
                  <Clock className="h-3.5 w-3.5" style={{ color: AMBER }} />
                  {daysUntil(nextExam.due_at!)} days
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Progress ring */}
        <div className="shrink-0 flex items-center gap-4">
          <ProgressRing value={avgScore} size={80} strokeWidth={6}
            circleColor={avgScore >= 70 ? CLINICAL_GREEN : avgScore >= 40 ? AMBER : ALERT_RED}
            trackColor="hsl(220,12%,20%)">
            <span className="text-sm font-mono font-bold" style={{ color: "hsl(210,20%,90%)" }}>
              {avgScore}%
            </span>
          </ProgressRing>
          <div className="hidden sm:block">
            <p className="text-xs font-medium" style={{ color: "hsl(215,15%,55%)" }}>Overall</p>
            <p className="text-[11px]" style={{ color: "hsl(215,15%,40%)" }}>Academic Progress</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         STUDY METRICS — KPIs
         ═══════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Exam Readiness",
            value: examReadiness,
            icon: Target,
            color: examReadiness >= 70 ? DATA_GREEN : examReadiness >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.length} attempt${recentAttempts.length !== 1 ? "s" : ""} recorded`,
          },
          {
            label: "Average Score",
            value: avgScore,
            icon: FileQuestion,
            color: avgScore >= 70 ? DATA_GREEN : avgScore >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.filter(a => a.score / a.total >= 0.6).length}/${recentAttempts.length} passed`,
          },
          {
            label: "Retention",
            value: retentionScore,
            icon: BookOpen,
            color: retentionScore >= 70 ? DATA_GREEN : retentionScore >= 40 ? AMBER : ALERT_RED,
            desc: `${recentAttempts.reduce((s, a) => s + a.total, 0)} questions answered`,
          },
        ].map((metric) => (
          <div key={metric.label}
            className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-2px]"
            style={{
              background: "hsl(220,14%,10%)",
              borderColor: "hsl(220,12%,17%)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "hsl(215,15%,50%)" }}>
                {metric.label}
              </span>
              <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
            </div>
            <span className="font-mono text-2xl font-bold" style={{ color: metric.color }}>
              {metric.value}%
            </span>
            <p className="text-[11px] mt-1.5" style={{ color: "hsl(215,15%,45%)" }}>
              {metric.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
         MODULES / COURSES CARDS
         ═══════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-bold" style={{ color: "hsl(210,20%,90%)" }}>
            Your Courses
          </h2>
          <Link href="/dashboard/courses"
            className="text-xs font-medium flex items-center gap-1 transition-colors hover:underline"
            style={{ color: MEDICAL_BLUE_LIGHT }}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {majors.length === 0 && (
            <div className="col-span-full rounded-xl border p-6 text-center"
              style={{ borderColor: "hsl(220,12%,17%)", background: "hsl(220,14%,10%)" }}>
              <p className="text-sm" style={{ color: "hsl(215,15%,50%)" }}>
                No courses available yet.
              </p>
            </div>
          )}
          {majors.map((major) => {
            const majorModules = modules.filter(m => m.major_id === major.id);
            const majorQuizzes = data.totalQuizzes; // simplified
            const moduleCount = majorModules.length;
            const completionPct = moduleCount > 0
              ? Math.min(100, Math.round((recentAttempts.length / Math.max(moduleCount, 1)) * 100))
              : 0;

            return (
              <Link key={major.id} href={`/dashboard/courses`}
                className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-2px] block"
                style={{
                  background: "hsl(220,14%,10%)",
                  borderColor: "hsl(220,12%,17%)",
                }}
              >
                <h3 className="font-heading text-sm font-bold" style={{ color: "hsl(210,20%,90%)" }}>
                  {major.name}
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: "hsl(215,15%,45%)" }}>
                  {moduleCount} module{moduleCount !== 1 ? "s" : ""} · {majorQuizzes} quiz{majorQuizzes !== 1 ? "zes" : ""}
                </p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span style={{ color: "hsl(215,15%,50%)" }}>Progress</span>
                    <span className="font-mono font-medium" style={{ color: MEDICAL_BLUE_LIGHT }}>
                      {completionPct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full w-full overflow-hidden"
                    style={{ background: "hsl(220,12%,18%)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPct}%`,
                        background: `linear-gradient(90deg, ${MEDICAL_BLUE}, ${MEDICAL_BLUE_LIGHT})`,
                      }}
                    />
                  </div>
                </div>

                {/* Module list */}
                {majorModules.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {majorModules.slice(0, 3).map(mod => (
                      <div key={mod.id} className="flex items-center gap-2 text-[11px]"
                        style={{ color: "hsl(215,15%,50%)" }}>
                        <div className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: MEDICAL_BLUE_LIGHT }} />
                        {mod.name}
                      </div>
                    ))}
                    {majorModules.length > 3 && (
                      <p className="text-[10px] mt-1" style={{ color: "hsl(215,15%,40%)" }}>
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

      {/* ═══════════════════════════════════════════════════
         BOTTOM ROW — Task List + Resource Hub + Recent Attempts
         ═══════════════════════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* ── To-Do / Task List ────────────────────────── */}
        <div className="md:col-span-2 rounded-xl border p-4"
          style={{
            background: "hsl(220,14%,10%)",
            borderColor: "hsl(220,12%,17%)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-bold" style={{ color: "hsl(210,20%,90%)" }}>
              Upcoming Assignments
            </h2>
            <Link href="/dashboard/homework"
              className="text-xs font-medium flex items-center gap-1 transition-colors hover:underline"
              style={{ color: MEDICAL_BLUE_LIGHT }}>
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Overdue */}
          {overdue.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                style={{ color: ALERT_RED }}>
                <AlertTriangle className="h-3 w-3" /> Overdue
              </p>
              <div className="space-y-1">
                {overdue.map(hw => (
                  <div key={hw.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ background: "hsla(0,69%,55%,0.08)", borderLeft: `3px solid ${ALERT_RED}` }}>
                    <span className="text-xs font-medium truncate" style={{ color: "hsl(210,20%,85%)" }}>
                      {hw.title_en || hw.title_fr || hw.title_ar || "Untitled"}
                    </span>
                    <span className="text-[10px] font-mono shrink-0 ml-2"
                      style={{ color: ALERT_RED }}>
                      {Math.abs(daysUntil(hw.due_at!))}d overdue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* This week */}
          {thisWeek.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                style={{ color: AMBER }}>
                <Clock className="h-3 w-3" /> Due This Week
              </p>
              <div className="space-y-1">
                {thisWeek.map(hw => (
                  <div key={hw.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ background: "hsla(37,90%,55%,0.08)", borderLeft: `3px solid ${AMBER}` }}>
                    <span className="text-xs font-medium truncate" style={{ color: "hsl(210,20%,85%)" }}>
                      {hw.title_en || hw.title_fr || hw.title_ar || "Untitled"}
                    </span>
                    <span className="text-[10px] font-mono shrink-0 ml-2"
                      style={{ color: AMBER }}>
                      {daysUntil(hw.due_at!)}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On track */}
          {onTrack.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                style={{ color: DATA_GREEN }}>
                <CheckCircle2 className="h-3 w-3" /> On Track
              </p>
              <div className="space-y-1">
                {onTrack.map(hw => (
                  <div key={hw.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ background: "hsla(145,64%,50%,0.06)", borderLeft: `3px solid ${DATA_GREEN}` }}>
                    <span className="text-xs font-medium truncate" style={{ color: "hsl(210,20%,85%)" }}>
                      {hw.title_en || hw.title_fr || hw.title_ar || "Untitled"}
                    </span>
                    <span className="text-[10px] font-mono shrink-0 ml-2"
                      style={{ color: DATA_GREEN }}>
                      {daysUntil(hw.due_at!)}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingHomework.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: "hsl(215,15%,45%)" }}>
              No assignments pending. You are all caught up.
            </p>
          )}
        </div>

        {/* ── Right Column: Recent Attempts + Resource Hub ── */}
        <div className="space-y-4">
          {/* Recent Quiz Attempts */}
          <div className="rounded-xl border p-4"
            style={{
              background: "hsl(220,14%,10%)",
              borderColor: "hsl(220,12%,17%)",
            }}
          >
            <h2 className="font-heading text-sm font-bold mb-3" style={{ color: "hsl(210,20%,90%)" }}>
              Recent Attempts
            </h2>
            {recentAttempts.length > 0 ? (
              <div className="space-y-2">
                {recentAttempts.slice(0, 4).map((attempt) => {
                  const pct = Math.round((attempt.score / attempt.total) * 100);
                  return (
                    <div key={attempt.id}
                      className="flex items-center justify-between py-1.5 border-b text-sm"
                      style={{ borderColor: "hsl(220,12%,14%)" }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate"
                          style={{ color: "hsl(210,20%,85%)" }}>
                          {((attempt.quizzes as { title?: string })?.title) || "Quiz"}
                        </p>
                        <p className="text-[10px] mt-0.5"
                          style={{ color: "hsl(215,15%,45%)" }}>
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-mono text-xs font-bold shrink-0 ml-3 ${pct >= 70 ? "text-green-500" : pct >= 40 ? "text-amber-500" : "text-red-500"}`}
                        style={{
                          color: pct >= 70 ? DATA_GREEN : pct >= 40 ? AMBER : ALERT_RED,
                        }}>
                        {attempt.score}/{attempt.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs py-4 text-center" style={{ color: "hsl(215,15%,45%)" }}>
                No attempts yet.
              </p>
            )}
            <Link href="/dashboard/quizzes"
              className="text-xs font-medium flex items-center gap-1 mt-3 transition-colors hover:underline"
              style={{ color: MEDICAL_BLUE_LIGHT }}>
              <PenLine className="h-3 w-3" /> Take a quiz
            </Link>
          </div>

          {/* Resource Hub */}
          <div className="rounded-xl border p-4"
            style={{
              background: "hsl(220,14%,10%)",
              borderColor: "hsl(220,12%,17%)",
            }}
          >
            <h2 className="font-heading text-sm font-bold mb-3" style={{ color: "hsl(210,20%,90%)" }}>
              Resource Hub
            </h2>
            {majors.length > 0 ? (
              <div className="space-y-2">
                {majors.slice(0, 4).map(major => (
                  <Link key={major.id} href={`/dashboard/courses`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-[hsl(220,12%,14%)]"
                    style={{ color: "hsl(215,15%,60%)" }}>
                    <Library className="h-3.5 w-3.5 shrink-0" style={{ color: MEDICAL_BLUE_LIGHT }} />
                    {major.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs py-4 text-center" style={{ color: "hsl(215,15%,45%)" }}>
                No resources yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
