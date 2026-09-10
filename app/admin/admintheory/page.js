"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Heading1,
  Heading2,
  Pilcrow,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Link2,
  Code2,
  Info,
  Minus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  X,
  Loader2,
  Video,
  Images,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   BLOCK DEFINITIONS
========================================================= */

const BLOCK_DEFS = [
  {
    type: "heading",
    label: "Heading",
    icon: Heading1,
    group: "Structural",
  },
  {
    type: "subheading",
    label: "Subheading",
    icon: Heading2,
    group: "Structural",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: Pilcrow,
    group: "Structural",
  },
  {
    type: "bulletList",
    label: "Bulleted List",
    icon: ListIcon,
    group: "Structural",
  },
  {
    type: "numberList",
    label: "Numbered List",
    icon: ListOrdered,
    group: "Structural",
  },
  {
    type: "divider",
    label: "Divider",
    icon: Minus,
    group: "Structural",
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    group: "Media & Tech",
  },
  {
    type: "imageCarousel",
    label: "Image Carousel",
    icon: Images,
    group: "Media & Tech",
  },
  {
    type: "video",
    label: "Video",
    icon: Video,
    group: "Media & Tech",
  },
  {
    type: "link",
    label: "Link",
    icon: Link2,
    group: "Media & Tech",
  },
  {
    type: "code",
    label: "Code Block",
    icon: Code2,
    group: "Media & Tech",
  },
  {
    type: "callout",
    label: "Callout",
    icon: Info,
    group: "Media & Tech",
  },
  {
    type: "question",
    label: "Question",
    icon: HelpCircle,
    group: "Interactive",
  },
];

const GROUPS = [
  "Structural",
  "Media & Tech",
  "Interactive",
];

/* =========================================================
   EMPTY BLOCK
========================================================= */

function emptyBlock(type) {
  const id = `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

  switch (type) {
    case "heading":
    case "subheading":
    case "paragraph":
      return {
        id,
        type,
        text: "",
      };

    case "bulletList":
    case "numberList":
      return {
        id,
        type,
        items: [""],
      };

    case "image":
      return {
        id,
        type,
        url: "",
        alt: "",
        caption: "",
      };

    case "imageCarousel":
      return {
        id,
        type,
        images: [
          {
            url: "",
            alt: "",
            caption: "",
          },
        ],
      };

    case "video":
      return {
        id,
        type,
        url: "",
        title: "",
        description: "",
      };

    case "link":
      return {
        id,
        type,
        label: "",
        url: "",
      };

    case "code":
      return {
        id,
        type,
        language: "javascript",
        code: "",
      };

    case "callout":
      return {
        id,
        type,
        tone: "info",
        text: "",
      };

    case "question":
      return {
        id,
        type,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      };

    case "divider":
      return {
        id,
        type,
      };

    default:
      return {
        id,
        type,
      };
  }
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TheoryBuilderPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [isLoadingRefs, setIsLoadingRefs] = useState(true);

  const [activeSubject, setActiveSubject] = useState("");

  const chaptersForSubject = useMemo(
    () =>
      chapters.filter(
        (c) => String(c.subjectId) === String(activeSubject)
      ),
    [chapters, activeSubject]
  );

  const [activeChapter, setActiveChapter] = useState("");

  const topicsForChapter = useMemo(
    () =>
      topics
        .filter(
          (t) =>
            String(t.chapterId) === String(activeChapter)
        )
        .sort(
          (a, b) =>
            Number(a.order || 0) -
            Number(b.order || 0)
        ),
    [topics, activeChapter]
  );

  const [mainTopicId, setMainTopicId] = useState("");

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [theoryId, setTheoryId] = useState(null);

  /* =========================================================
     LOAD SUBJECTS / CHAPTERS / TOPICS
  ========================================================= */

  useEffect(() => {
    async function loadRefs() {
      setIsLoadingRefs(true);

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
          const subjectsData =
            await subjectsRes.json();

          setSubjects(subjectsData);

          setActiveSubject(
            (prev) =>
              prev ||
              subjectsData[0]?._id ||
              ""
          );
        }

        if (chaptersRes.ok) {
          setChapters(
            await chaptersRes.json()
          );
        }

        if (topicsRes.ok) {
          setTopics(
            await topicsRes.json()
          );
        }
      } catch (err) {
        console.error(
          "Failed to load references:",
          err
        );
      } finally {
        setIsLoadingRefs(false);
      }
    }

    loadRefs();
  }, []);

  /* =========================================================
     AUTO SELECT CHAPTER
  ========================================================= */

  useEffect(() => {
    if (chaptersForSubject.length === 0) {
      setActiveChapter("");
      return;
    }

    if (
      !chaptersForSubject.some(
        (c) =>
          String(c._id) ===
          String(activeChapter)
      )
    ) {
      setActiveChapter(
        chaptersForSubject[0]._id
      );
    }
  }, [
    chaptersForSubject,
    activeChapter,
  ]);

  /* =========================================================
     AUTO SELECT TOPIC
  ========================================================= */

  useEffect(() => {
    if (topicsForChapter.length === 0) {
      setMainTopicId("");
      return;
    }

    if (
      !topicsForChapter.some(
        (t) =>
          String(t._id) ===
          String(mainTopicId)
      )
    ) {
      setMainTopicId(
        topicsForChapter[0]._id
      );
    }
  }, [
    topicsForChapter,
    mainTopicId,
  ]);

  /* =========================================================
     BLOCK FUNCTIONS
  ========================================================= */

  const addBlock = useCallback((type) => {
    setBlocks((prev) => [
      ...prev,
      emptyBlock(type),
    ]);
  }, []);

  const updateBlock = useCallback(
    (id, patch) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === id
            ? {
                ...block,
                ...patch,
              }
            : block
        )
      );
    },
    []
  );

  const removeBlock = useCallback(
    (id) => {
      setBlocks((prev) =>
        prev.filter(
          (block) => block.id !== id
        )
      );
    },
    []
  );

  const moveBlock = useCallback(
    (id, direction) => {
      setBlocks((prev) => {
        const index = prev.findIndex(
          (b) => b.id === id
        );

        const newIndex =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          index < 0 ||
          newIndex < 0 ||
          newIndex >= prev.length
        ) {
          return prev;
        }

        const next = [...prev];

        [
          next[index],
          next[newIndex],
        ] = [
          next[newIndex],
          next[index],
        ];

        return next;
      });
    },
    []
  );

  /* =========================================================
     DRAG
  ========================================================= */

  const [dragId, setDragId] =
    useState(null);

  const onDrop = (targetId) => {
    if (
      !dragId ||
      dragId === targetId
    ) {
      return;
    }

    setBlocks((prev) => {
      const from = prev.findIndex(
        (b) => b.id === dragId
      );

      const to = prev.findIndex(
        (b) => b.id === targetId
      );

      if (
        from < 0 ||
        to < 0
      ) {
        return prev;
      }

      const next = [...prev];

      const [moved] =
        next.splice(from, 1);

      next.splice(to, 0, moved);

      return next;
    });

    setDragId(null);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSave(publish) {
    if (!title.trim()) {
      setStatus(
        "Add a title first"
      );

      setTimeout(
        () => setStatus(""),
        2000
      );

      return;
    }

    if (!mainTopicId) {
      setStatus(
        "Pick a subtopic first"
      );

      setTimeout(
        () => setStatus(""),
        2000
      );

      return;
    }

    setSaving(true);

    const payload = {
      mainTopicId,
      title: title.trim(),
      status: publish
        ? "published"
        : "draft",
      blocks,
    };

    try {
      let res;

      if (theoryId) {
        res = await fetch(
          "/api/theories",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: theoryId,
              ...payload,
            }),
          }
        );
      } else {
        res = await fetch(
          "/api/theories",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "SAVE THEORY ERROR:",
          data
        );

        setStatus(
          data.message ||
            "Save failed"
        );

        return;
      }

      setTheoryId(data._id);

      setStatus(
        publish
          ? "Published"
          : "Draft saved"
      );
    } catch (err) {
      console.error(
        "Error saving theory:",
        err
      );

      setStatus("Save failed");
    } finally {
      setSaving(false);

      setTimeout(
        () => setStatus(""),
        2000
      );
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">

      {/* HEADER */}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0b0e14]/95 px-6 py-3 backdrop-blur">

        <div className="flex items-center gap-2 text-sm text-slate-400">

          <span className="font-semibold text-slate-100">
            Theory Builder
          </span>

          <span className="text-slate-600">
            /
          </span>

          <span>
            Content
          </span>

          <span className="text-slate-600">
            /
          </span>

          <span className="text-violet-300">
            {theoryId
              ? "Editing"
              : "New article"}
          </span>

        </div>

        <div className="flex items-center gap-3">

          {status && (
            <span className="text-xs font-medium text-emerald-400">
              {status}
            </span>
          )}

          <button
            onClick={() =>
              handleSave(false)
            }
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            Save draft
          </button>

          <button
            onClick={() =>
              handleSave(true)
            }
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            Publish
          </button>

        </div>

      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">

        {/* =====================================================
            TOOLBAR
        ===================================================== */}

        <aside className="sticky top-[64px] h-[calc(100vh-88px)] w-60 shrink-0 overflow-y-auto pr-2">

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Elements — click to add
          </p>

          {GROUPS.map(
            (group) => (
              <div
                key={group}
                className="mb-5"
              >

                <p className="mb-2 text-[11px] text-slate-600">
                  {group}
                </p>

                <div className="space-y-1">

                  {BLOCK_DEFS
                    .filter(
                      (b) =>
                        b.group ===
                        group
                    )
                    .map((block) => {

                      const Icon =
                        block.icon;

                      return (
                        <button
                          key={
                            block.type
                          }
                          onClick={() =>
                            addBlock(
                              block.type
                            )
                          }
                          className="flex w-full items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left text-sm text-slate-300 hover:border-white/10 hover:bg-white/5"
                        >

                          <Icon
                            size={16}
                            className="text-violet-400"
                          />

                          {block.label}

                        </button>
                      );
                    })}

                </div>

              </div>
            )
          )}

        </aside>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="min-w-0 flex-1 space-y-4">

          {/* ARTICLE SETTINGS */}

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">

            <label className="mb-1.5 block text-xs text-slate-500">
              Article title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Understanding Java"
              className="mb-4 w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-lg font-semibold text-slate-100 outline-none focus:border-violet-500"
            />

            <div className="grid gap-3 sm:grid-cols-3">

              {/* SUBJECT */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Subject
                </label>

                <select
                  value={
                    activeSubject
                  }
                  onChange={(e) =>
                    setActiveSubject(
                      e.target.value
                    )
                  }
                  disabled={
                    subjects.length ===
                    0
                  }
                  className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
                >

                  {subjects.length ===
                    0 && (
                    <option value="">
                      No subjects
                    </option>
                  )}

                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject._id
                        }
                        value={
                          subject._id
                        }
                      >
                        {subject.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CHAPTER */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Main Topic
                </label>

                <select
                  value={
                    activeChapter
                  }
                  onChange={(e) =>
                    setActiveChapter(
                      e.target.value
                    )
                  }
                  disabled={
                    chaptersForSubject.length ===
                    0
                  }
                  className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
                >

                  {chaptersForSubject.length ===
                    0 && (
                    <option value="">
                      No main topics
                    </option>
                  )}

                  {chaptersForSubject.map(
                    (chapter) => (
                      <option
                        key={
                          chapter._id
                        }
                        value={
                          chapter._id
                        }
                      >
                        {
                          chapter.title
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SUBTOPIC */}

              <div>

                <label className="mb-1.5 block text-xs text-slate-500">
                  Subtopic
                </label>

                <select
                  value={
                    mainTopicId
                  }
                  onChange={(e) =>
                    setMainTopicId(
                      e.target.value
                    )
                  }
                  disabled={
                    topicsForChapter.length ===
                    0
                  }
                  className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
                >

                  {topicsForChapter.length ===
                    0 && (
                    <option value="">
                      No subtopics
                    </option>
                  )}

                  {topicsForChapter.map(
                    (topic) => (
                      <option
                        key={
                          topic._id
                        }
                        value={
                          topic._id
                        }
                      >
                        {
                          topic.title
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>

          {/* EMPTY */}

          {blocks.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">
              No content yet — click an element on the left to add it here.
            </div>
          )}

          {/* BLOCKS */}

          {blocks.map(
            (block, index) => (
              <BlockCard
                key={block.id}
                index={index}
                block={block}
                isFirst={
                  index === 0
                }
                isLast={
                  index ===
                  blocks.length - 1
                }
                onChange={(patch) =>
                  updateBlock(
                    block.id,
                    patch
                  )
                }
                onRemove={() =>
                  removeBlock(
                    block.id
                  )
                }
                onMove={(dir) =>
                  moveBlock(
                    block.id,
                    dir
                  )
                }
                onDragStart={() =>
                  setDragId(
                    block.id
                  )
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={() =>
                  onDrop(
                    block.id
                  )
                }
              />
            )
          )}

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   BLOCK CARD
========================================================= */

function BlockCard({
  block,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const def =
    BLOCK_DEFS.find(
      (item) =>
        item.type === block.type
    );

  return (
    <div
      draggable
      onDragStart={
        onDragStart
      }
      onDragOver={
        onDragOver
      }
      onDrop={onDrop}
      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
    >

      <div className="mb-3 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="cursor-grab text-slate-600">
            ⠿
          </span>

          <span className="text-xs text-slate-600">
            #{index + 1}
          </span>

          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-violet-300">
            {def?.label ||
              block.type}
          </span>

        </div>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">

          <IconBtn
            onClick={() =>
              onMove("up")
            }
            disabled={isFirst}
            title="Move up"
          >
            <ArrowUp size={14} />
          </IconBtn>

          <IconBtn
            onClick={() =>
              onMove("down")
            }
            disabled={isLast}
            title="Move down"
          >
            <ArrowDown size={14} />
          </IconBtn>

          <IconBtn
            onClick={onRemove}
            title="Delete"
            danger
          >
            <Trash2 size={14} />
          </IconBtn>

        </div>

      </div>

      <BlockEditor
        block={block}
        onChange={onChange}
      />

    </div>
  );
}

/* =========================================================
   ICON BUTTON
========================================================= */

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 disabled:opacity-30 ${
        danger
          ? "hover:border-red-500/40 hover:text-red-400"
          : "hover:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   BLOCK EDITOR
========================================================= */

function BlockEditor({
  block,
  onChange,
}) {
  switch (block.type) {

    /* =====================================================
       HEADING
    ===================================================== */

    case "heading":
      return (
        <input
          value={block.text}
          onChange={(e) =>
            onChange({
              text: e.target.value,
            })
          }
          placeholder="Section heading"
          className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-2xl font-bold text-slate-100 outline-none focus:border-violet-500"
        />
      );

    /* =====================================================
       SUBHEADING
    ===================================================== */

    case "subheading":
      return (
        <input
          value={block.text}
          onChange={(e) =>
            onChange({
              text: e.target.value,
            })
          }
          placeholder="Subheading"
          className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-lg font-semibold text-slate-100 outline-none focus:border-violet-500"
        />
      );

    /* =====================================================
       PARAGRAPH
    ===================================================== */

    case "paragraph":
      return (
        <textarea
          value={block.text}
          onChange={(e) =>
            onChange({
              text: e.target.value,
            })
          }
          placeholder="Write the explanation here..."
          rows={4}
          className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 leading-relaxed text-slate-200 outline-none focus:border-violet-500"
        />
      );

    /* =====================================================
       LIST
    ===================================================== */

    case "bulletList":
    case "numberList":
      return (
        <ListEditor
          block={block}
          onChange={onChange}
        />
      );

    /* =====================================================
       IMAGE
    ===================================================== */

    case "image":
      return (
        <div className="space-y-2">

          <input
            value={block.url}
            onChange={(e) =>
              onChange({
                url: e.target.value,
              })
            }
            placeholder="Image URL"
            className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

          <input
            value={block.alt}
            onChange={(e) =>
              onChange({
                alt: e.target.value,
              })
            }
            placeholder="Alt text"
            className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

          <input
            value={block.caption}
            onChange={(e) =>
              onChange({
                caption:
                  e.target.value,
              })
            }
            placeholder="Caption"
            className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

          {block.url && (
            <img
              src={block.url}
              alt={block.alt}
              className="mt-2 max-h-72 rounded-lg border border-white/10 object-contain"
            />
          )}

        </div>
      );

    /* =====================================================
       IMAGE CAROUSEL
    ===================================================== */

    case "imageCarousel":
      return (
        <CarouselEditor
          block={block}
          onChange={onChange}
        />
      );

    /* =====================================================
       VIDEO
    ===================================================== */

    case "video":
      return (
        <VideoEditor
          block={block}
          onChange={onChange}
        />
      );

    /* =====================================================
       LINK
    ===================================================== */

    case "link":
      return (
        <div className="flex flex-col gap-2 sm:flex-row">

          <input
            value={block.label}
            onChange={(e) =>
              onChange({
                label:
                  e.target.value,
              })
            }
            placeholder="Link text"
            className="flex-1 rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

          <input
            value={block.url}
            onChange={(e) =>
              onChange({
                url: e.target.value,
              })
            }
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm text-violet-300 outline-none focus:border-violet-500"
          />

        </div>
      );

    /* =====================================================
       CODE
    ===================================================== */

    case "code":
      return (
        <div>

          <select
            value={
              block.language
            }
            onChange={(e) =>
              onChange({
                language:
                  e.target.value,
              })
            }
            className="mb-2 rounded-md border border-white/10 bg-[#0b0e14] px-2 py-1 text-xs text-slate-300 outline-none"
          >

            {[
              "javascript",
              "typescript",
              "python",
              "java",
              "c",
              "cpp",
              "html",
              "css",
              "bash",
              "json",
            ].map(
              (language) => (
                <option
                  key={language}
                  value={language}
                >
                  {language}
                </option>
              )
            )}

          </select>

          <textarea
            value={block.code}
            onChange={(e) =>
              onChange({
                code:
                  e.target.value,
              })
            }
            placeholder='System.out.println("Hello Java");'
            rows={7}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-sm text-emerald-300 outline-none focus:border-violet-500"
          />

        </div>
      );

    /* =====================================================
       CALLOUT
    ===================================================== */

    case "callout":
      return (
        <div className="space-y-2">

          <div className="flex gap-1.5">

            {[
              "info",
              "warning",
              "success",
            ].map((tone) => (
              <button
                key={tone}
                onClick={() =>
                  onChange({
                    tone,
                  })
                }
                className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                  block.tone ===
                  tone
                    ? "bg-violet-600 text-white"
                    : "border border-white/10 text-slate-400 hover:bg-white/5"
                }`}
              >
                {tone}
              </button>
            ))}

          </div>

          <textarea
            value={block.text}
            onChange={(e) =>
              onChange({
                text:
                  e.target.value,
              })
            }
            placeholder="Good to know..."
            rows={3}
            className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

        </div>
      );

    /* =====================================================
       QUESTION
    ===================================================== */

    case "question":
      return (
        <QuestionEditor
          block={block}
          onChange={onChange}
        />
      );

    /* =====================================================
       DIVIDER
    ===================================================== */

    case "divider":
      return (
        <hr className="border-white/15" />
      );

    default:
      return null;
  }
}

/* =========================================================
   VIDEO EDITOR
========================================================= */

function VideoEditor({
  block,
  onChange,
}) {
  const getEmbedUrl = (url) => {
    if (!url) return "";

    try {
      const parsed =
        new URL(url);

      /* YouTube */

      if (
        parsed.hostname.includes(
          "youtube.com"
        )
      ) {
        const videoId =
          parsed.searchParams.get(
            "v"
          );

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (
        parsed.hostname ===
          "youtu.be" ||
        parsed.hostname.includes(
          "youtube-nocookie.com"
        )
      ) {
        const id =
          parsed.pathname.replace(
            "/",
            ""
          );

        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      }

      /* Vimeo */

      if (
        parsed.hostname.includes(
          "vimeo.com"
        )
      ) {
        const id =
          parsed.pathname
            .split("/")
            .filter(Boolean)
            .pop();

        if (id) {
          return `https://player.vimeo.com/video/${id}`;
        }
      }

      /* Already embed URL */

      if (
        url.includes(
          "/embed/"
        )
      ) {
        return url;
      }

      return url;
    } catch {
      return "";
    }
  };

  const embedUrl =
    getEmbedUrl(block.url);

  return (
    <div className="space-y-3">

      <div>

        <label className="mb-1 block text-xs text-slate-500">
          Video URL
        </label>

        <input
          value={block.url}
          onChange={(e) =>
            onChange({
              url:
                e.target.value,
            })
          }
          placeholder="YouTube, Vimeo or embed URL"
          className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
        />

      </div>

      <input
        value={block.title}
        onChange={(e) =>
          onChange({
            title:
              e.target.value,
          })
        }
        placeholder="Video title"
        className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
      />

      <textarea
        value={
          block.description
        }
        onChange={(e) =>
          onChange({
            description:
              e.target.value,
          })
        }
        placeholder="Video description"
        rows={2}
        className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
      />

      {embedUrl && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black">

          <div className="aspect-video">

            <iframe
              src={embedUrl}
              title={
                block.title ||
                "Theory video"
              }
              className="h-full w-full"
              allowFullScreen
              loading="lazy"
            />

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   CAROUSEL EDITOR
========================================================= */

function CarouselEditor({
  block,
  onChange,
}) {
  const [preview, setPreview] =
    useState(0);

  const images =
    block.images || [];

  const updateImage = (
    index,
    patch
  ) => {
    const next = images.map(
      (image, i) =>
        i === index
          ? {
              ...image,
              ...patch,
            }
          : image
    );

    onChange({
      images: next,
    });
  };

  const addImage = () => {
    onChange({
      images: [
        ...images,
        {
          url: "",
          alt: "",
          caption: "",
        },
      ],
    });

    setPreview(
      images.length
    );
  };

  const removeImage = (
    index
  ) => {
    const next =
      images.filter(
        (_, i) =>
          i !== index
      );

    onChange({
      images:
        next.length
          ? next
          : [
              {
                url: "",
                alt: "",
                caption: "",
              },
            ],
    });

    setPreview(
      Math.max(
        0,
        Math.min(
          preview,
          next.length - 1
        )
      )
    );
  };

  const currentImage =
    images[preview];

  return (
    <div className="space-y-4">

      {/* IMAGE ITEMS */}

      {images.map(
        (image, index) => (
          <div
            key={index}
            className="rounded-lg border border-white/10 bg-black/20 p-3"
          >

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-medium text-slate-400">
                Image {index + 1}
              </span>

              <button
                onClick={() =>
                  removeImage(
                    index
                  )
                }
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>

            </div>

            <div className="space-y-2">

              <input
                value={
                  image.url
                }
                onChange={(e) =>
                  updateImage(
                    index,
                    {
                      url: e.target
                        .value,
                    }
                  )
                }
                placeholder="Image URL"
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
              />

              <input
                value={
                  image.alt
                }
                onChange={(e) =>
                  updateImage(
                    index,
                    {
                      alt: e.target
                        .value,
                    }
                  )
                }
                placeholder="Alt text"
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
              />

              <input
                value={
                  image.caption
                }
                onChange={(e) =>
                  updateImage(
                    index,
                    {
                      caption:
                        e.target
                          .value,
                    }
                  )
                }
                placeholder="Caption"
                className="w-full rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
              />

            </div>

          </div>
        )
      )}

      <button
        onClick={addImage}
        className="flex items-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 hover:bg-violet-500/20"
      >
        <Plus size={15} />
        Add image
      </button>

      {/* PREVIEW */}

      {currentImage?.url && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black">

          <div className="relative">

            <img
              src={
                currentImage.url
              }
              alt={
                currentImage.alt
              }
              className="max-h-[500px] w-full object-contain"
            />

            {images.length >
              1 && (
              <>
                <button
                  onClick={() =>
                    setPreview(
                      (preview -
                        1 +
                        images.length) %
                        images.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
                >
                  <ChevronLeft
                    size={20}
                  />
                </button>

                <button
                  onClick={() =>
                    setPreview(
                      (preview + 1) %
                        images.length
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
                >
                  <ChevronRight
                    size={20}
                  />
                </button>
              </>
            )}

          </div>

          {currentImage.caption && (
            <div className="border-t border-white/10 px-4 py-3 text-center text-sm text-slate-400">
              {
                currentImage.caption
              }
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-2 text-center text-xs text-slate-600">
            {preview + 1} /{" "}
            {images.length}
          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   QUESTION EDITOR
========================================================= */

function QuestionEditor({
  block,
  onChange,
}) {
  const updateOption = (
    index,
    value
  ) => {
    const options = [
      ...block.options,
    ];

    options[index] = value;

    onChange({
      options,
    });
  };

  const addOption = () => {
    onChange({
      options: [
        ...block.options,
        "",
      ],
    });
  };

  const removeOption = (
    index
  ) => {
    if (
      block.options.length <=
      2
    ) {
      return;
    }

    const options =
      block.options.filter(
        (_, i) =>
          i !== index
      );

    let correctAnswer =
      block.correctAnswer;

    if (
      correctAnswer >=
      options.length
    ) {
      correctAnswer =
        options.length - 1;
    }

    onChange({
      options,
      correctAnswer,
    });
  };

  return (
    <div className="space-y-4">

      {/* QUESTION */}

      <div>

        <label className="mb-1.5 block text-xs text-slate-500">
          Question
        </label>

        <textarea
          value={
            block.question
          }
          onChange={(e) =>
            onChange({
              question:
                e.target.value,
            })
          }
          placeholder="What is Java?"
          rows={3}
          className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500"
        />

      </div>

      {/* OPTIONS */}

      <div>

        <label className="mb-2 block text-xs text-slate-500">
          Answer options
        </label>

        <div className="space-y-2">

          {block.options.map(
            (option, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-md border p-2 ${
                  block.correctAnswer ===
                  index
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-white/10"
                }`}
              >

                <input
                  type="radio"
                  name={`correct-${block.id}`}
                  checked={
                    block.correctAnswer ===
                    index
                  }
                  onChange={() =>
                    onChange({
                      correctAnswer:
                        index,
                    })
                  }
                  className="accent-emerald-500"
                  title="Correct answer"
                />

                <input
                  value={
                    option
                  }
                  onChange={(e) =>
                    updateOption(
                      index,
                      e.target
                        .value
                    )
                  }
                  placeholder={`Option ${
                    index + 1
                  }`}
                  className="flex-1 bg-transparent px-2 py-1 text-sm text-slate-200 outline-none"
                />

                <button
                  onClick={() =>
                    removeOption(
                      index
                    )
                  }
                  disabled={
                    block.options
                      .length <=
                    2
                  }
                  className="rounded p-1 text-slate-600 hover:text-red-400 disabled:opacity-20"
                >
                  <X
                    size={14}
                  />
                </button>

              </div>
            )
          )}

        </div>

      </div>

      <button
        onClick={addOption}
        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
      >
        <Plus size={13} />
        Add option
      </button>

      {/* EXPLANATION */}

      <div>

        <label className="mb-1.5 block text-xs text-slate-500">
          Explanation shown after answering
        </label>

        <textarea
          value={
            block.explanation
          }
          onChange={(e) =>
            onChange({
              explanation:
                e.target.value,
            })
          }
          placeholder="Explain why this is the correct answer..."
          rows={3}
          className="w-full resize-y rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
        />

      </div>

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
        Select the radio button beside the correct answer.
      </div>

    </div>
  );
}

/* =========================================================
   LIST EDITOR
========================================================= */

function ListEditor({
  block,
  onChange,
}) {
  const setItem = (
    index,
    value
  ) => {
    const items = [
      ...block.items,
    ];

    items[index] = value;

    onChange({
      items,
    });
  };

  const addItem = () => {
    onChange({
      items: [
        ...block.items,
        "",
      ],
    });
  };

  const removeItem = (
    index
  ) => {
    const items =
      block.items.filter(
        (_, i) =>
          i !== index
      );

    onChange({
      items:
        items.length
          ? items
          : [""],
    });
  };

  return (
    <div className="space-y-1.5">

      {block.items.map(
        (item, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
          >

            <span className="w-4 shrink-0 text-right text-xs text-slate-500">
              {block.type ===
              "numberList"
                ? `${index + 1}.`
                : "•"}
            </span>

            <input
              value={item}
              onChange={(e) =>
                setItem(
                  index,
                  e.target.value
                )
              }
              placeholder="List item"
              className="flex-1 rounded-md border border-white/10 bg-[#0b0e14] px-3 py-1.5 text-sm outline-none focus:border-violet-500"
            />

            <button
              onClick={() =>
                removeItem(
                  index
                )
              }
              className="rounded p-1 text-slate-500 hover:text-red-400"
            >
              <X size={14} />
            </button>

          </div>
        )
      )}

      <button
        onClick={addItem}
        className="mt-1 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
      >
        <Plus size={13} />
        Add item
      </button>

    </div>
  );
}
