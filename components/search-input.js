import { useRouter } from "next/router";
import { search } from "../utils/api";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "sonner";

const SearchInput = () => {
  
  const [loadingSearch, setLoadingSearch] = useState(false);

  const router = useRouter();

  const sendSearchQuery = async (query) => {
    if (!query || query.trim() === "") {
      toast.error("Please enter a search query.");
      return;
    };
    setLoadingSearch(true)
    try {
      const response = await search(query);
      const data = response.data;
      if (data.type === "address") {
        router.push(`/address/${data.data.address}`);
      }
      if (data.type === "transaction") {
        router.push(`/tx/${data.data.hash}`);
      }
      if (data.type === "block") {
        router.push(`/block/${data.data.number}`);
      }
      if (data.type === "not_found") {
        toast.error("No results found for your search query.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSearch(false);
    }
  }

  return (
    <div className="search-container">
      <div className="search-bar">
        <FaSearch className='search-icon' />
        <input 
          type="text" 
          className="search-input" 
          placeholder={loadingSearch ? "Searching..." : "Search by Address / Txn Hash / Block"}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendSearchQuery(e.target.value);
              // window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
            }
          }}
          disabled={loadingSearch}
        />
      </div>
      <button className="search-button" onClick={() => sendSearchQuery(document.querySelector('.search-input').value)}>
        <FaSearch size={15} className='search-button-icon' />
      </button>
    </div>
  )
}
export default SearchInput;