import { fix } from '../utils/api';

const Fix = () => {

  const fixItAll = async () => {
    // try {
    //   console.log("Fixing all issues...");
    //   const response = await fix();
    //   console.log(response.data.message);
    // } catch (error) {
    //   console.log(error);
    // }
  }
  
  return (
    <div className="main-content">
      <button onClick={fixItAll}>
        Fix it all
      </button>
    </div>
  )
}
export default Fix;