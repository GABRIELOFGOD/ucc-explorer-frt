// const sendSearchQuery = async (query) => {
//   setLoadingSearch(true)
//   try {
//     const response = await search(query);
//     const data = response.data;
//
//     if (data.type === "address") {
//       router.push(`/address/${data.data.address}`);
//     }
//     if (data.type === "transaction") {
//       router.push(`/tx/${data.data.hash}`);
//     }
//     if (data.type === "block") {
//       router.push(`/block/${data.data.number}`);
//     }
//     if (data.type === "not_found") {
//       toast.error("No results found for your search query.");
//     }
//   } catch (error) {
//     console.log(error);
//   } finally {
//     setLoadingSearch(false);
//   }
// }
