import { content } from '@/content/content';

type Props = { compact?: boolean };

/**
 * OPEN TO ROLES with a 10px accent square.
 * The compact variant (mobile header) shows only the square, with the label for AT.
 */
export function StatusPanel({ compact = false }: Props) {
  const { openToRoles } = content.status;
  const label = openToRoles ? content.ui.openToRoles : content.ui.notOpenToRoles;

  if (compact) {
    return (
      <span className="status-compact inline-flex items-center" title={label}>
        <StatusSquare on={openToRoles} />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <div className="status-panel flex flex-col gap-3">
      <p className="status-roles box themed mono flex items-center gap-2.5 px-3 py-2 font-medium">
        <StatusSquare on={openToRoles} />
        <span>{label}</span>
      </p>
    </div>
  );
}

function StatusSquare({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="status-square inline-block shrink-0"
      style={{
        width: 10,
        height: 10,
        background: on ? 'var(--accent)' : 'transparent',
        border: on ? 'none' : '2px solid var(--line)',
      }}
    />
  );
}
