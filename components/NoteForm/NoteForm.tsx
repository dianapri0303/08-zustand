'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';

import css from './NoteForm.module.css';
import { noteTags, type NoteTag } from '@/types/note';
import { createNote } from '@/lib/api';
import { useNoteDraftStore } from '@/lib/store/noteStore';

export default function NoteForm() {
  const id = useId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { draft, setDraft, clearDraft } = useNoteDraftStore();

  const { mutate, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      clearDraft();
      router.back();
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate({
      title: draft.title.trim(),
      content: draft.content.trim(),
      tag: draft.tag as NoteTag,
    });
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor={`${id}-title`}>Title</label>
        <input
          id={`${id}-title`}
          name="title"
          value={draft.title}
          onChange={handleChange}
          className={css.input}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor={`${id}-content`}>Content</label>
        <textarea
          id={`${id}-content`}
          name="content"
          value={draft.content}
          onChange={handleChange}
          rows={8}
          className={css.textarea}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor={`${id}-tag`}>Tag</label>
        <select
          id={`${id}-tag`}
          name="tag"
          value={draft.tag}
          onChange={handleChange}
          className={css.select}
        >
          {noteTags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={() => router.back()}>
          Cancel
        </button>

        <button type="submit" disabled={isPending} className={css.submitButton}>
          {isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
}
