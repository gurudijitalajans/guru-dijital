/** Sayfa başlığı: tüm ekranlarda aynı yerde ve aynı biçimde */
export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 text-[26px] font-semibold leading-tight text-ink text-balance">{title}</h1>
        {description ? <p className="mt-1 mb-0 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
