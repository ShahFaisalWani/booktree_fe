import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import LoadingScreen from "../components/Loading/LoadingScreen";
import BooksDisplay from "../components/BooksDisplay";
import { SortContext } from "../App";

const limit = 25;

const BooksPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [genre, setGenre] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [books, setBooks] = useState([]);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  const { type, setType } = useContext(SortContext);

  useEffect(() => {
    setGenre(queryParams.get("genre"));
  }, [location]);

  const fetchMyData = async () => {
    const offset = (page - 1) * limit;
    const res = await axios.get(
      import.meta.env.VITE_API_BASEURL +
        "/book/specific" +
        location.search +
        "&offset=" +
        offset +
        "&limit=" +
        limit +
        "&sort=" +
        type?.sort +
        "&way=" +
        type?.way
    );

    setTotalCount(res.data.total_count);
    setBooks(res.data.books);
    setPages(Math.ceil(res.data.total_count / limit));
    return res.data;
  };

  const { isLoading, error, data } = useQuery(
    ["genre", genre, location.search, page, type?.sort, type?.way],
    fetchMyData
  );

  const handleChange = (value) => {
    setPage(value);
  };

  if (!books) return <>No Books</>;

  if (isLoading) return <LoadingScreen />;
  if (error) return <p>Error</p>;

  return (
    <div>
      <BooksDisplay
        books={books}
        page={page}
        pages={pages}
        totalCount={totalCount}
        handlePageChange={handleChange}
      />
    </div>
  );
};

export default BooksPage;
