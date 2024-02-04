import { useState } from "react";

function Card({ name, img, title }) {
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        console.log(da);
      } else {
        console.error("Error uploading file:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <div className="flex flex-col justify-between px-10 py-12 rounded-[20px]  w-1/3 md:mr-10 sm:mr-5 mr-0 my-5 action-card  box-shadow glass">
      <label
        htmlFor="files"
        className="flex flex-col items-center p-2 justify-center"
      >
        <img
          src={img}
          alt="double_quotes"
          className="w-[60%] h-[60%] mb-4 object-contain text-white"
        />
        <h1 className="text-white text-lg text-center">{name}</h1>
        <h1 className="text-gray-200 text-md text-center">{title}</h1>
      </label>
    </div>
  );
}

export default Card;
