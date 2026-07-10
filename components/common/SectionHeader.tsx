interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function SectionHeader({ title, action, badge }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center w-full mt-2">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>
        {badge}
      </div>
      {action && <div className="text-xs shrink-0">{action}</div>}
    </div>
  );
}
