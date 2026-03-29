'use client';

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ error }: Props) {
  return <p>Something went wrong. {error.message}</p>;
}
