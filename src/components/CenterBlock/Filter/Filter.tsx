"use client";

import { useMemo, useState } from "react";
import classNames from "classnames";
import type { Track } from "@/data";
import styles from "./Filter.module.css";

type FilterName = "author" | "year" | "genre";

interface FilterConfig {
  name: FilterName;
  label: string;
  options: readonly string[];
}

export interface TrackFilters {
  author: string | null;
  year: string | null;
  genre: string | null;
}

interface FilterProps {
  tracks: Track[];
  value: TrackFilters;
  onChange: (filters: TrackFilters) => void;
}

function getUniqueOptions(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort(
    (firstValue, secondValue) => firstValue.localeCompare(secondValue, "ru"),
  );
}

export default function Filter({ tracks, value, onChange }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterName | null>(null);
  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        name: "author",
        label: "исполнителю",
        options: getUniqueOptions(tracks.map((track) => track.author)),
      },
      {
        name: "year",
        label: "году выпуска",
        options: getUniqueOptions(
          tracks.map((track) => track.release_date.slice(0, 4)),
        ),
      },
      {
        name: "genre",
        label: "жанру",
        options: getUniqueOptions(tracks.flatMap((track) => track.genre)),
      },
    ],
    [tracks],
  );

  const toggleFilter = (nameFilter: FilterName): void => {
    setActiveFilter((currentFilter) =>
      currentFilter === nameFilter ? null : nameFilter,
    );
  };

  return (
    <div className={styles.centerblock__filter}>
      <div className={styles.filter__title}>Искать по:</div>
      {filters.map(({ name, label, options }) => (
        <div className={styles.filter__wrapper} key={name}>
          <button
            type="button"
            className={classNames(styles.filter__button, {
              [styles.active]: activeFilter === name,
            })}
            onClick={() => toggleFilter(name)}
            aria-expanded={activeFilter === name}
            aria-controls={`${name}-filter-options`}
          >
            {label}
          </button>
          {activeFilter === name && (
            <ul
              className={styles.filter__list}
              id={`${name}-filter-options`}
              aria-label={`Фильтр по ${label}`}
            >
              {options.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    className={classNames(styles.filter__item, {
                      [styles.selected]: value[name] === option,
                    })}
                    aria-pressed={value[name] === option}
                    onClick={() => {
                      onChange({
                        ...value,
                        [name]: value[name] === option ? null : option,
                      });
                      setActiveFilter(null);
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}