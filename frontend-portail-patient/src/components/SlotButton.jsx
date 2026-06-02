export default function SlotButton({ slot, selected, onSelect }) {
  const label = slot.heure_debut?.slice(0, 5) || slot.heure_debut;

  return (
    <button
      type="button"
      className={`slot-btn${selected ? ' selected' : ''}`}
      onClick={() => onSelect(slot)}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
