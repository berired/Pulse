import { Filter } from 'lucide-react';
import './FilterSidebar.css';

const SUBJECTS = [
  'Anatomy and Physiology',
  'Physiology',
  'Pharmacology',
  'Microbiology',
  'Biochemistry',
  'Diagnostics',
  'Psychology',
  'Maternal',
  'Geriatrics',
  'OB-GYN',
  'Medical Surgical',
  'Nursing Research',
  'Community Health Nursing',
  'Others',
];

function FilterSidebar({ filters, onFiltersChange, sortBy, onSortChange }) {
  const handleSubjectChange = (subject) => {
    onFiltersChange({
      ...filters,
      subject: filters.subject === subject ? '' : subject,
    });
  };

  const handleYearLevelChange = (year) => {
    onFiltersChange({
      ...filters,
      yearLevel: filters.yearLevel === year ? null : year,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      subject: '',
      yearLevel: null,
    });
    onSortChange('date');
  };

  const hasActiveFilters = filters.subject || filters.yearLevel;

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>
          <Filter size={20} />
          Filters
        </h3>
        {hasActiveFilters && (
          <button className="clear-btn" onClick={handleClearFilters}>
            Clear
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="filter-section">
        <h4>Sort By</h4>
        <div className="sort-options">
          <label>
            <input
              type="radio"
              name="sort"
              value="date"
              checked={sortBy === 'date'}
              onChange={(e) => onSortChange(e.target.value)}
            />
            Most Recent
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="rating"
              checked={sortBy === 'rating'}
              onChange={(e) => onSortChange(e.target.value)}
            />
            Highest Rated
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="views"
              checked={sortBy === 'views'}
              onChange={(e) => onSortChange(e.target.value)}
            />
            Most Viewed
          </label>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="filter-section">
        <h4>Subjects</h4>
        <div className="subject-list">
          {SUBJECTS.map((subject) => (
            <label key={subject} className="subject-checkbox">
              <input
                type="checkbox"
                checked={filters.subject === subject}
                onChange={() => handleSubjectChange(subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Year Level Filter */}
      <div className="filter-section">
        <h4>Year Level</h4>
        <div className="year-levels">
          {[1, 2, 3, 4].map((year) => (
            <label key={year} className="year-checkbox">
              <input
                type="checkbox"
                checked={filters.yearLevel === year}
                onChange={() => handleYearLevelChange(year)}
              />
              <span>Year {year}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
