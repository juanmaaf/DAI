import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export const useFetch = (url) => {
  const { data, error } = useSWR(url, fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
