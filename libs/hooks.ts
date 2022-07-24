import axios from "axios";
import useSWRInfinite from "swr/infinite";
import { useCallback } from "react";
import flatten from "lodash/flatten";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const usePagination = <T>(url: string, PAGE_SIZE = 20) => {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: T[] | null) => {
      if (previousPageData && !previousPageData.length) return null; // reached the end
      return `${url}?page=${pageIndex}&limit=${PAGE_SIZE}`; // SWR key
    },
    [url, PAGE_SIZE]
  );

  const { data, error, setSize, size, mutate } = useSWRInfinite<T[]>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  );

  const paginatedData = flatten(data);
  const isReachedEnd = data && data[data.length - 1]?.length < PAGE_SIZE;
  const loadingMore = data && typeof data[size - 1] === "undefined";

  return {
    data,
    paginatedData,
    isReachedEnd,
    loadingMore,
    size,
    setSize,
    error,
    mutate,
  };
};

type CursorPagination<D> = { data: D[]; nextCursor?: string };

export const useCursorPagination = <
  T,
  S extends CursorPagination<T> = CursorPagination<T>
>(
  url: string,
  PAGE_SIZE = 20
) => {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: S | null) => {
      if (previousPageData && !previousPageData.data) return null; // reached the end
      if (pageIndex === 0) return `${url}?&limit=${PAGE_SIZE}`; // SWR key
      return `${url}?cursor=${previousPageData?.nextCursor}&limit=${PAGE_SIZE}`; // SWR key
    },
    [url, PAGE_SIZE]
  );

  const { data, error, setSize, size, mutate } = useSWRInfinite<S>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  );

  const paginatedData = flatten(data);
  const isReachedEnd = data && data[data.length - 1]?.data.length < PAGE_SIZE;
  const loadingMore = data && typeof data[size - 1] === "undefined";

  return {
    data,
    paginatedData,
    isReachedEnd,
    loadingMore,
    size,
    setSize,
    error,
    mutate,
  };
};
