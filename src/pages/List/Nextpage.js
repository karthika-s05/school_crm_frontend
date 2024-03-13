import { useLocation } from "react-router-dom";

const Nextpage = () => {
  const location = useLocation();
  console.log(location.state); // Debugging: Check the location state

  // Ensure location.state is not null before accessing previewURL
  const previewURL = location.state ? location.state.previewURL : null;

  return (
    <div>
      {previewURL && <img src={previewURL} alt="Preview" />}{" "}
      {/* Display the file using the preview URL */}
    </div>
  );
};

export default Nextpage;
