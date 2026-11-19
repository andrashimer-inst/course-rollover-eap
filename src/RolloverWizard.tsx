import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CircleCheckInstUIIcon,
  CircleDashedInstUIIcon,
  CircleDotInstUIIcon,
  CloseButton,
  Heading,
  Modal,
  ProgressBar,
  ScreenReaderContent,
  Text,
} from "@instructure/ui/v11_7";
import DesktopWrapper from "./DesktopWrapper";
import ContentStep from "./ContentStep";
import { nothingPicked, withPulledIn } from "./contentHelpers";
import type { CopyMode, Picked, Scope } from "./contentHelpers";
import ReadinessLoading from "./ReadinessLoading";
import SelectCourseStep from "./SelectCourseStep";
import FixDatesStep from "./FixDatesStep";
import ReviewAndCopyStep from "./ReviewAndCopyStep";
import { buildHistory } from "./copyHistory";
import { INITIAL_OPENING, buildTodo, checkOf, dimensionsOf, failedTodo, openingLabel, readiness } from "./reviewCopyData";
import type { Opening } from "./reviewCopyData";
import { DATE_ITEMS, INITIAL_DATES, dateCounts } from "./fixDatesData";
import type { Included } from "./fixDatesData";
import type { FixDatesState } from "./fixDatesData";
import LearningObjectReview from "./LearningObjectReview";
import { buildRows, choiceLabel, choiceOf, hiddenModules, itemIdOf } from "./reviewData";
import StatusPill from "./StatusPill";
import { CONTENT_TYPES } from "./courseContentData";
import type { Choice, DupeChoice } from "./reviewData";
import type { CourseNav } from "./GlobalNav";
import { useAppThemeKey, useSurfaceTokens } from "./appTheme";
import TodoTray, { TODO_DESCRIPTION, TodoList, todoTitle } from "./TodoTray";
import {
  AREA_TO_TYPE,
  COPIED_COUNTS,
  FAILED_ITEMS,
} from "./rolloverData";
import type { CopySummary, EducatorComment } from "./rolloverData";

// The copy wizard. It opens when someone starts a copy, so the review happens before the copy
// (discovery priority 1), not after it. Each step has a name that says what it covers:
//   Learning object review  each item checked against the readiness criteria and the team's comments, with a choice per item
//   Set dates        place the dates in the new term, with a preview and warnings (priority 7)
//   Review and copy  readiness check, final preview and a to-do list. The copy starts here
//   Summary          what was copied and what wasn't (priority 2)
// Sample data only.

type StepId = "select" | "content" | "review" | "dates" | "copy";
const STEP_INFO: Record<StepId, { name: string; hint: string; lead: string }> =
  {
    select: {
      name: "Select course",
      hint: "Choose the source",
      lead: "Choose the course you want to copy content from. You can only pick one.",
    },
    content: {
      name: "Select content",
      hint: "Whole course or selected items",
      lead: "Choose whether to copy the whole course or only some learning objects.",
    },
    review: {
      name: "Learning object review",
      hint: "Check each item",
      lead: "These are the problems the check found in your course. For each one, include the item in the copy, include it and add it to your to-do list to fix later, or leave it out.",
    },
    dates: {
      name: "Set dates",
      hint: "Place dates in the new term",
      lead: "Choose how the dates move to the new term, and fix any that land on a non-teaching day. Then check the new dates in the table.",
    },
    copy: {
      name: "Review and copy",
      hint: "Readiness check and final preview",
      lead: "Choose when students see the course, run the readiness check and look through the final course. When it looks right, start the copy, and your to-do list comes with the summary.",
    },
  };

// ---- Step indicator -----------------------------------------------------------------------------------------
function Stepper({
  steps,
  current,
  reached,
  onGo,
}: {
  steps: StepId[];
  current: number;
  reached: number;
  onGo: (i: number) => void;
}) {
  const t = useSurfaceTokens();
  // Figma Stepper (default layout, horizontal): one continuous rail on top. Done and current steps have a 4px blue stroke,
  // steps not reached a 2px grey one. The first and last step have rounded outer ends. Under the rail each step has a
  // 20px icon (done: check, current: dot, not reached: dashed circle), the title (bold for the current step) and a label.
  return (
    <ol
      aria-label="Copy steps"
      style={{
        display: "flex",
        gap: 0,
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {steps.map((id, i) => {
        const done = i < current;
        const isCurrent = i === current;
        const filled = done || isCurrent;
        const first = i === 0;
        const last = i === steps.length - 1;
        return (
          <li
            key={id}
            aria-current={isCurrent ? "step" : undefined}
            style={{ flex: 1, minWidth: 0 }}
          >
            <button
              type="button"
              className="wizard-step"
              // Only the steps already reached can be opened, so nothing is skipped.
              disabled={i > reached}
              onClick={() => onGo(i)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: t.space.sm,
                cursor: i > reached ? "default" : "pointer",
                color: t.textColor,
              }}
            >
              <span aria-hidden="true" style={{ display: "flex", alignItems: "center", height: "0.25rem" }}>
                <span
                  style={{
                    flex: 1,
                    height: filled ? "0.25rem" : "0.125rem",
                    background: filled ? t.linkColor : t.strokeBase,
                    borderStartStartRadius: first ? "0.125rem" : 0,
                    borderEndStartRadius: first ? "0.125rem" : 0,
                    borderStartEndRadius: last ? "0.125rem" : 0,
                    borderEndEndRadius: last ? "0.125rem" : 0,
                  }}
                />
              </span>
              <span style={{ display: "flex", gap: t.space.sm, alignItems: "flex-start", paddingInlineEnd: t.space.lg }}>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    paddingBlockStart: "0.125rem",
                    fontSize: "1.25rem",
                    color: t.textColor,
                  }}
                >
                  {done ? <CircleCheckInstUIIcon /> : isCurrent ? <CircleDotInstUIIcon /> : <CircleDashedInstUIIcon />}
                </span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <Text weight={isCurrent ? "bold" : "normal"}>
                    {STEP_INFO[id].name}
                  </Text>
                  <Text size="small" color="secondary">
                    {STEP_INFO[id].hint}
                  </Text>
                  <ScreenReaderContent>
                    {done ? "Done" : isCurrent ? "Current step" : ""}
                  </ScreenReaderContent>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// What "Save and continue later" keeps, so the copy can be picked up again on the same step.
export type WizardDraft = {
  course: string;
  scope: Scope | null;
  picked: Picked;
  mode: CopyMode;
  step: number;
  reached: number;
  choices: Record<string, Choice>;
  dupes: Record<string, DupeChoice>;
  dates: FixDatesState;
  readyRan: boolean;
  opening: Opening;
};

// ---- The wizard ----------------------------------------------------------------------------------------------
export default function RolloverWizard({
  adjustDates,
  courseNav,
  onNavigate,
  onCancel,
  onDone,
  draft,
  onSaveLater,
}: {
  // The comments for the chosen course. The course is picked in the first step.
  commentsFor: (course: string) => EducatorComment[];
  courseNav: CourseNav;
  onNavigate?: (label: string) => void;
  adjustDates: boolean;
  onCancel: () => void;
  onDone: (summary: CopySummary) => void;
  // A saved copy to carry on with, and what to do when the educator saves one.
  draft?: WizardDraft | null;
  onSaveLater: (draft: WizardDraft) => void;
}) {
  const t = useSurfaceTokens();
  // Leaving the wizard (Cancel or the breadcrumb) asks first, so a copy in progress is not dropped by accident.
  const [confirmLeave, setConfirmLeave] = useState(false);
  const steps = useMemo<StepId[]>(
    () =>
      adjustDates
        ? ["select", "content", "review", "dates", "copy"]
        : ["select", "content", "review", "copy"],
    [adjustDates],
  );
  // The steps start empty. Each step needs a choice before the next one opens.
  const [course, setCourse] = useState(draft?.course ?? "");
  // Team notes are not part of this version, so the review and the to-do list start without them.
  const comments = useMemo<EducatorComment[]>(() => [], []);
  // The whole course is selected when the step opens. A choice made later is kept.
  const [scope, setScope] = useState<Scope | null>(draft?.scope ?? "whole");
  const [picked, setPicked] = useState<Picked>(draft?.picked ?? {});
  const [mode, setMode] = useState<CopyMode>(draft?.mode ?? "merge");
  const [loadingContent, setLoadingContent] = useState(false);
  const [step, setStep] = useState(draft?.step ?? 0);
  const [reached, setReached] = useState(draft?.reached ?? 0);
  const [copying, setCopying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [when] = useState(() =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  );
  // What the educator chose for each learning object, and which of two similar modules to keep.
  const [choices, setChoices] = useState<Record<string, Choice>>(draft?.choices ?? {});
  const [dupes, setDupes] = useState<Record<string, DupeChoice>>(draft?.dupes ?? {});
  const rows = useMemo(
    () => buildRows(scope ?? "whole", picked, comments),
    [scope, picked, comments],
  );
  // The learning objects that are copied: the ones chosen in step 2, without the ones left out in step 3. The dates step lists only these.
  const included = useMemo<Included>(() => {
    const eff = withPulledIn(picked);
    const left = new Set(rows.filter((r) => choiceOf(r, choices) === "leave").map(itemIdOf));
    return (id) => (scope !== "part" || !!eff[id]) && !left.has(id);
  }, [scope, picked, rows, choices]);
  // Choosing another course starts the review over.
  const [reviewedFor, setReviewedFor] = useState(draft?.course ?? "");
  if (reviewedFor !== course) {
    setReviewedFor(course);
    setChoices({});
    setDupes({});
  }
  const [dates, setDates] = useState<FixDatesState>(draft?.dates ?? INITIAL_DATES);
  // Whether the readiness check has run on the Review and copy step.
  const [readyRan, setReadyRan] = useState(draft?.readyRan ?? false);
  const [opening, setOpening] = useState<Opening>(draft?.opening ?? INITIAL_OPENING);
  // Whether the user asked for help in step 3. The summary only shows that card when they did.
  const [helpSent, setHelpSent] = useState(false);
  const summary = useMemo<CopySummary>(() => {
    const AREA: Record<string, string> = {
      assignments: "Assignments",
      quizzes: "Quizzes",
      pages: "Pages",
      discussions: "Discussions",
      files: "Files",
    };
    const asItem = (r: (typeof rows)[number]) => ({
      item: r.title,
      area: AREA[r.typeId] ?? r.kindLabel,
      text: r.findings[0]?.rule.title ?? r.note?.text ?? "Check it after the copy.",
    });
    const left = rows
      .filter((r) => !r.extra && !r.courseWide && choiceOf(r, choices) === "leave")
      .map(asItem);
    const fixLater = rows
      .filter((r) => choiceOf(r, choices) === "fix")
      .map(asItem);
    const { shifted, edited } = dateCounts(dates, included);
    // The broken links are on the to-do list when the educator chose so in the review.
    const linksFixed = false;
    const types = new Set(fixLater.map((c) => AREA_TO_TYPE[c.area]));
    const came = COPIED_COUNTS.map((c) => ({
      type: c.type,
      count:
        c.count -
        left.filter((l) => AREA_TO_TYPE[l.area] === c.type).length -
        FAILED_ITEMS.filter((f) => f.type === c.type).length,
      changed:
        types.has(c.type) ||
        (adjustDates &&
          ["Assignments", "Quizzes", "Discussions", "Calendar events"].includes(
            c.type,
          )) ||
        (linksFixed && c.type === "Pages"),
    }));
    const opens =
      opening.mode === "open"
        ? `The course publishes on ${openingLabel(opening)}.`
        : "The course stays unpublished until you publish it.";
    return {
      course,
      target: courseNav.name,
      when,
      opens,
      stats: {
        // The learning objects that are copied. The course-wide fixes are not items of their own.
        created: rows.filter((r) => !r.courseWide && !r.extra && choiceOf(r, choices) !== "leave").length,
        relinked: 3,
        // Only counts when the user sent a help request in step 3.
        sentToAdmin: helpSent ? 1 : 0,
        datesPlaced: dates.mode === "clear" || dates.mode === "keep" || !adjustDates ? 0 : DATE_ITEMS.filter((i) => included(i.itemId)).length,
      },
      history: buildHistory({ rows, choices, opens: opening.mode === "open" ? openingLabel(opening) : "you publish it" }),
      came,
      failed: FAILED_ITEMS.map(({ item, reason, fix }) => ({
        item,
        reason,
        fix,
      })),
      notCame: [
        ...left.map((c) => ({
          item: c.item,
          reason: "you chose to leave it out of the copy",
          kind: "left-out" as const,
        })),
        {
          item: "Student submissions and grades",
          reason: "Canvas never copies these.",
          kind: "canvas" as const,
        },
        {
          item: "Enrollments and groups",
          reason: "Add people to the new course.",
          kind: "canvas" as const,
        },
        {
          item: "Feature options",
          reason: "Turn them on again in Settings.",
          kind: "canvas" as const,
        },
      ],
      todo: [
        ...FAILED_ITEMS.map(failedTodo),
        // The list is gathered from the choices made in the steps before.
        ...buildTodo({ rows, choices, dates, comments, opening, included }),
      ],
      check: checkOf(rows, choices),
      datesShifted: adjustDates ? shifted : 0,
      datesEdited: adjustDates ? edited : 0,
    };
  }, [
    rows,
    choices,
    dates,
    comments,
    opening,
    included,
    adjustDates,
    courseNav.name,
    course,
    when,
  ]);

  // The copy takes a moment. The progress bar moves, then the summary shows.
  useEffect(() => {
    if (!copying) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return p;
        return Math.min(100, p + 12);
      });
    }, 180);
    return () => clearInterval(timer);
  }, [copying]);
  useEffect(() => {
    if (!copying || progress < 100) return;
    const done = setTimeout(() => {
      // The summary is a page of its own: the parent shows it when the copy is done.
      setCopying(false);
      onDone(summary);
    }, 400);
    return () => clearTimeout(done);
  }, [copying, progress, onDone, summary]);

  // Undo: every change to the choices, and every move to another step, is remembered. Undo takes the last one back.
  const snap = useMemo<WizardDraft>(
    () => ({ course, scope, picked, mode, step, reached, choices, dupes, dates, readyRan, opening }),
    [course, scope, picked, mode, step, reached, choices, dupes, dates, readyRan, opening],
  );
  const [history, setHistory] = useState<WizardDraft[]>([]);
  const lastSnap = useRef(snap);
  const restoring = useRef(false);
  useEffect(() => {
    if (lastSnap.current === snap) return;
    const before = lastSnap.current;
    lastSnap.current = snap;
    if (restoring.current) restoring.current = false;
    else setHistory((h) => [...h.slice(-99), before]);
  }, [snap]);
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    restoring.current = true;
    setHistory((h) => h.slice(0, -1));
    // reviewedFor moves with the course, so going back to another course keeps its choices.
    setReviewedFor(prev.course);
    setCourse(prev.course);
    setScope(prev.scope);
    setPicked(prev.picked);
    setMode(prev.mode);
    setStep(prev.step);
    setReached(prev.reached);
    setChoices(prev.choices);
    setDupes(prev.dupes);
    setDates(prev.dates);
    setReadyRan(prev.readyRan);
    setOpening(prev.opening);
  };

  // The to-do list so far. It follows the choices, so the review step can show it while the choices are made.
  // The dates entries start from the dates step, because the dates are only set there.
  const datesReached = step >= steps.indexOf("dates");
  const todoNow = useMemo(
    () => buildTodo({ rows, choices, dates, comments, opening, included, withDates: datesReached }),
    [rows, choices, dates, comments, opening, included, datesReached],
  );

  const [todoOpen, setTodoOpen] = useState(false);
  // Leaving the review with items that have no choice asks first: those items are copied as they are.
  const [confirmBring, setConfirmBring] = useState(false);
  // What the window says is fixed when it opens, so the text does not change while it closes.
  const [bringInfo, setBringInfo] = useState({ count: 0, none: false });
  const undecided = useMemo(() => rows.filter((r) => choiceOf(r, choices) === undefined), [rows, choices]);
  const toTopAfterClose = useRef(false);
  const bringAsIs = () => {
    toTopAfterClose.current = true;
    const next = { ...choices };
    for (const r of undecided) next[r.id] = "bring";
    setChoices(next);
    setConfirmBring(false);
    go(step + 1);
  };
  const legacy = useAppThemeKey() === "legacy";

  const id = steps[step];
  // Nothing to lose before anything is chosen, so it only asks once the copy has been started.
  // Anything that leaves the wizard asks first: Cancel, the breadcrumb, the global nav and the course menu.
  // `then` is what the educator was trying to open. It runs after they confirm.
  const afterLeave = useRef<(() => void) | undefined>(undefined);
  const leave = (then?: unknown) => {
    afterLeave.current = typeof then === "function" ? (then as () => void) : undefined;
    if (course || step > 0) setConfirmLeave(true);
    else {
      onCancel();
      afterLeave.current?.();
    }
  };
  // Closing the browser tab or reloading also drops the copy, so the browser asks as well.
  const hasWork = course !== "" || step > 0;
  useEffect(() => {
    if (!hasWork) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasWork]);
  const closeConfirm = () => {
    afterLeave.current = undefined;
    setConfirmLeave(false);
  };
  // The copy runs from the last step.
  const atCopy = id === "copy";
  const go = (i: number) => {
    setStep(i);
    setReached((r) => Math.max(r, i));
  };
  // Each step is a page view, so a new step starts at the top.
  // A window that closes on the way (like "Include everything?") gives the old scroll position back after the step changed,
  // so it scrolls up again a moment later. The loading screen between two steps starts at the top too.
  useEffect(() => {
    window.scrollTo(0, 0);
    const later = [100, 300, 600, 1000].map((ms) => window.setTimeout(() => window.scrollTo(0, 0), ms));
    return () => later.forEach(window.clearTimeout);
  }, [step, loadingContent]);
  const finishLoading = useCallback(() => {
    setLoadingContent(false);
    setStep((st) => st + 1);
    setReached((r) => Math.max(r, step + 1));
  }, [step]);
  const startCopy = () => {
    setProgress(0);
    setCopying(true);
  };

  return (
    <DesktopWrapper
      pageTitle={course ? `Copy content from ${course}` : "Course copy wizard"}
      breadcrumb={["Courses", courseNav.name, "Import Content"]}
      // "Import Content" goes back to the page the wizard started from.
      onBreadcrumb={() => leave()}
      activeNav="Courses"
      course={{ ...courseNav, onSelect: (label) => leave(() => courseNav.onSelect?.(label)) }}
      onNavigate={(label) => leave(() => onNavigate?.(label))}
      onOpenCourse={() => leave()}
      // The page buttons sit in the wrapper's actions row, under the page title.
      actions={
        !loadingContent && !copying ? (
          <>
            <Button onClick={undo} interaction={history.length ? "enabled" : "disabled"}>
              Undo
            </Button>
            <Button
              onClick={() =>
                onSaveLater({ course, scope, picked, mode, step, reached, choices, dupes, dates, readyRan, opening })
              }
            >
              Save and continue later
            </Button>
          </>
        ) : undefined
      }
      // The to-do list opens beside the content (Light and Dark) and only on the review step.
      sidePanel={
        (id === "review" || id === "dates" || id === "copy") && !legacy
          ? { open: todoOpen, title: todoTitle(todoNow), description: TODO_DESCRIPTION, onClose: () => setTodoOpen(false), content: <TodoList todo={todoNow} /> }
          : undefined
      }
      fullWidth
    >
      {(id === "review" || id === "dates" || id === "copy") && legacy && <TodoTray open={todoOpen} todo={todoNow} onClose={() => setTodoOpen(false)} />}
      <div
        style={{ display: "flex", flexDirection: "column", gap: t.space.xl }}
      >
        <Stepper steps={steps} current={step} reached={reached} onGo={go} />
        {/* A short line on what this step is for, on the steps users were unsure about. */}
        {!loadingContent && !copying && (id === "review" || id === "dates" || id === "copy") && (
          <Text as="p" variant="descriptionPage" color="secondary" margin="0">{STEP_INFO[id].lead}</Text>
        )}
        {loadingContent ? (
          // The wait after step 2 is the course readiness check, the same as the check in steps 3 and 5.
          <div style={{ display: "flex", flexDirection: "column", gap: t.space.lg, padding: `${t.space.xl} 0` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: t.space.sm }}>
              <Text as="div" weight="bold" size="large">Course readiness check</Text>
              <Text as="div" color="secondary">The check goes through the readiness criteria of your account.</Text>
            </div>
            <ReadinessLoading
              areas={dimensionsOf(readiness(rows, choices)).map((g) => g.dimension)}
              onDone={finishLoading}
            />
          </div>
        ) : copying ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: t.space.lg,
              padding: `${t.space.xxl} 0`,
            }}
          >
            <Heading level="h3" variant="titleCardRegular">
              Copying content
            </Heading>
            <ProgressBar
              screenReaderLabel="Copying content"
              valueNow={progress}
              valueMax={100}
              renderValue={({ valueNow }) => `${valueNow}%`}
            />
            <Text color="secondary">
              Applying your choices from the review.
            </Text>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: t.space.xl,
            }}
          >
            {id === "select" && (
              <SelectCourseStep selected={course} onSelect={setCourse} />
            )}
            {id === "content" && (
              <ContentStep
                scope={scope}
                setScope={setScope}
                picked={picked}
                setPicked={setPicked}
                mode={mode}
                setMode={setMode}
                hidden={hiddenModules(dupes)}
              />
            )}
            {id === "review" && (
              <LearningObjectReview
                rows={rows}
                choices={choices}
                setChoices={setChoices}
                scope={scope ?? "whole"}
                mode={mode}
                picked={picked}
                dupes={dupes}
                todo={todoNow}
                onToggleTodo={() => setTodoOpen((o) => !o)}
                onHelpSent={() => setHelpSent(true)}
              />
            )}
            {id === "dates" && (
              <FixDatesStep
                included={included}
                preview={{
                  moduleIds: CONTENT_TYPES.find((c) => c.id === 'modules')!.items.filter((m) => scope === 'whole' || picked[m.id]).map((m) => m.id),
                  keepCurrent: scope === 'part' && mode === 'merge',
                  hidden: hiddenModules(dupes),
                  scope: scope ?? 'whole',
                  picked,
                }}
                courseName={course ?? ''} choiceNote={(itemId) => { const r = rows.find((x) => x.id === itemId); const c = r ? choiceOf(r, choices) : undefined; return r && c ? <StatusPill size="xs" color={c === 'fix' ? 'warning' : c === 'leave' ? 'neutral' : 'success'}>{choiceLabel(r, c)}</StatusPill> : null }} state={dates} setState={setDates} todoCount={todoNow.length} onToggleTodo={() => setTodoOpen((o) => !o)} />
            )}
            {id === "copy" && (
              <ReviewAndCopyStep
                included={included}
                rows={rows}
                choices={choices}
                scope={scope ?? "whole"}
                mode={mode}
                picked={picked}
                dupes={dupes}
                dates={dates}
                readyRan={readyRan}
                setReadyRan={setReadyRan}
                opening={opening}
                setOpening={setOpening}
                todoCount={todoNow.length}
                onToggleTodo={() => setTodoOpen((o) => !o)}
              />
            )}
          </div>
        )}
        <div
          style={{
            paddingTop: t.space.lg,
            borderTop: `${t.borderWidth} solid ${t.borderColor}`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: t.gapButtons,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={leave}
              interaction={copying || loadingContent ? "disabled" : "enabled"}
            >
              Cancel
            </Button>
            <div style={{ display: "flex", gap: t.gapButtons }}>
              <Button
                onClick={() => go(step - 1)}
                interaction={step === 0 || copying || loadingContent ? "disabled" : "enabled"}
              >
                Back
              </Button>
              {atCopy ? (
                <Button
                  color="primary"
                  onClick={startCopy}
                  interaction={copying ? "disabled" : "enabled"}
                >
                  Copy content
                </Button>
              ) : (
                <Button
                  color="primary"
                  onClick={() =>
                    id === "content"
                      ? setLoadingContent(true)
                      : id === "review" && undecided.length > 0
                        ? (setBringInfo({ count: undecided.length, none: Object.keys(choices).length === 0 }), setConfirmBring(true))
                        : go(step + 1)
                  }
                  interaction={
                    loadingContent ||
                    (id === "select" && !course) ||
                    (id === "content" && (scope === null || (scope === "part" && nothingPicked(picked))))
                      ? "disabled"
                      : "enabled"
                  }
                >
                  Next: {STEP_INFO[steps[step + 1]].name}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Closing the window gives the focus back to the button that opened it, which scrolls the page down to it. The next step starts at the top instead. */}
      <Modal open={confirmBring} onDismiss={() => setConfirmBring(false)} size="small" label="Include everything" shouldCloseOnDocumentClick={false} shouldReturnFocus={false} onExited={() => { if (toTopAfterClose.current) window.scrollTo(0, 0); toTopAfterClose.current = false; }}>
        <Modal.Header>
          <CloseButton placement="end" offset="small" onClick={() => setConfirmBring(false)} screenReaderLabel="Close" />
          <Heading level="h2">Include everything?</Heading>
        </Modal.Header>
        <Modal.Body>
          <Text as="p">
            {bringInfo.none
              ? `You haven't chosen anything in the review. If you continue, the ${bringInfo.count} items with no choice are included in the copy as they are, and nothing is left out.`
              : `${bringInfo.count} ${bringInfo.count === 1 ? "item has" : "items have"} no choice yet. If you continue, ${bringInfo.count === 1 ? "it is" : "they are"} included in the copy as ${bringInfo.count === 1 ? "it is" : "they are"}. The choices you made stay.`}
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button onClick={() => setConfirmBring(false)}>Back to the review</Button>
            <Button color="primary" onClick={bringAsIs}>Include and continue</Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal open={confirmLeave} onDismiss={closeConfirm} size="small" label="Abandon the copy" shouldCloseOnDocumentClick={false}>
        <Modal.Header>
          <CloseButton placement="end" offset="small" onClick={closeConfirm} screenReaderLabel="Close" />
          <Heading level="h2">Abandon the copy?</Heading>
        </Modal.Header>
        <Modal.Body>
          <Text as="p">
            You are about to leave the copy session. Nothing has been copied yet, and the choices you made are lost. To keep them, choose Save and continue later instead.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button onClick={closeConfirm}>Keep working</Button>
            <Button color="danger" onClick={() => { setConfirmLeave(false); onCancel(); afterLeave.current?.(); afterLeave.current = undefined; }}>
              Yes, abandon the copy
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </DesktopWrapper>
  );
}
