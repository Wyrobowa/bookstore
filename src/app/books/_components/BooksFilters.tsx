'use client';

import React, { useState } from 'react';
import { Box, Button, Input, Select } from 'tharaday';

import styles from './BooksFilters.module.css';

type Option = { value: string; label: string };

type BooksFiltersProps = {
  searchQuery: string;
  selectedType: string;
  selectedAuthor: string;
  selectedSort: string;
  typeOptions: Option[];
  authorOptions: Option[];
  sortOptions: Option[];
  onSearchQueryChange: (value: string) => void;
  onSelectedTypeChange: (value: string) => void;
  onSelectedAuthorChange: (value: string) => void;
  onSelectedSortChange: (value: string) => void;
  onClear: () => void;
};

export function BooksFilters({
  searchQuery,
  selectedType,
  selectedAuthor,
  selectedSort,
  typeOptions,
  authorOptions,
  sortOptions,
  onSearchQueryChange,
  onSelectedTypeChange,
  onSelectedAuthorChange,
  onSelectedSortChange,
  onClear,
}: BooksFiltersProps) {
  const [areAdvancedFiltersVisible, setAreAdvancedFiltersVisible] =
    useState(false);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Input
          placeholder="Search by title or author"
          value={searchQuery}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearchQueryChange(event.target.value)}
          fullWidth
        />
        <Button
          variant="subtle"
          intent="neutral"
          size="sm"
          className={styles.advancedToggle}
          onClick={() =>
            setAreAdvancedFiltersVisible(!areAdvancedFiltersVisible)
          }
        >
          {areAdvancedFiltersVisible
            ? '▴ Hide advanced filters'
            : '▾ Show advanced filters'}
        </Button>
      </Box>

      {areAdvancedFiltersVisible ? (
        <Box
          display="grid"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          gap={3}
          alignItems="flex-end"
        >
          <Select
            label="Type"
            value={selectedType}
            options={typeOptions}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectedTypeChange(event.target.value)}
          />
          <Select
            label="Author"
            value={selectedAuthor}
            options={authorOptions}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectedAuthorChange(event.target.value)}
          />
          <Select
            label="Sort by"
            value={selectedSort}
            options={sortOptions}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onSelectedSortChange(event.target.value)}
          />
          <Button variant="outline" intent="neutral" onClick={onClear}>
            Clear filters
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
