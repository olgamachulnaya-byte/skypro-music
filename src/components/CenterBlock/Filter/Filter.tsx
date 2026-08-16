"use client";

import { useMemo, useState } from "react";
import classNames from "classnames";
import type { Track } from "@/data";
import {
  countActiveFilters,
  getUniqueOptions,
  type TrackFilters,
} from "../filterTracks";
import styles from "./Filter.module.css";

type FilterName = "author" | "dateSort" | "genre";

interface FilterConfig {
  name: FilterName;
  label: string;
  options: readonly string[];
}

interface FilterProps {
  tracks: Track[];
  value: TrackFilters;
  onChange: (filters: TrackFilters) => void;
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
        name: "dateSort",
        label: "году выпуска",
        options: ["По умолчанию", "Сначала новые", "Сначала старые"],
      },
      {
        name: "genre",
        label: "жанру",
        options: getUniqueOptions(tracks.flatMap((track) => track.genre)),
      },
    ],
    [tracks],
  );

   const optionValue = (name: FilterName, option: string) => {
    if (name !== "dateSort") return option;
    if (option === "Сначала новые") return "newest";
    if (option === "Сначала старые") return "oldest";
    return "default";
  };

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
            {name !== "dateSort" && value[name] && (
              <span className={styles.filter__count}>1</span>
            )}
            {name === "dateSort" && value.dateSort !== "default" && (
              <span className={styles.filter__count}>1</span>
            )}
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
                      [styles.selected]:
                        value[name] === optionValue(name, option),
                    })}
                    aria-pressed={value[name] === optionValue(name, option)}
                    onClick={() => {
                      const nextValue = optionValue(name, option);
                      onChange({
                        ...value,
                        [name]:
                          name === "dateSort"
                            ? nextValue
                            : value[name] === nextValue
                              ? null
                              : nextValue,
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
      {countActiveFilters(value) > 0 && (
        <button
          type="button"
          className={styles.filter__reset}
          onClick={() =>
            onChange({ author: null, genre: null, dateSort: "default" })
          }
        >
          Сбросить
        </button>
      )}
    </div>
  );
}