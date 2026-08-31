import EnquiryCard from "./EnquiryCard";

const EnquiryList = ({
  enquiries,
}: {
  enquiries: {
    id: string;
    name: string;
    email: string;
    brief: string;
    status: "new" | "read" | "archived";
    date: string;
  }[];
}) => {
  if (enquiries.length === 0) {
    return (
      <p className="text-sm text-body py-8 text-center">
        No enquiries match your filters.
      </p>
    );
  }

  return (
    <div className="space-y-4 max-h-[80vh] my-4 overflow-scroll">
      {enquiries.map((enquiry) => (
        <EnquiryCard key={enquiry.id} {...enquiry} />
      ))}
    </div>
  );
};

export default EnquiryList;
