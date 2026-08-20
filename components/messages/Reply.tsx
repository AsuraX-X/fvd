const Reply = ({ message, time }: { message: string; time: string }) => {
  return (
    <div className="flex items-start flex-col">
      <div className="bg-secondary rounded-2xl rounded-bl-md p-4 text-primary w-fit">
        <p className="text-sm">{message}</p>
      </div>
      <p className="text-[10px] text-body uppercase mt-0.5">{time}</p>
    </div>
  );
};

export default Reply;
