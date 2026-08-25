const ApplicationEntry = ({
  name,
  specialty,
  date,
  status,
}: {
  name: string;
  specialty: string;
  date: string;
  status: "pending" | "rejected" | "approved";
}) => {
  return (
    <div className="flex items-center py-3 justify-between">
      <div>
        <p>{name}</p>
        <p className="text-xs text-body">
          {specialty} · {date}
        </p>
      </div>
      <div
        className={`uppercase px-2 py-1 rounded-full text-xs ${status === "pending" ? "bg-secondary/10" : status == "approved" ? "bg-[#10231f] text-[#5ee9b5]" : "bg-[#2a1418] text-[#ffa2a2]"}`}
      >
        {status}
      </div>
    </div>
  );
};

export default ApplicationEntry;
