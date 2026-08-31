import AvatarImage from "../common/AvatarImage";

const ExpertBrief = ({
  avatar,
  name,
  specialty,
}: {
  name: string;
  specialty: string | null;
  avatar: string | null;
}) => {
  const initial = name[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-2 border-b border-primary-light pb-6">
      <div className="size-16 bg-secondary/10 rounded-full overflow-hidden relative flex items-center justify-center">
        {avatar ? (
          <AvatarImage
            key={avatar}
            src={avatar}
            alt={`${name} photo`}
            className="absolute inset-0 h-full w-full object-cover"
            fallback={<span className="font-semibold text-lg">{initial}</span>}
          />
        ) : (
          <span className="font-semibold text-lg">{initial}</span>
        )}
      </div>
      <div>
        <p>{name}</p>
        {specialty && <p className="text-xs text-body">{specialty}</p>}
      </div>
    </div>
  );
};

export default ExpertBrief;
