export const PRIORITIES = {
  urgent: {
    key: "urgent",
    label: "Urgent",
    emoji: "\u{1F525}",
    points: 15,
    dot: "bg-urgent",
    text: "text-urgent",
    chip: "bg-urgent/10 text-urgent border-urgent/30",
    ring: "focus:border-urgent",
  },
  important: {
    key: "important",
    label: "Important",
    emoji: "⭐",
    points: 10,
    dot: "bg-important",
    text: "text-important",
    chip: "bg-important/10 text-important border-important/30",
    ring: "focus:border-important",
  },
  someday: {
    key: "someday",
    label: "Someday",
    emoji: "\u{1F331}",
    points: 5,
    dot: "bg-someday",
    text: "text-someday",
    chip: "bg-someday/10 text-someday border-someday/30",
    ring: "focus:border-someday",
  },
};

export const PRIORITY_ORDER = ["urgent", "important", "someday"];
