const ApplicationMix = ({
  approved,
  pending,
  rejected,
}: {
  approved: number;
  pending: number;
  rejected: number;
}) => {
  const calcPerc = (stat: number) => {
    return Math.round((stat / (approved + pending + rejected)) * 100);
  };

  return (
    <div className="p-4 bg-primary-light text-sm rounded-2xl">
      <h2 className="font-body! font-bold">Application Mix</h2>
      <div className="w-full h-2 bg-secondary flex rounded-full overflow-hidden my-2">
        <div className="h-full bg-[#04ae79]" style={{ flex: approved }} />
        <div className="h-full bg-body/90" style={{ flex: pending }} />
        <div className="h-full bg-[#b84b4e]" style={{ flex: rejected }} />
      </div>
      <div>
        <ul>
          <li className="flex items-center py-1 justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-[#04ae79] rounded-full" />
              <p>Approved</p>
            </div>
            <div className=" flex gap-9">
              <p>{approved}</p>
              <p className="text-body/80 min-w-9">{calcPerc(approved)}%</p>
            </div>
          </li>
          <li className="flex items-center py-1 justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-body/90 rounded-full" /> <p>Pending</p>
            </div>
            <div className=" flex gap-9">
              <p>{pending}</p>
              <p className="text-body/80 min-w-9">{calcPerc(pending)}%</p>
            </div>
          </li>
          <li className="flex items-center py-1 justify-between">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-[#b84b4e] rounded-full" />
              <p>Rejected</p>
            </div>
            <div className=" flex gap-9">
              <p>{rejected}</p>
              <p className="text-body/80 min-w-9">{calcPerc(rejected)}%</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApplicationMix;
