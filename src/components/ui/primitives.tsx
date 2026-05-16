export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info";
}) {
  const colors: Record<string, string> = {
    default: "bg-white/10 text-white/70",
    success: "bg-green-500/10 text-green-400",
    danger: "bg-red-500/10 text-red-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    info: "bg-blue-500/10 text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass p-6 ${className}`}>{children}</div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90",
    secondary: "bg-white/10 text-[var(--foreground)] hover:bg-white/20",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ghost: "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: {
  label?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--muted)]">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: {
  label?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--muted)]">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  children,
  className = "",
  ...props
}: {
  label?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--muted)]">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[var(--muted)] mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function TimelineEvent({
  event,
}: {
  event: {
    id: string;
    eventType: string;
    notes?: string | null;
    createdAt: string;
    user: { name?: string | null; username: string; role: string };
  };
}) {
  const eventColors: Record<string, string> = {
    SUBMITTED: "border-blue-500/30 bg-blue-500/5",
    STATUS_CHANGE: "border-yellow-500/30 bg-yellow-500/5",
    DUPLICATE_CLAIMED: "border-orange-500/30 bg-orange-500/5",
    DISPUTE_OPENED: "border-red-500/30 bg-red-500/5",
    DISPUTE_RESOLVED: "border-green-500/30 bg-green-500/5",
    PAYOUT_CREATED: "border-green-500/30 bg-green-500/5",
    PAYOUT_COMPLETED: "border-emerald-500/30 bg-emerald-500/5",
    COMMENT: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div className="flex gap-4 py-3">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {event.user.name || event.user.username}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {new Date(event.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-[var(--muted)] mb-1">
          {event.eventType.replace(/_/g, " ")}
        </span>
        {event.notes && (
          <p className="text-sm text-[var(--muted)] mt-1">{event.notes}</p>
        )}
      </div>
    </div>
  );
}
