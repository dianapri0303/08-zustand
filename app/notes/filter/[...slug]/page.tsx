import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';
import { NoteTag } from '@/types/note';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const category = slug[0] === 'all' ? undefined : (slug[0] as NoteTag);
  const title = category ? `Notes: ${category}` : 'Notes: all';
  const description = category
    ? `Browse ${category} notes in NoteHub.`
    : 'Browse all notes in NoteHub.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/notes/filter/${slug[0]}`,
      siteName: 'NoteHub',
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'Notes page',
        },
      ],
    },
  };
}

export default async function NotesPage({ params }: Props) {
  const { slug } = await params;

  const category = slug[0] === 'all' ? undefined : (slug[0] as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, '', category],
    queryFn: () => fetchNotes({ page: 1, perPage: 12, search: '', tag: category }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient category={category} />
    </HydrationBoundary>
  );
}
