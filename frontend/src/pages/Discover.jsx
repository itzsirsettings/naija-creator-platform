import { useMemo, useState } from "react";
import { Inbox, Search, SlidersHorizontal } from "lucide-react";
import CreatorCard from "../components/CreatorCard";
import CreatorProfileModal from "../components/CreatorProfileModal";
import OfferModal from "../components/OfferModal";
import { useAppData } from "../context/AppDataContext";

const niches = ["All Niches", "Lifestyle", "Fashion", "Tech", "Food", "Travel", "Beauty", "Comedy"];
const followerBands = [
  ["Any audience", 0],
  ["10K+ followers", 10000],
  ["50K+ followers", 50000],
  ["100K+ followers", 100000],
];

export default function Discover() {
  const { creators, sendOffer } = useAppData();
  const [activeNiche, setActiveNiche] = useState("All Niches");
  const [query, setQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [minFollowers, setMinFollowers] = useState(0);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [profileCreator, setProfileCreator] = useState(null);

  const locations = useMemo(() => ["All locations", ...new Set(creators.map((creator) => creator.location))], [creators]);

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return creators.filter((creator) => {
      const matchesNiche = activeNiche === "All Niches" || creator.niche === activeNiche;
      const matchesLocation = locationFilter === "All locations" || creator.location === locationFilter;
      const matchesFollowers = Number(creator.followers || 0) >= Number(minFollowers || 0);
      const matchesQuery =
        !normalizedQuery ||
        [creator.name, creator.handle, creator.niche, creator.location, creator.platforms.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesNiche && matchesLocation && matchesFollowers && matchesQuery;
    });
  }, [activeNiche, creators, locationFilter, minFollowers, query]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Discover Nigerian Creators</h1>
          <p>Search creator profiles by niche, audience quality, platform, location, and campaign fit before sending a sponsorship offer.</p>
        </div>
      </div>

      <div className="filter-bar">
        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search by creator, handle, niche, city" />
        </label>
        <div className="segmented" aria-label="Filter creators by niche">
          {niches.map((niche) => (
            <button
              className={`segment-button ${activeNiche === niche ? "is-active" : ""}`}
              key={niche}
              type="button"
              onClick={() => setActiveNiche(niche)}
            >
              {niche}
            </button>
          ))}
        </div>
        <button className="ghost-button" type="button" onClick={() => setShowAdvancedFilters((current) => !current)} aria-expanded={showAdvancedFilters}>
          <SlidersHorizontal /> {showAdvancedFilters ? "Hide filters" : "More filters"}
        </button>
      </div>

      {showAdvancedFilters ? (
        <div className="advanced-filter-panel">
          <label className="input-field">
            <span>Location</span>
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
              {locations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </label>
          <label className="input-field">
            <span>Audience size</span>
            <select value={minFollowers} onChange={(event) => setMinFollowers(Number(event.target.value))}>
              {followerBands.map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              setQuery("");
              setActiveNiche("All Niches");
              setLocationFilter("All locations");
              setMinFollowers(0);
            }}
          >
            Reset filters
          </button>
        </div>
      ) : null}

      {filteredCreators.length ? (
        <div className="creator-grid">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} onSendOffer={setSelectedCreator} onViewProfile={setProfileCreator} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Inbox />
          <strong>No creators match these filters</strong>
          <span>Clear a filter or search another niche, city, or creator handle.</span>
        </div>
      )}

      {selectedCreator ? (
        <OfferModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} onSubmit={sendOffer} />
      ) : null}

      {profileCreator ? (
        <CreatorProfileModal creator={profileCreator} onClose={() => setProfileCreator(null)} onSendOffer={setSelectedCreator} />
      ) : null}
    </div>
  );
}
