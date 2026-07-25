"use client";

import { useState } from "react";
import classNames from "classnames";
import { tracksData } from "@/data";
import styles from "./Filter.module.css";

type FilterName = "author" | "year" | "genre";

interface FilterConfig {
  name: FilterName;
  label: string;
  options: readonly string[];
}

function getUniqueOptions(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, "ru"),
  );
}

const uniqueAuthors = getUniqueOptions(tracksData.map((track) => track.author));
const uniqueGenres = getUniqueOptions(tracksData.flatMap((track) => track.genre));


const filters: FilterConfig[] = [
  { name: "author", label: "исполнителю", options: uniqueAuthors },
  {
    name: "year",
    label: "году выпуска",
    options: ["По умолчанию", "Сначала новые", "Сначала старые"],
  },
  { name: "genre", label: "жанру", options: uniqueGenres },
];

export default function Filter() {
  const [activeFilter, setActiveFilter] = useState<FilterName | null>(null);

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
                <li className={styles.filter__item} key={option}>
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}