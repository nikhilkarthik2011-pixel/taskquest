export default function ListTabs({ lists, activeListId, onSelect, onAddList, onDeleteList }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2" data-tour="list-tabs">
      <ListChip active={activeListId === null} onClick={() => onSelect(null)} emoji="📋" label="All" />
      {lists.map((list) => (
        <ListChip
          key={list.id}
          active={activeListId === list.id}
          onClick={() => onSelect(list.id)}
          emoji={list.emoji}
          label={list.name}
          onDelete={lists.length > 1 ? () => onDeleteList(list) : undefined}
        />
      ))}
      <button
        onClick={onAddList}
        aria-label="Create new list"
        className="flex items-center gap-1 rounded-full border-2 border-dashed border-slate-300 px-3 py-1.5 font-display text-xs font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-500 dark:border-white/20"
      >
        + List
      </button>
    </div>
  );
}

function ListChip({ active, onClick, emoji, label, onDelete }) {
  return (
    <span
      className={`group inline-flex items-center rounded-full border-2 font-display text-xs font-bold transition ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      <button onClick={onClick} className="py-1.5 pl-3 pr-2">
        {emoji} {label}
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${label} list`}
          className={`mr-2 rounded-full px-1 opacity-0 transition group-hover:opacity-100 ${
            active ? "hover:bg-white/20" : "hover:bg-urgent/10 hover:text-urgent"
          }`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
