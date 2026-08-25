import { LucideIcon } from "lucide-react";

const DataCard = ({
  label,
  data,
  subtitle,
  Icon,
}: {
  label: string;
  data: number;
  subtitle?: string;
  Icon: LucideIcon;
}) => {
  return (
    <div className="bg-primary-light border border-primary group duration-500 hover:border-secondary/20 transition-colors overflow-hidden space-y-2 p-4 relative rounded-2xl w-full">
      <div className="absolute -top-4 -right-4 rounded-full bg-secondary/5 size-20" />
      <div className="  flex items-center justify-between">
        <p className="small-header text-[10px] mb-0">{label}</p>
        <div className="text-body/90 group-hover:text-secondary duration-500 transition-colors">
        <Icon size={14} /></div>
      </div>
      <p className="font-serif! italic text-5xl">{data}</p>
      <p className="text-body text-xs">{subtitle}</p>
    </div>
  );
};

export default DataCard;
