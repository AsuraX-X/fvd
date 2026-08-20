import AvatarImage from "@/components/common/AvatarImage";

type ExpertInfoProps = {
  name: string;
  specialty: string | null;
  headline: string | null;
  bio: string | null;
  rate: number | null;
  avatar: string | null;
};

const ExpertInfo = ({ name, specialty, headline, bio, rate, avatar }: ExpertInfoProps) => {
  const initial = name[0]?.toUpperCase() ?? "U";

  return (
    <div>
      <div className="flex items-center gap-2 p-4">
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
      <div className="p-4">
        {headline && <p className="text-sm">{headline}</p>}
        <p className="text-xs py-6 border-b border-secondary/10 text-body">
          {bio || "No bio yet."}
        </p>
      </div>
      <div className="p-4">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="small-header mb-2">Status</dt>
            <dd>Active Conversation</dd>
          </div>
          <div>
            <dt className="small-header mb-2">Rate</dt>
            <dd>{rate ? `from ¢${rate.toLocaleString()}` : "Rate on request"}</dd>
          </div>
          <div>
            <dt className="small-header mb-2">Attachments</dt>
            <dd>0 shared</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ExpertInfo;
