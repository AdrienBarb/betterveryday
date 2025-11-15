/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/api/axiosInstance";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

interface FetchParams {
  url: string;
  params?: Record<string, any>;
}

interface MutationParams {
  url: string;
  data: any;
}

export const fetchData = async (
  url: string,
  params?: Record<string, any>,
): Promise<any> => {
  try {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const useApi = () => {
  const fetcher = async ({
    queryKey,
  }: {
    queryKey: [string, FetchParams];
  }): Promise<any> => {
    const [, { url, params }] = queryKey;

    const response: AxiosResponse = await axiosInstance.get(url, { params });

    return response.data;
  };

  const poster = async ({ url, data }: MutationParams): Promise<any> => {
    const response: AxiosResponse = await axiosInstance.post(url, data);

    return response.data;
  };

  const editer = async ({ url, data }: MutationParams): Promise<any> => {
    const response: AxiosResponse = await axiosInstance.put(url, data);

    return response.data;
  };

  const useGet = (url: string, params?: Record<string, any>, options = {}) =>
    useQuery({
      queryKey: ["get", { url, params }],
      queryFn: fetcher,
      ...options,
    });

  const useInfinite = (
    queryKey: any,
    url: string,
    params: Record<string, any>,
    options = {},
  ) => {
    return useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: async ({ pageParam = "" }) => {
        const response = await axiosInstance.get(url, {
          params: { ...params, cursor: pageParam },
        });

        return response.data;
      },
      getNextPageParam: (lastPage: any) => lastPage.nextCursor,
      initialPageParam: undefined,
      ...options,
    });
  };

  const usePost = (url: string, options = {}) =>
    useMutation({
      mutationFn: (data: any) => poster({ url, data }),
      ...options,
    });

  const usePut = (url: string, options = {}) =>
    useMutation({
      mutationFn: (data: any) => {
        if (data && typeof data === "object" && data.url) {
          return editer({ url: data.url, data: { ...data, url: undefined } });
        }

        return editer({ url, data });
      },
      ...options,
    });

  return { useGet, usePost, usePut, useInfinite, fetchData };
};

export default useApi;

