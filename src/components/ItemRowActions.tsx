interface ItemRowActionsLabels {
  moveUp: string
  moveDown: string
  edit: string
  delete: string
}

interface ItemRowActionsProps {
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
  labels: ItemRowActionsLabels
}

function IconChevronUp() {
  return (
    <svg
      className="icon-button-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg
      className="icon-button-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function IconPencil() {
  return (
    <svg
      className="icon-button-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 3a2.85 2.85 0 114 4L7 21H3v-4L17 3z" />
    </svg>
  )
}

export function IconPlus() {
  return (
    <svg
      className="icon-button-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg
      className="icon-button-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function ItemRowActions({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  labels,
}: ItemRowActionsProps) {
  return (
    <div className="row-actions">
      <button
        type="button"
        className="icon-action-button"
        aria-label={labels.moveUp}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        <IconChevronUp />
      </button>
      <button
        type="button"
        className="icon-action-button"
        aria-label={labels.moveDown}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <IconChevronDown />
      </button>
      <button
        type="button"
        className="icon-action-button"
        aria-label={labels.edit}
        onClick={onEdit}
      >
        <IconPencil />
      </button>
      <button
        type="button"
        className="icon-action-button"
        aria-label={labels.delete}
        onClick={onDelete}
      >
        <IconTrash />
      </button>
    </div>
  )
}

export function IconDeleteButton({
  ariaLabel,
  onClick,
}: {
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="icon-action-button"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <IconTrash />
    </button>
  )
}
