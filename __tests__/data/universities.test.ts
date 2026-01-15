/**
 * Tests for university filtering and search
 */

import {UNIVERSITIES} from '../../src/data/universities';

// Helper function to simulate the filter logic from PremiumUniversitiesScreen
const filterUniversities = (
  searchQuery: string,
  selectedType: string,
  selectedCity: string,
) => {
  return UNIVERSITIES.filter(university => {
    const matchesSearch =
      university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      university.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      university.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || university.type === selectedType;
    const matchesCity = selectedCity === 'All Cities' || university.city === selectedCity;

    return matchesSearch && matchesType && matchesCity;
  });
};

describe('University Filtering', () => {
  it('should return all universities when no filters applied', () => {
    const result = filterUniversities('', 'all', 'All Cities');
    expect(result.length).toBe(UNIVERSITIES.length);
  });

  it('should filter by search query (name)', () => {
    const result = filterUniversities('LUMS', 'all', 'All Cities');
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(u => u.short_name.includes('LUMS'))).toBe(true);
  });

  it('should filter by search query (city)', () => {
    const result = filterUniversities('Lahore', 'all', 'All Cities');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(u => {
      expect(
        u.name.toLowerCase().includes('lahore') ||
        u.city.toLowerCase().includes('lahore'),
      ).toBe(true);
    });
  });

  it('should filter by type (public)', () => {
    const result = filterUniversities('', 'public', 'All Cities');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(u => {
      expect(u.type).toBe('public');
    });
  });

  it('should filter by type (private)', () => {
    const result = filterUniversities('', 'private', 'All Cities');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(u => {
      expect(u.type).toBe('private');
    });
  });

  it('should filter by city', () => {
    const result = filterUniversities('', 'all', 'Lahore');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(u => {
      expect(u.city).toBe('Lahore');
    });
  });

  it('should combine multiple filters', () => {
    const result = filterUniversities('', 'public', 'Islamabad');
    result.forEach(u => {
      expect(u.type).toBe('public');
      expect(u.city).toBe('Islamabad');
    });
  });

  it('should return empty array when no matches', () => {
    const result = filterUniversities('NonExistentUniversity12345', 'all', 'All Cities');
    expect(result).toEqual([]);
  });

  it('should be case insensitive', () => {
    const result1 = filterUniversities('LUMS', 'all', 'All Cities');
    const result2 = filterUniversities('lums', 'all', 'All Cities');
    expect(result1.length).toBe(result2.length);
  });
});

describe('University Data Integrity', () => {
  it('should have required fields for all universities', () => {
    UNIVERSITIES.forEach(university => {
      expect(university.name).toBeDefined();
      expect(typeof university.name).toBe('string');
      expect(university.name.length).toBeGreaterThan(0);

      expect(university.short_name).toBeDefined();
      expect(typeof university.short_name).toBe('string');

      expect(university.city).toBeDefined();
      expect(typeof university.city).toBe('string');

      expect(university.type).toBeDefined();
      expect(['public', 'private']).toContain(university.type);
    });
  });

  it('should have unique short names', () => {
    const shortNames = UNIVERSITIES.map(u => u.short_name);
    const uniqueShortNames = new Set(shortNames);
    expect(shortNames.length).toBe(uniqueShortNames.size);
  });

  it('should have valid cities', () => {
    const validCities = [
      'Lahore',
      'Karachi',
      'Islamabad',
      'Faisalabad',
      'Peshawar',
      'Multan',
      'Rawalpindi',
      'Hyderabad',
      'Quetta',
      'Jamshoro',
      'Mardan',
      'Abbottabad',
      'Mansehra',
      'Bahawalpur',
      'Sargodha',
      'Muzaffarabad',
      'Mirpur',
    ];

    UNIVERSITIES.forEach(university => {
      expect(validCities).toContain(university.city);
    });
  });

  it('should have logo_url field (can be empty - logos are loaded by shortName)', () => {
    UNIVERSITIES.forEach(university => {
      expect(university).toHaveProperty('logo_url');
      // logo_url can be empty string since UniversityLogo component
      // looks up logos by short_name from UNIVERSITY_LOGO_MAP
      expect(typeof university.logo_url).toBe('string');
    });
  });
});
