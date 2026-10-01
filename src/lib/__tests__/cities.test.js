import { describe, it, expect } from "vitest";
import { CITIES_DB, ALL_CITIES, searchCities, findCity } from "../cities";

describe("Cities Database — Integrity and Coverage", () => {
  it("contains more than 150 verified global cities", () => {
    expect(CITIES_DB.length).toBeGreaterThanOrEqual(150);
  });

  it("verifies every city has valid coordinates, country code, and official IANA timezone", () => {
    CITIES_DB.forEach((city) => {
      expect(city.name).toBeTruthy();
      expect(city.country).toBeTruthy();
      expect(city.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(city.lat).toBeGreaterThanOrEqual(-90);
      expect(city.lat).toBeLessThanOrEqual(90);
      expect(city.lng).toBeGreaterThanOrEqual(-180);
      expect(city.lng).toBeLessThanOrEqual(180);
      expect(Array.isArray(city.aliases)).toBe(true);

      expect(() => {
        new Intl.DateTimeFormat("en-US", { timeZone: city.timezone });
      }).not.toThrow();
    });
  });

  it("exports ALL_CITIES string array for simple auto-completes", () => {
    expect(ALL_CITIES.length).toBe(CITIES_DB.length);
    expect(ALL_CITIES).toContain("San Francisco");
    expect(ALL_CITIES).toContain("Tokyo");
    expect(ALL_CITIES).toContain("London");
  });
});

describe("Cities Database — Intelligent Search and Aliases", () => {
  it("finds cities by exact and partial names", () => {
    const tokyoResults = searchCities("Tokyo");
    expect(tokyoResults.length).toBeGreaterThan(0);
    expect(tokyoResults[0].name).toBe("Tokyo");

    const londonResults = searchCities("Lond");
    expect(londonResults.length).toBeGreaterThan(0);
    expect(londonResults[0].name).toBe("London");
  });

  it("resolves popular colloquial abbreviations and aliases", () => {
    const nyc = searchCities("NYC");
    expect(nyc.some(c => c.name === "New York")).toBe(true);

    const sf = searchCities("SF");
    expect(sf.some(c => c.name === "San Francisco")).toBe(true);

    const bombay = searchCities("Bombay");
    expect(bombay.some(c => c.name === "Mumbai")).toBe(true);

    const bangalore = searchCities("Bangalore");
    expect(bangalore.some(c => c.name === "Bengaluru")).toBe(true);
  });

  it("findCity returns single best match or null", () => {
    const city = findCity("Sydney");
    expect(city).not.toBeNull();
    expect(city?.countryCode).toBe("AU");

    const unknown = findCity("NonExistentAtlantisXYZ");
    expect(unknown).toBeNull();
  });
});
