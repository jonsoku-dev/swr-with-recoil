import filter from "lodash/filter";
import includes from "lodash/includes";
import remove from "lodash/remove";
import flatten from "lodash/flatten";
import type { GetServerSideProps, NextPage } from "next";
import React, { useCallback, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Hearts } from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {
  atom,
  DefaultValue,
  selector,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { Product, fetchProductsExternal } from "../external/products";
import { usePagination, useCursorPagination } from "../libs/hooks";

const productListState = atom<Product[]>({
  key: "productListSsrState", // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});

const deletedIdsState = atom<number[]>({
  key: "deletedIdsSsrState",
  default: [],
  effects: [
    ({ onSet, setSelf, node }) => {
      if (typeof window !== "undefined") {
        const ids = sessionStorage.getItem(node.key);
        if (ids != null) {
          setSelf(JSON.parse(ids));
        }
        onSet((updatedIds) => {
          console.log(updatedIds, node, "onSet");
          if (updatedIds instanceof DefaultValue) {
            sessionStorage.removeItem(node.key);
          } else {
            sessionStorage.setItem(node.key, JSON.stringify(updatedIds));
          }
        });
      }
    },
  ],
});

const filteredProductListSelector = selector({
  key: "filteredProductListSsrState", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const productList = get(productListState);
    const deletedIds = get(deletedIdsState);
    return filter(productList, (product) => !includes(deletedIds, product.id));
  },
});

interface SsrPageProps {
  fallbackData: Product[];
}

const SsrPage: NextPage<SsrPageProps> = ({ fallbackData }) => {
  const { data, error, setSize, isReachedEnd } = usePagination<Product>(
    "/api/products",
    10,
    fallbackData
  );

  const setProductList = useSetRecoilState(productListState);
  const setDeletedIds = useSetRecoilState(deletedIdsState);
  const filteredProductList = useRecoilValue(filteredProductListSelector);

  const handleDeleteProduct = useCallback((selectedId: number) => {
    setDeletedIds((prev) => [...prev, selectedId]);
    setProductList((prev) => {
      const temp = [...prev];
      remove(temp, (item) => item.id === selectedId);
      return temp;
    });
  }, []);

  useEffect(() => {
    if (data) {
      setProductList(flatten(data));
    }
  }, [data]);

  useEffect(() => {
    if (!isReachedEnd && filteredProductList.length === 0) {
      setSize((prev) => prev + 1);
    }
  }, [isReachedEnd, filteredProductList]);

  console.log({ rerender: "called" });

  if (error) return <div>Error occured</div>;

  if (!data) return <Hearts />;

  return (
    <div>
      <h1>Infinite scroll example (SSR)</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <InfiniteScroll
          next={() => setSize((prev) => prev + 1)}
          hasMore={!isReachedEnd}
          loader={<Hearts />}
          endMessage={<p>Reached to the end</p>}
          dataLength={filteredProductList?.length ?? 0}
        >
          {filteredProductList?.map((product) => {
            return (
              <MemoizedProductItem
                key={product.id}
                onClickDeleteItem={handleDeleteProduct}
                {...product}
              />
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default SsrPage;

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchProductsExternal({ limit: "20", page: "0" });
  console.log("ssr called");
  return {
    props: {
      fallbackData: data,
    },
  };
};

interface ProductItemProps {
  id: number;
  title: string;
  price: number;
  onClickDeleteItem: (selectedId: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  id,
  title,
  price,
  onClickDeleteItem,
}) => {
  return (
    <div key={id} style={{ border: "1px solid blue" }}>
      <h3>{title}</h3>
      <p>price: {price}</p>
      <button onClick={() => onClickDeleteItem(id)}>Delete</button>
    </div>
  );
};

const MemoizedProductItem = React.memo(ProductItem);

function replaceItemAtIndex<T>(arr: T[], index: number, newValue: T) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex<T>(arr: T[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
