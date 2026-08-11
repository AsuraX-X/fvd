const ApplyForm = () => {
  return (
    <form className="space-y-4" action="">
      <div className="flex flex-col sm:flex-row w-full items-center gap-2">
        <div className="w-full">
          <label className="form-label mb-2" htmlFor="name">
            Full Name *
          </label>
          <input type="text" className="form-input w-full min-w-70" name="name" id="name" />
        </div>
        <div className="w-full">
          <label className="form-label mb-2" htmlFor="email">
            Email *
          </label>
          <input type="email" className="form-input w-full min-w-70" name="email" id="email" />
        </div>
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="specialty">
          Specialty *
        </label>
        <input
          type="text"
          className="form-input w-full min-w-70"
          name="specialty"
          id="specialty"
        />
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="bio">
          Short bio *
        </label>
        <textarea name="bio" id="bio" />
      </div>
      <div className="flex flex-col sm:flex-row w-full items-center gap-2">
        <div className="w-full">
          <label className="form-label mb-2" htmlFor="website">
            Website
          </label>
          <input
            type="text"
            className="form-input w-full min-w-70"
            name="website"
            id="website"
          />
        </div>
        <div className="w-full">
          <label className="form-label mb-2" htmlFor="linkedin">
            Linkedin
          </label>
          <input
            type="text"
            className="form-input w-full min-w-70"
            name="linkedin"
            id="linkedin"
          />
        </div>
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="instagram">
          Instagram
        </label>
        <input
          type="text"
          className="form-input w-full min-w-70"
          name="instagram"
          id="instagram"
        />
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="portfolio">
          Portfolio (PDF / image / ZIP, up to 15 MB)
        </label>
        <input type="file" name="portfolio" id="portfolio" />
      </div>
      <div></div>
    </form>
  );
};

export default ApplyForm;
