'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';

import css from './NotesPage.module.css';
import type { Note, NoteTag } from '@/types/note';
import { fetchNotes } from '@/lib/api';

import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import SearchBox from '@/components/SearchBox/SearchBox';
import NoResults from '@/components/NoResults/NoResults';

export default function NotesClient({ category }: { category?: NoteTag }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

        <button className={css.button} onClick={openModal}>
          Create note +
        </button>

        {isModalOpen && (
          <Modal onClose={closeModal}>
            <NoteForm onClose={closeModal} />
          </Modal>
        )}
      </header>

      {!isLoading && notes.length === 0 && <NoResults />}
      {notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
