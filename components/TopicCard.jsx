"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function TopicCard({ category }) {
  const router = useRouter();

  // =========================================================
  // OPEN THEORY PAGE
  // =========================================================

  function handleOpen() {
    if (category.isLocked) return;

    if (!category.id) {
      console.error(
        "TopicCard: chapter ID is missing",
        category
      );
      return;
    }

    router.push(`/theory/${category.id}`);
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={category.isLocked}
      className={`
        group relative w-full overflow-hidden rounded-xl
        border border-slate-800
        bg-[#0d111c]
        p-6 text-left
        transition-all duration-300

        ${
          category.isLocked
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-[#101522] hover:shadow-[0_15px_45px_rgba(79,70,229,0.12)]"
        }
      `}
    >

      {/* =====================================================
          TOP ROW
      ===================================================== */}

      <div className="flex items-start justify-between gap-4">

        {/* ICON */}

        <div
          className={`
            flex h-12 w-12 shrink-0 items-center
            justify-center rounded-lg
            bg-slate-900
            border border-slate-800
            font-mono text-sm font-bold
            transition
            ${
              category.isLocked
                ? "text-slate-600"
                : "text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10"
            }
          `}
        >
          {category.isLocked ? (
            <Lock size={18} />
          ) : (
            category.iconText || "[ ]"
          )}
        </div>

        {/* STATUS */}

        {category.isLocked ? (
          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <Lock size={11} />
            Locked
          </div>
        ) : category.solved > 0 &&
          category.total > 0 &&
          category.solved >= category.total ? (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 size={11} />
            Complete
          </div>
        ) : null}

      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <h2
        className={`
          mt-6 text-xl font-bold tracking-tight
          transition
          ${
            category.isLocked
              ? "text-slate-500"
              : "text-white group-hover:text-indigo-300"
          }
        `}
      >
        {category.title}
      </h2>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {category.description && (
        <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
          {category.description}
        </p>
      )}

      {/* =====================================================
          DIFFICULTY
      ===================================================== */}

      {category.difficulty && (
        <div className="mt-5 flex items-center justify-between">

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Difficulty
          </span>

          <span
            className={`
              text-xs font-semibold
              ${
                category.difficulty === "Easy"
                  ? "text-emerald-400"
                  : category.difficulty === "Medium"
                  ? "text-yellow-400"
                  : "text-orange-400"
              }
            `}
          >
            {category.difficulty}
          </span>

        </div>
      )}

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      {category.total > 0 && (
        <div className="mt-4">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Progress
            </span>

            <span className="font-mono text-[11px] text-slate-500">
              {category.solved || 0}/{category.total}
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">

            <div
              className={`
                h-full rounded-full transition-all
                ${
                  category.progressColor ||
                  "bg-indigo-500"
                }
              `}
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    ((category.solved || 0) /
                      category.total) *
                      100
                  )
                )}%`,
              }}
            />

          </div>

        </div>
      )}

      {/* =====================================================
          OPEN THEORY
      ===================================================== */}

      {!category.isLocked && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">

          <span className="text-xs font-semibold text-slate-600 transition group-hover:text-indigo-400">
            Read theory
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-slate-500 transition group-hover:bg-indigo-500/10 group-hover:text-indigo-400">

            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />

          </div>

        </div>
      )}

    </button>
  );
}