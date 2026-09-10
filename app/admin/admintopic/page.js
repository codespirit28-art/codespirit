"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Loader2,
  Coins,
  Lock,
} from "lucide-react";

export default function TopicsPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeSubject, setActiveSubject] = useState("");
  const [activeChapter, setActiveChapter] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "50",
  });

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "50",
  });

  /* =========================================================
     CHAPTERS FOR ACTIVE SUBJECT
  ========================================================= */

  const chaptersForSubject = useMemo(() => {
    return chapters.filter(
      (chapter) =>
        String(chapter.subjectId) === String(activeSubject)
    );
  }, [chapters, activeSubject]);

  /* =========================================================
     TOPICS FOR ACTIVE CHAPTER
  ========================================================= */

  const topicsForChapter = useMemo(() => {
    return topics
      .filter(
        (topic) =>
          String(topic.chapterId) === String(activeChapter)
      )
      .sort(
        (a, b) =>
          Number(a.order || 0) - Number(b.order || 0)
      );
  }, [topics, activeChapter]);

  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  useEffect(() => {
    fetchAll();
  }, []);

  /* =========================================================
     KEEP VALID CHAPTER SELECTED
  ========================================================= */

  useEffect(() => {
    if (chaptersForSubject.length === 0) {
      setActiveChapter("");
      return;
    }

    const currentChapterExists = chaptersForSubject.some(
      (chapter) =>
        String(chapter._id) === String(activeChapter)
    );

    if (!currentChapterExists) {
      setActiveChapter(chaptersForSubject[0]._id);
    }
  }, [chaptersForSubject, activeChapter]);

  /* =========================================================
     FETCH ALL
  ========================================================= */

  async function fetchAll() {
    setIsLoading(true);

    try {
      const [
        subjectsRes,
        chaptersRes,
        topicsRes,
      ] = await Promise.all([
        fetch("/api/subjects", {
          cache: "no-store",
        }),

        fetch("/api/chapters", {
          cache: "no-store",
        }),

        fetch("/api/topics", {
          cache: "no-store",
        }),
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();

        setSubjects(subjectsData);

        setActiveSubject((previous) => {
          if (previous) return previous;
          return subjectsData[0]?._id || "";
        });
      }

      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json();
        setChapters(chaptersData);
      }

      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
      }
    } catch (error) {
      console.error("Failed to fetch admin topic data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  /* =========================================================
     FETCH TOPICS ONLY
  ========================================================= */

  async function fetchTopics() {
    try {
      const response = await fetch("/api/topics", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }

      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  }

  /* =========================================================
     SUBJECT CHANGE
  ========================================================= */

  function handleSubjectChange(subjectId) {
    setActiveSubject(subjectId);
    setActiveChapter("");
  }

  /* =========================================================
     ADD TOPIC
  ========================================================= */

  async function addTopic() {
    if (!activeChapter) {
      alert("Please select a chapter first.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter a subtopic title.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid coin price.");
      return;
    }

    const payload = {
      chapterId: activeChapter,
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      coins: price,
      isFree: price === 0,
      order: topicsForChapter.length + 1,
    };

    setIsSaving(true);

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(
          data?.message ||
            "Failed to create subtopic."
        );
        return;
      }

      setForm({
        title: "",
        description: "",
        price: "50",
      });

      await fetchTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Something went wrong while creating the topic.");
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================================================
     DELETE TOPIC
  ========================================================= */

  async function removeTopic(id) {
    const confirmed = window.confirm(
      "Delete this topic completely from MongoDB?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/topics?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(
          data?.message ||
            "Failed to delete topic."
        );
        return;
      }

      await fetchTopics();
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Something went wrong while deleting.");
    }
  }

  /* =========================================================
     START EDIT
  ========================================================= */

  function startEdit(topic) {
    setEditingId(topic._id);

    setEditForm({
      title: topic.title || "",
      description: topic.description || "",
      price: String(
        topic.price ??
          topic.coins ??
          0
      ),
    });
  }

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  function cancelEdit() {
    setEditingId(null);

    setEditForm({
      title: "",
      description: "",
      price: "50",
    });
  }

  /* =========================================================
     SAVE EDIT
  ========================================================= */

  async function saveEdit(id) {
    if (!editForm.title.trim()) {
      alert("Topic title cannot be empty.");
      return;
    }

    const price = Number(editForm.price);

    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid coin price.");
      return;
    }

    try {
      const response = await fetch("/api/topics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          price,
          coins: price,
          isFree: price === 0,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(
          data?.message ||
            "Failed to update topic."
        );
        return;
      }

      cancelEdit();
      await fetchTopics();
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Something went wrong while updating.");
    }
  }

  /* =========================================================
     MOVE TOPIC
  ========================================================= */

  async function moveTopic(id, direction) {
    const index = topicsForChapter.findIndex(
      (topic) =>
        String(topic._id) === String(id)
    );

    if (index === -1) return;

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= topicsForChapter.length
    ) {
      return;
    }

    const topicA = topicsForChapter[index];
    const topicB = topicsForChapter[targetIndex];

    try {
      const firstResponse = await fetch(
        "/api/topics",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: topicA._id,
            order: topicB.order,
          }),
        }
      );

      if (!firstResponse.ok) {
        throw new Error("Failed to move first topic");
      }

      const secondResponse = await fetch(
        "/api/topics",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: topicB._id,
            order: topicA.order,
          }),
        }
      );

      if (!secondResponse.ok) {
        throw new Error("Failed to move second topic");
      }

      await fetchTopics();
    } catch (error) {
      console.error("Error reordering topics:", error);
      alert("Unable to reorder topics.");
    }
  }

  /* =========================================================
     CURRENT CHAPTER
  ========================================================= */

  const currentChapter = chapters.find(
    (chapter) =>
      String(chapter._id) ===
      String(activeChapter)
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e14]/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-100">
              Content Admin
            </span>

            <span className="text-slate-600">
              /
            </span>

            <span className="text-violet-300">
              Subtopics
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Coins
              size={14}
              className="text-yellow-400"
            />

            Coin-based learning
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">

        {/* ===================================================
            SUBJECT / CHAPTER SELECTOR
        =================================================== */}

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

          <div className="mb-5">
            <h1 className="text-lg font-bold text-slate-100">
              Topic Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create paid or free learning topics.
              Users can spend earned coins to unlock
              paid topics.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* SUBJECT */}

            <div>
              <label className="mb-1.5 block text-xs text-slate-500">
                Subject
              </label>

              <select
                value={activeSubject}
                onChange={(event) =>
                  handleSubjectChange(
                    event.target.value
                  )
                }
                disabled={subjects.length === 0}
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm outline-none focus:border-violet-500 disabled:opacity-40"
              >
                {subjects.length === 0 && (
                  <option value="">
                    No subjects yet
                  </option>
                )}

                {subjects.map((subject) => (
                  <option
                    key={subject._id}
                    value={subject._id}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CHAPTER */}

            <div>
              <label className="mb-1.5 block text-xs text-slate-500">
                Main Topic / Chapter
              </label>

              <select
                value={activeChapter}
                onChange={(event) =>
                  setActiveChapter(
                    event.target.value
                  )
                }
                disabled={
                  chaptersForSubject.length === 0
                }
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm outline-none focus:border-violet-500 disabled:opacity-40"
              >
                {chaptersForSubject.length === 0 && (
                  <option value="">
                    No chapters yet
                  </option>
                )}

                {chaptersForSubject.map(
                  (chapter) => (
                    <option
                      key={chapter._id}
                      value={chapter._id}
                    >
                      {chapter.title}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          {!isLoading &&
            subjects.length === 0 && (
              <p className="mt-3 text-xs text-amber-400/80">
                No subjects yet. Add a subject first.
              </p>
            )}

          {!isLoading &&
            subjects.length > 0 &&
            chaptersForSubject.length === 0 && (
              <p className="mt-3 text-xs text-amber-400/80">
                This subject has no chapters yet.
                Add a main topic first.
              </p>
            )}
        </section>

        {/* ===================================================
            ADD SUBTOPIC
        =================================================== */}

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

          <div className="mb-5 flex items-start justify-between gap-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Add subtopic to{" "}
                <span className="text-violet-300">
                  {currentChapter?.title || "—"}
                </span>
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Set the number of coins required
                to unlock this topic.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400 sm:flex">
              <Lock size={13} />
              Paid topics
            </div>

          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px]">

            {/* TITLE */}

            <input
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder="Subtopic title"
              disabled={!activeChapter}
              className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-40"
            />

            {/* DESCRIPTION */}

            <input
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description:
                    event.target.value,
                }))
              }
              placeholder="Short description"
              disabled={!activeChapter}
              className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-40"
            />

            {/* PRICE */}

            <div className="relative">
              <Coins
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400"
              />

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    price: event.target.value,
                  }))
                }
                placeholder="Coins"
                disabled={!activeChapter}
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-yellow-500 disabled:opacity-40"
              />
            </div>

          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-slate-600">
              Enter <span className="text-green-400">0</span>{" "}
              to make the topic free.
            </p>

            <button
              onClick={addTopic}
              disabled={
                !activeChapter ||
                isSaving
              }
              className="flex items-center justify-center gap-1.5 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Plus size={15} />
              )}

              {isSaving
                ? "Adding..."
                : "Add subtopic"}
            </button>

          </div>
        </section>

        {/* ===================================================
            TOPIC LIST
        =================================================== */}

        <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Subtopics
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                {currentChapter?.title ||
                  "Select a chapter"}
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-500">
              {topicsForChapter.length} topics
            </span>

          </div>

          {/* LOADING */}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
              <Loader2
                className="animate-spin text-violet-500"
                size={18}
              />

              Loading topics...
            </div>
          ) : topicsForChapter.length === 0 ? (
            <div className="px-5 py-14 text-center">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                <Plus
                  size={20}
                  className="text-violet-400"
                />
              </div>

              <p className="text-sm text-slate-500">
                No subtopics yet for this chapter.
              </p>

              <p className="mt-1 text-xs text-slate-700">
                Create the first topic above.
              </p>

            </div>
          ) : (
            <ul className="divide-y divide-white/10">

              {topicsForChapter.map(
                (topic, index) => {

                  const topicPrice = Number(
                    topic.price ??
                      topic.coins ??
                      0
                  );

                  const isFree =
                    topic.isFree === true ||
                    topicPrice === 0;

                  const isEditing =
                    editingId === topic._id;

                  return (
                    <li
                      key={topic._id}
                      className="px-5 py-4"
                    >

                      {isEditing ? (

                        /* ===================================
                           EDIT MODE
                        =================================== */

                        <div className="space-y-3">

                          <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px]">

                            <input
                              value={editForm.title}
                              onChange={(event) =>
                                setEditForm(
                                  (previous) => ({
                                    ...previous,
                                    title:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Subtopic title"
                              className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500"
                            />

                            <input
                              value={
                                editForm.description
                              }
                              onChange={(event) =>
                                setEditForm(
                                  (previous) => ({
                                    ...previous,
                                    description:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Description"
                              className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500"
                            />

                            <div className="relative">
                              <Coins
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400"
                              />

                              <input
                                type="number"
                                min="0"
                                value={
                                  editForm.price
                                }
                                onChange={(event) =>
                                  setEditForm(
                                    (previous) => ({
                                      ...previous,
                                      price:
                                        event.target
                                          .value,
                                    })
                                  )
                                }
                                className="w-full rounded-md border border-white/10 bg-[#0b0e14] py-2 pl-8 pr-3 text-sm text-slate-200 outline-none focus:border-yellow-500"
                              />
                            </div>

                          </div>

                          <div className="flex justify-end gap-2">

                            <IconBtn
                              title="Save"
                              onClick={() =>
                                saveEdit(
                                  topic._id
                                )
                              }
                            >
                              <Check size={14} />
                            </IconBtn>

                            <IconBtn
                              title="Cancel"
                              onClick={
                                cancelEdit
                              }
                            >
                              <X size={14} />
                            </IconBtn>

                          </div>

                        </div>

                      ) : (

                        /* ===================================
                           NORMAL MODE
                        =================================== */

                        <div className="flex items-center gap-3">

                          {/* ORDER */}

                          <span className="w-6 shrink-0 text-center font-mono text-xs text-slate-600">
                            {topic.order ??
                              index + 1}
                          </span>

                          {/* LOCK ICON */}

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isFree
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {isFree ? (
                              <Check
                                size={17}
                              />
                            ) : (
                              <Lock
                                size={16}
                              />
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="truncate text-sm font-medium text-slate-100">
                                {topic.title}
                              </p>

                              {isFree ? (
                                <span className="rounded border border-green-500/20 bg-green-500/5 px-2 py-0.5 text-[10px] font-medium text-green-400">
                                  FREE
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded border border-yellow-500/20 bg-yellow-500/5 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                                  <Coins
                                    size={10}
                                  />

                                  {topicPrice}
                                </span>
                              )}

                            </div>

                            {topic.description && (
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {
                                  topic.description
                                }
                              </p>
                            )}

                          </div>

                          {/* ACTIONS */}

                          <div className="flex shrink-0 items-center gap-1">

                            <IconBtn
                              title="Move up"
                              disabled={
                                index === 0
                              }
                              onClick={() =>
                                moveTopic(
                                  topic._id,
                                  "up"
                                )
                              }
                            >
                              <ArrowUp
                                size={14}
                              />
                            </IconBtn>

                            <IconBtn
                              title="Move down"
                              disabled={
                                index ===
                                topicsForChapter.length -
                                  1
                              }
                              onClick={() =>
                                moveTopic(
                                  topic._id,
                                  "down"
                                )
                              }
                            >
                              <ArrowDown
                                size={14}
                              />
                            </IconBtn>

                            <IconBtn
                              title="Edit"
                              onClick={() =>
                                startEdit(
                                  topic
                                )
                              }
                            >
                              <Pencil
                                size={14}
                              />
                            </IconBtn>

                            <IconBtn
                              title="Delete"
                              danger
                              onClick={() =>
                                removeTopic(
                                  topic._id
                                )
                              }
                            >
                              <Trash2
                                size={14}
                              />
                            </IconBtn>

                          </div>

                        </div>
                      )}

                    </li>
                  );
                }
              )}

            </ul>
          )}

        </section>

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section className="rounded-xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
              <Coins
                size={19}
                className="text-yellow-400"
              />
            </div>

            <div>

              <h3 className="text-sm font-semibold text-slate-200">
                How the coin system works
              </h3>

              <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">

                <p>
                  1. Users solve MCQ/coding questions
                  and earn coins.
                </p>

                <p>
                  2. Topics can be configured with a
                  coin price.
                </p>

                <p>
                  3. Free topics use price{" "}
                  <span className="text-green-400">
                    0
                  </span>
                  .
                </p>

                <p>
                  4. Paid topics should require the user
                  to spend the configured coins before
                  accessing the topic.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

/* =========================================================
   ICON BUTTON
========================================================= */

function IconBtn({
  children,
  onClick,
  disabled = false,
  danger = false,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "hover:border-red-500/40 hover:text-red-400"
          : "hover:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
