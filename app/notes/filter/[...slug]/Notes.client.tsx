'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';

import css from './NotesPage.module.css';
import type { Note, NoteTag } from '@/types/note';
import { fetchNotes } from '@/lib/api';

import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';
import NoResults from '@/components/NoResults/NoResults';

import Link from 'next/link';

export default function NotesClient({ category }: { category?: NoteTag }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const updateSearch = useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  }, 300);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notes', page, search, category],
    queryFn: () => fetchNotes({ page, perPage: 12, search, tag: category }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  if (isError) throw error;

  const notes: Note[] = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={updateSearch} />
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>
      {!isLoading && data && data.notes.length === 0 && <NoResults />}
      {!isLoading && notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
