// Each step spotlights one real element on the page (matched by its
// data-tour attribute). The first step has no target and just shows a
// centered welcome message. If an element can't be found (e.g. the user
// opened the tour from a different page), OnboardingTour skips that step
// automatically rather than getting stuck.
export const TOUR_STEPS = [
  {
    title: "Welcome to TaskQuest!",
    body: "Here's a quick tour of how everything works. You can skip anytime, or come back to this later with the ? button in the header.",
  },
  {
    target: "add-task",
    title: "Add a task",
    body: "Tap this button anytime to add a new task — give it a priority, put it in a list, add a due date, or make it repeat every day.",
  },
  {
    target: "priority-filters",
    title: "Urgent, Important, or Someday",
    body: "Every task gets a priority. Urgent tasks earn the most points, Someday tasks the least. Tap a chip to filter your list, or All to see everything.",
  },
  {
    target: "list-tabs",
    title: "Organize with lists",
    body: "Group tasks into lists like Homework or Chores. Tap + List to make your own, or tap a list to jump to just those tasks.",
  },
  {
    target: "stats-level",
    title: "Earn XP and level up",
    body: "Finishing a task earns points based on its priority. Fill this bar to level up — higher levels unlock new avatars.",
  },
  {
    target: "stats-streak",
    title: "Build a streak",
    body: "Complete at least one task a day to grow your streak. Miss a day and it resets, so try to check in daily.",
  },
  {
    target: "avatar-button",
    title: "Pick your avatar",
    body: "Tap your avatar to open the picker. New avatars unlock automatically as you level up — purely for fun, no effect on points or streaks.",
  },
  {
    target: "nav-stats",
    title: "Your productivity dashboard",
    body: "See charts of your weekly XP, streak history, task categories, and your most productive hour of the day.",
  },
  {
    target: "nav-badges",
    title: "Achievements",
    body: "Earn badges for milestones — like finishing every task in a list, or reaching a 14-day streak.",
  },
  {
    target: "nav-dark",
    title: "Light or dark mode",
    body: "Switch the whole app between light and dark anytime.",
  },
  {
    target: "nav-help",
    title: "Come back anytime",
    body: "That's the tour! Tap this button whenever you want to see it again.",
  },
];